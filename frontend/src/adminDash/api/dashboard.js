// src/adminDash/api/dashboard.js
import axios from "axios";
import { Users, Briefcase, UserCheck, Wallet, ClipboardList } from "lucide-react";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  // lowercase لأن أغلب middleware تقرأ req.headers.authorization
  return token ? { authorization: `Bearer ${token}` } : {};
}

function pickArray(data, keys = []) {
  for (const k of keys) {
    const v = k ? data?.[k] : data;
    if (Array.isArray(v)) return v;
  }
  return [];
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/* ===================== Client dashboard (عندك موجود) ===================== */
// export async function fetchClientDashboard() { ... }

/* ===================== Admin dashboard ===================== */
export async function fetchAdminDashboard() {
  const api = axios.create({
    baseURL: API_BASE,
    headers: { ...getAuthHeaders() },
  });

  const [projectsRes, freelancersRes, deactivatedRes, paymentsRes, tasksRes] =
    await Promise.allSettled([
      api.get("/projects/admin/projects"),
      api.get("/projects/admin/freelancers"),
      api.get("/users/deactivated-users"),
      api.get("/payments/admin/all"),
      api.get("/tasks/admin"),
    ]);

  const projects =
    projectsRes.status === "fulfilled"
      ? pickArray(projectsRes.value?.data, ["projects", "data", "rows", null])
      : [];

  const freelancers =
    freelancersRes.status === "fulfilled"
      ? pickArray(freelancersRes.value?.data, ["freelancers", "users", "data", "rows", null])
      : [];

  const deactivatedUsers =
    deactivatedRes.status === "fulfilled"
      ? pickArray(deactivatedRes.value?.data, ["users", "deactivatedUsers", "data", "rows", null])
      : [];

  const payments =
    paymentsRes.status === "fulfilled"
      ? pickArray(paymentsRes.value?.data, ["payments", "data", "rows", null])
      : [];

  const tasks =
    tasksRes.status === "fulfilled"
      ? pickArray(tasksRes.value?.data, ["tasks", "data", "rows", null])
      : [];

  const totalRevenue = payments.reduce((sum, p) => {
    const amount =
      p?.amount ??
      p?.amount_paid ??
      p?.amountToPay ??
      p?.amount_to_pay ??
      p?.total ??
      p?.total_amount ??
      0;
    return sum + toNum(amount);
  }, 0);

  const topStats = [
    {
      id: "projects",
      title: "Projects",
      value: projects.length,
      sub: "All projects in the system",
      icon: Briefcase,
      accent: "bg-teal-50",
    },
    {
      id: "freelancers",
      title: "Freelancers",
      value: freelancers.length,
      sub: "Registered freelancers",
      icon: Users,
      accent: "bg-sky-50",
    },
    {
      id: "tasks",
      title: "Tasks",
      value: tasks.length,
      sub: "Tasks in the platform",
      icon: ClipboardList,
      accent: "bg-indigo-50",
    },
    {
      id: "revenue",
      title: "Total revenue",
      value: totalRevenue ? formatMoney(totalRevenue) : "—",
      sub: payments.length ? "From payments" : "No payments data",
      icon: Wallet,
      accent: "bg-emerald-50",
    },
  ];

  const pendingVerifications = deactivatedUsers.slice(0, 6).map((u) => {
    const name =
      u?.name ||
      u?.full_name ||
      u?.fullName ||
      [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
      "Unknown";
    const initials = name?.trim()?.charAt(0)?.toUpperCase() || "?";

    return {
      id: u?.id,
      name,
      email: u?.email,
      role: u?.role || u?.role_name || u?.roleName,
      initials,
    };
  });

  const revenuePoints = buildMonthlySeries(payments, 12);

  return { topStats, pendingVerifications, revenuePoints };
}

/* ===================== Freelancer dashboard ===================== */
export async function fetchFreelancerDashboard() {
  const api = axios.create({
    baseURL: API_BASE,
    headers: { ...getAuthHeaders() },
  });

  const [projectsRes, assignedTasksRes, openRes] = await Promise.allSettled([
    api.get("/projects/myprojects"),
    api.get("/tasks/freelancer/assigned"),
    api.get("/offers/projects/open"),
  ]);

  const projects =
    projectsRes.status === "fulfilled"
      ? pickArray(projectsRes.value?.data, ["projects", "data", "rows", null])
      : [];

  const assignedTasks =
    assignedTasksRes.status === "fulfilled"
      ? pickArray(assignedTasksRes.value?.data, ["tasks", "data", "rows", null])
      : [];

  // /offers/projects/open ممكن يفشل بسبب subscription/verification -> fallback
  let openProjects =
    openRes.status === "fulfilled"
      ? pickArray(openRes.value?.data, ["projects", "data", "rows", null])
      : [];

  if (!openProjects.length) {
    try {
      const poolRes = await axios.get(`${API_BASE}/tasks/pool`);
      openProjects = pickArray(poolRes?.data, ["tasks", "data", "rows", null]);
    } catch {
      // ignore
    }
  }

  const activeProjects = projects
    .filter((p) => {
      const s = String(p?.status || "").toLowerCase();
      return ["in_progress", "active", "running", "started"].includes(s);
    })
    .slice(0, 6)
    .map((p) => {
      const budgetRaw = p?.budget ?? p?.amount_to_pay ?? p?.amountToPay;
      const dueRaw = p?.due ?? p?.deadline ?? p?.end_date ?? p?.updated_at;

      return {
        id: p?.id,
        title: p?.title,
        client:
          p?.client_name ||
          p?.clientName ||
          p?.client ||
          p?.user_name ||
          p?.owner_name,
        budget: budgetRaw != null ? String(budgetRaw) : "",
        status: p?.status,
        due: dueRaw ? safeDate(dueRaw) : "",
      };
    });

  const latestClientProjects = openProjects
    .slice(0, 6)
    .map((p) => {
      const budgetRaw = p?.budget ?? p?.budget_max ?? p?.price ?? p?.amount_to_pay;
      return {
        id: p?.id,
        title: p?.title,
        type: p?.project_type || p?.type || p?.category || "—",
        budget: budgetRaw != null ? String(budgetRaw) : "—",
      };
    });

  const balanceCards = [
    {
      id: "active_projects",
      title: "Active projects",
      value: activeProjects.length,
      sub: "Currently running",
      icon: Briefcase,
      accent: "bg-cyan-50",
    },
    {
      id: "assigned_tasks",
      title: "Assigned tasks",
      value: assignedTasks.length,
      sub: "Tasks assigned to you",
      icon: ClipboardList,
      accent: "bg-indigo-50",
    },
    {
      id: "open_opportunities",
      title: "Open opportunities",
      value: openProjects.length,
      sub: "Projects you can bid on",
      icon: UserCheck,
      accent: "bg-amber-50",
    },
  ];

  return { balanceCards, activeProjects, latestClientProjects };
}

/* ===================== Helpers ===================== */
function safeDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "";
  }
}

function buildMonthlySeries(items, months = 12) {
  const now = new Date();
  const keys = [];
  for (let i = months - 1; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`);
  }

  const sums = new Map(keys.map((k) => [k, 0]));

  const getDate = (x) =>
    x?.created_at || x?.createdAt || x?.paid_at || x?.paidAt || x?.updated_at || x?.updatedAt;

  const getAmount = (x) =>
    x?.amount ??
    x?.amount_paid ??
    x?.amountToPay ??
    x?.amount_to_pay ??
    x?.total ??
    x?.total_amount ??
    x?.price ??
    0;

  for (const item of Array.isArray(items) ? items : []) {
    const d = getDate(item);
    if (!d) continue;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) continue;

    const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    if (!sums.has(k)) continue;

    sums.set(k, (sums.get(k) || 0) + toNum(getAmount(item)));
  }

  return keys.map((k) => Math.round(sums.get(k) || 0));
}
