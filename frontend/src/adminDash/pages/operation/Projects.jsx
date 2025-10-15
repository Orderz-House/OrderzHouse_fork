import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
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
} from "lucide-react";

/* Theme tokens (soft) */
const T = {
  primary: "#028090",
  dark: "#05668D",
  light: "#02C39A",
  ring: "rgba(15,23,42,.10)",
};
const ringStyle = { border: `1px solid ${T.ring}` };

function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  return "user";
}

/* axios instance */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

export default function Projects() {
  const { userData } = useSelector((s) => s.auth);
  const role = mapRole(userData?.role_id);

  if (role === "admin") return <AdminProjects />;
  if (role === "freelancer") return <FreelancerProjects />;
  // default → client
  return <ClientProjects />;
}

/* ===================== Admin (PeopleTable  API) ===================== */
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

  // PeopleTable
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

/* ===================== Client (Kanban-style) ===================== */
function ClientProjects() {
  const { token } = useSelector((s) => s.auth);
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const statuses = ["Planning", "Active", "On hold", "Done"];

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
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

  const data = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((p) => {
      if (!t) return true;
      return (
        (p.title ?? "").toLowerCase().includes(t) ||
        (p.client ?? "").toLowerCase().includes(t) ||
        (p.owner ?? "").toLowerCase().includes(t)
      );
    });
  }, [q, items]);

  const groups = useMemo(() => {
    const map = Object.fromEntries(statuses.map((s) => [s, []]));
    data.forEach((p) => map[p.status]?.push(p));
    return map;
  }, [data]);

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
              My Projects
            </h1>
            <p className="text-slate-500 text-sm">
              Organize requests and milestones at a glance
            </p>
          </div>

          <Link
            to="/create-project"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white hover:bg-slate-50"
            style={ringStyle}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Project</span>
          </Link>
        </div>

        {/* search */}
        <div className="mt-3 sm:mt-4 max-w-lg">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search project, client, or freelancer…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white outline-none"
              style={ringStyle}
            />
          </div>
        </div>
      </header>

      {/* Loading / Empty */}
      {loading ? (
        <div className="rounded-2xl bg-white/80 backdrop-blur p-5 text-slate-500 text-center" style={ringStyle}>
          Loading…
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statuses.map((s) => {
            const list = groups[s] || [];
            return (
              <div key={s} className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-3 sm:p-4 min-h-[220px]" style={ringStyle}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={s} />
                    <div className="font-semibold text-slate-800">{s}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    {list.length}
                  </div>
                </div>

                <div className="space-y-3">
                  {list.length === 0 && (
                    <div className="text-slate-400 text-sm">No items.</div>
                  )}
                  {list.map((p) => (
                    <ClientCard key={p.id ?? p._id} p={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

function ClientCard({ p }) {
  return (
    <div className="rounded-xl bg-white shadow-sm p-3 hover:shadow transition" style={ringStyle}>
      <div className="font-medium text-slate-800">{p.title}</div>
      <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
        <Briefcase className="w-3.5 h-3.5" />
        <span className="truncate">{p.client}</span>
        {p.owner && (
          <>
            <span className="mx-1">•</span>
            <UserIcon className="w-3.5 h-3.5" />
            <span className="truncate">{p.owner}</span>
          </>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-slate-500 inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {p.due}
        </div>
        <div className="text-xs font-semibold text-slate-700">
          {typeof p.budget === "number" ? `$${p.budget.toLocaleString()}` : "—"}
        </div>
      </div>
      <div className="mt-2">
        <ProgressBar value={p.progress ?? 0} />
      </div>
    </div>
  );
}

/* ===================== Freelancer (Focused list) ===================== */
function FreelancerProjects() {
  const { token } = useSelector((s) => s.auth);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("due_asc");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
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
              Projects
            </h1>
            <p className="text-slate-500 text-sm">
              Focus on deadlines and progress
            </p>
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
          <MiniKpi icon={<Timer />} title="Due in 7d" value={kpis.dueSoon} />
          <MiniKpi icon={<PauseCircle />} title="Active" value={kpis.active} />
          <MiniKpi icon={<CheckCircle2 />} title="Done" value={kpis.done} />
        </div>
      </header>

      {/* List */}
      {loading ? (
        <div className="rounded-2xl bg-white/80 backdrop-blur p-5 text-slate-500 text-center" style={ringStyle}>
          Loading…
        </div>
      ) : (
        <section className="grid gap-3 sm:gap-4">
          {filtered.length === 0 ? (
            <div
              className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-5 text-center text-slate-500"
              style={ringStyle}
            >
              No projects found.
            </div>
          ) : (
            filtered.map((p) => <FreelancerRow key={p.id ?? p._id} p={p} />)
          )}
        </section>
      )}
    </div>
  );
}

function FreelancerRow({ p }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 hover:shadow transition" style={ringStyle}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-slate-800">{p.title}</div>
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
    </div>
  );
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
      <div
        className="mx-auto mb-2 w-9 h-9 grid place-items-center rounded-xl text-white"
        style={{ background: T.primary }}
      >
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
