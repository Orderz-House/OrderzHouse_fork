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
  const { token } = useSelector((s) => s.auth); // 👈 نجيب التوكن من الريدوكس

  return (
    <PeopleTable
      title="All Tasks"
      endpoint="/tasks/admin"   // 👈 هذا يستدعي GET /api/tasks/admin
      token={token}            // 👈 ضروري عشان الـ authentication
      columns={[
        { label: "ID", key: "id" },
        { label: "Title", key: "title" },
        { label: "Freelancer", key: "freelancer_name" },
        { label: "Client", key: "client_name" },
        { label: "Category", key: "category_name" },
        {
          label: "Price",
          key: "price",
          render: (row) => `${row.price} $`,
        },
        { label: "Status", key: "status" },
      ]}
      /* الأدمن يشوف فقط (بدون تعديل/حذف) */
      desktopAsCards
      crudConfig={{
        showDetails: false,
        showRowEdit: false,
        showDelete: false,
      }}
      // لو حابب تفتح صفحة تفاصيل لاحقًا، تقدر تستخدم onCardClick
      // onCardClick={(row, h) => navigate(`/admin/tasks/${h.getId(row)}`)}
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
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  // نفس البيانات لكن نعرضها ككروت من PeopleTable
  const columns = [
  { label: "Title", key: "title" },
  { label: "Category", key: "category_name" },
  {
    label: "Price",
    key: "price",
    render: (row) => `${row.price} $`, // أو العملة اللي تستخدمها
  },
  { label: "Status", key: "status" },
  {
    label: "Requests",
    key: "total_requests",
    render: (row) => row.total_requests ?? 0,
  },
];


  // شِيبس بسيطة لتصفية الستاتس من أعلى الجدول (اختياري)
  const chips = [
    { label: "All", value: "" },
    { label: "To do", value: "todo" },
    { label: "In progress", value: "in_progress" },
    { label: "Review", value: "review" },
    { label: "Done", value: "done" },
  ];

  return (
    <PeopleTable
      /* العنوان */
      title="My tasks"

      /* مصدر البيانات للفريلانسر */
      endpoint="/tasks/freelancer/my-tasks"
      token={token}

      /* أعمدة الجدول */
      columns={columns}
      formFields={[]}

      /* عرض كروت على الديسكتوب والموبايل */
      desktopAsCards
      mobileAsCards

      /* فلترة حسب الـ status عن طريق الشيبس */
      chips={chips}
      chipField="status"

      /* لا نحتاج CRUD للفريلانسر هنا */
      crudConfig={{ showDetails: false, showRowEdit: false, showDelete: false }}
      hideCrudActions

      /* النص الصغير تحت عنوان الكارد */
      renderSubtitle={(task) => (
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500">
          {task.project_name && (
            <span className="inline-flex items-center gap-1">
              <FolderKanban className="w-3.5 h-3.5" />
              {task.project_name}
            </span>
          )}
          {task.client_name && (
            <span className="inline-flex items-center gap-1">
              <User2 className="w-3.5 h-3.5" />
              {task.client_name}
            </span>
          )}
          {task.due_date && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      /* عند الضغط على الكارد يفتح صفحة تفاصيل التاسك */
      onCardClick={(row, helpers) => {
        const id = helpers.getId(row);
        if (!id) return;
        navigate(`/freelancer/tasks/${id}`);
      }}
    />
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
