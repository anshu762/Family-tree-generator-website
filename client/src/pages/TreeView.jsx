import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Dagre from "@dagrejs/dagre";
import {
  ReactFlow,
  useReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const NODE_WIDTH = 240;
const NODE_HEIGHT = 112;

function getLayoutedElements(nodes, edges, direction = "TB") {
  const dagreGraph = new Dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 90,
    ranksep: 130,
    marginx: 60,
    marginy: 60,
  });
  nodes.forEach((n) =>
    dagreGraph.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }),
  );
  edges.forEach((e) => dagreGraph.setEdge(e.source, e.target));
  Dagre.layout(dagreGraph);
  return {
    nodes: nodes.map((n) => {
      const { x, y } = dagreGraph.node(n.id);
      return {
        ...n,
        position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 },
      };
    }),
    edges,
  };
}
function computeGenerations(members) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const memo = new Map();
  const visiting = new Set();
  const getGen = (id) => {
    if (memo.has(id)) return memo.get(id);
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const m = byId.get(id);
    if (!m || (!m.father_id && !m.mother_id)) {
      memo.set(id, 0);
      visiting.delete(id);
      return 0;
    }
    const fg = m.father_id && byId.has(m.father_id) ? getGen(m.father_id) : -1;
    const mg = m.mother_id && byId.has(m.mother_id) ? getGen(m.mother_id) : -1;
    const gen = Math.max(fg, mg) + 1;
    memo.set(id, gen);
    visiting.delete(id);
    return gen;
  };
  members.forEach((m) => getGen(m.id));
  return memo;
}
function getDescendantIds(memberId, members) {
  const ids = new Set();
  const queue = [memberId];
  while (queue.length) {
    const cur = queue.pop();
    members.forEach((m) => {
      if ((m.father_id === cur || m.mother_id === cur) && !ids.has(m.id)) {
        ids.add(m.id);
        queue.push(m.id);
      }
    });
  }
  return ids;
}

function CustomNode({ data }) {
  const isFemale = data.gender === 'female';
  const ring = isFemale
    ? 'from-rose-400 to-pink-500'
    : data.gender === 'other'
    ? 'from-purple-400 to-fuchsia-500'
    : 'from-blue-400 to-indigo-500';
  const isH = data.direction === 'LR';

  return (
    <div
      className={`group relative rounded-2xl border-2 bg-white transition-all ${
        data.selected
          ? 'border-primary shadow-2xl shadow-primary/40 scale-[1.05] z-10'
          : 'border-gray-100 shadow-md hover:border-primary/40 hover:shadow-xl'
      }`}
      style={{ width: NODE_WIDTH, minHeight: NODE_HEIGHT }}
    >
      <Handle type="target" position={isH ? Position.Left : Position.Top} className="!w-2 !h-2 !bg-gray-300 !border-0" />
      <Handle type="source" position={isH ? Position.Right : Position.Bottom} className="!w-2 !h-2 !bg-gray-300 !border-0" />

      {data.isRoot && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 shadow flex items-center justify-center"
          title="Family Founder"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 16L3 6l4.5 3L10 4l2.5 5L17 6l-2 10H5zm0 2h10v1H5v-1z" />
          </svg>
        </div>
      )}

      <div
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow text-[10px] font-extrabold flex items-center justify-center text-primary"
        title={`Generation ${data.generation + 1}`}
      >
        G{data.generation + 1}
      </div>

      {data.hasSpouse && (
        <div
          className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-white border border-amber-200 shadow flex items-center justify-center"
          title="Has spouse"
        >
          <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927a.75.75 0 011.902 0l.928 1.879 2.073.301a.75.75 0 01.416 1.279l-1.5 1.462.354 2.064a.75.75 0 01-1.088.79L10 9.68l-1.854 1.022a.75.75 0 01-1.088-.79l.354-2.064-1.5-1.462a.75.75 0 01.416-1.28l2.073-.3.928-1.879z" />
          </svg>
        </div>
      )}

      <div className="p-3 flex items-center gap-3">
        <div className={`relative w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br ${ring} p-[2px] ${data.isDeceased ? 'grayscale opacity-80' : ''}`}>
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            {data.photo_url ? (
              <img src={data.photo_url} alt={data.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-lg font-bold text-gray-700">{data.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {data.isDeceased && (
            <div
              className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-gray-700 rounded-full flex items-center justify-center text-white p-0.5"
              title="Deceased"
            >
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2h2v4h4v2h-4v10H9V8H5V6h4V2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 break-words">
            {data.name}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {data.birthYear ? `${data.birthYear} – ${data.deathYear || 'Present'}` : 'Dates unknown'}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 -bottom-4 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); data.onEdit?.(); }} className="w-7 h-7 rounded-full bg-white shadow border flex items-center justify-center text-primary hover:bg-primary hover:text-white text-xs">✎</button>
        <button onClick={(e) => { e.stopPropagation(); data.onAddChild?.(); }} className="w-7 h-7 rounded-full bg-white shadow border flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white font-bold">+</button>
        <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="w-7 h-7 rounded-full bg-white shadow border flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white text-xs">✕</button>
      </div>
    </div>
  );
}

const nodeTypes = { custom: CustomNode };
const PlusIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);
const UserPlusIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);
const EditIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const TrashIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);
const TreeIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 20l3-9m0 0l3 9m-3-9v9m6-9l3 9m-3-9V9m-3 11V9m0 11a9 9 0 01-9-9 9 9 0 0118 0 9 9 0 01-9 9z"
    />
  </svg>
);
const InfoIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

function TreeCanvas({
  nodes,
  setNodes,
  members,
  direction,
  onToggleDirection,
  isFullscreen,
  onToggleFullscreen,
  onSelectFromSearch,
  onExportPDF,
  onExportPNG,
}) {
  const { setCenter, fitView } = useReactFlow();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const matches = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 6);
  }, [searchTerm, members]);
  const focusOnMember = (member) => {
    const node = nodes.find((n) => n.id === String(member.id));
    if (node) {
      setCenter(
        node.position.x + NODE_WIDTH / 2,
        node.position.y + NODE_HEIGHT / 2,
        { zoom: 1.4, duration: 800 },
      );
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === node.id,
          data: { ...n.data, selected: n.id === node.id },
        })),
      );
    }
    onSelectFromSearch(member);
    setSearchTerm("");
    setShowSuggestions(false);
  };
  return (
    <>
      <Panel
        position="top-left"
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-100"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
            <TreeIcon />
          </div>
          <div>
            <div className="font-bold text-gray-900">Family Tree</div>
            <div className="text-xs text-gray-500">Drag • Scroll to zoom</div>
          </div>
        </div>
      </Panel>
      <Panel position="top-right" className="flex flex-col items-end gap-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-2 flex items-center gap-2 flex-wrap justify-end max-w-[92vw]">
          <div className="relative">
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 gap-2 border focus-within:ring-2 focus-within:ring-primary">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm w-28 sm:w-40"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
            </div>
            <AnimatePresence>
              {showSuggestions && matches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                >
                  {matches.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => focusOnMember(m)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 flex items-center gap-2"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${m.gender === "female" ? "bg-pink-500" : "bg-blue-500"}`}
                      />
                      {m.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => fitView({ duration: 600, padding: 0.2 })}
            className="p-2 rounded-lg bg-gray-50 hover:bg-primary hover:text-white border"
          >
            ⛶
          </button>
          <button
            onClick={onToggleDirection}
            className="p-2 rounded-lg bg-gray-50 hover:bg-primary hover:text-white border text-xs font-bold"
          >
            {direction === "TB" ? "⇅" : "⇄"}
          </button>
          <button
            onClick={() => setShowLegend((s) => !s)}
            className="p-2 rounded-lg bg-gray-50 hover:bg-primary hover:text-white border"
          >
            <InfoIcon />
          </button>
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg bg-gray-50 hover:bg-primary hover:text-white border"
          >
            {isFullscreen ? "⤓" : "⤢"}
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button
            onClick={onExportPNG}
            className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black"
          >
            PNG
          </button>
          <button
            onClick={onExportPDF}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold"
          >
            PDF
          </button>
        </div>
      </Panel>
      {showLegend && (
        <Panel
          position="bottom-center"
          className="hidden sm:flex bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border p-3 text-xs text-gray-600 gap-4 items-center"
        >
          <span className="font-bold text-gray-800">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500" />
            Male
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-rose-400 to-pink-500" />
            Female
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-indigo-500 inline-block" />
            Father
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-pink-500 inline-block" />
            Mother
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-amber-500 inline-block border-dashed" />
            Spouse
          </span>
          <span>👑 Founder</span>
          <span className="flex flex-row items-center justify-center"><svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927a.75.75 0 011.902 0l.928 1.879 2.073.301a.75.75 0 01.416 1.279l-1.5 1.462.354 2.064a.75.75 0 01-1.088.79L10 9.68l-1.854 1.022a.75.75 0 01-1.088-.79l.354-2.064-1.5-1.462a.75.75 0 01.416-1.28l2.073-.3.928-1.879z" />
          </svg> Has Spouse</span>
        </Panel>
      )}
    </>
  );
}

export default function TreeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token],
  );
  const canvasRef = useRef(null);

  const [members, setMembers] = useState([]);
  const [spouses, setSpouses] = useState([]);
  const [spouseMap, setSpouseMap] = useState(new Map());
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [treeStats, setTreeStats] = useState({
    total: 0,
    males: 0,
    females: 0,
    generations: 0,
  });
  const [direction, setDirection] = useState("TB");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRelation, setSelectedRelation] = useState("child");

  const [formData, setFormData] = useState({
    name: "",
    gender: "male",
    birth_date: "",
    death_date: "",
    photo_url: "",
    bio: "",
    father_id: null,
    mother_id: null,
    isDeceased: false,
  });

  useEffect(() => {
    fetchAll();
  }, [id]);
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const getFirstSpouseId = useCallback(
    (memberId) => {
      const list = spouseMap.get(memberId);
      return list && list.length ? list[0] : null;
    },
    [spouseMap],
  );

  const fetchAll = async (dir = direction) => {
    try {
      const res = await axios.get(`${API}/members/${id}`, authHeaders);
      const mem = res.data;
      let spouseData = [];
      try {
        const sRes = await axios.get(
          `${API}/members/spouses/${id}`,
          authHeaders,
        );
        spouseData = sRes.data;
      } catch {
        spouseData = [];
      }
      setMembers(mem);
      setSpouses(spouseData);
      const map = new Map();
      spouseData.forEach((s) => {
        if (!map.has(s.member1_id)) map.set(s.member1_id, []);
        if (!map.has(s.member2_id)) map.set(s.member2_id, []);
        map.get(s.member1_id).push(s.member2_id);
        map.get(s.member2_id).push(s.member1_id);
      });
      setSpouseMap(map);
      buildFlow(mem, spouseData, map, dir);
      const genMap = computeGenerations(mem);
      setTreeStats({
        total: mem.length,
        males: mem.filter((m) => m.gender === "male").length,
        females: mem.filter((m) => m.gender === "female").length,
        generations: mem.length
          ? Math.max(...mem.map((m) => genMap.get(m.id) ?? 0)) + 1
          : 0,
      });
    } catch {
      setError("Failed to load family members.");
    } finally {
      setLoading(false);
    }
  };

  const buildFlow = (membersData, spousesData, sMap, dir = direction) => {
    const genMap = computeGenerations(membersData);
    const rawNodes = membersData.map((m) => ({
      id: String(m.id),
      type: "custom",
      data: {
        name: m.name,
        gender: m.gender,
        photo_url: m.photo_url,
        birthYear: m.birth_date ? new Date(m.birth_date).getFullYear() : null,
        deathYear: m.death_date ? new Date(m.death_date).getFullYear() : null,
        isDeceased: !!m.death_date,
        isRoot: !m.father_id && !m.mother_id,
        generation: genMap.get(m.id) ?? 0,
        direction: dir,
        hasSpouse: sMap.has(m.id) && sMap.get(m.id).length > 0,
        selected: selectedMember?.id === m.id,
        onEdit: () => openEditModal(m),
        onAddChild: () => openAddModal(m, "child"),
        onDelete: () => {
          setSelectedMember(m);
          setMemberToDelete(m.id);
          setShowDeleteModal(true);
        },
      },
      position: { x: 0, y: 0 },
    }));
    const parentEdges = membersData
      .filter((m) => m.father_id || m.mother_id)
      .flatMap((m) => {
        const es = [];
        if (m.father_id)
          es.push({
            id: `edge-${m.id}-father`,
            source: String(m.father_id),
            target: String(m.id),
            type: "smoothstep",
            style: { stroke: "#6366f1", strokeWidth: 2 },
            label: "Father",
            labelStyle: { fill: "#6366f1", fontWeight: 600, fontSize: 11 },
            labelBgStyle: { fill: "#fff" },
          });
        if (m.mother_id)
          es.push({
            id: `edge-${m.id}-mother`,
            source: String(m.mother_id),
            target: String(m.id),
            type: "smoothstep",
            style: { stroke: "#ec4899", strokeWidth: 2 },
            label: "Mother",
            labelStyle: { fill: "#ec4899", fontWeight: 600, fontSize: 11 },
            labelBgStyle: { fill: "#fff" },
          });
        return es;
      });
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      parentEdges,
      dir,
    );
    const spouseEdges = spousesData.map((s) => ({
      id: `spouse-${s.id}`,
      source: String(s.member1_id),
      target: String(s.member2_id),
      type: "straight",
      style: { stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "8 4" },
      label: "Wife",
      labelStyle: { fill: "#f59e0b", fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: "#fff" },
    }));
    setNodes(layoutedNodes);
    setEdges([...layoutedEdges, ...spouseEdges]);
  };

  const toggleDirection = () => {
    const nd = direction === "TB" ? "LR" : "TB";
    setDirection(nd);
    buildFlow(members, spouses, spouseMap, nd);
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) canvasRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const captureTree = async () => {
    const el = document.querySelector(".react-flow");
    if (!el) throw new Error("Tree canvas element not found");

    const rect = el.getBoundingClientRect();
    const pixelRatio = 2;

    const dataUrl = await toPng(el, {
      backgroundColor: "#ffffff",
      pixelRatio,
      cacheBust: true,
      skipFonts: true,
      filter: (node) => {
        if (!node.classList) return true;
        return !(
          node.classList.contains("react-flow__controls") ||
          node.classList.contains("react-flow__minimap") ||
          node.classList.contains("react-flow__panel") ||
          node.classList.contains("react-flow__attribution")
        );
      },
    });

    return {
      dataUrl,
      width: Math.round(rect.width * pixelRatio),
      height: Math.round(rect.height * pixelRatio),
    };
  };

  const exportToPNG = async () => {
    setActionLoading(true);
    setError("");
    try {
      const { dataUrl } = await captureTree();
      const link = document.createElement("a");
      link.download = `family-tree-${id}.png`;
      link.href = dataUrl;
      link.click();
      setSuccess("PNG downloaded!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("PNG export error:", err); // <-- now you'll SEE the real reason if it fails again
      setError("PNG export failed");
    } finally {
      setActionLoading(false);
    }
  };

  const exportToPDF = async () => {
    setActionLoading(true);
    setError("");
    try {
      const { dataUrl, width, height } = await captureTree();
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
      pdf.save(`family-tree-${id}.pdf`);
      setSuccess("PDF downloaded!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("PDF export error:", err);
      setError("PDF export failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (member) => {
    setFormData({
      name: member.name || "",
      gender: member.gender || "male",
      birth_date: member.birth_date ? member.birth_date.slice(0, 10) : "",
      death_date: member.death_date ? member.death_date.slice(0, 10) : "",
      photo_url: member.photo_url || "",
      bio: member.bio || "",
      father_id: member.father_id,
      mother_id: member.mother_id,
      isDeceased: !!member.death_date,
    });
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const openAddModal = (anchorMember = null, mode = "root") => {
    let rel = "root";
    if (anchorMember) {
      if (mode === "child") rel = "child";
      else if (mode === "father") rel = "father";
      else if (mode === "mother") rel = "mother";
      else rel = "child";
    }
    setSelectedRelation(rel);
    const spouseId = anchorMember ? getFirstSpouseId(anchorMember.id) : null;
    let father_id = null,
      mother_id = null,
      gender = "male";
    if (anchorMember) {
      if (rel === "child") {
        gender = "male";
        if (anchorMember.gender === "male") {
          father_id = anchorMember.id;
          mother_id = spouseId;
        } else {
          mother_id = anchorMember.id;
          father_id = spouseId;
        }
      } else if (rel === "son") {
        gender = "male";
        if (anchorMember.gender === "male") {
          father_id = anchorMember.id;
          mother_id = spouseId;
        } else {
          mother_id = anchorMember.id;
          father_id = spouseId;
        }
      } else if (rel === "daughter") {
        gender = "female";
        if (anchorMember.gender === "male") {
          father_id = anchorMember.id;
          mother_id = spouseId;
        } else {
          mother_id = anchorMember.id;
          father_id = spouseId;
        }
      } else if (rel === "brother" || rel === "sister" || rel === "sibling") {
        father_id = anchorMember.father_id;
        mother_id = anchorMember.mother_id;
        gender =
          rel === "brother" ? "male" : rel === "sister" ? "female" : "male";
      } else if (rel === "father") {
        gender = "male";
      } else if (rel === "mother") {
        gender = "female";
      } else if (rel === "husband") {
        gender = "male";
      } else if (rel === "wife") {
        gender = "female";
      }
    }
    setFormData({
      name: "",
      gender,
      birth_date: "",
      death_date: "",
      photo_url: "",
      bio: "",
      father_id,
      mother_id,
      isDeceased: false,
    });
    setSelectedMember(anchorMember);
    setError("");
    setShowAddModal(true);
  };

  const handleRelationChange = (rel) => {
    setSelectedRelation(rel);
    const anchor = selectedMember;
    const spouseId = anchor ? getFirstSpouseId(anchor.id) : null;
    let father_id = null,
      mother_id = null,
      gender = formData.gender;
    switch (rel) {
      case "son":
        gender = "male";
        if (anchor) {
          if (anchor.gender === "male") {
            father_id = anchor.id;
            mother_id = spouseId;
          } else {
            mother_id = anchor.id;
            father_id = spouseId;
          }
        }
        break;
      case "daughter":
        gender = "female";
        if (anchor) {
          if (anchor.gender === "male") {
            father_id = anchor.id;
            mother_id = spouseId;
          } else {
            mother_id = anchor.id;
            father_id = spouseId;
          }
        }
        break;
      case "child":
        if (anchor) {
          if (anchor.gender === "male") {
            father_id = anchor.id;
            mother_id = spouseId;
          } else {
            mother_id = anchor.id;
            father_id = spouseId;
          }
        }
        break;
      case "father":
        gender = "male";
        father_id = null;
        mother_id = null;
        break;
      case "mother":
        gender = "female";
        father_id = null;
        mother_id = null;
        break;
      case "brother":
        gender = "male";
        if (anchor) {
          father_id = anchor.father_id;
          mother_id = anchor.mother_id;
        }
        break;
      case "sister":
        gender = "female";
        if (anchor) {
          father_id = anchor.father_id;
          mother_id = anchor.mother_id;
        }
        break;
      case "sibling":
        if (anchor) {
          father_id = anchor.father_id;
          mother_id = anchor.mother_id;
        }
        break;
      case "husband":
        gender = "male";
        father_id = null;
        mother_id = null;
        break;
      case "wife":
        gender = "female";
        father_id = null;
        mother_id = null;
        break;
      case "spouse":
        father_id = null;
        mother_id = null;
        break;
      case "root":
        father_id = null;
        mother_id = null;
        break;
      default:
        break;
    }
    setFormData((prev) => ({ ...prev, gender, father_id, mother_id }));
  };

  const handleSaveEdit = async () => {
    if (!selectedMember) return;
    setActionLoading(true);
    setError("");
    try {
      const payload = {
        name: formData.name.trim(),
        gender: formData.gender,
        birth_date: formData.birth_date || null,
        death_date: formData.isDeceased ? formData.death_date || null : null,
        photo_url: formData.photo_url || null,
        bio: formData.bio || null,
        father_id: formData.father_id || null,
        mother_id: formData.mother_id || null,
      };
      await axios.put(
        `${API}/members/${selectedMember.id}`,
        payload,
        authHeaders,
      );
      await fetchAll();
      setShowEditModal(false);
      setSuccess("Member updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      const payload = {
        name: formData.name.trim(),
        gender: formData.gender,
        birth_date: formData.birth_date || null,
        death_date: formData.isDeceased ? formData.death_date || null : null,
        photo_url: formData.photo_url || null,
        bio: formData.bio || null,
        father_id: formData.father_id || null,
        mother_id: formData.mother_id || null,
        tree_id: id,
      };
      const res = await axios.post(`${API}/members`, payload, authHeaders);
      const newMember = res.data;

      // If adding parent -> update anchor
      if (
        (selectedRelation === "father" || selectedRelation === "mother") &&
        selectedMember
      ) {
        const anchor = selectedMember;
        await axios.put(
          `${API}/members/${anchor.id}`,
          {
            name: anchor.name,
            gender: anchor.gender,
            birth_date: anchor.birth_date
              ? anchor.birth_date.slice(0, 10)
              : null,
            death_date: anchor.death_date
              ? anchor.death_date.slice(0, 10)
              : null,
            photo_url: anchor.photo_url,
            bio: anchor.bio,
            father_id:
              selectedRelation === "father" ? newMember.id : anchor.father_id,
            mother_id:
              selectedRelation === "mother" ? newMember.id : anchor.mother_id,
          },
          authHeaders,
        );
      }
      // If spouse -> create spouse link
      if (
        ["husband", "wife", "spouse"].includes(selectedRelation) &&
        selectedMember
      ) {
        await axios.post(
          `${API}/members/spouses`,
          {
            tree_id: id,
            member1_id: selectedMember.id,
            member2_id: newMember.id,
          },
          authHeaders,
        );
      }

      await fetchAll();
      setShowAddModal(false);
      setSuccess("Member added!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    setActionLoading(true);
    setError("");
    try {
      await axios.delete(`${API}/members/${memberToDelete}`, authHeaders);
      await fetchAll();
      setShowDeleteModal(false);
      setMemberToDelete(null);
      setSelectedMember(null);
      setSuccess("Member deleted");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete");
    } finally {
      setActionLoading(false);
    }
  };

  const onNodeClick = useCallback(
    (_, node) => {
      const m = members.find((mm) => mm.id === Number(node.id));
      if (m) setSelectedMember(m);
    },
    [members],
  );

  // const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const invalidParentIds = useMemo(() => {
    if (!selectedMember) return new Set();
    const d = getDescendantIds(selectedMember.id, members);
    d.add(selectedMember.id);
    return d;
  }, [selectedMember, members]);

  const relationOptions = useMemo(() => {
    if (!selectedMember)
      return [
        {
          value: "root",
          label: "Root Member (No relation)",
          desc: "A founding member with no parents",
        },
      ];
    return [
      {
        value: "son",
        label: "Son of " + selectedMember.name,
        desc: `Male child. ${selectedMember.name} will be parent`,
      },
      {
        value: "daughter",
        label: "Daughter of " + selectedMember.name,
        desc: `Female child. ${selectedMember.name} will be parent`,
      },
      {
        value: "child",
        label: "Child (custom gender)",
        desc: `Child of ${selectedMember.name}`,
      },
      {
        value: "father",
        label: "Father of " + selectedMember.name,
        desc: `Will become father of ${selectedMember.name}`,
      },
      {
        value: "mother",
        label: "Mother of " + selectedMember.name,
        desc: `Will become mother of ${selectedMember.name}`,
      },
      {
        value: "brother",
        label: "Brother of " + selectedMember.name,
        desc: `Shares same parents as ${selectedMember.name}`,
      },
      {
        value: "sister",
        label: "Sister of " + selectedMember.name,
        desc: `Shares same parents as ${selectedMember.name}`,
      },
      { value: "sibling", label: "Sibling (custom)", desc: `Shares parents` },
      {
        value: "wife",
        label: "Wife of " + selectedMember.name,
        desc: `Spouse (female)`,
      },
      {
        value: "husband",
        label: "Husband of " + selectedMember.name,
        desc: `Spouse (male)`,
      },
      {
        value: "spouse",
        label: "Spouse / Partner",
        desc: `Partner of ${selectedMember.name}`,
      },
    ];
  }, [selectedMember]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-6 animate-pulse flex items-center justify-center text-white">
            <TreeIcon />
          </div>
          <p className="text-xl font-semibold">Loading tree...</p>
        </div>
      </div>
    );

  const getMemberById = (mid) => members.find((m) => m.id === mid);
  const selFather = selectedMember?.father_id
    ? getMemberById(selectedMember.father_id)
    : null;
  const selMother = selectedMember?.mother_id
    ? getMemberById(selectedMember.mother_id)
    : null;
  const selChildren = selectedMember
    ? members.filter(
        (m) =>
          m.father_id === selectedMember.id ||
          m.mother_id === selectedMember.id,
      )
    : [];
  const selSpouseIds = selectedMember
    ? spouseMap.get(selectedMember.id) || []
    : [];
  const selSpouses = selSpouseIds.map(getMemberById).filter(Boolean);
  const selSiblings = selectedMember
    ? members.filter(
        (m) =>
          m.id !== selectedMember.id &&
          ((m.father_id && m.father_id === selectedMember.father_id) ||
            (m.mother_id && m.mother_id === selectedMember.mother_id)),
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-700 hover:text-primary group"
          >
            <div className="p-2 bg-gray-100 group-hover:bg-primary/10 rounded-lg">
              <ArrowLeftIcon />
            </div>
            <span className="text-xl font-bold">Back</span>
          </button>
          <button
            onClick={() => openAddModal(null, "root")}
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold flex items-center gap-2"
          >
            <UserPlusIcon />
            Add Member
          </button>
        </div>
      </nav>

      <div className="bg-white/60 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />{" "}
              {treeStats.total} Members
            </span>
            <span className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />{" "}
              {treeStats.males} Males
            </span>
            <span className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full" />{" "}
              {treeStats.females} Females
            </span>
            <span className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />{" "}
              {treeStats.generations} Gen
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <InfoIcon />
            <span>Click node for details • Hover for quick actions</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            className="fixed top-32 right-6 z-50"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
              {success}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={canvasRef}
        className={isFullscreen ? "h-screen bg-white" : "h-[calc(100vh-180px)]"}
      >
        {members.length === 0 ? (
          <div className="h-full flex items-center justify-center px-6">
            <motion.div
              className="text-center bg-white/80 rounded-3xl p-12 shadow-xl border max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold mb-2">
                Plant Your Family Tree
              </h3>
              <p className="text-gray-600 mb-6">Add first member to start.</p>
              <button
                onClick={() => openAddModal(null, "root")}
                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold inline-flex items-center gap-2"
              >
                <PlusIcon />
                Add First Member
              </button>
            </motion.div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{ type: "smoothstep" }}
          >
            <TreeCanvas
              nodes={nodes}
              setNodes={setNodes}
              members={members}
              direction={direction}
              onToggleDirection={toggleDirection}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              onSelectFromSearch={setSelectedMember}
              onExportPDF={exportToPDF}
              onExportPNG={exportToPNG}
            />
            <Controls
              position="bottom-left"
              className="bg-white/80 rounded-xl shadow-lg border overflow-hidden"
              showInteractive={false}
            />
            <MiniMap
              position="bottom-right"
              className="bg-white/80 rounded-xl shadow-lg border overflow-hidden"
              nodeColor={(n) =>
                n.data?.gender === "female" ? "#ec4899" : "#6366f1"
              }
              maskColor="rgba(240,240,240,0.6)"
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#888"
            />
          </ReactFlow>
        )}
      </div>

      <AnimatePresence>
        {error && !showEditModal && !showAddModal && (
          <motion.div
            className="fixed top-32 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedMember && !showEditModal && !showAddModal && (
          <motion.div
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-full md:max-w-md bg-white rounded-3xl shadow-2xl border p-6 z-40 max-h-[75vh] overflow-y-auto"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${selectedMember.gender === "female" ? "bg-gradient-to-br from-pink-400 to-rose-500" : "bg-gradient-to-br from-blue-400 to-indigo-500"}`}
                >
                  {selectedMember.photo_url ? (
                    <img
                      src={selectedMember.photo_url}
                      alt={selectedMember.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    selectedMember.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedMember.name}</h3>
                  <div className="text-sm text-gray-500 capitalize">
                    {selectedMember.gender}
                    {selectedMember.death_date ? " • Deceased" : ""}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              {selFather && (
                <div>
                  👨 Father: <b>{selFather.name}</b>
                </div>
              )}
              {selMother && (
                <div>
                  👩 Mother: <b>{selMother.name}</b>
                </div>
              )}
              {selSpouses.length > 0 && (
                <div>
                  ⭐ Spouse:{" "}
                  {selSpouses.map((s) => (
                    <b key={s.id} className="mr-2">
                      {s.name}
                    </b>
                  ))}
                </div>
              )}
              {selSiblings.length > 0 && (
                <div>
                  👥 Siblings: {selSiblings.map((s) => s.name).join(", ")}
                </div>
              )}
              {selChildren.length > 0 && (
                <div>
                  👶 Children: {selChildren.map((c) => c.name).join(", ")}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <span>🎂</span>
                {selectedMember.birth_date
                  ? `Born ${new Date(selectedMember.birth_date).toLocaleDateString()}`
                  : "Birth unknown"}{" "}
                {selectedMember.death_date
                  ? ` • Died ${new Date(selectedMember.death_date).toLocaleDateString()}`
                  : ""}
              </div>
              {selectedMember.bio && (
                <div className="p-3 bg-gray-50 rounded-xl text-sm">
                  {selectedMember.bio}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => openEditModal(selectedMember)}
                className="py-3 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <EditIcon />
                Edit
              </button>
              <button
                onClick={() => {
                  setMemberToDelete(selectedMember.id);
                  setShowDeleteModal(true);
                }}
                className="py-3 bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <TrashIcon />
                Delete
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {!selectedMember.father_id && (
                <button
                  onClick={() => {
                    setSelectedRelation("father");
                    openAddModal(selectedMember, "father");
                  }}
                  className="py-2 border-2 border-blue-400 text-blue-600 rounded-xl text-xs font-bold"
                >
                  + Father
                </button>
              )}
              {!selectedMember.mother_id && (
                <button
                  onClick={() => {
                    setSelectedRelation("mother");
                    openAddModal(selectedMember, "mother");
                  }}
                  className="py-2 border-2 border-pink-400 text-pink-600 rounded-xl text-xs font-bold"
                >
                  + Mother
                </button>
              )}
              <button
                onClick={() => openAddModal(selectedMember, "child")}
                className="py-2 border-2 border-green-500 text-green-600 rounded-xl text-xs font-bold"
              >
                + Child
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setSelectedRelation("brother");
                  openAddModal(selectedMember, "child");
                  handleRelationChange("brother");
                }}
                className="py-2 border border-gray-300 rounded-xl text-xs"
              >
                + Brother
              </button>
              <button
                onClick={() => {
                  setSelectedRelation("sister");
                  openAddModal(selectedMember, "child");
                }}
                className="py-2 border border-gray-300 rounded-xl text-xs"
              >
                + Sister
              </button>
              <button
                onClick={() => {
                  setSelectedRelation("spouse");
                  openAddModal(selectedMember, "child");
                }}
                className="py-2 border border-amber-400 text-amber-600 rounded-xl text-xs"
              >
                + Spouse
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedMember && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-1">
                Edit {selectedMember.name}
              </h2>
              <p className="text-sm text-gray-500 mb-6">Update information</p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Full Name *</label>
                  <input
                    className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Gender</label>
                  <select
                    className="w-full mt-1 px-4 py-3 border rounded-xl"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Father</label>
                  <select
                    className="w-full mt-1 px-4 py-3 border rounded-xl"
                    value={formData.father_id ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        father_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">None (no father linked)</option>
                    {members
                      .filter((m) => !invalidParentIds.has(m.id))
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Mother</label>
                  <select
                    className="w-full mt-1 px-4 py-3 border rounded-xl"
                    value={formData.mother_id ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mother_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">None (no mother linked)</option>
                    {members
                      .filter((m) => !invalidParentIds.has(m.id))
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">
                    Birth Date (optional)
                  </label>
                  <input
                    type="date"
                    className="w-full mt-1 px-4 py-3 border rounded-xl"
                    value={formData.birth_date}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isDeceased}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isDeceased: e.target.checked,
                        })
                      }
                    />{" "}
                    This person has passed away
                  </label>
                  {formData.isDeceased && (
                    <input
                      type="date"
                      className="w-full mt-1 px-4 py-3 border rounded-xl"
                      value={formData.death_date}
                      onChange={(e) =>
                        setFormData({ ...formData, death_date: e.target.value })
                      }
                    />
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium">
                  Photo URL (optional)
                </label>
                <input
                  type="url"
                  className="w-full mt-1 px-4 py-3 border rounded-xl"
                  value={formData.photo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, photo_url: e.target.value })
                  }
                />
              </div>
              <div className="mb-6">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  className="w-full mt-1 px-4 py-3 border rounded-xl"
                  rows="3"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal - NEW RELATIONSHIP UX */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold">
                {selectedMember
                  ? `Add relative of ${selectedMember.name}`
                  : "Add New Member"}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Choose relationship, then fill details. Death date is optional.
              </p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {selectedMember && (
                <div className="mb-4">
                  <label className="text-sm font-bold text-gray-700">
                    Relationship Type *
                  </label>
                  <select
                    className="w-full mt-1 px-4 py-3 border-2 border-primary/30 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
                    value={selectedRelation}
                    onChange={(e) => handleRelationChange(e.target.value)}
                  >
                    {relationOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
                    ℹ️{" "}
                    {
                      relationOptions.find((o) => o.value === selectedRelation)
                        ?.desc
                    }
                    {["son", "daughter", "child"].includes(selectedRelation) &&
                      getFirstSpouseId(selectedMember.id) && (
                        <div className="mt-1">
                          ✅ Other parent auto-filled:{" "}
                          <b>
                            {
                              getMemberById(getFirstSpouseId(selectedMember.id))
                                ?.name
                            }
                          </b>{" "}
                          (you can change)
                        </div>
                      )}
                    {["brother", "sister", "sibling"].includes(
                      selectedRelation,
                    ) && (
                      <div className="mt-1">
                        Will share Father:{" "}
                        {getMemberById(selectedMember.father_id)?.name ||
                          "None"}{" "}
                        & Mother:{" "}
                        {getMemberById(selectedMember.mother_id)?.name ||
                          "None"}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Full Name *</label>
                  <input
                    className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g., Priya Sharma"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Gender *{" "}
                    {["son", "father", "brother", "husband"].includes(
                      selectedRelation,
                    )
                      ? "(auto male)"
                      : ["daughter", "mother", "sister", "wife"].includes(
                            selectedRelation,
                          )
                        ? "(auto female)"
                        : ""}
                  </label>
                  <select
                    disabled={[
                      "son",
                      "daughter",
                      "father",
                      "mother",
                      "brother",
                      "sister",
                      "wife",
                      "husband",
                    ].includes(selectedRelation)}
                    className="w-full mt-1 px-4 py-3 border rounded-xl disabled:bg-gray-100"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Show parent selectors only when relevant */}
              {[
                "son",
                "daughter",
                "child",
                "brother",
                "sister",
                "sibling",
              ].includes(selectedRelation) && (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium">
                      Father{" "}
                      {selectedRelation === "brother" ||
                      selectedRelation === "sister" ||
                      selectedRelation === "sibling"
                        ? "(shared)"
                        : "(Parent 1)"}
                    </label>
                    <select
                      className="w-full mt-1 px-4 py-3 border rounded-xl"
                      value={formData.father_id ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          father_id: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    >
                      <option value="">None</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Mother{" "}
                      {selectedRelation === "brother" ||
                      selectedRelation === "sister" ||
                      selectedRelation === "sibling"
                        ? "(shared)"
                        : "(Parent 2)"}
                    </label>
                    <select
                      className="w-full mt-1 px-4 py-3 border rounded-xl"
                      value={formData.mother_id ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mother_id: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    >
                      <option value="">None</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">
                    Birth Date (optional)
                  </label>
                  <input
                    type="date"
                    className="w-full mt-1 px-4 py-3 border rounded-xl"
                    value={formData.birth_date}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isDeceased}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isDeceased: e.target.checked,
                        })
                      }
                    />{" "}
                    Deceased? (death date optional)
                  </label>
                  {formData.isDeceased && (
                    <input
                      type="date"
                      className="w-full mt-2 px-4 py-3 border rounded-xl"
                      value={formData.death_date}
                      onChange={(e) =>
                        setFormData({ ...formData, death_date: e.target.value })
                      }
                    />
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium">
                  Photo URL (optional)
                </label>
                <input
                  type="url"
                  className="w-full mt-1 px-4 py-3 border rounded-xl"
                  placeholder="https://..."
                  value={formData.photo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, photo_url: e.target.value })
                  }
                />
              </div>
              <div className="mb-6">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  className="w-full mt-1 px-4 py-3 border rounded-xl"
                  rows="3"
                  placeholder="Short story..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={actionLoading || !formData.name.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {actionLoading ? "Adding..." : "Add Member"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                  <TrashIcon />
                </div>
                <h2 className="text-2xl font-bold mb-2">Delete Member?</h2>
                <p className="text-gray-600">
                  This will permanently remove <b>{selectedMember?.name}</b>.
                  Cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 border rounded-xl"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMember}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {actionLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import Dagre from '@dagrejs/dagre';
// import {
//   ReactFlow,
//   useReactFlow,
//   useNodesState,
//   useEdgesState,
//   Controls,
//   Background,
//   BackgroundVariant,
//   MiniMap,
//   Panel,
//   Handle,
//   Position
// } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';

// const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// const NODE_WIDTH = 210;
// const NODE_HEIGHT = 96;

// /* ---------------------------------- Layout ---------------------------------- */

// function getLayoutedElements(nodes, edges, direction = 'TB') {
//   const dagreGraph = new Dagre.graphlib.Graph();
//   dagreGraph.setDefaultEdgeLabel(() => ({}));
//   dagreGraph.setGraph({
//     rankdir: direction,
//     nodesep: 90,
//     ranksep: 130,
//     marginx: 60,
//     marginy: 60
//   });

//   nodes.forEach((node) => {
//     dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
//   });
//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   Dagre.layout(dagreGraph);

//   const layoutedNodes = nodes.map((node) => {
//     const { x, y } = dagreGraph.node(node.id);
//     return { ...node, position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 } };
//   });

//   return { nodes: layoutedNodes, edges };
// }

// /* ------------------------------- Helpers ------------------------------- */

// // Generation depth (0 = root/founder), based on longest ancestor chain
// function computeGenerations(members) {
//   const byId = new Map(members.map((m) => [m.id, m]));
//   const memo = new Map();
//   const visiting = new Set();

//   const getGen = (id) => {
//     if (memo.has(id)) return memo.get(id);
//     if (visiting.has(id)) return 0; // cycle guard
//     visiting.add(id);
//     const m = byId.get(id);
//     if (!m || (!m.father_id && !m.mother_id)) {
//       memo.set(id, 0);
//       visiting.delete(id);
//       return 0;
//     }
//     const fatherGen = m.father_id && byId.has(m.father_id) ? getGen(m.father_id) : -1;
//     const motherGen = m.mother_id && byId.has(m.mother_id) ? getGen(m.mother_id) : -1;
//     const gen = Math.max(fatherGen, motherGen) + 1;
//     memo.set(id, gen);
//     visiting.delete(id);
//     return gen;
//   };

//   members.forEach((m) => getGen(m.id));
//   return memo;
// }

// // Prevent choosing a descendant (or self) as someone's parent
// function getDescendantIds(memberId, members) {
//   const ids = new Set();
//   const queue = [memberId];
//   while (queue.length) {
//     const cur = queue.pop();
//     members.forEach((m) => {
//       if ((m.father_id === cur || m.mother_id === cur) && !ids.has(m.id)) {
//         ids.add(m.id);
//         queue.push(m.id);
//       }
//     });
//   }
//   return ids;
// }

// /* ------------------------------ Custom Node ------------------------------ */

// function CustomNode({ id, data, selected }) {
//   const isFemale = data.gender === 'female';
//   const isOther = data.gender === 'other';
//   const ring = isFemale
//     ? 'from-rose-400 to-pink-500'
//     : isOther
//     ? 'from-purple-400 to-fuchsia-500'
//     : 'from-blue-400 to-indigo-500';

//   const isHorizontal = data.direction === 'LR';

//   return (
//     <div
//       className={`group relative rounded-2xl border-2 bg-white transition-all duration-300 ${
//         selected
//           ? 'border-primary shadow-2xl shadow-primary/40 scale-[1.06] z-10'
//           : 'border-gray-100 shadow-md hover:border-primary/40 hover:shadow-xl'
//       }`}
//       style={{ width: NODE_WIDTH }}
//     >
//       <Handle
//         type="target"
//         position={isHorizontal ? Position.Left : Position.Top}
//         className="!w-2 !h-2 !bg-gray-300 !border-0"
//       />
//       <Handle
//         type="source"
//         position={isHorizontal ? Position.Right : Position.Bottom}
//         className="!w-2 !h-2 !bg-gray-300 !border-0"
//       />

//       {data.isRoot && (
//         <div
//           className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg drop-shadow"
//           title="Family Founder"
//         >
//           👑
//         </div>
//       )}

//       <div
//         className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow text-[10px] font-extrabold flex items-center justify-center text-primary"
//         title={`Generation ${data.generation + 1}`}
//       >
//         G{data.generation + 1}
//       </div>

//       <div className="p-3 flex items-center gap-3">
//         <div
//           className={`relative w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br ${ring} p-[2px] ${
//             data.isDeceased ? 'grayscale opacity-80' : ''
//           }`}
//         >
//           <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
//             {data.photo_url ? (
//               <img src={data.photo_url} alt={data.name} className="w-full h-full object-cover rounded-full" />
//             ) : (
//               <span className="text-lg font-bold text-gray-700">
//                 {data.name?.charAt(0).toUpperCase()}
//               </span>
//             )}
//           </div>
//           {data.isDeceased && (
//             <div
//               className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center text-white text-[9px]"
//               title="Deceased"
//             >
//               ✝
//             </div>
//           )}
//         </div>

//         <div className="min-w-0 flex-1">
//           <div className="font-bold text-gray-900 text-sm truncate">{data.name}</div>
//           <div className="text-[11px] text-gray-500">
//             {data.birthYear ? `${data.birthYear} – ${data.deathYear || 'Present'}` : 'Dates unknown'}
//           </div>
//         </div>
//       </div>

//       {/* Hover quick actions */}
//       <div className="absolute inset-x-0 -bottom-4 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//         <button
//           onClick={(e) => { e.stopPropagation(); data.onEdit?.(); }}
//           className="w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all text-xs"
//           title="Edit"
//         >
//           ✎
//         </button>
//         <button
//           onClick={(e) => { e.stopPropagation(); data.onAddChild?.(); }}
//           className="w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all text-sm font-bold"
//           title="Add Child"
//         >
//           +
//         </button>
//         <button
//           onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }}
//           className="w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs"
//           title="Delete"
//         >
//           ✕
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ---------------------------------- Icons --------------------------------- */

// const PlusIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//   </svg>
// );
// const UserPlusIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
//   </svg>
// );
// const EditIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//   </svg>
// );
// const TrashIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//   </svg>
// );
// const ArrowLeftIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//   </svg>
// );
// const TreeIcon = () => (
//   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20l3-9m0 0l3 9m-3-9v9m6-9l3 9m-3-9V9m-3 11V9m0 11a9 9 0 01-9-9 9 9 0 0118 0 9 9 0 01-9 9z" />
//   </svg>
// );
// const InfoIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// );
// const SearchIcon = () => (
//   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//   </svg>
// );
// const FitViewIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M4 4l6 6m10-2V4h-4m4 0l-6 6M4 16v4h4m-4 0l6-6m10 6l-6-6m6 6v-4h-4" />
//   </svg>
// );
// const LayoutIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
//   </svg>
// );
// const FullscreenIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4m12-4v4h-4" />
//   </svg>
// );
// const FullscreenExitIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4v4H5m14-4v4h-4M5 20v-4h4m10 4v-4h-4" />
//   </svg>
// );

// /* -------------------------------- Toolbar / Canvas -------------------------------- */

// function TreeCanvas({
//   nodes,
//   setNodes,
//   members,
//   direction,
//   onToggleDirection,
//   isFullscreen,
//   onToggleFullscreen,
//   onSelectFromSearch
// }) {
//   const { setCenter, fitView } = useReactFlow();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [showLegend, setShowLegend] = useState(true);

//   const matches = useMemo(() => {
//     if (!searchTerm.trim()) return [];
//     const q = searchTerm.toLowerCase();
//     return members.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 6);
//   }, [searchTerm, members]);

//   const focusOnMember = (member) => {
//     const node = nodes.find((n) => n.id === String(member.id));
//     if (node) {
//       setCenter(node.position.x + NODE_WIDTH / 2, node.position.y + NODE_HEIGHT / 2, {
//         zoom: 1.4,
//         duration: 800
//       });
//       setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
//     }
//     onSelectFromSearch(member);
//     setSearchTerm('');
//     setShowSuggestions(false);
//   };

//   return (
//     <>
//       <Panel
//         position="top-left"
//         className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-100"
//       >
//         <div className="flex items-center gap-2">
//           <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
//             <TreeIcon />
//           </div>
//           <div>
//             <div className="font-bold text-gray-900">Family Tree</div>
//             <div className="text-xs text-gray-500">Drag to pan • Scroll to zoom</div>
//           </div>
//         </div>
//       </Panel>

//       <Panel position="top-right" className="flex flex-col items-end gap-2">
//         <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-2 flex items-center gap-2 flex-wrap justify-end max-w-[90vw]">
//           <div className="relative">
//             <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 gap-2 border border-gray-200 focus-within:ring-2 focus-within:ring-primary">
//               <SearchIcon />
//               <input
//                 type="text"
//                 placeholder="Search member..."
//                 className="bg-transparent outline-none text-sm w-28 sm:w-40"
//                 value={searchTerm}
//                 onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
//                 onFocus={() => setShowSuggestions(true)}
//               />
//             </div>
//             <AnimatePresence>
//               {showSuggestions && matches.length > 0 && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -5 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -5 }}
//                   className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
//                 >
//                   {matches.map((m) => (
//                     <button
//                       key={m.id}
//                       onClick={() => focusOnMember(m)}
//                       className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 flex items-center gap-2"
//                     >
//                       <span
//                         className={`w-2 h-2 rounded-full ${
//                           m.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
//                         }`}
//                       />
//                       {m.name}
//                     </button>
//                   ))}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           <button
//             onClick={() => fitView({ duration: 600, padding: 0.2 })}
//             className="p-2 rounded-lg bg-gray-50 hover:bg-primary hover:text-white transition-all border border-gray-200"
//             title="Fit View"
//           >
//             <FitViewIcon />
//           </button>
//           <button
//             onClick={onToggleDirection}
//             className="p-2 rounded-lg bg-gray-50 hover:bg-primary hover:text-white transition-all border border-gray-200"
//             title={`Switch to ${direction === 'TB' ? 'Horizontal' : 'Vertical'} Layout`}
//           >
//             <LayoutIcon />
//           </button>
//           <button
//             onClick={() => setShowLegend((s) => !s)}
//             className="p-2 rounded-lg bg-gray-50 hover:bg-primary hover:text-white transition-all border border-gray-200"
//             title="Toggle Legend"
//           >
//             <InfoIcon />
//           </button>
//           <button
//             onClick={onToggleFullscreen}
//             className="p-2 rounded-lg bg-gray-50 hover:bg-primary hover:text-white transition-all border border-gray-200"
//             title="Toggle Fullscreen"
//           >
//             {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
//           </button>
//         </div>
//       </Panel>

//       {showLegend && (
//         <Panel
//           position="bottom-center"
//           className="hidden sm:flex bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-3 text-xs text-gray-600 gap-4 items-center"
//         >
//           <span className="font-bold text-gray-800">Legend:</span>
//           <span className="flex items-center gap-1.5">
//             <span className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500" /> Male
//           </span>
//           <span className="flex items-center gap-1.5">
//             <span className="w-3 h-3 rounded-full bg-gradient-to-br from-rose-400 to-pink-500" /> Female
//           </span>
//           <span className="flex items-center gap-1.5">
//             <span className="w-4 h-0.5 bg-indigo-500 inline-block" /> Father
//           </span>
//           <span className="flex items-center gap-1.5">
//             <span className="w-4 h-0.5 bg-pink-500 inline-block" /> Mother
//           </span>
//           <span className="flex items-center gap-1.5">👑 Founder</span>
//           <span className="flex items-center gap-1.5">✝ Deceased</span>
//         </Panel>
//       )}
//     </>
//   );
// }

// /* ---------------------------------- Main ---------------------------------- */

// export default function TreeView() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const token = localStorage.getItem('token');
//   const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
//   const canvasRef = useRef(null);

//   const [members, setMembers] = useState([]);
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [memberToDelete, setMemberToDelete] = useState(null);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [treeStats, setTreeStats] = useState({ total: 0, males: 0, females: 0, generations: 0 });
//   const [direction, setDirection] = useState('TB');
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [addMode, setAddMode] = useState('root'); // 'root' | 'child' | 'father' | 'mother'

//   const [formData, setFormData] = useState({
//     name: '',
//     gender: 'male',
//     birth_date: '',
//     death_date: '',
//     photo_url: '',
//     bio: '',
//     father_id: null,
//     mother_id: null
//   });

//   useEffect(() => {
//     fetchMembers();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   useEffect(() => {
//     const handler = () => setIsFullscreen(!!document.fullscreenElement);
//     document.addEventListener('fullscreenchange', handler);
//     return () => document.removeEventListener('fullscreenchange', handler);
//   }, []);

//   const fetchMembers = async (dir = direction) => {
//     try {
//       const res = await axios.get(`${API}/members/${id}`, authHeaders);
//       setMembers(res.data);
//       buildFlow(res.data, dir);

//       const genMap = computeGenerations(res.data);
//       setTreeStats({
//         total: res.data.length,
//         males: res.data.filter((m) => m.gender === 'male').length,
//         females: res.data.filter((m) => m.gender === 'female').length,
//         generations: res.data.length ? Math.max(...res.data.map((m) => genMap.get(m.id) ?? 0)) + 1 : 0
//       });
//     } catch (err) {
//       setError('Failed to load family members.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const requestEdit = (member) => openEditModal(member);
//   const requestAddChild = (member) => openAddModal(member, 'child');
//   const requestDelete = (member) => {
//     setSelectedMember(member);
//     setMemberToDelete(member.id);
//     setShowDeleteModal(true);
//   };

//   const buildFlow = (membersData, dir = direction) => {
//     const genMap = computeGenerations(membersData);

//     const rawNodes = membersData.map((m) => ({
//       id: String(m.id),
//       type: 'custom',
//       data: {
//         name: m.name,
//         gender: m.gender,
//         photo_url: m.photo_url,
//         birthYear: m.birth_date ? new Date(m.birth_date).getFullYear() : null,
//         deathYear: m.death_date ? new Date(m.death_date).getFullYear() : null,
//         isDeceased: !!m.death_date,
//         isRoot: !m.father_id && !m.mother_id,
//         generation: genMap.get(m.id) ?? 0,
//         direction: dir,
//         onEdit: () => requestEdit(m),
//         onAddChild: () => requestAddChild(m),
//         onDelete: () => requestDelete(m)
//       },
//       position: { x: 0, y: 0 }
//     }));

//     const rawEdges = membersData
//       .filter((m) => m.father_id || m.mother_id)
//       .flatMap((m) => {
//         const es = [];
//         if (m.father_id) {
//           es.push({
//             id: `edge-${m.id}-father`,
//             source: String(m.father_id),
//             target: String(m.id),
//             type: 'smoothstep',
//             animated: false,
//             style: { stroke: '#6366f1', strokeWidth: 2 },
//             label: 'Father',
//             labelStyle: { fill: '#6366f1', fontWeight: 600, fontSize: 11 },
//             labelBgStyle: { fill: '#fff' }
//           });
//         }
//         if (m.mother_id) {
//           es.push({
//             id: `edge-${m.id}-mother`,
//             source: String(m.mother_id),
//             target: String(m.id),
//             type: 'smoothstep',
//             animated: false,
//             style: { stroke: '#ec4899', strokeWidth: 2 },
//             label: 'Mother',
//             labelStyle: { fill: '#ec4899', fontWeight: 600, fontSize: 11 },
//             labelBgStyle: { fill: '#fff' }
//           });
//         }
//         return es;
//       });

//     const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges, dir);
//     setNodes(layoutedNodes);
//     setEdges(layoutedEdges);
//   };

//   const toggleDirection = () => {
//     const newDir = direction === 'TB' ? 'LR' : 'TB';
//     setDirection(newDir);
//     buildFlow(members, newDir);
//   };

//   const toggleFullscreen = () => {
//     if (!document.fullscreenElement) {
//       canvasRef.current?.requestFullscreen?.();
//     } else {
//       document.exitFullscreen?.();
//     }
//   };

//   const resetFormData = () => {
//     setFormData({
//       name: '',
//       gender: 'male',
//       birth_date: '',
//       death_date: '',
//       photo_url: '',
//       bio: '',
//       father_id: null,
//       mother_id: null
//     });
//   };

//   const openEditModal = (member) => {
//     setFormData({
//       name: member.name || '',
//       gender: member.gender || 'male',
//       birth_date: member.birth_date || '',
//       death_date: member.death_date || '',
//       photo_url: member.photo_url || '',
//       bio: member.bio || '',
//       father_id: member.father_id,
//       mother_id: member.mother_id
//     });
//     setSelectedMember(member);
//     setShowEditModal(true);
//   };

//   // mode: 'root' | 'child' | 'father' | 'mother'
//   const openAddModal = (anchorMember = null, mode = 'root') => {
//     setAddMode(mode);
//     let father_id = null;
//     let mother_id = null;

//     if (mode === 'child' && anchorMember) {
//       if (anchorMember.gender === 'female') mother_id = anchorMember.id;
//       else father_id = anchorMember.id;
//     }

//     setFormData({
//       name: '',
//       gender: 'male',
//       birth_date: '',
//       death_date: '',
//       photo_url: '',
//       bio: '',
//       father_id,
//       mother_id
//     });
//     setSelectedMember(anchorMember);
//     setError('');
//     setShowAddModal(true);
//   };

//   const handleSaveEdit = async () => {
//     if (!selectedMember) return;
//     setActionLoading(true);
//     setError('');
//     try {
//       await axios.put(`${API}/members/${selectedMember.id}`, formData, authHeaders);
//       await fetchMembers();
//       setShowEditModal(false);
//       setSelectedMember(null);
//       setSuccess('Member updated successfully!');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to update member.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleAddMember = async () => {
//     if (!formData.name.trim()) {
//       setError('Name is required.');
//       return;
//     }
//     setActionLoading(true);
//     setError('');
//     try {
//       const res = await axios.post(`${API}/members`, { ...formData, tree_id: id }, authHeaders);
//       const newMember = res.data;

//       // If we're adding a parent, link the anchor member (the child) to this new parent
//       if ((addMode === 'father' || addMode === 'mother') && selectedMember) {
//         const anchor = selectedMember;
//         await axios.put(
//           `${API}/members/${anchor.id}`,
//           {
//             name: anchor.name,
//             gender: anchor.gender,
//             birth_date: anchor.birth_date,
//             death_date: anchor.death_date,
//             photo_url: anchor.photo_url,
//             bio: anchor.bio,
//             father_id: addMode === 'father' ? newMember.id : anchor.father_id,
//             mother_id: addMode === 'mother' ? newMember.id : anchor.mother_id
//           },
//           authHeaders
//         );
//       }

//       await fetchMembers();
//       setShowAddModal(false);
//       resetFormData();
//       setSuccess('Member added successfully!');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to add member.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleDeleteMember = async () => {
//     if (!memberToDelete) return;
//     setActionLoading(true);
//     setError('');
//     try {
//       await axios.delete(`${API}/members/${memberToDelete}`, authHeaders);
//       await fetchMembers();
//       setShowDeleteModal(false);
//       setMemberToDelete(null);
//       setSelectedMember(null);
//       setSuccess('Member deleted successfully.');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to delete member.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const onNodeClick = useCallback(
//     (event, node) => {
//       const member = members.find((m) => m.id === Number(node.id));
//       if (member) setSelectedMember(member);
//     },
//     [members]
//   );

//   const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

//   // Valid parent options for Edit modal (no self, no descendants -> avoids cycles)
//   const invalidParentIds = useMemo(() => {
//     if (!selectedMember) return new Set();
//     const desc = getDescendantIds(selectedMember.id, members);
//     desc.add(selectedMember.id);
//     return desc;
//   }, [selectedMember, members]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
//         <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
//           <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
//             <TreeIcon />
//           </div>
//           <p className="text-xl font-semibold text-gray-700">Loading your family tree...</p>
//           <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
//       {/* Top Navigation Bar */}
//       <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex justify-between items-center flex-wrap gap-3">
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="flex items-center gap-2 text-gray-700 hover:text-primary transition-all group"
//             >
//               <div className="p-2 bg-gray-100 group-hover:bg-primary/10 rounded-lg transition-all">
//                 <ArrowLeftIcon />
//               </div>
//               <span className="text-xl font-bold">Back to Dashboard</span>
//             </button>

//             <motion.button
//               onClick={() => openAddModal(null, 'root')}
//               className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <UserPlusIcon />
//               Add Member
//             </motion.button>
//           </div>
//         </div>
//       </nav>

//       {/* Stats Bar */}
//       <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100">
//         <div className="container mx-auto px-6 py-3">
//           <div className="flex items-center justify-between flex-wrap gap-3">
//             <div className="flex items-center gap-6 flex-wrap">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-primary rounded-full"></div>
//                 <span className="text-sm font-medium text-gray-700">
//                   {treeStats.total} {treeStats.total === 1 ? 'Member' : 'Members'}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                 <span className="text-sm font-medium text-gray-700">
//                   {treeStats.males} Male{treeStats.males !== 1 ? 's' : ''}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
//                 <span className="text-sm font-medium text-gray-700">
//                   {treeStats.females} Female{treeStats.females !== 1 ? 's' : ''}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
//                 <span className="text-sm font-medium text-gray-700">
//                   {treeStats.generations} Generation{treeStats.generations !== 1 ? 's' : ''}
//                 </span>
//               </div>
//             </div>
//             <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
//               <InfoIcon />
//               <span>Click a member to view details • Hover a node for quick actions</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Success Toast */}
//       <AnimatePresence>
//         {success && (
//           <motion.div
//             className="fixed top-32 right-6 z-50"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 50 }}
//           >
//             <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//               </svg>
//               <span className="font-medium">{success}</span>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Main Tree Canvas */}
//       <div
//         ref={canvasRef}
//         className={isFullscreen ? 'h-screen bg-white' : 'h-[calc(100vh-180px)]'}
//       >
//         {members.length === 0 ? (
//           <div className="h-full flex items-center justify-center px-6">
//             <motion.div
//               className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-100 max-w-md mx-auto"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//             >
//               <div className="text-6xl mb-4">🌱</div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-2">Plant Your Family Tree</h3>
//               <p className="text-gray-600 mb-6">
//                 Add the first member to start building your family history.
//               </p>
//               <button
//                 onClick={() => openAddModal(null, 'root')}
//                 className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:shadow-xl transition-all inline-flex items-center gap-2"
//               >
//                 <PlusIcon /> Add First Member
//               </button>
//             </motion.div>
//           </div>
//         ) : (
//           <ReactFlow
//             nodes={nodes}
//             edges={edges}
//             onNodesChange={onNodesChange}
//             onEdgesChange={onEdgesChange}
//             onNodeClick={onNodeClick}
//             fitView
//             attributionPosition="bottom-right"
//             nodeTypes={nodeTypes}
//             defaultEdgeOptions={{ type: 'smoothstep', animated: false, style: { strokeWidth: 2 } }}
//           >
//             <TreeCanvas
//               nodes={nodes}
//               setNodes={setNodes}
//               members={members}
//               direction={direction}
//               onToggleDirection={toggleDirection}
//               isFullscreen={isFullscreen}
//               onToggleFullscreen={toggleFullscreen}
//               onSelectFromSearch={(m) => setSelectedMember(m)}
//             />

//             <Controls
//               position="bottom-left"
//               className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 overflow-hidden"
//               showInteractive={false}
//             />

//             <MiniMap
//               position="bottom-right"
//               className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 overflow-hidden"
//               nodeColor={(node) => (node.data?.gender === 'female' ? '#ec4899' : '#6366f1')}
//               maskColor="rgba(240, 240, 240, 0.6)"
//             />

//             <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#888" />
//           </ReactFlow>
//         )}
//       </div>

//       {/* Error Toast (canvas-level actions) */}
//       <AnimatePresence>
//         {error && !showEditModal && !showAddModal && (
//           <motion.div
//             className="fixed top-32 left-1/2 -translate-x-1/2 z-50"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//           >
//             <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg">{error}</div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Selected Member Panel */}
//       <AnimatePresence>
//         {selectedMember && !showEditModal && (
//           <motion.div
//             className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-full md:max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-40 max-h-[75vh] overflow-y-auto"
//             initial={{ opacity: 0, y: 50, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 50, scale: 0.95 }}
//           >
//             <div className="flex justify-between items-start mb-6">
//               <div className="flex items-center gap-4">
//                 <div
//                   className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${
//                     selectedMember.gender === 'female'
//                       ? 'bg-gradient-to-br from-pink-400 to-rose-500'
//                       : 'bg-gradient-to-br from-blue-400 to-indigo-500'
//                   }`}
//                 >
//                   {selectedMember.photo_url ? (
//                     <img
//                       src={selectedMember.photo_url}
//                       alt={selectedMember.name}
//                       className="w-full h-full rounded-full object-cover"
//                     />
//                   ) : (
//                     selectedMember.name.charAt(0).toUpperCase()
//                   )}
//                 </div>
//                 <div>
//                   <h3 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h3>
//                   <div className="text-sm text-gray-500 capitalize">{selectedMember.gender}</div>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setSelectedMember(null)}
//                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <div className="space-y-4 mb-6">
//               <div className="flex items-center gap-3 text-gray-700">
//                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//                 <span>
//                   {selectedMember.birth_date
//                     ? `Born: ${new Date(selectedMember.birth_date).toLocaleDateString()}`
//                     : 'Birth date unknown'}
//                 </span>
//               </div>
//               {selectedMember.death_date && (
//                 <div className="flex items-center gap-3 text-gray-700">
//                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <span>Passed: {new Date(selectedMember.death_date).toLocaleDateString()}</span>
//                 </div>
//               )}
//               {selectedMember.bio && (
//                 <div className="p-4 bg-gray-50 rounded-xl">
//                   <p className="text-sm text-gray-700 leading-relaxed">{selectedMember.bio}</p>
//                 </div>
//               )}
//             </div>

//             <div className="grid grid-cols-2 gap-3 mb-3">
//               <motion.button
//                 onClick={() => openEditModal(selectedMember)}
//                 className="py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <EditIcon /> Edit
//               </motion.button>
//               <motion.button
//                 onClick={() => {
//                   setMemberToDelete(selectedMember.id);
//                   setShowDeleteModal(true);
//                 }}
//                 className="py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <TrashIcon /> Delete
//               </motion.button>
//             </div>

//             {(!selectedMember.father_id || !selectedMember.mother_id) && (
//               <div className="grid grid-cols-2 gap-3 mb-3">
//                 {!selectedMember.father_id && (
//                   <button
//                     onClick={() => openAddModal(selectedMember, 'father')}
//                     className="py-2.5 border-2 border-blue-400 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5"
//                   >
//                     <PlusIcon /> Add Father
//                   </button>
//                 )}
//                 {!selectedMember.mother_id && (
//                   <button
//                     onClick={() => openAddModal(selectedMember, 'mother')}
//                     className="py-2.5 border-2 border-pink-400 text-pink-600 rounded-xl text-sm font-semibold hover:bg-pink-50 transition-all flex items-center justify-center gap-1.5"
//                   >
//                     <PlusIcon /> Add Mother
//                   </button>
//                 )}
//               </div>
//             )}

//             <motion.button
//               onClick={() => openAddModal(selectedMember, 'child')}
//               className="w-full py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               <PlusIcon /> Add Child
//             </motion.button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Edit Modal */}
//       <AnimatePresence>
//         {showEditModal && selectedMember && (
//           <motion.div
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setShowEditModal(false)}
//           >
//             <motion.div
//               className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
//               initial={{ scale: 0.9, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white">
//                   <EditIcon />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">Edit Member</h2>
//                   <p className="text-sm text-gray-500">Update {selectedMember.name}'s information</p>
//                 </div>
//               </div>

//               {error && (
//                 <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
//               )}

//               <div className="grid md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//                   <input
//                     type="text"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     placeholder="e.g., John Smith"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
//                   <select
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.gender}
//                     onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
//                   >
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Father / Parent 1</label>
//                   <select
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.father_id ?? ''}
//                     onChange={(e) =>
//                       setFormData({ ...formData, father_id: e.target.value ? Number(e.target.value) : null })
//                     }
//                   >
//                     <option value="">None</option>
//                     {members
//                       .filter((m) => !invalidParentIds.has(m.id))
//                       .map((m) => (
//                         <option key={m.id} value={m.id}>
//                           {m.name}
//                         </option>
//                       ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Mother / Parent 2</label>
//                   <select
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.mother_id ?? ''}
//                     onChange={(e) =>
//                       setFormData({ ...formData, mother_id: e.target.value ? Number(e.target.value) : null })
//                     }
//                   >
//                     <option value="">None</option>
//                     {members
//                       .filter((m) => !invalidParentIds.has(m.id))
//                       .map((m) => (
//                         <option key={m.id} value={m.id}>
//                           {m.name}
//                         </option>
//                       ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
//                   <input
//                     type="date"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.birth_date}
//                     onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Death Date</label>
//                   <input
//                     type="date"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.death_date}
//                     onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Photo URL</label>
//                 <input
//                   type="url"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                   placeholder="https://example.com/photo.jpg"
//                   value={formData.photo_url}
//                   onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
//                 />
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Biography</label>
//                 <textarea
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                   placeholder="Write a short bio..."
//                   rows="4"
//                   value={formData.bio}
//                   onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
//                 />
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowEditModal(false)}
//                   className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSaveEdit}
//                   disabled={actionLoading}
//                   className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                 >
//                   {actionLoading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                       Saving...
//                     </span>
//                   ) : (
//                     'Save Changes'
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Add Member Modal */}
//       <AnimatePresence>
//         {showAddModal && (
//           <motion.div
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setShowAddModal(false)}
//           >
//             <motion.div
//               className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
//               initial={{ scale: 0.9, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white">
//                   <UserPlusIcon />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     {addMode === 'child' && selectedMember && `Add Child of ${selectedMember.name}`}
//                     {addMode === 'father' && selectedMember && `Add Father of ${selectedMember.name}`}
//                     {addMode === 'mother' && selectedMember && `Add Mother of ${selectedMember.name}`}
//                     {addMode === 'root' && 'Add New Member'}
//                   </h2>
//                   <p className="text-sm text-gray-500">
//                     {addMode === 'root'
//                       ? 'Start (or extend) your tree with a new member'
//                       : 'Fill in the details below'}
//                   </p>
//                 </div>
//               </div>

//               {error && (
//                 <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
//               )}

//               <div className="grid md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
//                   <input
//                     type="text"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     placeholder="e.g., Jane Doe"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     autoFocus
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
//                   <select
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.gender}
//                     onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
//                   >
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Father / Parent 1 {addMode === 'child' && '(auto-linked)'}
//                   </label>
//                   <select
//                     disabled={addMode === 'child'}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
//                     value={formData.father_id ?? ''}
//                     onChange={(e) =>
//                       setFormData({ ...formData, father_id: e.target.value ? Number(e.target.value) : null })
//                     }
//                   >
//                     <option value="">None</option>
//                     {members.map((m) => (
//                       <option key={m.id} value={m.id}>
//                         {m.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Mother / Parent 2 {addMode === 'child' && '(auto-linked)'}
//                   </label>
//                   <select
//                     disabled={addMode === 'child'}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
//                     value={formData.mother_id ?? ''}
//                     onChange={(e) =>
//                       setFormData({ ...formData, mother_id: e.target.value ? Number(e.target.value) : null })
//                     }
//                   >
//                     <option value="">None</option>
//                     {members.map((m) => (
//                       <option key={m.id} value={m.id}>
//                         {m.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
//                   <input
//                     type="date"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.birth_date}
//                     onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Death Date</label>
//                   <input
//                     type="date"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.death_date}
//                     onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Photo URL</label>
//                 <input
//                   type="url"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                   placeholder="https://example.com/photo.jpg"
//                   value={formData.photo_url}
//                   onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
//                 />
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Biography</label>
//                 <textarea
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                   placeholder="Write a short bio..."
//                   rows="4"
//                   value={formData.bio}
//                   onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
//                 />
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowAddModal(false)}
//                   className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddMember}
//                   disabled={actionLoading || !formData.name.trim()}
//                   className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                 >
//                   {actionLoading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                       Adding...
//                     </span>
//                   ) : (
//                     'Add Member'
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Delete Confirmation Modal */}
//       <AnimatePresence>
//         {showDeleteModal && (
//           <motion.div
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setShowDeleteModal(false)}
//           >
//             <motion.div
//               className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
//               initial={{ scale: 0.9, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="text-center mb-6">
//                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
//                   <TrashIcon />
//                 </div>
//                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Member?</h2>
//                 <p className="text-gray-600">
//                   This will permanently remove <strong>{selectedMember?.name}</strong> and may affect family
//                   relationships. This action cannot be undone.
//                 </p>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => {
//                     setShowDeleteModal(false);
//                     setMemberToDelete(null);
//                   }}
//                   disabled={actionLoading}
//                   className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteMember}
//                   disabled={actionLoading}
//                   className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all"
//                 >
//                   {actionLoading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                       Deleting...
//                     </span>
//                   ) : (
//                     'Delete Member'
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// import { useEffect, useState, useCallback, useMemo } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import Dagre from '@dagrejs/dagre';
// import {
//   ReactFlow,
//   useNodesState,
//   useEdgesState,
//   Controls,
//   Background,
//   BackgroundVariant,
//   MiniMap,
//   Panel
// } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';

// const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// const NODE_WIDTH = 200;
// const NODE_HEIGHT = 90;

// function getLayoutedElements(nodes, edges, direction = 'TB') {
//   const dagreGraph = new Dagre.graphlib.Graph();
//   dagreGraph.setDefaultEdgeLabel(() => ({}));
//   dagreGraph.setGraph({
//     rankdir: direction,
//     nodesep: 80,
//     ranksep: 120,
//     marginx: 40,
//     marginy: 40
//   });

//   nodes.forEach((node) => {
//     dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
//   });

//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   Dagre.layout(dagreGraph);

//   const layoutedNodes = nodes.map((node) => {
//     const { x, y } = dagreGraph.node(node.id);
//     return {
//       ...node,
//       position: {
//         x: x - NODE_WIDTH / 2,
//         y: y - NODE_HEIGHT / 2
//       }
//     };
//   });

//   return { nodes: layoutedNodes, edges };
// }

// // import { useEffect, useState, useCallback, useMemo } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import axios from 'axios';
// // import {
// //   ReactFlow,
// //   useNodesState,
// //   useEdgesState,
// //   Controls,
// //   Background,
// //   MiniMap,
// //   Panel
// // } from '@xyflow/react';
// // import '@xyflow/react/dist/style.css';

// // const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// // Custom Node Component
// const CustomNode = ({ data, selected }) => (
//   <div
//     className={`px-4 py-3 rounded-xl border-2 shadow-lg transition-all ${
//       selected
//         ? 'border-primary bg-primary/5 shadow-primary/30'
//         : 'border-white bg-white hover:border-primary/50'
//     }`}
//     style={{ minWidth: '180px' }}
//   >
//     <div className="flex items-center gap-3">
//       {/* Avatar */}
//       <div
//         className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
//           data.gender === 'female'
//             ? 'bg-gradient-to-br from-pink-400 to-rose-500'
//             : 'bg-gradient-to-br from-blue-400 to-indigo-500'
//         }`}
//       >
//         {data.photo_url ? (
//           <img
//             src={data.photo_url}
//             alt={data.name}
//             className="w-full h-full rounded-full object-cover"
//           />
//         ) : (
//           data.name.charAt(0).toUpperCase()
//         )}
//       </div>

//       {/* Info */}
//       <div className="flex-1 min-w-0">
//         <div className="font-bold text-gray-900 truncate">{data.name}</div>
//         <div className="text-xs text-gray-500">
//           {data.birthYear ? `${data.birthYear} - ${data.deathYear || 'Present'}` : 'Dates unknown'}
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // Icons
// const PlusIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//   </svg>
// );

// const UserPlusIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
//   </svg>
// );

// const EditIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//   </svg>
// );

// const TrashIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//   </svg>
// );

// const ArrowLeftIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//   </svg>
// );

// const TreeIcon = () => (
//   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20l3-9m0 0l3 9m-3-9v9m6-9l3 9m-3-9V9m-3 11V9m0 11a9 9 0 01-9-9 9 9 0 0118 0 9 9 0 01-9 9z" />
//   </svg>
// );

// const InfoIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// );

// const ZoomInIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
//   </svg>
// );

// const ZoomOutIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
//   </svg>
// );

// export default function TreeView() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const token = localStorage.getItem('token');

//   const [members, setMembers] = useState([]);
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [selectedNodeId, setSelectedNodeId] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [memberToDelete, setMemberToDelete] = useState(null);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [treeStats, setTreeStats] = useState({ total: 0, males: 0, females: 0 });

//   const [formData, setFormData] = useState({
//     name: '',
//     gender: 'male',
//     birth_date: '',
//     death_date: '',
//     photo_url: '',
//     bio: '',
//     father_id: null,
//     mother_id: null
//   });

//   useEffect(() => {
//     fetchMembers();
//   }, [id]);

//   const fetchMembers = async () => {
//     try {
//       const res = await axios.get(`${API}/members/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setMembers(res.data);
//       buildFlow(res.data);

//       // Calculate stats
//       const stats = {
//         total: res.data.length,
//         males: res.data.filter(m => m.gender === 'male').length,
//         females: res.data.filter(m => m.gender === 'female').length
//       };
//       setTreeStats(stats);
//     } catch (err) {
//       setError('Failed to load family members.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const buildFlow = (membersData) => {
//   const rawNodes = membersData.map((m) => ({
//     id: String(m.id),
//     type: 'custom',
//     data: {
//       name: m.name,
//       gender: m.gender,
//       photo_url: m.photo_url,
//       birthYear: m.birth_date ? new Date(m.birth_date).getFullYear() : null,
//       deathYear: m.death_date ? new Date(m.death_date).getFullYear() : null
//     },
//     position: { x: 0, y: 0 }
//   }));

//   const rawEdges = membersData
//     .filter((m) => m.father_id || m.mother_id)
//     .flatMap((m) => {
//       const edges = [];
//       if (m.father_id) {
//         edges.push({
//           id: `edge-${m.id}-father`,
//           source: String(m.father_id),
//           target: String(m.id),
//           type: 'smoothstep',
//           animated: false,
//           style: { stroke: '#6366f1', strokeWidth: 2 },
//           label: 'Father',
//           labelStyle: { fill: '#6366f1', fontWeight: 600, fontSize: 11 }
//         });
//       }
//       if (m.mother_id) {
//         edges.push({
//           id: `edge-${m.id}-mother`,
//           source: String(m.mother_id),
//           target: String(m.id),
//           type: 'smoothstep',
//           animated: false,
//           style: { stroke: '#ec4899', strokeWidth: 2 },
//           label: 'Mother',
//           labelStyle: { fill: '#ec4899', fontWeight: 600, fontSize: 11 }
//         });
//       }
//       return edges;
//     });

//   const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
//     rawNodes,
//     rawEdges,
//     'TB'
//   );

//   setNodes(layoutedNodes);
//   setEdges(layoutedEdges);
// };

//   const openEditModal = (member) => {
//     setFormData({
//       name: member.name || '',
//       gender: member.gender || 'male',
//       birth_date: member.birth_date || '',
//       death_date: member.death_date || '',
//       photo_url: member.photo_url || '',
//       bio: member.bio || '',
//       father_id: member.father_id,
//       mother_id: member.mother_id
//     });
//     setSelectedMember(member);
//     setShowEditModal(true);
//   };

//   const openAddModal = (parentId = null, relationType = null) => {
//     setFormData({
//       name: '',
//       gender: 'male',
//       birth_date: '',
//       death_date: '',
//       photo_url: '',
//       bio: '',
//       father_id: relationType === 'father' ? parentId : null,
//       mother_id: relationType === 'mother' ? parentId : null
//     });
//     setSelectedMember(parentId ? members.find(m => m.id === parentId) : null);
//     setShowAddModal(true);
//   };

//   const handleSaveEdit = async () => {
//     if (!selectedMember) return;
//     setActionLoading(true);
//     setError('');
//     try {
//       await axios.put(`${API}/members/${selectedMember.id}`, formData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       await fetchMembers();
//       setShowEditModal(false);
//       setSelectedMember(null);
//       setSuccess('Member updated successfully!');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to update member.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleAddMember = async () => {
//     if (!formData.name.trim()) {
//       setError('Name is required.');
//       return;
//     }
//     setActionLoading(true);
//     setError('');
//     try {
//       await axios.post(`${API}/members`, { ...formData, tree_id: id }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       await fetchMembers();
//       setShowAddModal(false);
//       setFormData({
//         name: '',
//         gender: 'male',
//         birth_date: '',
//         death_date: '',
//         photo_url: '',
//         bio: '',
//         father_id: null,
//         mother_id: null
//       });
//       setSuccess('Member added successfully!');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to add member.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleDeleteMember = async () => {
//     if (!memberToDelete) return;
//     setActionLoading(true);
//     setError('');
//     try {
//       await axios.delete(`${API}/members/${memberToDelete}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       await fetchMembers();
//       setShowDeleteModal(false);
//       setMemberToDelete(null);
//       setSelectedMember(null);
//       setSelectedNodeId(null);
//       setSuccess('Member deleted successfully.');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to delete member.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const onNodeClick = useCallback((event, node) => {
//     const member = members.find(m => m.id === Number(node.id));
//     if (member) {
//       setSelectedMember(member);
//       setSelectedNodeId(node.id);
//     }
//   }, [members]);

//   const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
//         <motion.div
//           className="text-center"
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//         >
//           <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
//             <TreeIcon />
//           </div>
//           <p className="text-xl font-semibold text-gray-700">Loading your family tree...</p>
//           <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
//       {/* Top Navigation Bar */}
//       <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex justify-between items-center">
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="flex items-center gap-2 text-gray-700 hover:text-primary transition-all group"
//             >
//               <div className="p-2 bg-gray-100 group-hover:bg-primary/10 rounded-lg transition-all">
//                 <ArrowLeftIcon />
//               </div>
//               <span className="text-xl font-bold">Back to Dashboard</span>
//             </button>

//             <div className="flex items-center gap-3">
//               <motion.button
//                 onClick={() => openAddModal()}
//                 className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <UserPlusIcon />
//                 Add Member
//               </motion.button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Stats Bar */}
//       <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100">
//         <div className="container mx-auto px-6 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-6">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-primary rounded-full"></div>
//                 <span className="text-sm font-medium text-gray-700">
//                   {treeStats.total} {treeStats.total === 1 ? 'Member' : 'Members'}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                 <span className="text-sm font-medium text-gray-700">
//                   {treeStats.males} Male{treeStats.males !== 1 ? 's' : ''}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
//                 <span className="text-sm font-medium text-gray-700">
//                   {treeStats.females} Female{treeStats.females !== 1 ? 's' : ''}
//                 </span>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 text-sm text-gray-500">
//               <InfoIcon />
//               <span>Click on a node to view details</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Success Message */}
//       <AnimatePresence>
//         {success && (
//           <motion.div
//             className="fixed top-32 right-6 z-50"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 50 }}
//           >
//             <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//               </svg>
//               <span className="font-medium">{success}</span>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Main Tree Canvas */}
//       <div className="h-[calc(100vh-180px)]">
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           onNodeClick={onNodeClick}
//           fitView
//           attributionPosition="bottom-right"
//           nodeTypes={nodeTypes}
//           defaultEdgeOptions={{
//             type: 'smoothstep',
//             animated: false,
//             style: { strokeWidth: 2 }
//           }}
//         >
//           <Panel position="top-left" className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-100">
//             <div className="flex items-center gap-2">
//               <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
//                 <TreeIcon />
//               </div>
//               <div>
//                 <div className="font-bold text-gray-900">Family Tree</div>
//                 <div className="text-xs text-gray-500">Drag to pan • Scroll to zoom</div>
//               </div>
//             </div>
//           </Panel>

//           <Controls
//             className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 overflow-hidden"
//             showInteractive={false}
//           />

//           <MiniMap
//             className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 overflow-hidden"
//             nodeColor={(node) => {
//               return node.data?.gender === 'female' ? '#ec4899' : '#6366f1';
//             }}
//             maskColor="rgba(240, 240, 240, 0.6)"
//           />

//           <Background variant="dots" gap={20} size={1} color="#888" />
//         </ReactFlow>
//       </div>

//       {/* Selected Member Panel */}
//       <AnimatePresence>
//         {selectedMember && !showEditModal && (
//           <motion.div
//             className="fixed bottom-6 right-6 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md z-40"
//             initial={{ opacity: 0, y: 50, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 50, scale: 0.95 }}
//           >
//             {/* Header */}
//             <div className="flex justify-between items-start mb-6">
//               <div className="flex items-center gap-4">
//                 <div
//                   className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${
//                     selectedMember.gender === 'female'
//                       ? 'bg-gradient-to-br from-pink-400 to-rose-500'
//                       : 'bg-gradient-to-br from-blue-400 to-indigo-500'
//                   }`}
//                 >
//                   {selectedMember.photo_url ? (
//                     <img
//                       src={selectedMember.photo_url}
//                       alt={selectedMember.name}
//                       className="w-full h-full rounded-full object-cover"
//                     />
//                   ) : (
//                     selectedMember.name.charAt(0).toUpperCase()
//                   )}
//                 </div>
//                 <div>
//                   <h3 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h3>
//                   <div className="text-sm text-gray-500 capitalize">{selectedMember.gender}</div>
//                 </div>
//               </div>
//               <button
//                 onClick={() => {
//                   setSelectedMember(null);
//                   setSelectedNodeId(null);
//                 }}
//                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             {/* Details */}
//             <div className="space-y-4 mb-6">
//               <div className="flex items-center gap-3 text-gray-700">
//                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//                 <span>
//                   {selectedMember.birth_date
//                     ? `Born: ${new Date(selectedMember.birth_date).toLocaleDateString()}`
//                     : 'Birth date unknown'}
//                 </span>
//               </div>
//               {selectedMember.death_date && (
//                 <div className="flex items-center gap-3 text-gray-700">
//                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <span>Passed: {new Date(selectedMember.death_date).toLocaleDateString()}</span>
//                 </div>
//               )}
//               {selectedMember.bio && (
//                 <div className="p-4 bg-gray-50 rounded-xl">
//                   <p className="text-sm text-gray-700 leading-relaxed">{selectedMember.bio}</p>
//                 </div>
//               )}
//             </div>

//             {/* Actions */}
//             <div className="grid grid-cols-2 gap-3 mb-4">
//               <motion.button
//                 onClick={() => openEditModal(selectedMember)}
//                 className="py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <EditIcon />
//                 Edit
//               </motion.button>
//               <motion.button
//                 onClick={() => {
//                   setMemberToDelete(selectedMember.id);
//                   setShowDeleteModal(true);
//                 }}
//                 className="py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <TrashIcon />
//                 Delete
//               </motion.button>
//             </div>

//             <motion.button
//               onClick={() => openAddModal(selectedMember.id, 'father')}
//               className="w-full py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               <PlusIcon />
//               Add Child
//             </motion.button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Edit Modal */}
//       <AnimatePresence>
//         {showEditModal && selectedMember && (
//           <motion.div
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setShowEditModal(false)}
//           >
//             <motion.div
//               className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
//               initial={{ scale: 0.9, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white">
//                   <EditIcon />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">Edit Member</h2>
//                   <p className="text-sm text-gray-500">Update {selectedMember.name}'s information</p>
//                 </div>
//               </div>

//               {error && (
//                 <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
//                   {error}
//                 </div>
//               )}

//               <div className="grid md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//                   <input
//                     type="text"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     placeholder="e.g., John Smith"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
//                   <select
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.gender}
//                     onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
//                   >
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
//                   <input
//                     type="date"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.birth_date}
//                     onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Death Date</label>
//                   <input
//                     type="date"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.death_date}
//                     onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Photo URL</label>
//                 <input
//                   type="url"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                   placeholder="https://example.com/photo.jpg"
//                   value={formData.photo_url}
//                   onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
//                 />
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Biography</label>
//                 <textarea
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                   placeholder="Write a short bio..."
//                   rows="4"
//                   value={formData.bio}
//                   onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
//                 />
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowEditModal(false)}
//                   className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSaveEdit}
//                   disabled={actionLoading}
//                   className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                 >
//                   {actionLoading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                       Saving...
//                     </span>
//                   ) : (
//                     'Save Changes'
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Add Member Modal */}
//       <AnimatePresence>
//         {showAddModal && (
//           <motion.div
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setShowAddModal(false)}
//           >
//             <motion.div
//               className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
//               initial={{ scale: 0.9, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white">
//                   <UserPlusIcon />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     {selectedMember ? `Add Child of ${selectedMember.name}` : 'Add New Member'}
//                   </h2>
//                   <p className="text-sm text-gray-500">
//                     {selectedMember ? 'Add a child to this family member' : 'Start your tree with a root member'}
//                   </p>
//                 </div>
//               </div>

//               {error && (
//                 <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
//                   {error}
//                 </div>
//               )}

//               <div className="grid md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
//                   <input
//                     type="text"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     placeholder="e.g., Jane Doe"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     autoFocus
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
//                   <select
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.gender}
//                     onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
//                   >
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
//                   <input
//                     type="date"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.birth_date}
//                     onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Death Date</label>
//                   <input
//                     type="date"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                     value={formData.death_date}
//                     onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Photo URL</label>
//                 <input
//                   type="url"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                   placeholder="https://example.com/photo.jpg"
//                   value={formData.photo_url}
//                   onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
//                 />
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Biography</label>
//                 <textarea
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
//                   placeholder="Write a short bio..."
//                   rows="4"
//                   value={formData.bio}
//                   onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
//                 />
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowAddModal(false)}
//                   className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddMember}
//                   disabled={actionLoading || !formData.name.trim()}
//                   className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                 >
//                   {actionLoading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                       Adding...
//                     </span>
//                   ) : (
//                     'Add Member'
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Delete Confirmation Modal */}
//       <AnimatePresence>
//         {showDeleteModal && (
//           <motion.div
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setShowDeleteModal(false)}
//           >
//             <motion.div
//               className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
//               initial={{ scale: 0.9, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="text-center mb-6">
//                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
//                   <TrashIcon />
//                 </div>
//                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Member?</h2>
//                 <p className="text-gray-600">
//                   This will permanently remove <strong>{selectedMember?.name}</strong> and may affect family relationships. This action cannot be undone.
//                 </p>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => {
//                     setShowDeleteModal(false);
//                     setMemberToDelete(null);
//                   }}
//                   disabled={actionLoading}
//                   className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteMember}
//                   disabled={actionLoading}
//                   className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all"
//                 >
//                   {actionLoading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                       Deleting...
//                     </span>
//                   ) : (
//                     'Delete Member'
//                   )}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
