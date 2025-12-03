// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
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

// 🧩 استيراد دوال الـ API الجاهزة
import {
  fetchAdminDashboard,
  fetchFreelancerDashboard,
  fetchClientDashboard,
} from "../api/dashboard";

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
          <div className="text-lg font-semibold text-slate-900">
            {value ?? "—"}
          </div>
          {trend && (
            <div
              className={`inline-flex items-center gap-1 text-[11px] ${trendColor}`}
            >
              <TrendIcon className="w-3 h-3" />
              <span>{String(trend).replace(/^[-+]/, "")}</span>
            </div>
          )}
        </div>
        {sub && (
          <div className="mt-1 text-xs text-slate-500 truncate">{sub}</div>
        )}
      </div>
    </div>
  );
}

/* تشارت بسيطة للريڤنيو – تستقبل نقاط من الـ API */
function SimpleAreaChart({ points }) {
  const safePoints = Array.isArray(points) ? points : [];
  const width = 240;
  const height = 80;

  if (!safePoints.length) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-slate-400">
        لا توجد بيانات للعرض حالياً
      </div>
    );
  }

  const max = Math.max(...safePoints) || 1;
  const stepX =
    safePoints.length > 1 ? width / (safePoints.length - 1) : width;

  let linePath = "";
  safePoints.forEach((v, i) => {
    const x = i * stepX;
    const y = height - (v / max) * (height - 10) - 5;
    linePath += `${i === 0 ? "M" : "L"} ${x},${y} `;
  });
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-32 overflow-visible"
    >
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
  const [topStats, setTopStats] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [revenuePoints, setRevenuePoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        // 👇 هنا نستخدم دالة الـ API بدل axios مباشرة
        const payload = await fetchAdminDashboard();

        setTopStats(
          Array.isArray(payload?.topStats) ? payload.topStats : []
        );
        setPendingVerifications(
          Array.isArray(payload?.pendingVerifications)
            ? payload.pendingVerifications
            : []
        );
        setRevenuePoints(
          Array.isArray(payload?.revenuePoints)
            ? payload.revenuePoints
            : []
        );
      } catch (err) {
        console.error("Failed to load admin dashboard data", err);
        setError("حدث خطأ أثناء تحميل بيانات لوحة التحكم.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6 py-6">
      {loading && (
        <div className="text-xs text-slate-500">جارِ تحميل البيانات...</div>
      )}
      {error && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {/* الكروت العلوية */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topStats.length > 0 ? (
          topStats.map((s, idx) => (
            <StatCard
              key={s.id || s.title || idx}
              {...s}
            />
          ))
        ) : (
          !loading && (
            <div className="col-span-full text-xs text-slate-400">
              لا توجد إحصائيات بعد.
            </div>
          )
        )}
      </div>

      {/* الريڤنيو + البيندينج */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 md:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Revenue (last 12 months)
              </h3>
              <p className="text-xs text-slate-500">
                يتم جلب بيانات الرسم من الخادم.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700">
              <ArrowUpRight className="w-3 h-3" />
              Overview
            </span>
          </div>
          <SimpleAreaChart points={revenuePoints} />
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
            {pendingVerifications.length > 0 ? (
              pendingVerifications.map((p, idx) => (
                <div
                  key={p.id || p.email || idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-white grid place-items-center text-xs font-semibold text-slate-600 border border-slate-200">
                      {p.initials || p.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {p.name || "بدون اسم"}
                      </div>
                      {p.role && (
                        <div className="text-[11px] text-slate-500 truncate">
                          {p.role}
                        </div>
                      )}
                      {p.email && (
                        <div className="text-[11px] text-slate-400 truncate">
                          {p.email}
                        </div>
                      )}
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
              ))
            ) : (
              <div className="text-xs text-slate-400">
                لا توجد طلبات تحقق معلّقة حالياً.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== داشبورد الفريلانسر ===================== */
function FreelancerDashboard() {
  const [balanceCards, setBalanceCards] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [latestClientProjects, setLatestClientProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const payload = await fetchFreelancerDashboard();

        setBalanceCards(
          Array.isArray(payload?.balanceCards)
            ? payload.balanceCards
            : []
        );
        setActiveProjects(
          Array.isArray(payload?.activeProjects)
            ? payload.activeProjects
            : []
        );
        setLatestClientProjects(
          Array.isArray(payload?.latestClientProjects)
            ? payload.latestClientProjects
            : []
        );
      } catch (err) {
        console.error("Failed to load freelancer dashboard data", err);
        setError("حدث خطأ أثناء تحميل بيانات لوحة التحكم.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6 py-6">
      {loading && (
        <div className="text-xs text-slate-500">جارِ تحميل البيانات...</div>
      )}
      {error && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {/* الرصيد */}
      <div className="grid gap-4 md:grid-cols-3">
        {balanceCards.length > 0 ? (
          balanceCards.map((c, idx) => (
            <StatCard
              key={c.id || c.title || idx}
              {...c}
              accent="bg-cyan-50"
            />
          ))
        ) : (
          !loading && (
            <div className="col-span-full text-xs text-slate-400">
              لا توجد بيانات رصيد حالياً.
            </div>
          )
        )}
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
            {activeProjects.length > 0 ? (
              activeProjects.map((p, idx) => (
                <div
                  key={p.id || p.title || idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-slate-900 truncate">
                      {p.title || "بدون عنوان"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {(p.client && p.budget && `${p.client} • ${p.budget}`) ||
                        p.client ||
                        p.budget ||
                        ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    {p.status && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                        <Activity className="w-3 h-3 mr-1" />
                        {p.status}
                      </span>
                    )}
                    {p.due && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {p.due}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">
                لا توجد مشاريع نشطة حالياً.
              </div>
            )}
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
              {latestClientProjects.length > 0 ? (
                latestClientProjects.map((p, idx) => (
                  <div
                    key={p.id || p.title || idx}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2"
                  >
                    <div className="text-sm font-medium text-slate-900">
                      {p.title || "بدون عنوان"}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
                      <span>{p.type}</span>
                      <span className="font-semibold text-slate-800">
                        {p.budget}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">
                  لا توجد مشاريع عملاء حديثة حالياً.
                </div>
              )}
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
  const [stats, setStats] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const payload = await fetchClientDashboard();

        setStats(Array.isArray(payload?.stats) ? payload.stats : []);
        setRecentProjects(
          Array.isArray(payload?.recentProjects)
            ? payload.recentProjects
            : []
        );
      } catch (err) {
        console.error("Failed to load client dashboard data", err);
        setError("حدث خطأ أثناء تحميل بيانات لوحة التحكم.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6 py-6">
      {loading && (
        <div className="text-xs text-slate-500">جارِ تحميل البيانات...</div>
      )}
      {error && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.length > 0 ? (
          stats.map((s, idx) => (
            <StatCard
              key={s.id || s.title || idx}
              {...s}
              accent="bg-sky-50"
            />
          ))
        ) : (
          !loading && (
            <div className="col-span-full text-xs text-slate-400">
              لا توجد إحصائيات بعد.
            </div>
          )
        )}
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
            {recentProjects.length > 0 ? (
              recentProjects.map((p, idx) => (
                <div
                  key={p.id || p.title || idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {p.title || "بدون عنوان"}
                    </div>
                    {p.status && (
                      <div className="text-xs text-slate-500">
                        {p.status}
                      </div>
                    )}
                  </div>
                  {p.budget && (
                    <div className="text-xs font-semibold text-slate-800">
                      {p.budget}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">
                لا توجد مشاريع حديثة حالياً.
              </div>
            )}
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
    (typeof storeRoleId === "number"
      ? storeRoleId
      : Number(localStorage.getItem("roled")));

  const role = mapRole(Number(rawRoleId));

  if (role === "freelancer") return <FreelancerDashboard />;
  if (role === "client") return <ClientDashboard />;
  // default admin / user
  return <AdminDashboard />;
}
