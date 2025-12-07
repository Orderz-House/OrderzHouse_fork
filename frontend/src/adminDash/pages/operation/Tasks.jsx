import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  return (
    <PeopleTable
      title="Tasks"
      addLabel="Add Task"
      endpoint="/tasks"
      columns={[
        { label: "Title", key: "title" },
        { label: "Assignee", key: "assignee" },
        { label: "Project", key: "project" },
        { label: "Due", key: "due" },
        { label: "Status", key: "status" },
        { label: "Priority", key: "priority" },
      ]}
      formFields={[
        { key: "title", label: "Title", required: true },
        { key: "assignee", label: "Assignee" },
        { key: "project", label: "Project" },
        { key: "due", label: "Due", type: "date" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Open", "In Progress", "Blocked", "Done"],
          defaultValue: "Open",
        },
        {
          key: "priority",
          label: "Priority",
          type: "select",
          options: ["Low", "Medium", "High", "Urgent"],
          defaultValue: "Medium",
        },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
      /* ✨ إعدادات الأدمن فقط */
      desktopAsCards
      crudConfig={{ showDetails: false, showRowEdit: true, showDelete: true }}
      onCardClick={(row, h) => navigate(`${h.getId(row)}`)}
    />
  );
}

/* =========================
   Client View (Table from Tables.jsx)
========================= */
function ClientTasks() {
  // لو عندك توكن JWT في redux auth تقدر تستخدمه هنا
  const { token } = useSelector((s) => s.auth) || {};

  return (
    <div className="space-y-3">
     

      <PeopleTable
        title="My tasks"
        endpoint="/api/client/tasks"
        token={token}
        columns={[
          { label: "Title", key: "title" },
          { label: "Project", key: "project_name" },
          { label: "Assignee", key: "assignee_name" },
          {
            label: "Due date",
            key: "due_date",
            render: (row) =>
              row.due_date
                ? new Date(row.due_date).toLocaleDateString()
                : "—",
          },
          { label: "Status", key: "status" },
          { label: "Priority", key: "priority" },
        ]}
        // نخلي الجدول Read‑only للعميل (ما فيه حذف/تعديل)
        crudConfig={{
          showDetails: false,
          showRowEdit: false,
          showDelete: false,
          showExpand: false,
        }}
        // عرض كروت في الموبايل وجدول في الديسكتوب
        mobileAsCards
        desktopAsCards
      />
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
          <div className="text-center text-slate-400 text-sm py-6">
            No tasks
          </div>
        )}
        {items.map((t) => (
          <div
            key={t.id ?? t._id}
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="font-medium text-slate-800">{t.title}</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <FolderKanban className="w-3.5 h-3.5" />{" "}
                {t.project_name ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />{" "}
                {t.due_date
                  ? new Date(t.due_date).toLocaleDateString()
                  : "—"}
              </span>
              <span
                className="ml-auto rounded-full px-2 py-[2px] text-[11px] font-medium"
                style={{ background: "rgba(2,128,144,.10)", color: primary }}
              >
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

  const columns = useMemo(
    () => ({
      todo: rows.filter((t) => t.status === "todo"),
      in_progress: rows.filter((t) => t.status === "in_progress"),
      review: rows.filter((t) => t.status === "review"),
      done: rows.filter((t) => t.status === "done"),
    }),
    [rows]
  );

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
    return () => {
      ignore = true;
    };
  }, []);

  const moveTo = async (task, status) => {
    const id = task.id ?? task._id;
    setRows((arr) =>
      arr.map((t) => ((t.id ?? t._id) === id ? { ...t, status } : t))
    );
    try {
      await api.put(`/api/freelancer/tasks/${id}`, { status });
    } catch {
      setRows((arr) =>
        arr.map((t) =>
          (t.id ?? t._id) === id ? { ...t, status: task.status } : t
        )
      );
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
          <p className="text-slate-600 text-sm">
            Drag-free lightweight kanban to manage your work.
          </p>
        </div>

        <a
          href="/tasks/create"
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
          <Column
            title="To do"
            items={columns.todo}
            onMove={moveTo}
            status="todo"
          />
          <Column
            title="In progress"
            items={columns.in_progress}
            onMove={moveTo}
            status="in_progress"
          />
          <Column
            title="Review"
            items={columns.review}
            onMove={moveTo}
            status="review"
          />
          <Column
            title="Done"
            items={columns.done}
            onMove={moveTo}
            status="done"
          />
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
      <p className="text-slate-600">Please sign in to view your tasks.</p>
    </div>
  );
}
