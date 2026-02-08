// src/adminDash/api/dashboard.js
import API from "./axios.js";
import { Users, Briefcase, UserCheck, Wallet, ClipboardList } from "lucide-react";

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
/* ===================== Client dashboard ===================== */
export async function fetchClientDashboard() {
  const [projectsRes, appsRes, offersRes] = await Promise.allSettled([
    API.get("/projects/myprojects"),
    API.get("/projects/applications/my-projects"),
    API.get("/offers/my-projects/offers"),
  ]);

  const projects =
    projectsRes.status === "fulfilled"
      ? pickArray(projectsRes.value?.data, ["projects", "data", "rows", null])
      : [];

  const applications =
    appsRes.status === "fulfilled"
      ? pickArray(appsRes.value?.data, ["applications", "data", "rows", null])
      : [];

  const offers =
    offersRes.status === "fulfilled"
      ? pickArray(offersRes.value?.data, ["offers", "data", "rows", null])
      : [];

  // ===== Pending decisions (Applications + Offers) =====
  const pendingApplications = applications.filter(
    (a) => String(a?.status || "").toLowerCase() === "pending_client_approval"
  );

  const pendingOffers = offers.filter(
    (o) => String(o?.offer_status || o?.status || "").toLowerCase() === "pending"
  );

  // ندمجهم في قائمة وحدة للـ Action Center (حتى لو شكل offer مختلف)
  const pendingDecisions = [
    ...pendingApplications,
    ...pendingOffers.map((o) => ({
      ...o,
      // نحاول نوحّد أسماء الحقول قدر الإمكان (عشان الكارد يعرض بشكل أحسن)
      project_title: o.project_title || o.projectTitle || o.title,
      freelancer_name:
        o.freelancer_name ||
        o.freelancerName ||
        o.freelancer_username ||
        o.username,
      applied_at: o.created_at || o.createdAt || o.offered_at || o.offeredAt,
    })),
  ];

  // ===== Pending payments =====
  const pendingPaymentProjects = projects.filter(
    (p) => String(p?.status || "").toLowerCase() === "pending_payment"
  );

  const pendingPaymentsAmount = pendingPaymentProjects.reduce(
    (sum, p) => sum + toNum(p?.amount_to_pay ?? p?.amountToPay ?? 0),
    0
  );

  // ===== Pending reviews =====
  const pendingReviews = projects.filter(
    (p) => String(p?.completion_status || "").toLowerCase() === "pending_review"
  );

  // ===== Active projects =====
  const activeProjectsCount = projects.filter((p) => {
    const s = String(p?.status || "").toLowerCase();
    return ["in_progress", "active", "running", "started"].includes(s);
  }).length;

  // ===== Stats cards =====
  const stats = [
    {
      id: "active_projects",
      title: "Active projects",
      value: activeProjectsCount,
      sub: "Currently running",
      icon: Briefcase,
      accent: "bg-sky-50",
    },
    {
      id: "pending_decisions",
      title: "Pending decisions",
      value: pendingDecisions.length,
      sub: "Offers / applications waiting for you",
      icon: UserCheck,
      accent: "bg-amber-50",
    },
    {
      id: "pending_reviews",
      title: "Pending reviews",
      value: pendingReviews.length,
      sub: "Work submitted, needs review",
      icon: ClipboardList,
      accent: "bg-indigo-50",
    },
    {
      id: "pending_payments",
      title: "Pending payments",
      value: pendingPaymentProjects.length,
      sub:
        pendingPaymentProjects.length > 0
          ? `Due: ${formatMoney(pendingPaymentsAmount)}`
          : "No payments pending",
      icon: Wallet,
      accent: "bg-rose-50",
    },
  ];

  // ===== Recent projects =====
  const recentProjects = [...projects]
    .sort((a, b) => {
      const da = new Date(a?.updated_at || a?.created_at || 0).getTime();
      const db = new Date(b?.updated_at || b?.created_at || 0).getTime();
      return db - da;
    })
    .slice(0, 6);

  return {
    stats,
    recentProjects,
    attention: {
      pendingApplications: pendingDecisions.slice(0, 4),
      pendingReviews: pendingReviews.slice(0, 4),
      pendingPayments: pendingPaymentProjects.slice(0, 4),
    },
  };
}

/* ===================== Admin dashboard ===================== */
export async function fetchAdminDashboard() {
  const [projectsRes, freelancersRes, deactivatedRes, paymentsRes, tasksRes] =
    await Promise.allSettled([
      API.get("/projects/admin/projects"),
      API.get("/projects/admin/freelancers"),
      API.get("/users/deactivated-users"),
      API.get("/payments/admin/all"),
      API.get("/tasks/admin"),
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
  const [projectsRes, assignedTasksRes, openRes] = await Promise.allSettled([
    API.get("/projects/myprojects"),
    API.get("/tasks/freelancer/assigned"),
    API.get("/offers/projects/open"),
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
