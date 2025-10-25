import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PeopleTable from "../Tables";
import {
  Plus,
  Search,
  ChevronDown,
  Calendar,
  User as UserIcon,
  Briefcase,
  CheckCircle2,
  PauseCircle,
  AlertCircle,
  Timer,
  ArrowUpDown,
  MessageSquare,
  SendHorizontal,
  Eye,
  X,
  Loader2,
  UploadCloud,
  FileText,
  Code,
  Palette,
  Link2,
  Image as ImageIcon,
  RefreshCw,
  Check,
  Undo2,
} from "lucide-react";

/* ===================== MOCK  ===================== */
const USE_MOCK = true;

/* ===================== Theme ===================== */
const T = {
  primary: "#028090",
  dark: "#05668D",
  light: "#02C39A",
  ring: "rgba(15,23,42,.10)",
};
const ringStyle = { border: `1px solid ${T.ring}` };

/* ===================== Role ===================== */
function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  return "user";
}

/* ===================== AXIOS Instance ===================== */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

/* ===================== MOCK DATA ===================== */
const MOCK_PROJECTS = [
  {
    id: "P-1001",
    title: "E-commerce UI Overhaul",
    client: "Suzy Store",
    owner: "Hazber Team",
    due: "2025-11-10",
    budget: 12000,
    progress: 70,
    status: "Active",
    category: "programming",
    description: "Revamp product grid, checkout, and account pages.",
    image: "https://picsum.photos/seed/p1001/800/500",
  },
  {
    id: "P-1002",
    title: "OrderzHouse Tasks Module",
    client: "OrderzHouse",
    owner: "Backend Squad",
    due: "2025-12-01",
    budget: 8000,
    progress: 35,
    status: "Planning",
    category: "programming",
    description: "Tasks CRUD with role-based views.",
    image: "https://picsum.photos/seed/p1002/800/500",
  },
  {
    id: "P-1003",
    title: "Brand Identity — Zayt Aurum",
    client: "Zayt Aurum",
    owner: "Branding Cell",
    due: "2025-11-28",
    budget: 4500,
    progress: 55,
    status: "Active",
    category: "design",
    description: "Logo, packaging, dieline, and mockups.",
    image: "https://picsum.photos/seed/p1003/800/500",
  },
  {
    id: "P-1004",
    title: "Casa Landing Page",
    client: "Casa",
    owner: "Frontend Team",
    due: "2025-11-05",
    budget: 3000,
    progress: 90,
    status: "Done",
    category: "programming",
    description: "Responsive landing with Tailwind & animations.",
    image: "https://picsum.photos/seed/p1004/800/500",
  },
  {
    id: "P-1005",
    title: "Freelancer Payouts",
    client: "OrderzHouse",
    owner: "Finance Ops",
    due: "2025-11-22",
    budget: 6000,
    progress: 10,
    status: "On hold",
    category: "programming",
    description: "Stripe & bank transfer flow.",
    image: "https://picsum.photos/seed/p1005/800/500",
  },
  {
    id: "P-1006",
    title: "InvestFarm Pitch Deck",
    client: "InvestFarm",
    owner: "Design Guild",
    due: "2025-11-18",
    budget: 2000,
    progress: 80,
    status: "Active",
    category: "content",
    description: "12 slides, growth plan, TAM/SAM/SOM.",
    image: "https://picsum.photos/seed/p1006/800/500",
  },
  {
    id: "P-1007",
    title: "Hero Search (Projects)",
    client: "Hazber",
    owner: "Web Apps",
    due: "2025-11-08",
    budget: 1500,
    progress: 60,
    status: "Active",
    category: "programming",
    description: "Categories & subcategories with routing filters.",
    image: "https://picsum.photos/seed/p1007/800/500",
  },
  {
    id: "P-1008",
    title: "Megamenu Redesign",
    client: "Hazber",
    owner: "UX Core",
    due: "2025-11-30",
    budget: 1800,
    progress: 25,
    status: "Planning",
    category: "design",
    description: "Centering, hover intent, and mobile sheet.",
    image: "https://picsum.photos/seed/p1008/800/500",
  },
  {
    id: "P-1009",
    title: "Loader & Silent Nav",
    client: "OrderzHouse",
    owner: "Frontend Team",
    due: "2025-11-06",
    budget: 900,
    progress: 100,
    status: "Done",
    category: "programming",
    description: "Silent dropdown actions without page reload.",
    image: "https://picsum.photos/seed/p1009/800/500",
  },
  {
    id: "P-1010",
    title: "Freelancer Dashboard KPIs",
    client: "OrderzHouse",
    owner: "Data Team",
    due: "2025-11-15",
    budget: 2500,
    progress: 45,
    status: "Active",
    category: "programming",
    description: "Due soon, active, done counters.",
    image: "https://picsum.photos/seed/p1010/800/500",
  },
  {
    id: "P-1011",
    title: "Client Kanban Columns",
    client: "Hazber",
    owner: "UX Core",
    due: "2025-12-05",
    budget: 1100,
    progress: 5,
    status: "Planning",
    category: "content",
    description: "Tuning the four status lanes.",
    image: "https://picsum.photos/seed/p1011/800/500",
  },
  {
    id: "P-1012",
    title: "Gmail-like Feature Study",
    client: "Research",
    owner: "Product",
    due: "2025-11-25",
    budget: 1300,
    progress: 20,
    status: "On hold",
    category: "content",
    description: "Benchmarking search-in-DMs feature parity.",
    image: "https://picsum.photos/seed/p1012/800/500",
  },
];

const MOCK_DELIVERIES = {
  "P-1001": [
    {
      id: "v2",
      at: "2025-11-07T10:10:00Z",
      notes: "Hotfix checkout total, added unit tests.",
      links: { primary: "https://github.com/acme/shop/tree/v1.0.1", secondary: "https://shop.example.com" },
      attachments: ["build_101.zip"],
      status: "submitted",
    },
    {
      id: "v1",
      at: "2025-11-05T16:00:00Z",
      notes: "Initial delivery.",
      links: { primary: "https://github.com/acme/shop/tree/v1.0.0" },
      attachments: [],
      status: "submitted",
    },
  ],
  "P-1006": [
    {
      id: "v1",
      at: "2025-11-16T09:00:00Z",
      notes: "Slides + speaker notes.",
      links: { primary: "https://docs.google.com/presentation/d/xyz" },
      attachments: ["deck.pdf"],
      status: "submitted",
    },
  ],
};

const MOCK_ADMIN = MOCK_PROJECTS;
const MOCK_CLIENT = MOCK_PROJECTS;
const MOCK_FREELANCER = MOCK_PROJECTS;

/* ===================== Entry ===================== */
export default function Projects() {
  const { userData } = useSelector((s) => s.auth);
  const role = mapRole(userData?.role_id);

  if (role === "admin") return <AdminProjects />;
  if (role === "freelancer") return <FreelancerProjects />;
  return <ClientProjects />;
}

/* ===================== Admin ===================== */
function AdminProjects() {
  const columns = [
    { label: "Title", key: "title" },
    { label: "Client", key: "client" },
    { label: "Owner", key: "owner" },
    { label: "Due", key: "due" },
    { label: "Budget", key: "budget" },
    { label: "Progress", key: "progress" },
    { label: "Status", key: "status" },
  ];
  const formFields = [
    { key: "title", label: "Title", required: true },
    { key: "client", label: "Client" },
    { key: "owner", label: "Owner" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Planning", "Active", "On hold", "Done"],
      defaultValue: "Planning",
    },
    { key: "progress", label: "Progress %", type: "number", defaultValue: 0 },
    { key: "budget", label: "Budget", type: "number", placeholder: "12000" },
    { key: "due", label: "Due", type: "date" },
    { key: "description", label: "Description", type: "textarea" },
  ];
  const chips = [
    { label: "All", value: "" },
    { label: "Planning", value: "Planning" },
    { label: "Active", value: "Active" },
    { label: "On hold", value: "On hold" },
    { label: "Done", value: "Done" },
  ];
  const filters = [
    { key: "status", label: "Status", options: ["Planning", "Active", "On hold", "Done"] },
  ];

  if (USE_MOCK) {
    return <AdminMockTable items={MOCK_ADMIN} columns={columns} chips={chips} />;
  }

  return (
    <PeopleTable
      title="Projects"
      addLabel="Add Project"
      endpoint="/api/admin/projects"
      columns={columns}
      formFields={formFields}
      chips={chips}
      chipField="status"
      filters={filters}
    />
  );
}

/* ===================== Client ===================== */
function ClientProjects() {
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("due_asc");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewFor, setReviewFor] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        if (USE_MOCK) {
          if (!alive) return;
          setItems(MOCK_CLIENT);
          return;
        }
        const { data } = await api.get("/api/client/projects", {
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
        });
        if (!alive) return;
        const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        setItems(list);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [token]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    let arr = items.filter((p) => {
      const matchQ =
        !t ||
        (p.title ?? "").toLowerCase().includes(t) ||
        (p.client ?? "").toLowerCase().includes(t) ||
        (p.owner ?? "").toLowerCase().includes(t);
      const s = (p.status ?? "").toLowerCase();
      const matchS = status === "all" || s === status;
      return matchQ && matchS;
    });
    arr = arr.sort((a, b) => {
      if (sort === "due_asc") return new Date(a.due) - new Date(b.due);
      if (sort === "due_desc") return new Date(b.due) - new Date(a.due);
      if (sort === "progress_desc") return (b.progress ?? 0) - (a.progress ?? 0);
      return 0;
    });
    return arr;
  }, [q, status, sort, items]);

  // actions
  const openChat = (p) => {
    const withUser = p.assignee || "Freelancer";
    navigate(`/chat?projectId=${encodeURIComponent(p.id)}&with=${encodeURIComponent(withUser)}`);
  };
  const openDetails = (p) => {
    navigate(`/project/${p.id}`, { state: { project: p, readOnly: true, role: "client" } });
  };
  const openReview = (p) => {
    setReviewFor(p);
    setReviewOpen(true);
  };

  const approveLatest = async (projectId, versionId) => {
    if (USE_MOCK) {
      setItems((prev) =>
        prev.map((it) => (it.id === projectId ? { ...it, status: "Done", progress: 100 } : it))
      );
      return;
    }
    await api.post(`/api/client/projects/${projectId}/approve`, { versionId }, {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    });
  };

  const requestChanges = async (projectId, versionId, message) => {
    if (USE_MOCK) {
      setItems((prev) =>
        prev.map((it) => (it.id === projectId ? { ...it, status: "Active" } : it))
      );
      return;
    }
    await api.post(`/api/client/projects/${projectId}/request-changes`, { versionId, message }, {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <header className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5" style={ringStyle}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold" style={{ color: T.dark }}>
              My Projects
            </h1>
            <p className="text-slate-500 text-sm">Manage requests, chat, and receive deliveries</p>
          </div>

          <div className="grid sm:flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title or freelancer…"
                className="w-full sm:w-64 pl-9 pr-3 py-2.5 rounded-xl bg-white outline-none"
                style={ringStyle}
              />
            </div>
            <Select
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { label: "All", value: "all" },
                { label: "Planning", value: "planning" },
                { label: "Active", value: "active" },
                { label: "On hold", value: "on hold" },
                { label: "Done", value: "done" },
              ]}
            />
            <Select
              label="Sort"
              value={sort}
              onChange={setSort}
              options={[
                { label: "Due ↑", value: "due_asc" },
                { label: "Due ↓", value: "due_desc" },
                { label: "Progress ↓", value: "progress_desc" },
              ]}
              icon={<ArrowUpDown className="w-4 h-4" />}
            />
          </div>
        </div>
      </header>

      {/* Cards grid */}
      {loading ? (
        <div className="rounded-2xl bg-white/80 backdrop-blur p-5 text-slate-500 text-center" style={ringStyle}>
          Loading…
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.length === 0 ? (
            <div
              className="md:col-span-2 xl:col-span-3 rounded-2xl bg-white/80 backdrop-blur shadow-sm p-5 text-center text-slate-500"
              style={ringStyle}
            >
              No projects found.
            </div>
          ) : (
            filtered.map((p) => (
              <ClientCard
                key={p.id}
                p={p}
                onDetails={() => openDetails(p)}
                onChat={() => openChat(p)}
                onReceive={() => openReview(p)}
              />
            ))
          )}
        </section>
      )}

      {reviewOpen && reviewFor && (
        <ClientReviewDrawer
          project={reviewFor}
          onClose={() => { setReviewOpen(false); setReviewFor(null); }}
          onApprove={approveLatest}
          onRequestChanges={requestChanges}
        />
      )}
    </div>
  );
}

function ClientCard({ p, onDetails, onChat, onReceive }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur shadow-sm hover:shadow transition overflow-hidden" style={ringStyle}>
      <ProjectImage p={p} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-slate-800">{p.title}</div>
            <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5" />
              <span className="truncate">{p.assignee || "Freelancer"}</span>
              <span className="mx-1">•</span>
              <Calendar className="w-3.5 h-3.5" />
              <span>{p.due}</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={p.progress ?? 0} />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <StatusBadge status={p.status} />
            <div className="mt-2 text-sm font-semibold text-slate-700">
              {typeof p.budget === "number" ? `$${p.budget.toLocaleString()}` : "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={onDetails}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm"
            style={ringStyle}
            title="Open details"
          >
            <Eye className="w-4 h-4" />
            Details
          </button>
          <button
            onClick={onChat}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm"
            style={ringStyle}
            title="Open chat"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={onReceive}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-xl text-white text-xs hover:shadow"
            style={{ backgroundColor: T.primary }}
            title="Review & receive delivery"
          >
            <SendHorizontal className="w-4 h-4" />
            Receive
          </button>
        </div>
      </div>
    </div>
  );
}

/* =============== Review Drawer (Client) =============== */
function ClientReviewDrawer({ project, onClose, onApprove, onRequestChanges }) {
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        if (USE_MOCK) {
          if (!alive) return;
          setVersions(MOCK_DELIVERIES[project.id] || []);
          return;
        }
       
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [project?.id]);

  const latest = versions[0];

  const approve = async () => {
    if (!latest) return;
    setSubmitting(true);
    await onApprove(project.id, latest.id);
    setSubmitting(false);
    onClose();
  };

  const request = async () => {
    if (!latest) return;
    setSubmitting(true);
    await onRequestChanges(project.id, latest.id, requestText.trim());
    setSubmitting(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="font-semibold text-slate-800">Receive Project — {project.title}</div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            <section className="rounded-2xl bg-white p-4" style={ringStyle}>
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-800">Latest delivery</div>
                <button
                  className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50"
                  style={ringStyle}
                  onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 400); }}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {!latest ? (
                <div className="text-sm text-slate-500 mt-3">No deliveries yet.</div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="text-xs text-slate-500">
                    Delivered on {new Date(latest.at).toLocaleString()}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Primary">
                      <a className="text-sky-700 hover:underline break-all" href={latest.links?.primary} target="_blank" rel="noreferrer">
                        {latest.links?.primary}
                      </a>
                    </Field>
                    {latest.links?.secondary && (
                      <Field label="Secondary">
                        <a className="text-sky-700 hover:underline break-all" href={latest.links?.secondary} target="_blank" rel="noreferrer">
                          {latest.links?.secondary}
                        </a>
                      </Field>
                    )}
                  </div>

                  {latest.notes && (
                    <Field label="Notes">
                      <div className="text-sm text-slate-700 whitespace-pre-wrap">{latest.notes}</div>
                    </Field>
                  )}

                  <Field label="Attachments">
                    {latest.attachments?.length ? (
                      <ul className="list-disc ml-4 text-sm text-slate-700">
                        {latest.attachments.map((f) => <li key={f}>{f}</li>)}
                      </ul>
                    ) : (
                      <span className="text-slate-500 text-sm">—</span>
                    )}
                  </Field>
                </div>
              )}
            </section>

            {/* Actions */}
            <section className="rounded-2xl bg-white p-4" style={ringStyle}>
              <div className="flex items-center gap-2">
                <button
                  disabled={!latest || submitting}
                  onClick={approve}
                  className="h-11 px-4 rounded-xl text-white text-sm inline-flex items-center gap-2"
                  style={{ backgroundColor: T.primary, opacity: !latest || submitting ? 0.75 : 1 }}
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={!latest || submitting}
                  onClick={() => setRequesting((v) => !v)}
                  className="h-11 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm inline-flex items-center gap-2"
                  style={ringStyle}
                >
                  <Undo2 className="w-4 h-4" />
                  Request changes
                </button>
              </div>

              {requesting && (
                <div className="mt-3">
                  <textarea
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="Briefly describe what needs to be changed..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none min-h-[80px]"
                    style={ringStyle}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      disabled={!requestText.trim() || submitting}
                      onClick={request}
                      className="h-10 px-3 rounded-xl text-white text-sm"
                      style={{ backgroundColor: T.dark, opacity: !requestText.trim() || submitting ? 0.75 : 1 }}
                    >
                      Send request
                    </button>
                    <button
                      type="button"
                      className="h-10 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm"
                      style={ringStyle}
                      onClick={() => setRequesting(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* History */}
            <section className="rounded-2xl bg-white p-4" style={ringStyle}>
              <div className="font-medium text-slate-800">History</div>
              {versions.length === 0 ? (
                <div className="text-sm text-slate-500 mt-2">No history yet.</div>
              ) : (
                <ol className="mt-3 space-y-3">
                  {versions.map((v) => (
                    <li key={v.id} className="rounded-xl bg-white p-3" style={ringStyle}>
                      <div className="text-xs text-slate-500">
                        {new Date(v.at).toLocaleString()} — {v.id}
                      </div>
                      <div className="mt-1 text-sm text-slate-700">{v.notes || "—"}</div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}


function ProjectImage({ p }) {
  const [ok, setOk] = useState(!!p.image);
  return ok ? (
    <img
      src={p.image}
      alt={p.title}
      className="w-full aspect-[16/9] object-cover"
      onError={() => setOk(false)}
    />
  ) : (
    <div className="w-full aspect-[16/9] grid place-items-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="flex items-center gap-2 text-slate-500">
        <ImageIcon className="w-5 h-5" />
        <span className="text-sm">{emojiFor(p.category)} {capitalize(p.category || "project")}</span>
      </div>
    </div>
  );
}
function emojiFor(cat) {
  if (cat === "design") return "🎨";
  if (cat === "content") return "📝";
  return "🧑‍💻";
}

/* ===================== Freelancer ===================== */
function FreelancerProjects() {
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("due_asc");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deliverOpen, setDeliverOpen] = useState(false);
  const [deliverFor, setDeliverFor] = useState(null);
  const [deliverSubmitting, setDeliverSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        if (USE_MOCK) {
          if (!alive) return;
          setItems(MOCK_FREELANCER);
          return;
        }

        const { data } = await api.get("/api/freelancer/projects", {
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
        });
        if (!alive) return;
        const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        setItems(list);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [token]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    let arr = items.filter((p) => {
      const matchQ =
        !t ||
        (p.title ?? "").toLowerCase().includes(t) ||
        (p.client ?? "").toLowerCase().includes(t) ||
        (p.owner ?? "").toLowerCase().includes(t);
      const matchS = status === "all" || (p.status ?? "").toLowerCase() === status;
      return matchQ && matchS;
    });

    arr = arr.sort((a, b) => {
      if (sort === "due_asc") return new Date(a.due) - new Date(b.due);
      if (sort === "due_desc") return new Date(b.due) - new Date(a.due);
      if (sort === "progress_desc") return (b.progress ?? 0) - (a.progress ?? 0);
      return 0;
    });
    return arr;
  }, [q, status, sort, items]);

  const kpis = useMemo(() => {
    const active = items.filter((p) => p.status === "Active").length;
    const done = items.filter((p) => p.status === "Done").length;
    const dueSoon = items.filter((p) => {
      const d = new Date(p.due);
      const now = new Date();
      const diff = (d - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7 && p.status !== "Done";
    }).length;
    return { active, dueSoon, done };
  }, [items]);

  // === actions ===
  const openDetails = (p) => {
    navigate(`/project/${p.id}`, {
      state: { project: p, readOnly: true, role: "freelancer" },
    });
  };

  const openChat = (p) => {
    navigate(`/chat?projectId=${encodeURIComponent(p.id)}&with=${encodeURIComponent(p.client)}`);
  };

  const startDeliver = (p) => {
    setDeliverFor(p);
    setDeliverOpen(true);
  };

  const submitDelivery = async (payload) => {
    if (!deliverFor) return;
    setDeliverSubmitting(true);
    try {
      if (USE_MOCK) {
        setItems((prev) =>
          prev.map((it) =>
            (it.id ?? it._id) === (deliverFor.id ?? deliverFor._id)
              ? { ...it, status: "Done", progress: 100 }
              : it
          )
        );
      } else {
        const fd = new FormData();
        fd.append("category", payload.category);
        fd.append("notes", payload.notes || "");
        fd.append("links", JSON.stringify(payload.links || {}));
        fd.append("checklist", JSON.stringify(payload.checklist || {}));
        (payload.files || []).forEach((f) => fd.append("files", f));
        await api.post(
          `/api/freelancer/projects/${deliverFor.id}/deliver`,
          fd,
          {
            headers: {
              ...(token ? { authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        setItems((prev) =>
          prev.map((it) =>
            (it.id ?? it._id) === (deliverFor.id ?? deliverFor._id)
              ? { ...it, status: "Done", progress: 100 }
              : it
          )
        );
      }
      setDeliverOpen(false);
      setDeliverFor(null);
    } catch (e) {
      alert("Failed to deliver. Please try again.");
    } finally {
      setDeliverSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <header
        className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5"
        style={ringStyle}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold" style={{ color: T.dark }}>
              My Assigned Projects
            </h1>
            <p className="text-slate-500 text-sm">Work fast with quick actions</p>
          </div>

          <div className="grid sm:flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title or client…"
                className="w-full sm:w-64 pl-9 pr-3 py-2.5 rounded-xl bg-white outline-none"
                style={ringStyle}
              />
            </div>

            <Select
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { label: "All", value: "all" },
                { label: "Planning", value: "planning" },
                { label: "Active", value: "active" },
                { label: "On hold", value: "on hold" },
                { label: "Done", value: "done" },
              ]}
            />
            <Select
              label="Sort"
              value={sort}
              onChange={setSort}
              options={[
                { label: "Due ↑", value: "due_asc" },
                { label: "Due ↓", value: "due_desc" },
                { label: "Progress ↓", value: "progress_desc" },
              ]}
              icon={<ArrowUpDown className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-3">
          <MiniKpi icon={<Timer />} title="Due in 7d" value={ items.filter((p) => {
            const d = new Date(p.due); const now = new Date(); const diff = (d - now)/(1000*60*60*24);
            return diff >= 0 && diff <= 7 && p.status !== "Done";
          }).length} />
          <MiniKpi icon={<PauseCircle />} title="Active" value={items.filter((p) => p.status === "Active").length} />
          <MiniKpi icon={<CheckCircle2 />} title="Done" value={items.filter((p) => p.status === "Done").length} />
        </div>
      </header>

      {/* Cards list */}
      {loading ? (
        <div className="rounded-2xl bg-white/80 backdrop-blur p-5 text-slate-500 text-center" style={ringStyle}>
          Loading…
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.length === 0 ? (
            <div
              className="md:col-span-2 xl:col-span-3 rounded-2xl bg-white/80 backdrop-blur shadow-sm p-5 text-center text-slate-500"
              style={ringStyle}
            >
              No projects found.
            </div>
          ) : (
            filtered.map((p) => (
              <FreelancerCard
                key={p.id ?? p._id}
                p={p}
                onDetails={() => navigate(`/project/${p.id}`, { state: { project: p, readOnly: true, role: "freelancer" } })}
                onChat={() => navigate(`/chat?projectId=${encodeURIComponent(p.id)}&with=${encodeURIComponent(p.client)}`)}
                onDeliver={() => { setDeliverFor(p); setDeliverOpen(true); }}
                isDelivering={deliverOpen && deliverFor && (deliverFor.id === p.id)}
              />
            ))
          )}
        </section>
      )}

      {/* Deliver Modal */}
      {deliverOpen && deliverFor && (
        <DeliverModal
          project={deliverFor}
          onClose={() => { setDeliverOpen(false); setDeliverFor(null); }}
          onSubmit={() => { setDeliverOpen(false); setDeliverFor(null); }}
          submitting={false}
        />
      )}
    </div>
  );
}

function FreelancerCard({ p, onDetails, onChat, onDeliver, isDelivering }) {
  const isDone = (p.status ?? "").toLowerCase() === "done";
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur shadow-sm hover:shadow transition overflow-hidden" style={ringStyle}>
      <ProjectImage p={p} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-slate-800">{p.title}</div>
            <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5" />
              <span className="truncate">{p.client}</span>
              <span className="mx-1">•</span>
              <Calendar className="w-3.5 h-3.5" />
              <span>{p.due}</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={p.progress ?? 0} />
            </div>
          </div>

          <div className="shrink-0 text-right">
            <StatusBadge status={p.status} />
            <div className="mt-2 text-sm font-semibold text-slate-700">
              {typeof p.budget === "number" ? `$${p.budget.toLocaleString()}` : "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={onDetails}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm"
            style={ringStyle}
            title="Open details (read-only)"
          >
            <Eye className="w-4 h-4" />
            Details
          </button>
          <button
            onClick={onChat}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm"
            style={ringStyle}
            title="Open chat"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={onDeliver}
            disabled={isDone || isDelivering}
            className={`inline-flex items-center justify-center gap-2 h-10 rounded-xl text-white text-xs ${isDone ? "opacity-60 cursor-not-allowed" : "hover:shadow"}`}
            style={{ backgroundColor: T.primary }}
            title={isDone ? "Already delivered" : "Deliver this project"}
          >
            <SendHorizontal className="w-4 h-4" />
            {isDelivering ? "Delivering…" : isDone ? "Delivered" : "Deliver"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ===================== Deliver Modal (Freelancer) ===================== */
function DeliverModal({ project, onClose, onSubmit, submitting }) {
  const [category, setCategory] = useState(project.category || "programming");
  const [primaryLink, setPrimaryLink] = useState("");
  const [secondaryLink, setSecondaryLink] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const readOnlyCategory = !!project.category;
  const requiredOk = validateRequired(primaryLink, confirmed);

  const handleFile = (e) => setFiles(Array.from(e.target.files || []));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!requiredOk) return;
    onSubmit({
      id: project.id,
      category,
      notes,
      links: { primary: primaryLink, secondary: secondaryLink },
      checklist: { confirmed },
      files,
    });
  };

  const placeholderFor = (cat) => {
    if (cat === "programming") return "Repository / build link (GitHub, GitLab, Zip…)";
    if (cat === "content") return "Document link (Google Docs, Notion…)";
    return "Figma / Preview link";
  };

  const HeaderIcon = () => {
    if (category === "content") return <FileText className="w-5 h-5" style={{ color: T.dark }} />;
    if (category === "design") return <Palette className="w-5 h-5" style={{ color: T.dark }} />;
    return <Code className="w-5 h-5" style={{ color: T.dark }} />;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <HeaderIcon />
              <div className="font-semibold text-slate-800">
                Deliver Project — {project.title}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* body */}
          <form onSubmit={submit} className="p-5 space-y-5">
            {/* Category */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600">Category</label>
                {readOnlyCategory ? (
                  <div className="mt-1.5 px-3 py-2.5 rounded-xl bg-slate-50 text-slate-700" style={ringStyle}>
                    {capitalize(project.category)}
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none"
                    style={ringStyle}
                  >
                    <option value="programming">Programming</option>
                    <option value="content">Content Writing</option>
                    <option value="design">Design</option>
                  </select>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm text-slate-600">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything the client should know about this delivery…"
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none min-h-[44px]"
                  style={ringStyle}
                />
              </div>
            </div>

            {/* Links */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-600">
                  Primary delivery link <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1.5 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Link2 className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    required
                    value={primaryLink}
                    onChange={(e) => setPrimaryLink(e.target.value)}
                    placeholder={placeholderFor(category)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white text-sm outline-none"
                    style={ringStyle}
                  />
                </div>
              </div>

              {/* Secondary */}
              <div>
                <label className="text-sm text-slate-600">Secondary link (optional)</label>
                <div className="mt-1.5 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Link2 className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    value={secondaryLink}
                    onChange={(e) => setSecondaryLink(e.target.value)}
                    placeholder="Live URL / extra preview / backup…"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white text-sm outline-none"
                    style={ringStyle}
                  />
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="text-sm text-slate-600">Attachments (optional)</label>
              <div className="mt-1.5 flex items-center gap-3">
                <label
                  className="inline-flex items-center gap-2 h-11 px-3 rounded-xl bg-white hover:bg-slate-50 cursor-pointer text-sm"
                  style={ringStyle}
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload files
                  <input type="file" multiple className="hidden" onChange={handleFile} />
                </label>
                {files.length > 0 && (
                  <div className="text-xs text-slate-600">
                    {files.length} file{files.length > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>
            </div>

            {/* Confirm */}
            <label
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white cursor-pointer"
              style={ringStyle}
            >
              <input
                type="checkbox"
                className="accent-emerald-600"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span className="text-sm text-slate-700">
                I confirm this delivery matches the project requirements.
              </span>
            </label>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Trusted links are preferred over large uploads.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm"
                  style={ringStyle}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!requiredOk || submitting}
                  className="h-11 px-4 rounded-xl text-white text-sm inline-flex items-center gap-2"
                  style={{ backgroundColor: T.primary, opacity: !requiredOk || submitting ? 0.75 : 1 }}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Delivery
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ===================== SIMPLE VALIDATION ===================== */
function validateRequired(primaryLink, confirmed) {
  return !!(primaryLink && primaryLink.trim()) && !!confirmed;
}

/* ===================== UI Bits ===================== */
function StatusIcon({ status }) {
  if (status === "Active") return <PauseCircle className="w-4 h-4" style={{ color: T.primary }} />;
  if (status === "Planning") return <AlertCircle className="w-4 h-4 text-amber-500" />;
  if (status === "On hold") return <PauseCircle className="w-4 h-4 text-slate-500" />;
  if (status === "Done") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  return <AlertCircle className="w-4 h-4 text-slate-400" />;
}

function StatusBadge({ status }) {
  let bg = "rgba(15,23,42,.08)", color = "#0f172a";
  if (status === "Active") { bg = "rgba(2,128,144,.12)"; color = T.dark; }
  if (status === "Planning") { bg = "rgba(255,184,0,.15)"; color = "#8a5c00"; }
  if (status === "On hold") { bg = "rgba(148,163,184,.20)"; color = "#334155"; }
  if (status === "Done") { bg = "rgba(16,185,129,.15)"; color = "#065f46"; }
  return (
    <span className="inline-block text-xs px-2.5 py-1 rounded-full" style={{ background: bg, color }}>
      {status}
    </span>
  );
}

function ProgressBar({ value = 0 }) {
  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: T.primary }}
      />
    </div>
  );
}

function MiniKpi({ icon, title, value }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-3 text-center" style={ringStyle}>
      <div className="mx-auto mb-2 w-9 h-9 grid place-items-center rounded-xl text-white" style={{ background: T.primary }}>
        {icon}
      </div>
      <div className="text-slate-500 text-xs">{title}</div>
      <div className="text-base font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function Select({ label, value, onChange, options, icon }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded-xl pl-3 pr-8 py-2 bg-white text-sm outline-none"
          style={ringStyle}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {icon ? (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        ) : (
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
      </div>
    </div>
  );
}

/* ===================== Admin Mock Table  ===================== */
function AdminMockTable({ items, columns, chips }) {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("");
  const data = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((p) => {
      const okChip = !chip || (p.status ?? "") === chip;
      const okQ =
        !t ||
        (p.title ?? "").toLowerCase().includes(t) ||
        (p.client ?? "").toLowerCase().includes(t) ||
        (p.owner ?? "").toLowerCase().includes(t);
      return okChip && okQ;
    });
  }, [q, chip, items]);

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      <header className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5" style={ringStyle}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold" style={{ color: T.dark }}>
              Projects (Admin • Mock)
            </h1>
            <p className="text-slate-500 text-sm">Temporary table powered by local mock data.</p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white hover:bg-slate-50"
            style={ringStyle}
            disabled
            title="Mock mode"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Project</span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, client, or owner…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white outline-none"
              style={ringStyle}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {chips.map((c) => (
              <button
                key={c.label}
                onClick={() => setChip(c.value)}
                className={`text-sm px-3 py-1.5 rounded-xl ${chip === c.value ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
                style={chip === c.value ? undefined : ringStyle}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-3 sm:p-4" style={ringStyle}>
        <div className="hidden md:grid md:grid-cols-12 text-xs font-semibold text-slate-500 px-2 pb-2">
          <div className="col-span-3">Title</div>
          <div className="col-span-2">Client</div>
          <div className="col-span-2">Owner</div>
          <div className="col-span-2">Due</div>
          <div className="col-span-1">Budget</div>
          <div className="col-span-1">Progress</div>
          <div className="col-span-1">Status</div>
        </div>

        <div className="space-y-3">
          {data.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center rounded-xl bg-white p-3 hover:shadow transition"
              style={ringStyle}
            >
              <div className="md:col-span-4 font-medium text-slate-800">{p.title}</div>
              <div className="md:col-span-2 text-sm text-slate-600">{p.client}</div>
              <div className="md:col-span-2 text-sm text-slate-600">{p.owner}</div>
              <div className="md:col-span-2 text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {p.due}
              </div>
              <div className="md:col-span-1 text-sm font-semibold text-slate-700">
                {typeof p.budget === "number" ? `$${p.budget.toLocaleString()}` : "—"}
              </div>
              <div className="md:col-span-1">
                <ProgressBar value={p.progress ?? 0} />
              </div>
              <div className="md:col-span-1">
                <StatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
/* ===================== helpers ===================== */
function capitalize(s) { return (s || "").charAt(0).toUpperCase() + (s || "").slice(1); }
