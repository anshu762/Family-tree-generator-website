# 🌳 Family Tree Generator

An interactive, visual family tree builder that lets you create, explore, and export multi-generational family trees with automatic layout, relationship management, and rich member profiles.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![React](https://img.shields.io/badge/react-18-61DAFB?logo=react)

---

## ✨ Features

- **Interactive Tree Canvas** — Drag, zoom, and pan through your family tree powered by [React Flow](https://reactflow.dev/)
- **Automatic Layout Engine** — Uses [Dagre](https://github.com/dagrejs/dagre) to auto-arrange nodes in a clean hierarchical structure (Top-Bottom or Left-Right)
- **Rich Relationship Modeling**
  - Parents (Father / Mother)
  - Children (auto-links both parents when a spouse exists)
  - Siblings (shared parents)
  - Spouses / Partners
- **Smart Add-Member Flow** — Select a relationship type (son, daughter, father, mother, sibling, spouse, etc.) and the form auto-fills gender and parent links
- **Live Search** — Instantly search and jump/focus to any member on the canvas
- **Member Detail Panel** — View father, mother, spouse(s), siblings, children, birth/death dates, and bio in one place
- **Visual Indicators**
  - 👑 Founder badge for root ancestors (no parents)
  - Generation badge (`G1`, `G2`, ...) on every node
  - 💍 Spouse indicator icon
  - Deceased marker with grayscale photo styling
- **Tree Statistics Bar** — Total members, male/female counts, and generation count, live-updated
- **Export to PNG / PDF** — Download your entire tree as a high-resolution image or PDF document
- **Fullscreen Mode** — Distraction-free, full-browser tree viewing
- **Legend Panel** — Explains node colors, edge types (father/mother/spouse), and icons
- **Responsive UI** — Smooth animations via Framer Motion, styled with Tailwind CSS
- **Safe Deletion Guards** — Prevents assigning a descendant as their own ancestor's parent (cycle protection)

---

## 🛠 Tech Stack

| Layer            | Technology                                   |
|-------------------|-----------------------------------------------|
| Frontend          | React + Vite                                  |
| Tree Visualization| `@xyflow/react` (React Flow)                  |
| Auto Layout       | `@dagrejs/dagre`                              |
| Animations        | Framer Motion                                 |
| Styling           | Tailwind CSS                                  |
| HTTP Client       | Axios                                         |
| Routing           | React Router DOM                              |
| PNG/PDF Export    | `html-to-image` + `jsPDF`                     |
| Backend           | Node.js / Express (REST API)                  |
| Auth              | JWT (Bearer token)                            |

> Update the **Backend** row above if you're using a different framework/database (e.g. PostgreSQL, MySQL, MongoDB) than what's listed.

---

## 📁 Project Structure
```bash
family-tree-generator/
├── public/
│ ├── favicon.svg
│ ├── logo.svg
│ └── manifest.json
├── src/
│ ├── components/
│ │ └── Logo.jsx
│ ├── pages/
│ │ └── TreeView.jsx # Main tree canvas + CRUD logic
│ ├── App.jsx
│ └── main.jsx
├── .env # VITE_API_URL config (not committed)
├── index.html
├── package.json
└── README.md
```

text


---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18`
- npm or yarn
- A running backend API (see [Backend Setup](#backend-setup))

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/family-tree-generator.git
cd family-tree-generator
2. Install dependencies
Bash

npm install
3. Configure environment variables
Create a .env file in the project root:

env

VITE_API_URL=http://localhost:4000/api
4. Run the development server
Bash

npm run dev
The app will be available at http://localhost:5173 (default Vite port).

5. Build for production
Bash

npm run build
npm run preview
```

# 🔌 Backend API Reference
The frontend expects the following REST endpoints (adjust to match your actual backend):
```bash
Method	Endpoint	Description
GET	/members/:treeId	Fetch all members of a tree
GET	/members/spouses/:treeId	Fetch all spouse relationships
POST	/members	Create a new member
PUT	/members/:id	Update an existing member
DELETE	/members/:id	Delete a member
POST	/members/spouses	Create a spouse relationship
All requests require an Authorization: Bearer <token> header (JWT-based auth).
```

# Member object shape
```bash
JSON

{
  "id": 1,
  "tree_id": 4,
  "name": "John Doe",
  "gender": "male",
  "birth_date": "1980-05-12",
  "death_date": null,
  "photo_url": "https://...",
  "bio": "Short biography...",
  "father_id": null,
  "mother_id": null
}
```
# 🧭 How It Works
```bash
Load Tree — On visiting /tree/:id, the app fetches all members and spouse links for that tree.
Generation Calculation — Each member's generation is computed recursively based on parent depth (root ancestors = Generation 1).
Auto Layout — Dagre calculates X/Y coordinates for every node based on parent → child edges, producing a clean top-down or left-right tree.
Rendering — React Flow renders each member as a custom node (photo, name, generation badge, founder/spouse/deceased indicators) connected by color-coded edges:
🔵 Indigo edge = Father relationship
🌸 Pink edge = Mother relationship
🟡 Amber dashed edge = Spouse relationship
Interactions
Click a node → opens the detail panel (parents, spouse, children, siblings, bio)
Hover a node → quick actions appear (Edit ✎, Add Child +, Delete ✕)
Use the top-right toolbar to search, change layout direction, toggle fullscreen, or export
Export — The .react-flow canvas is captured as an image (html-to-image) and either downloaded as PNG or embedded into a PDF (jsPDF).
🎨 Branding
Favicon: public/favicon.svg (with .ico/PNG fallbacks for older browsers)
Logo: public/logo.svg and reusable <Logo /> component in src/components/Logo.jsx
Theme Colors:
Primary: #6366f1 (Indigo)
Secondary: #ec4899 (Pink)
🗺 Roadmap / Ideas
 Multi-tree comparison view
 Timeline view (chronological instead of generational)
 Shareable public tree links
 Import from GEDCOM files
 Dark mode
```


# 🙏 Acknowledgements
React Flow — Node-based graph rendering
Dagre — Graph layout algorithm
Framer Motion — Animations
Tailwind CSS — Styling