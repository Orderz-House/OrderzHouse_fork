import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ListChecks,
  TimerReset,
  CheckCircle2,
  Loader2,
  ClipboardList,
  ChevronDown,
  Plus,
  CalendarDays,
  User2,
  FolderKanban,
  ArrowRightLeft,
} from "lucide-react";

import PeopleTable from "../Tables"; 

/* =========================
   Helpers / Theme
========================= */
const primary = "#028090";
const themeDark = "#05668D";
const themeLight = "#02C39A";

function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  return "user";
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

/* =========================
   Admin View
========================= */
function AdminTasks() {
  const columns = [
    { label: "Task", key: "title" },
    { label: "Assignee", key: "assignee_name" },
    { label: "Project", key: "project_name" },
    { label: "Priority", key: "priority" },
    { label: "Status", key: "status" },
    { label: "Due", key: "due_date" },
    { label: "Created", key: "created_at" },
  ];

  const formFields = [
    { label: "Title", key: "title", required: true },
    { label: "Project", key: "project_id", type: "text", placeholder: "Project ID" },
    {
      label: "Assignee (user id)", key: "assignee_id", type: "text", placeholder: "User ID",
    },
    {
      label: "Priority",
      key: "priority",
      type: "select",
      options: ["Low", "Medium", "High", "Urgent"],
      placeholder: "Choose…",
      required: true,
    },
    {
      label: "Status",
      key: "status",
      type: "select",
      options: ["todo", "in_progress", "review", "done"],
      placeholder: "Choose…",
      required: true,
    },
    { label: "Due date", key: "due_date", type: "date" },
    { label: "Notes", key: "notes", type: "textarea", placeholder: "Extra details…" },
  ];

  const filters = [
    { key: "status", label: "Status", options: ["todo", "in_progress", "review", "done"] },
    { key: "priority", label: "Priority", options: ["Low", "Medium", "High", "Urgent"] },
  ];

  return (
    <div className="space-y-4">
      <PeopleTable
        title="Tasks"
        addLabel="Add task"
        endpoint="/api/admin/tasks"
        columns={columns}
        formFields={formFields}
        filters={filters}
      />
    </div>
  );
}

/* =========================
   Client View (Clean list)
========================= */
function ClientTasks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [proj, setProj] = useState("");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const [{ data: list }, { data: projs }] = await Promise.all([
          api.get("/api/client/tasks", {
            params: { q, status, project: proj },
          }),
          api.get("/api/client/projects", { params: { slim: true } }).catch(() => ({ data: [] })),
        ]);
        if (!ignore) {
          setRows(Array.isArray(list) ? list : list?.items ?? []);
          setProjects(Array.isArray(projs) ? projs : projs?.items ?? []);
        }
      } catch (e) {
        if (!ignore) setRows([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [q, status, proj]);

  const filtered = rows;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: themeDark }}>
            My tasks
          </h1>
          <p className="text-slate-600 text-sm">Track milestones and deadlines for your projects.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search task or project…"
          className="w-full md:max-w-sm rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none text-slate-700 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Status</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>

          <select
            value={proj}
            onChange={(e) => setProj(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none text-slate-700 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Project</option>
            {projects.map((p) => (
              <option key={p.id ?? p._id} value={p.id ?? p._id}>
                {p.name ?? p.title ?? `#${p.id ?? p._id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-slate-50/70 text-slate-500 text-xs font-medium">
          Tasks
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <Loader2 className="inline-block animate-spin mr-2" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No tasks yet.</div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {filtered.map((t) => (
              <li key={t.id ?? t._id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-slate-800 font-medium truncate">
                      <ClipboardList className="w-4 h-4 text-[color:var(--t)]" style={{ ["--t"]: primary }} />
                      <span className="truncate">{t.title}</span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <FolderKanban className="w-3.5 h-3.5" /> {t.project_name ?? "—"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <User2 className="w-3.5 h-3.5" /> {t.assignee_name ?? "—"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" /> {t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                        <span className="capitalize">{t.status}</span>
                      </span>
                    </div>
                  </div>

                  <span
                    className="ml-auto rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      background: "rgba(2,128,144,.10)",
                      color: primary,
                    }}
                  >
                    {t.priority ?? "—"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* =========================
   Freelancer View
========================= */
function Column({ title, items, onMove, status }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-2 bg-slate-50/70 text-slate-600 text-sm font-semibold flex items-center gap-2">
        <ListChecks className="w-4 h-4" />
        {title}
        <span className="ml-auto text-xs text-slate-500">{items.length}</span>
      </div>
      <div className="p-3 space-y-3 min-h-[220px]">
        {items.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-6">No tasks</div>
        )}
        {items.map((t) => (
          <div
            key={t.id ?? t._id}
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="font-medium text-slate-800">{t.title}</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <FolderKanban className="w-3.5 h-3.5" /> {t.project_name ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" /> {t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}
              </span>
              <span className="ml-auto rounded-full px-2 py-[2px] text-[11px] font-medium"
                style={{ background: "rgba(2,128,144,.10)", color: primary }}>
                {t.priority ?? "—"}
              </span>
            </div>

            {/* Move actions */}
            <div className="mt-3 flex items-center gap-2">
              {status !== "todo" && (
                <button
                  onClick={() => onMove(t, "todo")}
                  className="rounded-lg border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
                  title="Move to: To do"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> To do
                </button>
              )}
              {status !== "in_progress" && (
                <button
                  onClick={() => onMove(t, "in_progress")}
                  className="rounded-lg border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
                  title="Move to: In progress"
                >
                  <Loader2 className="w-3.5 h-3.5" /> In progress
                </button>
              )}
              {status !== "review" && (
                <button
                  onClick={() => onMove(t, "review")}
                  className="rounded-lg border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
                  title="Move to: Review"
                >
                  <TimerReset className="w-3.5 h-3.5" /> Review
                </button>
              )}
              {status !== "done" && (
                <button
                  onClick={() => onMove(t, "done")}
                  className="rounded-lg border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
                  title="Move to: Done"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FreelancerTasks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = useMemo(() => ({
    todo: rows.filter((t) => t.status === "todo"),
    in_progress: rows.filter((t) => t.status === "in_progress"),
    review: rows.filter((t) => t.status === "review"),
    done: rows.filter((t) => t.status === "done"),
  }), [rows]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/freelancer/tasks");
        if (!ignore) setRows(Array.isArray(data) ? data : data?.items ?? []);
      } catch {
        if (!ignore) setRows([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const moveTo = async (task, status) => {
    const id = task.id ?? task._id;
    setRows((arr) => arr.map((t) => ( (t.id ?? t._id) === id ? { ...t, status } : t )));
    try {
      await api.put(`/api/freelancer/tasks/${id}`, { status });
    } catch {
      setRows((arr) => arr.map((t) => ( (t.id ?? t._id) === id ? { ...t, status: task.status } : t )));
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: themeDark }}>
            My tasks
          </h1>
          <p className="text-slate-600 text-sm">Drag-free lightweight kanban to manage your work.</p>
        </div>

        <a
          href="/freelancer/tasks/new"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow-sm"
          style={{ backgroundColor: primary }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add task</span>
        </a>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">
          <Loader2 className="inline-block animate-spin mr-2" /> Loading…
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Column title="To do" items={columns.todo} onMove={moveTo} status="todo" />
          <Column title="In progress" items={columns.in_progress} onMove={moveTo} status="in_progress" />
          <Column title="Review" items={columns.review} onMove={moveTo} status="review" />
          <Column title="Done" items={columns.done} onMove={moveTo} status="done" />
        </div>
      )}
    </div>
  );
}

/* =========================
   Entry: Role-based switch
========================= */
export default function Tasks() {
  const { userData } = useSelector((s) => s.auth);
  const role = mapRole(userData?.role_id);

  if (role === "admin") return <AdminTasks />;
  if (role === "freelancer") return <FreelancerTasks />;
  if (role === "client") return <ClientTasks />;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <h1 className="text-xl font-semibold mb-2" style={{ color: themeDark }}>
        Tasks
      </h1>
      <p className="text-slate-600">
        Please sign in to view your tasks.
      </p>
    </div>
  );
}
