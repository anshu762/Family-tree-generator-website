import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

/* --------------------------------- Icons --------------------------------- */

const TreeIcon = (p) => (
  <svg className={p.className || 'w-8 h-8'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20l3-9m0 0l3 9m-3-9v9m6-9l3 9m-3-9V9m-3 11V9m0 11a9 9 0 01-9-9 9 9 0 0118 0 9 9 0 01-9 9z" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const ShareIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);
const PhotoIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const ExportIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const HeartIcon = (p) => (
  <svg className={p.className || 'w-7 h-7'} fill={p.fill || 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);
const StarIcon = () => (
  <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ChevronDownIcon = ({ open }) => (
  <svg className={`w-5 h-5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const XCircleIcon = () => (
  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const QuoteIcon = () => (
  <svg className="w-9 h-9 text-primary/15" fill="currentColor" viewBox="0 0 32 32">
    <path d="M9.352 4C4.456 7.336 1 12.892 1 19.032c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.336-8.256 8.892-8.256 15.032 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CrownIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 16L3 6l4.5 3L10 4l2.5 5L17 6l-2 10H5zm0 2h10v1H5v-1z" />
  </svg>
);
const CrossIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 2h2v4h4v2h-4v10H9V8H5V6h4V2z" />
  </svg>
);

/* --------------------------------- Data ---------------------------------- */

const features = [
  { icon: <TreeIcon className="w-7 h-7" />, title: 'Interactive Family Trees', desc: 'Build zoomable, drag-and-pan trees that automatically arrange generations, spouses, and siblings for you.', color: 'from-primary to-primary/70', big: true },
  { icon: <PhotoIcon />, title: 'Rich Member Profiles', desc: 'Photos, bios, birth & death dates — preserve full life stories, not just names.', color: 'from-secondary to-secondary/70' },
  { icon: <ShieldIcon />, title: 'Private & Secure', desc: 'Your family data is encrypted and private by default.', color: 'from-accent to-accent/70' },
  { icon: <ShareIcon />, title: 'Share with Family', desc: 'Invite relatives to view or collaborate on the same tree.', color: 'from-primary to-secondary' },
  { icon: <ExportIcon />, title: 'Export & Backup', desc: 'Download as high-res PDF or PNG, ready to print or share.', color: 'from-secondary to-accent' },
  { icon: <HeartIcon className="w-7 h-7" />, title: 'Preserve Legacy', desc: 'Give future generations a lasting record of where they came from.', color: 'from-accent to-primary' }
];

const steps = [
  { num: '01', title: 'Create Your Account', desc: 'Sign up in seconds with just your email — no credit card.', icon: '' },
  { num: '02', title: 'Start Your Tree', desc: 'Name your family tree and add yourself as the first member.', icon: '' },
  { num: '03', title: 'Add Relatives', desc: 'Connect parents, children, spouses & siblings in a few clicks.', icon: '' },
  { num: '04', title: 'Visualize & Share', desc: 'Watch it grow, export as PDF, and share it with your family.', icon: '' }
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Genealogy Enthusiast', text: 'I mapped 5 generations of my family in one weekend. The interface is so intuitive, even my grandparents could use it!', rating: 5, image: '👵' },
  { name: 'Rahul Mehta', role: 'Teacher & Father of 3', text: "This is now a family project. My kids love adding photos and stories. It's brought us closer together.", rating: 5, image: '👨‍👧‍👦' },
  { name: 'Anita Kapoor', role: 'Family Reunion Organizer', text: 'I exported a beautiful PDF for our 200-person reunion. Everyone was amazed at how complete it was!', rating: 5, image: '🎊' }
];

const stats = [
  { value: '10,000+', label: 'Family Trees Created' },
  { value: '500,000+', label: 'Family Members Added' },
  { value: '99.9%', label: 'Uptime' },
  { value: '100%', label: 'Free Core Features' }
];

const comparison = [
  { label: 'Visualize unlimited generations', us: true, spreadsheet: false, paper: false },
  { label: 'Add photos, bios & life stories', us: true, spreadsheet: false, paper: true },
  { label: 'Auto-updates when you add a member', us: true, spreadsheet: false, paper: false },
  { label: 'Share & collaborate with relatives', us: true, spreadsheet: true, paper: false },
  { label: 'Export as PDF to print/share', us: true, spreadsheet: true, paper: false },
  { label: 'Never gets lost or torn', us: true, spreadsheet: true, paper: false }
];

const faqs = [
  { q: 'Is FamilyTree really free to use?', a: 'Yes! Core features — creating trees, adding unlimited members, and exporting — are free forever. No credit card required to get started.' },
  { q: 'Can I add relationships like spouses and siblings?', a: 'Absolutely. Beyond parents and children, you can add spouses, husbands, wives, brothers and sisters — the tree automatically connects them correctly.' },
  { q: 'Can I download my family tree to share with relatives?', a: 'Yes, you can export your entire tree as a high-resolution PDF or PNG image with one click, ready to print or share digitally.' },
  { q: 'Is my family data private?', a: 'Your trees are private by default and only accessible from your account. You control who you share access with.' }
];

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#faq', label: 'FAQ' }
];

const trustChips = [
  { icon: <LockIcon />, label: 'Bank-level encryption' },
  { icon: <ClockIcon />, label: 'Set up in 5 minutes' },
  { icon: <GlobeIcon />, label: 'Used in 50+ countries' }
];

/* ---------------------- Realistic Tree Preview (matches app UI) ---------------------- */

// function RealNode({ label, sub, gender, deceased, isRoot, gen, style, delay = 0 }) {
//   const ring =
//     gender === 'female' ? 'from-rose-400 to-pink-500' : 'from-blue-400 to-indigo-500';
//   return (
//     <motion.div
//       className="absolute bg-white rounded-xl border-2 border-gray-100 shadow-md px-3 py-2 flex items-center gap-2"
//       style={{ width: 152, ...style }}
//       initial={{ opacity: 0, y: 12, scale: 0.9 }}
//       whileInView={{ opacity: 1, y: 0, scale: 1 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.45, delay }}
//     >
//       {isRoot && (
//         <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full bg-amber-400 flex items-center justify-center text-white">
//           <CrownIcon className="w-2.5 h-2.5" />
//         </div>
//       )}
//       <div className="absolute -top-2 -right-2 w-4.5 h-4.5 rounded-full bg-white border border-gray-200 text-[8px] font-extrabold text-primary flex items-center justify-center">
//         G{gen}
//       </div>
//       <div className={`relative w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br ${ring} p-[1.5px] ${deceased ? 'grayscale opacity-80' : ''}`}>
//         <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
//           <span className="text-[11px] font-bold text-gray-700">{label.charAt(0)}</span>
//         </div>
//         {deceased && (
//           <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-700 rounded-full flex items-center justify-center text-white">
//             <CrossIcon className="w-1.5 h-1.5" />
//           </div>
//         )}
//       </div>
//       <div className="min-w-0">
//         <div className="text-[11px] font-bold text-gray-900 leading-tight truncate w-[80px]">{label}</div>
//         <div className="text-[9px] text-gray-500">{sub}</div>
//       </div>
//     </motion.div>
//   );
// }

// function RealisticTreePreview({ compact = false }) {
//   const h = compact ? 300 : 380;
//   return (
//     <div
//       className="relative w-full rounded-xl overflow-hidden bg-[repeating-radial-gradient(circle_at_1px_1px,theme(colors.gray.300)_1px,transparent_0)] bg-[length:16px_16px] bg-gray-50"
//       style={{ height: h }}
//     >
//       {/* connector lines */}
//       <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 380" preserveAspectRatio="xMidYMid meet">
//         {/* grandparents spouse line */}
//         <motion.line x1="90" y1="40" x2="230" y2="40" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4"
//           initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} />
//         {/* grandma -> down -> parents row (elbow) */}
//         <motion.path d="M90 55 V95 H165 V115" stroke="#ec4899" strokeWidth="2" fill="none"
//           initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} />
//         <motion.path d="M230 55 V95 H165" stroke="#6366f1" strokeWidth="2" fill="none"
//           initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} />
//         {/* parents spouse line */}
//         <motion.line x1="90" y1="170" x2="230" y2="170" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4"
//           initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }} />
//         {/* parents -> child elbow */}
//         <motion.path d="M90 185 V225 H165 V245" stroke="#6366f1" strokeWidth="2" fill="none"
//           initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.8 }} />
//         <motion.path d="M230 185 V225 H165" stroke="#ec4899" strokeWidth="2" fill="none"
//           initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.9 }} />
//       </svg>

//       <RealNode label="Grandmother" sub="1958 – 2019" gender="female" deceased isRoot gen={1} style={{ left: 12, top: 10 }} delay={0.1} />
//       <RealNode label="Grandfather" sub="1955 – Present" gender="male" isRoot gen={1} style={{ left: 156, top: 10 }} delay={0.2} />

//       <RealNode label="Father" sub="1982 – Present" gender="male" gen={2} style={{ left: 90, top: 130 }} delay={0.5} />
//       <RealNode label="Mother" sub="1985 – Present" gender="female" isRoot gen={1} style={{ left: 234, top: 130 }} delay={0.6} />

//       <RealNode label="You" sub="2015 – Present" gender="male" gen={3} style={{ left: 163, top: 250 }} delay={1.0} />
//     </div>
//   );
// }

/* ---------------------- Realistic Tree Preview (matches app UI) ---------------------- */

function RealNode({ label, sub, gender, deceased, isRoot, gen, x, y, delay = 0 }) {
  const ring = gender === 'female' ? 'from-rose-400 to-pink-500' : 'from-blue-400 to-indigo-500';
  return (
    <motion.div
      className="absolute z-10 bg-white rounded-xl border-2 border-gray-100 shadow-md px-3 py-2 flex items-center gap-2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: 150, left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay }}
    >
      {isRoot && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-[18px] h-[18px] rounded-full bg-amber-400 flex items-center justify-center text-white shadow">
          <CrownIcon className="w-2.5 h-2.5" />
        </div>
      )}
      <div className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-white border border-gray-200 text-[8px] font-extrabold text-primary flex items-center justify-center shadow-sm">
        G{gen}
      </div>
      <div className={`relative w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br ${ring} p-[1.5px] ${deceased ? 'grayscale opacity-80' : ''}`}>
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
          <span className="text-[11px] font-bold text-gray-700">{label.charAt(0)}</span>
        </div>
        {deceased && (
          <div className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] bg-gray-700 rounded-full flex items-center justify-center text-white">
            <CrossIcon className="w-1.5 h-1.5" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-gray-900 leading-tight truncate w-[80px]">{label}</div>
        <div className="text-[9px] text-gray-500">{sub}</div>
      </div>
    </motion.div>
  );
}

function RealisticTreePreview({ compact = false }) {
  const h = compact ? 300 : 360;

  // All coordinates below are PERCENTAGES (0–100) of the container's width/height.
  // The SVG (viewBox 0 0 100 100, preserveAspectRatio="none") and the HTML node
  // positions share this exact same 0–100 scale, so lines and cards always line up
  // perfectly no matter how wide or narrow the container actually renders.
  const positions = {
    gm: { x: 20, y: 14 },
    gf: { x: 58, y: 14 },
    father: { x: 20, y: 50 },
    mother: { x: 58, y: 50 },
    child: { x: 39, y: 86 }
  };

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden bg-[repeating-radial-gradient(circle_at_1px_1px,theme(colors.gray.300)_1px,transparent_0)] bg-[length:16px_16px] bg-gray-50"
      style={{ height: h }}
    >
      <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grandparents spouse line */}
        <motion.line
          x1={positions.gm.x + 7} y1={positions.gm.y} x2={positions.gf.x - 7} y2={positions.gf.y}
          stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="2.5 1.5" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
        />
        {/* Grandmother -> Father (same column) */}
        <motion.path
          d={`M ${positions.gm.x} ${positions.gm.y + 8} V ${positions.father.y - 8}`}
          stroke="#ec4899" strokeWidth="0.6" fill="none" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
        />
        {/* Grandfather -> Father (elbow) */}
        <motion.path
          d={`M ${positions.gf.x} ${positions.gf.y + 8} V ${(positions.gf.y + positions.father.y) / 2} H ${positions.father.x} V ${positions.father.y - 8}`}
          stroke="#6366f1" strokeWidth="0.6" fill="none" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}
        />
        {/* Father-Mother spouse line */}
        <motion.line
          x1={positions.father.x + 7} y1={positions.father.y} x2={positions.mother.x - 7} y2={positions.mother.y}
          stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="2.5 1.5" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.7 }}
        />
        {/* Father -> Child (elbow) */}
        <motion.path
          d={`M ${positions.father.x} ${positions.father.y + 8} V ${(positions.father.y + positions.child.y) / 2} H ${positions.child.x} V ${positions.child.y - 8}`}
          stroke="#6366f1" strokeWidth="0.6" fill="none" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.9 }}
        />
        {/* Mother -> Child (elbow) */}
        <motion.path
          d={`M ${positions.mother.x} ${positions.mother.y + 8} V ${(positions.mother.y + positions.child.y) / 2} H ${positions.child.x} V ${positions.child.y - 8}`}
          stroke="#ec4899" strokeWidth="0.6" fill="none" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 1.0 }}
        />
      </svg>

      <RealNode label="Grandmother" sub="1958 – 2019" gender="female" deceased isRoot gen={1} x={positions.gm.x} y={positions.gm.y} delay={0.1} />
      <RealNode label="Grandfather" sub="1955 – Present" gender="male" isRoot gen={1} x={positions.gf.x} y={positions.gf.y} delay={0.2} />
      <RealNode label="Father" sub="1982 – Present" gender="male" gen={2} x={positions.father.x} y={positions.father.y} delay={0.5} />
      <RealNode label="Mother" sub="1985 – Present" gender="female" isRoot gen={1} x={positions.mother.x} y={positions.mother.y} delay={0.6} />
      <RealNode label="You" sub="2015 – Present" gender="male" gen={3} x={positions.child.x} y={positions.child.y} delay={1.0} />
    </div>
  );
}

/* --------------------------- Browser mockup frame -------------------------- */

function BrowserFrame({ children, url = 'familytree.app/tree/sharma-family' }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-1 bg-white border border-gray-200 rounded-md text-[11px] text-gray-400 flex items-center gap-1.5">
            <LockIcon /> {url}
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

/* --------------------------------- FAQ item -------------------------------- */

function FaqItem({ q, a, isOpen, onClick }) {
  return (
    <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{q}</span>
        <ChevronDownIcon open={isOpen} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-6 pb-5 text-gray-600 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------- Home ---------------------------------- */

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md border-gray-100 shadow-sm' : 'bg-white/70 backdrop-blur-sm border-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div className="flex items-center gap-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
                  <defs>
                    <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#6366f1"/>
                      <stop offset="100%" stop-color="#ec4899"/>
                    </linearGradient>
                  </defs>
                  <rect width="32" height="32" rx="8" fill="url(#favGrad)"/>
                  <path d="M16 10 L10 18 M16 10 L22 18 M10 18 L10 24 M22 18 L22 24"
                        stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.9"/>
                  <circle cx="16" cy="8" r="3.4" fill="#ffffff"/>
                  <circle cx="10" cy="18" r="2.8" fill="#ffffff" opacity="0.95"/>
                  <circle cx="22" cy="18" r="2.8" fill="#ffffff" opacity="0.95"/>
                  <circle cx="10" cy="25" r="2.2" fill="#ffffff" opacity="0.85"/>
                  <circle cx="22" cy="25" r="2.2" fill="#ffffff" opacity="0.85"/>
                </svg>
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">FamilyTree</span>
          </motion.div>

          <motion.div
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-gray-600 hover:text-primary transition font-medium text-sm">
                {link.label}
              </a>
            ))}
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-4">
            <motion.div
              className="hidden sm:flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/auth" className="text-sm font-semibold text-gray-600 hover:text-primary transition">
                Log in
              </Link>
              <Link
                to="/auth"
                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all"
              >
                Get Started Free
              </Link>
            </motion.div>

            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={closeMobileMenu} className="text-gray-700 font-medium py-2 border-b border-gray-50 hover:text-primary transition">
                    {link.label}
                  </a>
                ))}
                <Link to="/auth" onClick={closeMobileMenu} className="text-gray-700 font-medium py-2">
                  Log in
                </Link>
                <Link to="/auth" onClick={closeMobileMenu} className="mt-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold text-center">
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 blur-3xl -z-10 rounded-full" />

        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-gray-700 font-medium text-xs mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Trusted by 10,000+ families worldwide
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight text-gray-900">
                Every family has a story.{' '}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Give yours a home.
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
                FamilyTree helps you build a beautiful, interactive family tree in minutes —
                connect parents, spouses, siblings and children, then export and share it with
                the people who matter most.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  to="/auth"
                  className="px-7 py-3.5 bg-gray-900 text-white rounded-xl text-base font-bold hover:bg-gray-800 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-gray-900/10"
                >
                  Start Building Free
                  <ArrowRightIcon />
                </Link>
                <a
                  href="#product-tour"
                  className="px-7 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-base font-semibold hover:border-gray-300 transition-all inline-flex items-center justify-center gap-2"
                >
                  <TreeIcon className="w-5 h-5" />
                  See a Live Example
                </a>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex">{[...Array(5)].map((_, i) => <StarIcon key={i} />)}</div>
                <span className="text-sm font-semibold text-gray-800">4.9/5</span>
                <span className="text-sm text-gray-500">· 2,000+ reviews</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                {trustChips.map((chip, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                    <span className="text-gray-400">{chip.icon}</span>
                    {chip.label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Actual product preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <BrowserFrame>
                <RealisticTreePreview />
              </BrowserFrame>

              <motion.div
                className="absolute -top-5 -left-5 bg-white rounded-xl shadow-xl p-3.5 border border-gray-100 hidden sm:block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="text-xl font-extrabold text-gray-900">500K+</div>
                <div className="text-xs text-gray-500">Members added</div>
              </motion.div>

              <motion.div
                className="absolute -bottom-5 -right-5 bg-white rounded-xl shadow-xl p-3.5 border border-gray-100 hidden sm:flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-full border-2 border-white" />
                  ))}
                </div>
                <div className="text-xs font-semibold text-gray-700">10K+ families</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-14 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Tour Section */}
      <section id="product-tour" className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-3.5 py-1.5 bg-primary/10 rounded-full text-primary font-semibold text-xs uppercase tracking-wide mb-4">
              See It In Action
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">
              This is exactly what you'll build
            </h2>
            <p className="text-lg text-gray-600">
              Real cards, real generations, real relationships — Father, Mother, Spouse links auto-drawn for you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <BrowserFrame url="familytree.app/tree/your-family">
              <RealisticTreePreview />
            </BrowserFrame>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6 mt-8 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Father link</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Mother link</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Spouse link</span>
            <span className="flex items-center gap-1.5"><CrownIcon className="w-3.5 h-3.5 text-amber-500" /> Family founder</span>
          </div>
        </div>
      </section>

      {/* Features Section — Bento grid */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="container mx-auto">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-3.5 py-1.5 bg-primary/10 rounded-full text-primary font-semibold text-xs uppercase tracking-wide mb-4">
              Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">
              Everything you need to preserve your history
            </h2>
            <p className="text-lg text-gray-600">Powerful features wrapped in a simple, focused interface</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl hover:border-gray-200 transition-all ${
                  feature.big ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-5 shadow-md`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2.5 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-[15px]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-3.5 py-1.5 bg-secondary/10 rounded-full text-secondary font-semibold text-xs uppercase tracking-wide mb-4">
              Simple Process
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">
              Start in 4 simple steps
            </h2>
            <p className="text-lg text-gray-600">From zero to family tree in minutes — no experience needed</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-9 left-full w-full h-px bg-gray-200 -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10 bg-white rounded-2xl border border-gray-100 p-7 text-center hover:shadow-lg transition-all">
                  <div className="w-9 h-9 mx-auto mb-4 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
                    {step.num}
                  </div>
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <h3 className="text-base font-bold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white rounded-xl text-base font-bold hover:bg-gray-800 transition-all"
            >
              Start Your Tree Now
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-3.5 py-1.5 bg-accent/10 rounded-full text-accent font-semibold text-xs uppercase tracking-wide mb-4">
              Why FamilyTree
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">
              Better than spreadsheets & paper
            </h2>
            <p className="text-lg text-gray-600">See why thousands of families switched to a smarter way to document history</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl border border-gray-100 overflow-x-auto shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-5 text-gray-500 font-medium text-sm">Feature</th>
                  <th className="p-5">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-900 text-white rounded-lg font-bold text-sm">
                      <TreeIcon className="w-4 h-4" /> FamilyTree
                    </div>
                  </th>
                  <th className="p-5 text-gray-500 font-semibold text-sm">Spreadsheets</th>
                  <th className="p-5 text-gray-500 font-semibold text-sm">Paper Charts</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/60' : ''}>
                    <td className="p-5 text-gray-800 font-medium text-sm">{row.label}</td>
                    <td className="p-5 text-center">{row.us ? <CheckCircleIcon /> : <XCircleIcon />}</td>
                    <td className="p-5 text-center">{row.spreadsheet ? <CheckCircleIcon /> : <XCircleIcon />}</td>
                    <td className="p-5 text-center">{row.paper ? <CheckCircleIcon /> : <XCircleIcon />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-3.5 py-1.5 bg-primary/10 rounded-full text-primary font-semibold text-xs uppercase tracking-wide mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">
              Loved by families worldwide
            </h2>
            <p className="text-lg text-gray-600">See what our community is building</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <QuoteIcon />
                <div className="flex items-center gap-1 mb-4 -mt-2">
                  {[...Array(testimonial.rating)].map((_, i) => <StarIcon key={i} />)}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-[15px]">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Teaser Section */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-3.5 py-1.5 bg-secondary/10 rounded-full text-secondary font-semibold text-xs uppercase tracking-wide mb-4">
              FAQ
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">Got questions?</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
          </motion.div>

          <motion.div className="space-y-3" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </motion.div>

          <div className="text-center mt-8">
            <Link to="/faq" className="text-primary font-semibold hover:underline inline-flex items-center gap-1 text-sm">
              View all FAQs <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto">
          <motion.div
            className="bg-gray-900 rounded-3xl p-12 lg:p-20 text-center text-white relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-5 tracking-tight">Ready to start your family tree?</h2>
              <p className="text-lg text-white/70 mb-9 max-w-xl mx-auto">
                Join thousands of families preserving their history today. Free forever for core features — no credit card required.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-9 py-4 bg-white text-gray-900 rounded-xl text-base font-bold hover:bg-gray-100 transition-all"
              >
                Create Free Account
                <ArrowRightIcon />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
                    <defs>
                      <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#6366f1"/>
                        <stop offset="100%" stop-color="#ec4899"/>
                      </linearGradient>
                    </defs>
                    <rect width="32" height="32" rx="8" fill="url(#favGrad)"/>
                    <path d="M16 10 L10 18 M16 10 L22 18 M10 18 L10 24 M22 18 L22 24"
                          stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.9"/>
                    <circle cx="16" cy="8" r="3.4" fill="#ffffff"/>
                    <circle cx="10" cy="18" r="2.8" fill="#ffffff" opacity="0.95"/>
                    <circle cx="22" cy="18" r="2.8" fill="#ffffff" opacity="0.95"/>
                    <circle cx="10" cy="25" r="2.2" fill="#ffffff" opacity="0.85"/>
                    <circle cx="22" cy="25" r="2.2" fill="#ffffff" opacity="0.85"/>
                  </svg>
                </div>
                <span className="text-xl font-extrabold text-white">FamilyTree</span>
              </div>
              <p className="text-sm leading-relaxed">
                Preserve your family history for future generations.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">Testimonials</a></li>
                <li><Link to="/auth" className="hover:text-white transition">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="hover:text-white transition">About</Link></li>
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2026 FamilyTree. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1.5"><LockIcon /> Secure & Private</span>
              <span>Made with love</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



















// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';

// // Icons
// const TreeIcon = () => (
//   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20l3-9m0 0l3 9m-3-9v9m6-9l3 9m-3-9V9m-3 11V9m0 11a9 9 0 01-9-9 9 9 0 0118 0 9 9 0 01-9 9z" />
//   </svg>
// );

// const ShieldIcon = () => (
//   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//   </svg>
// );

// const ShareIcon = () => (
//   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
//   </svg>
// );

// const PhotoIcon = () => (
//   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//   </svg>
// );

// const ExportIcon = () => (
//   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
//   </svg>
// );

// const HeartIcon = () => (
//   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//   </svg>
// );

// const CheckIcon = () => (
//   <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//   </svg>
// );

// const ArrowRightIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//   </svg>
// );

// const StarIcon = () => (
//   <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
//     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//   </svg>
// );

// // Features data
// const features = [
//   {
//     icon: <TreeIcon />,
//     title: 'Interactive Family Trees',
//     desc: 'Build beautiful, zoomable trees with drag-and-drop simplicity. See your family connections come to life.',
//     color: 'from-primary to-primary/70'
//   },
//   {
//     icon: <PhotoIcon />,
//     title: 'Rich Member Profiles',
//     desc: 'Add photos, bios, birth/death dates, and life stories. Preserve memories for future generations.',
//     color: 'from-secondary to-secondary/70'
//   },
//   {
//     icon: <ShieldIcon />,
//     title: 'Private & Secure',
//     desc: 'Your family data is encrypted and private by default. Only you control who sees your tree.',
//     color: 'from-accent to-accent/70'
//   },
//   {
//     icon: <ShareIcon />,
//     title: 'Share with Family',
//     desc: 'Invite relatives to view or collaborate. Build your family history together, no matter the distance.',
//     color: 'from-primary to-secondary'
//   },
//   {
//     icon: <ExportIcon />,
//     title: 'Export & Backup',
//     desc: 'Download your tree as PDF for printing or JSON for backup. Your data, your control.',
//     color: 'from-secondary to-accent'
//   },
//   {
//     icon: <HeartIcon />,
//     title: 'Preserve Legacy',
//     desc: 'Create a lasting gift for future generations. Help your descendants know their roots.',
//     color: 'from-accent to-primary'
//   }
// ];

// // Steps data
// const steps = [
//   {
//     num: '01',
//     title: 'Create Your Account',
//     desc: 'Sign up in seconds with just your email. No credit card required.',
//     icon: '✉️'
//   },
//   {
//     num: '02',
//     title: 'Start Your Tree',
//     desc: 'Name your family tree and add yourself as the first member.',
//     icon: '🌱'
//   },
//   {
//     num: '03',
//     title: 'Add Family Members',
//     desc: 'Connect parents, children, and spouses with simple clicks.',
//     icon: '👨‍👩‍👧'
//   },
//   {
//     num: '04',
//     title: 'Visualize & Share',
//     desc: 'Watch your tree grow and share it with family members.',
//     icon: '🎉'
//   }
// ];

// // Testimonials data
// const testimonials = [
//   {
//     name: 'Priya Sharma',
//     role: 'Genealogy Enthusiast',
//     text: 'I mapped 5 generations of my family in one weekend. The interface is so intuitive, even my grandparents could use it!',
//     rating: 5,
//     image: '👵'
//   },
//   {
//     name: 'Rahul Mehta',
//     role: 'Teacher & Father of 3',
//     text: 'This is now a family project. My kids love adding photos and stories. It\'s brought us closer together.',
//     rating: 5,
//     image: '👨‍👧‍👦'
//   },
//   {
//     name: 'Anita Kapoor',
//     role: 'Family Reunion Organizer',
//     text: 'I exported a beautiful PDF for our 200-person reunion. Everyone was amazed at how complete it was!',
//     rating: 5,
//     image: '🎊'
//   }
// ];

// // Stats data
// const stats = [
//   { value: '10,000+', label: 'Family Trees Created' },
//   { value: '500,000+', label: 'Family Members Added' },
//   { value: '99.9%', label: 'Uptime' },
//   { value: '100%', label: 'Free Core Features' }
// ];

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 overflow-x-hidden">
//       {/* Navigation */}
//       <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
//         <div className="container mx-auto px-6 py-4 flex justify-between items-center">
//           <motion.div
//             className="flex items-center gap-2"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//           >
//             <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl">
//               F
//             </div>
//             <span className="text-2xl font-bold text-primary">FamilyTree</span>
//           </motion.div>
          
//           <motion.div
//             className="hidden md:flex items-center gap-8"
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//           >
//             <a href="#features" className="text-gray-600 hover:text-primary transition">Features</a>
//             <a href="#how-it-works" className="text-gray-600 hover:text-primary transition">How It Works</a>
//             <a href="#testimonials" className="text-gray-600 hover:text-primary transition">Testimonials</a>
//             <a href="#faq" className="text-gray-600 hover:text-primary transition">FAQ</a>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//           >
//             <Link 
//               to="/auth" 
//               className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5"
//             >
//               Get Started Free
//             </Link>
//           </motion.div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="pt-32 pb-20 px-6">
//         <div className="container mx-auto">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             {/* Left: Content */}
//             <motion.div
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8 }}
//             >
//               <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-6">
//                 🎉 Free Forever for Core Features
//               </div>
              
//               <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
//                 Build Your{' '}
//                 <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
//                   Family Legacy
//                 </span>
//               </h1>
              
//               <p className="text-xl text-gray-600 mb-8 leading-relaxed">
//                 Create beautiful, interactive family trees. Preserve your history, 
//                 connect with relatives, and discover your roots — all in one place.
//               </p>

//               <div className="flex flex-col sm:flex-row gap-4 mb-8">
//                 <Link 
//                   to="/auth" 
//                   className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-lg font-bold hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 inline-flex items-center justify-center gap-2"
//                 >
//                   Start Building Free
//                   <ArrowRightIcon />
//                 </Link>
//                 <a 
//                   href="#how-it-works"
//                   className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-lg font-semibold hover:border-primary hover:text-primary transition-all inline-flex items-center justify-center"
//                 >
//                   See How It Works
//                 </a>
//               </div>

//               {/* Trust Indicators */}
//               <div className="flex items-center gap-6 text-sm text-gray-500">
//                 <div className="flex items-center gap-2">
//                   <CheckIcon />
//                   <span>No credit card required</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <CheckIcon />
//                   <span>Free forever</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <CheckIcon />
//                   <span>Cancel anytime</span>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Right: Visual/Preview */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               className="relative"
//             >
//               <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
//                 <div className="aspect-video bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl flex items-center justify-center">
//                   <div className="text-center">
//                     <div className="text-6xl mb-4">🌳</div>
//                     <p className="text-gray-600 font-medium">Interactive Tree Preview</p>
//                     <p className="text-sm text-gray-500">See your family come to life</p>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Floating Stats Cards */}
//               <motion.div
//                 className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.6 }}
//               >
//                 <div className="text-2xl font-bold text-primary">500K+</div>
//                 <div className="text-sm text-gray-600">Members Added</div>
//               </motion.div>

//               <motion.div
//                 className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.8 }}
//               >
//                 <div className="flex items-center gap-2">
//                   <div className="flex -space-x-2">
//                     {[1, 2, 3].map(i => (
//                       <div key={i} className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full border-2 border-white" />
//                     ))}
//                   </div>
//                   <div className="text-sm font-medium text-gray-700">10K+ Families</div>
//                 </div>
//               </motion.div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="py-16 bg-white">
//         <div className="container mx-auto px-6">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//             {stats.map((stat, index) => (
//               <motion.div
//                 key={index}
//                 className="text-center"
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <div className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
//                   {stat.value}
//                 </div>
//                 <div className="text-gray-600 font-medium">{stat.label}</div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-24 px-6">
//         <div className="container mx-auto">
//           <motion.div
//             className="text-center max-w-3xl mx-auto mb-16"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
//               Everything You Need to{' '}
//               <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//                 Preserve Your History
//               </span>
//             </h2>
//             <p className="text-xl text-gray-600">
//               Powerful features wrapped in a simple, beautiful interface
//             </p>
//           </motion.div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {features.map((feature, index) => (
//               <motion.div
//                 key={index}
//                 className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
//                   {feature.icon}
//                 </div>
//                 <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
//                 <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* How It Works Section */}
//       <section id="how-it-works" className="py-24 px-6 bg-white">
//         <div className="container mx-auto">
//           <motion.div
//             className="text-center max-w-3xl mx-auto mb-16"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
//               Start in{' '}
//               <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
//                 4 Simple Steps
//               </span>
//             </h2>
//             <p className="text-xl text-gray-600">
//               From zero to family tree in minutes — no experience needed
//             </p>
//           </motion.div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {steps.map((step, index) => (
//               <motion.div
//                 key={index}
//                 className="relative"
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.15 }}
//               >
//                 {index < steps.length - 1 && (
//                   <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent -translate-x-1/2 z-0" />
//                 )}
//                 <div className="relative z-10 bg-white rounded-3xl shadow-lg p-8 border border-gray-100 text-center hover:shadow-xl transition-all">
//                   <div className="text-5xl mb-4">{step.icon}</div>
//                   <div className="text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
//                     {step.num}
//                   </div>
//                   <h3 className="text-xl font-bold mb-3">{step.title}</h3>
//                   <p className="text-gray-600">{step.desc}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>

//           <div className="text-center mt-12">
//             <Link 
//               to="/auth" 
//               className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-lg font-bold hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1"
//             >
//               Start Your Tree Now
//               <ArrowRightIcon />
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section id="testimonials" className="py-24 px-6">
//         <div className="container mx-auto">
//           <motion.div
//             className="text-center max-w-3xl mx-auto mb-16"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
//               Loved by{' '}
//               <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
//                 Families Worldwide
//               </span>
//             </h2>
//             <p className="text-xl text-gray-600">
//               See what our community is building
//             </p>
//           </motion.div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, index) => (
//               <motion.div
//                 key={index}
//                 className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all"
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <div className="flex items-center gap-1 mb-4">
//                   {[...Array(testimonial.rating)].map((_, i) => (
//                     <StarIcon key={i} />
//                   ))}
//                 </div>
//                 <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-2xl">
//                     {testimonial.image}
//                   </div>
//                   <div>
//                     <div className="font-bold text-gray-900">{testimonial.name}</div>
//                     <div className="text-sm text-gray-500">{testimonial.role}</div>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-24 px-6">
//         <div className="container mx-auto">
//           <motion.div
//             className="bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl p-12 lg:p-20 text-center text-white relative overflow-hidden"
//             initial={{ opacity: 0, scale: 0.95 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             viewport={{ once: true }}
//           >
//             {/* Background Pattern */}
//             <div className="absolute inset-0 opacity-10">
//               <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
//               <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
//             </div>

//             <div className="relative z-10">
//               <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">
//                 Ready to Start Your Family Tree?
//               </h2>
//               <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
//                 Join thousands of families preserving their history today. 
//                 Free forever for core features — no credit card required.
//               </p>
//               <Link 
//                 to="/auth" 
//                 className="inline-flex items-center gap-2 px-10 py-5 bg-white text-primary rounded-xl text-lg font-bold hover:shadow-2xl transition-all transform hover:-translate-y-1"
//               >
//                 Create Free Account
//                 <ArrowRightIcon />
//               </Link>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-white border-t border-gray-100 py-12 px-6">
//         <div className="container mx-auto">
//           <div className="grid md:grid-cols-4 gap-8 mb-8">
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl">
//                   F
//                 </div>
//                 <span className="text-2xl font-bold text-primary">FamilyTree</span>
//               </div>
//               <p className="text-gray-600 text-sm">
//                 Preserve your family history for future generations.
//               </p>
//             </div>

//             <div>
//               <h4 className="font-bold mb-4">Product</h4>
//               <ul className="space-y-2 text-sm text-gray-600">
//                 <li><a href="#features" className="hover:text-primary transition">Features</a></li>
//                 <li><a href="#how-it-works" className="hover:text-primary transition">How It Works</a></li>
//                 <li><a href="#testimonials" className="hover:text-primary transition">Testimonials</a></li>
//                 <li><a href="/auth" className="hover:text-primary transition">Get Started</a></li>
//               </ul>
//             </div>

//             <div>
//               <h4 className="font-bold mb-4">Company</h4>
//               <ul className="space-y-2 text-sm text-gray-600">
//                 <li><a href="/about" className="hover:text-primary transition">About</a></li>
//                 <li><a href="/faq" className="hover:text-primary transition">FAQ</a></li>
//                 <li><a href="/contact" className="hover:text-primary transition">Contact</a></li>
//                 <li><a href="/privacy" className="hover:text-primary transition">Privacy</a></li>
//               </ul>
//             </div>

//             <div>
//               <h4 className="font-bold mb-4">Legal</h4>
//               <ul className="space-y-2 text-sm text-gray-600">
//                 <li><a href="/privacy" className="hover:text-primary transition">Privacy Policy</a></li>
//                 <li><a href="/terms" className="hover:text-primary transition">Terms of Service</a></li>
//               </ul>
//             </div>
//           </div>

//           <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
//             <p className="text-sm text-gray-500">
//               © 2026 FamilyTree. All rights reserved.
//             </p>
//             <div className="flex items-center gap-6 text-sm text-gray-500">
//               <span>🔒 Secure & Private</span>
//               <span>Made with love</span>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }