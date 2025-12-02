// src/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  Briefcase,
  Wallet,
  CreditCard,
  Activity,
  Clock,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  FolderPlus,
} from "lucide-react";

const PRIMARY = "#028090";

/* نفس mapRole المستخدم في AdminLayout تقريباً */
function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  return "user";
}

/* كرت إحصائيات عام */
function StatCard({ title, value, sub, icon: Icon, trend, accent }) {
  const trendIsNegative = trend && String(trend).trim().startsWith("-");
  const TrendIcon = trendIsNegative ? ArrowDownRight : ArrowUpRight;
  const trendColor = trendIsNegative ? "text-rose-500" : "text-emerald-600";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex items-center gap-4">
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          accent || "bg-teal-50"
        }`}
      >
        {Icon && <Icon className="w-5 h-5" style={{ color: PRIMARY }} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          {title}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-lg font-semibold text-slate-900">{value}</div>
          {trend && (
            <div className={`inline-flex items-center gap-1 text-[11px] ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              <span>{String(trend).replace(/^[-+]/, "")}</span>
            </div>
          )}
        </div>
        {sub && <div className="mt-1 text-xs text-slate-500 truncate">{sub}</div>}
      </div>
    </div>
  );
}

/* تشارت بسيطة للريڤنيو */
function SimpleAreaChart() {
  const points = [40, 60, 55, 70, 90, 80, 95, 110, 120, 140, 130, 160];
  const width = 240;
  const height = 80;
  const max = Math.max(...points) || 1;
  const stepX = points.length > 1 ? width / (points.length - 1) : width;

  let linePath = "";
  points.forEach((v, i) => {
    const x = i * stepX;
    const y = height - (v / max) * (height - 10) - 5;
    linePath += `${i === 0 ? "M" : "L"} ${x},${y} `;
  });
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
      <defs>
        <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PRIMARY} stopOpacity="0.3" />
          <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#dash-area)" stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={PRIMARY}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ===================== داشبورد الادمن ===================== */
function AdminDashboard() {
  const topStats = [
    {
      title: "Clients",
      value: "3,120",
      sub: "Active on the platform",
      icon: Users,
      trend: "+4.2%",
    },
    {
      title: "Freelancers",
      value: "1,850",
      sub: "Available to hire",
      icon: Briefcase,
      trend: "+3.1%",
    },
    {
      title: "Projects",
      value: "96",
      sub: "Open / in progress",
      icon: ClipboardList,
      trend: "+1.4%",
    },
    {
      title: "Revenue",
      value: "$53,210",
      sub: "Last 30 days",
      icon: CreditCard,
      trend: "+7.8%",
    },
  ];

  const pendingVerifications = [
    {
      name: "Khaled F.",
      role: "Freelancer • Design",
      email: "khaled@example.com",
    },
    {
      name: "Maha S.",
      role: "Client • —",
      email: "maha@example.com",
    },
  ];

  return (
    <div className="space-y-6 py-6">

      {/* الكروت العلوية */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topStats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* الريڤنيو + البيندينج */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 md:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Revenue (last 12 months)
              </h3>
              <p className="text-xs text-slate-500">Sum — $83,200 (demo)</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700">
              <ArrowUpRight className="w-3 h-3" />
              Trending up
            </span>
          </div>
          <SimpleAreaChart />
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span>Avg monthly: $6,930</span>
            <span className="inline-block w-px h-3 bg-slate-200" />
            <span>Best month: August</span>
            <span className="inline-block w-px h-3 bg-slate-200" />
            <span>Worst month: February</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Pending verifications
            </h3>
            <span className="text-[11px] text-slate-400">
              {pendingVerifications.length} waiting
            </span>
          </div>

          <div className="space-y-3">
            {pendingVerifications.map((p) => (
              <div
                key={p.email}
                className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-white grid place-items-center text-xs font-semibold text-slate-600 border border-slate-200">
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {p.role}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {p.email}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button className="h-8 px-3 rounded-full text-xs border border-emerald-500 text-emerald-700 hover:bg-emerald-50">
                    Approve
                  </button>
                  <button className="h-8 px-3 rounded-full text-xs border border-slate-200 text-slate-500 hover:bg-slate-50">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full h-9 rounded-xl text-xs border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50">
            View all requests
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== داشبورد الفريلانسر ===================== */
function FreelancerDashboard() {
  const balanceCards = [
    {
      title: "Total balance",
      value: "$2,430",
      sub: "All earnings including pending",
      icon: Wallet,
      trend: "+12%",
    },
    {
      title: "Available to withdraw",
      value: "$1,120",
      sub: "Ready to cash out",
      icon: CreditCard,
      trend: "+7%",
    },
    {
      title: "In review",
      value: "$890",
      sub: "Waiting for client approval",
      icon: Clock,
      trend: "+3%",
    },
  ];

  const activeProjects = [
    {
      title: "Landing page redesign",
      client: "Acme Inc.",
      status: "In progress",
      due: "3 days left",
      budget: "$800",
    },
    {
      title: "Mobile app UI kit",
      client: "Startup XYZ",
      status: "Feedback required",
      due: "Today",
      budget: "$1,200",
    },
    {
      title: "Branding package",
      client: "Coffee House",
      status: "In progress",
      due: "1 week left",
      budget: "$650",
    },
  ];

  const latestClientProjects = [
    {
      title: "Full-stack dashboard",
      budget: "$2,000",
      type: "Fixed • Remote",
    },
    {
      title: "Social media designs",
      budget: "$500",
      type: "Monthly • Part time",
    },
    {
      title: "React developer (long term)",
      budget: "$30/h",
      type: "Hourly • Remote",
    },
  ];

  return (
    <div className="space-y-6 py-6">

      {/* الرصيد */}
      <div className="grid gap-4 md:grid-cols-3">
        {balanceCards.map((c) => (
          <StatCard key={c.title} {...c} accent="bg-cyan-50" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* المشاريع النشطة */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Active projects
              </h3>
              <p className="text-xs text-slate-500">
                Projects you&apos;re currently working on.
              </p>
            </div>
            <button className="inline-flex items-center gap-1 h-9 px-3 rounded-xl text-xs border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ClipboardList className="w-3 h-3" />
              View all
            </button>
          </div>

          <div className="space-y-3">
            {activeProjects.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm text-slate-900 truncate">
                    {p.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.client} • {p.budget}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                    <Activity className="w-3 h-3 mr-1" />
                    {p.status}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                    <Clock className="w-3 h-3 mr-1" />
                    {p.due}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* آخر البروجكتس + شورت كاتس */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Latest client projects
              </h3>
              <button className="inline-flex items-center gap-1 h-8 px-3 rounded-full text-[11px] border border-slate-200 text-slate-600 hover:bg-slate-50">
                <FolderPlus className="w-3 h-3" />
                Browse all
              </button>
            </div>

            <div className="space-y-3">
              {latestClientProjects.map((p) => (
                <div
                  key={p.title}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2"
                >
                  <div className="text-sm font-medium text-slate-900">
                    {p.title}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
                    <span>{p.type}</span>
                    <span className="font-semibold text-slate-800">
                      {p.budget}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 md:p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Quick actions
            </h3>
            <div className="grid gap-2">
              <button className="h-9 rounded-xl text-xs border border-slate-200 hover:bg-slate-50 flex items-center justify-between px-3">
                <span>Find new projects</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
              <button className="h-9 rounded-xl text-xs border border-slate-200 hover:bg-slate-50 flex items-center justify-between px-3">
                <span>View my proposals</span>
                <MessageSquare className="w-3 h-3" />
              </button>
              <button className="h-9 rounded-xl text-xs border border-slate-200 hover:bg-slate-50 flex items-center justify-between px-3">
                <span>Go to payouts</span>
                <CreditCard className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== داشبورد الكلينت ===================== */
function ClientDashboard() {
  const stats = [
    {
      title: "Active projects",
      value: "4",
      sub: "Running with freelancers",
      icon: ClipboardList,
      trend: "+1",
    },
    {
      title: "Open jobs",
      value: "2",
      sub: "Awaiting proposals",
      icon: Briefcase,
      trend: "+2",
    },
    {
      title: "Total spent",
      value: "$9,540",
      sub: "Across all projects",
      icon: CreditCard,
      trend: "+18%",
    },
    {
      title: "Hired freelancers",
      value: "7",
      sub: "All-time",
      icon: Users,
      trend: "+1",
    },
  ];

  const recentProjects = [
    {
      title: "Multi‑step checkout flow",
      status: "In progress",
      budget: "$1,400",
    },
    { title: "Logo & brand refresh", status: "Reviewing", budget: "$600" },
    { title: "Marketing landing page", status: "Completed", budget: "$900" },
  ];

  return (
    <div className="space-y-6 py-6">
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} accent="bg-sky-50" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Recent projects
              </h3>
              <p className="text-xs text-slate-500">
                A quick look at your latest activity.
              </p>
            </div>
            <button className="inline-flex items-center gap-1 h-9 px-3 rounded-xl text-xs border border-slate-200 text-slate-600 hover:bg-slate-50">
              <FolderPlus className="w-3 h-3" />
              Post a project
            </button>
          </div>

          <div className="space-y-3">
            {recentProjects.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {p.title}
                  </div>
                  <div className="text-xs text-slate-500">{p.status}</div>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {p.budget}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 md:p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Tips to get better results
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
            <li>Write clear, detailed project descriptions.</li>
            <li>Share examples or references of what you like.</li>
            <li>Invite freelancers with relevant skills directly.</li>
            <li>Break big projects into smaller milestones.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ===================== الكومبوننت الرئيسي ===================== */
export default function Dashboard() {
  const { userData, roleId: storeRoleId } = useSelector((s) => s.auth || {});
  const outletCtx = useOutletContext() || {};
  const { clearTopBarRight } = outletCtx;

  // تنظيف محتوى التوب بار (مثلاً لو صفحة سابقة كانت حاطة حقل بحث)
  useEffect(() => {
    clearTopBarRight?.();
  }, [clearTopBarRight]);

  const rawRoleId =
    userData?.role_id ??
    (typeof storeRoleId === "number" ? storeRoleId : Number(localStorage.getItem("roled")));

  const role = mapRole(Number(rawRoleId));

  if (role === "freelancer") return <FreelancerDashboard />;
  if (role === "client") return <ClientDashboard />;
  // default admin / user
  return <AdminDashboard />;
}
