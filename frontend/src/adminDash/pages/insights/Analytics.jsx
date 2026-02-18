import React, { useEffect, useState, useCallback } from "react";
import API from "../../api/axios.js";
import { useSelector } from "react-redux";
import {
  BarChart3,
  TrendingUp,
  FolderKanban,
  Users,
  User,
  MapPin,
  Award,
  PieChart,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PRIMARY = "#F97316";
const PRIMARY_LIGHT = "#FED7AA";
const CARD_CLASS =
  "bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-100 ${className}`}
      style={{ minHeight: "80px" }}
    />
  );
}

function Panel({ title, icon: Icon, children, className = "", actionLabel }) {
  return (
    <div className={`${CARD_CLASS} flex flex-col ${className}`}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div
              className="w-9 h-9 rounded-xl grid place-items-center text-white"
              style={{ backgroundColor: PRIMARY }}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
        </div>
        {actionLabel && (
          <a
            href="#"
            className="text-xs font-semibold hover:opacity-80"
            style={{ color: PRIMARY }}
          >
            {actionLabel}
          </a>
        )}
      </div>
      <div className="p-5 flex-1 min-h-0">{children}</div>
    </div>
  );
}

export default function Analytics() {
  const { userData, token } = useSelector((s) => s.auth);
  const isAdmin = Number(userData?.role_id) === 1;

  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const [kpisData, setKpisData] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!token) {
      setLoading(false);
      setError("Please log in to view analytics.");
      return;
    }
    try {
      const { data: res } = await API.get("/analytics/admin", {
        params: { range },
      });
      setData(res);
    } catch (err) {
      console.error("Analytics fetch:", err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? "Access denied. Admin only."
          : err.response?.status === 404
            ? "Analytics API not found (404). Ensure the backend is running and includes the /analytics routes."
            : "Failed to load analytics.");
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [token, range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const fetchKpis = useCallback(() => {
    if (!token) {
      setKpisLoading(false);
      return;
    }
    setKpisLoading(true);
    setKpisError(null);
    API.get("/analytics/kpis")
      .then(({ data: res }) => {
        setKpisData(res);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          (err.response?.status === 403
            ? "Access denied. Admin only."
            : err.response?.status === 401
              ? "Please log in again."
              : err.response?.status === 404
                ? "Analytics API not found (404). Ensure the backend is running and includes the /analytics routes."
                : err.message || "Failed to load KPIs");
        setKpisError(msg);
        setKpisData(null);
      })
      .finally(() => {
        setKpisLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  if (!isAdmin) {
    return (
      <div className={`${CARD_CLASS} p-6`}>
        <p className="text-slate-600">Only administrators can access Analytics.</p>
      </div>
    );
  }

  const rangeOptions = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
  ];

  const kpis = data?.kpis;
  const timeseries = data?.timeseries;
  const byStatus = data?.byStatus || [];
  const byType = data?.byType || [];
  const byCountry = data?.byCountry || [];
  const topProjects = data?.topProjects || [];
  const topCategories = data?.topCategories || [];

  const projectsByDay = timeseries?.projectsByDay || [];
  const paymentsByDay = timeseries?.paymentsByDay || [];
  const combinedSeries = React.useMemo(() => {
    const byDate = {};
    projectsByDay.forEach(({ date, count }) => {
      byDate[date] = { ...(byDate[date] || {}), date, projects: count };
    });
    paymentsByDay.forEach(({ date, total }) => {
      byDate[date] = { ...(byDate[date] || {}), date, payments: Math.round(total) };
    });
    return Object.values(byDate).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [projectsByDay, paymentsByDay]);

  const completionRate =
    kpis?.projectsTotal > 0 && data?.byStatus?.length
      ? Math.round(
          (byStatus.find((s) => String(s.status).toLowerCase() === "completed")
            ?.count || 0) / kpis.projectsTotal * 100
        )
      : 0;

  const CHART_COLORS = [PRIMARY, "#ea580c", "#c2410c", "#9a3412", "#7c2d12"];

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header + Range */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
          <div className="flex gap-2">
            {rangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                  range === opt.value
                    ? "text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50 ring-1 ring-black/5"
                }`}
                style={
                  range === opt.value ? { backgroundColor: PRIMARY } : {}
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards — Freelancers, Clients, Projects, Total Paid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpisLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-4"
              >
                <Skeleton className="h-16" />
              </div>
            ))
          ) : kpisError ? (
            <div className="md:col-span-2 xl:col-span-4 rounded-2xl bg-slate-50 ring-1 ring-black/5 shadow-sm p-4 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-slate-600 text-sm">{kpisError}</p>
              <button
                type="button"
                onClick={() => fetchKpis()}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
                style={{ backgroundColor: PRIMARY }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl grid place-items-center text-white shrink-0"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">Freelancers</p>
                  <p className="text-lg font-bold text-slate-900">
                    {kpisData?.freelancers != null ? Number(kpisData.freelancers).toLocaleString() : "—"}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl grid place-items-center text-white shrink-0"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">Clients</p>
                  <p className="text-lg font-bold text-slate-900">
                    {kpisData?.clients != null ? Number(kpisData.clients).toLocaleString() : "—"}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl grid place-items-center text-white shrink-0"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">Projects</p>
                  <p className="text-lg font-bold text-slate-900">
                    {kpisData?.projects != null ? Number(kpisData.projects).toLocaleString() : "—"}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl grid place-items-center text-white shrink-0"
                  style={{ backgroundColor: PRIMARY }}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">Total Paid</p>
                  <p className="text-lg font-bold" style={{ color: PRIMARY }}>
                    {kpisData?.totalPaid != null
                      ? `${Number(kpisData.totalPaid).toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })} ${kpisData.currency || "JD"}`
                      : "—"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-amber-800 text-sm">
              <p className="font-medium">{error}</p>
              <p className="mt-1 text-amber-700 text-xs">
                تأكد من تشغيل الـ Backend (مثلاً على المنفذ 5000) وأنك مسجّل كـ Admin. جرّب تحديث الصفحة (Ctrl+Shift+R).
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
          {/* 1) Performance — Multi-line time series + KPIs */}
          <div className="md:col-span-2 xl:col-span-2">
            <Panel
              title="Projects & payments over time"
              icon={BarChart3}
              actionLabel="View full report"
            >
              {loading ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                  <Skeleton className="h-[260px]" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-black/5">
                      <p className="text-xs font-semibold text-slate-500">Projects</p>
                      <p className="text-lg font-bold text-slate-900">
                        {kpis?.projectsTotal ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-black/5">
                      <p className="text-xs font-semibold text-slate-500">Payments</p>
                      <p className="text-lg font-bold text-slate-900">
                        {kpis?.paymentsCount ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-black/5">
                      <p className="text-xs font-semibold text-slate-500">Revenue</p>
                      <p className="text-lg font-bold" style={{ color: PRIMARY }}>
                        {kpis?.paymentsTotal != null
                          ? `${Number(kpis.paymentsTotal).toFixed(0)} JD`
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-black/5">
                      <p className="text-xs font-semibold text-slate-500">Escrow held</p>
                      <p className="text-lg font-bold text-slate-900">
                        {kpis?.escrowHeld != null
                          ? `${Number(kpis.escrowHeld).toFixed(0)} JD`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="h-[240px]">
                    {combinedSeries.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={combinedSeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) =>
                              new Date(v).toLocaleDateString("en", {
                                month: "short",
                                day: "numeric",
                              })
                            }
                          />
                          <YAxis yAxisId="L" tick={{ fontSize: 11 }} />
                          <YAxis yAxisId="R" orientation="right" tick={{ fontSize: 11 }} />
                          <Tooltip
                            labelFormatter={(v) => new Date(v).toLocaleDateString()}
                            formatter={(value, name) => [
                              name === "projects" ? value : `${value} JD`,
                              name === "projects" ? "Projects" : "Payments",
                            ]}
                          />
                          <Line
                            yAxisId="L"
                            type="monotone"
                            dataKey="projects"
                            stroke={PRIMARY}
                            strokeWidth={2}
                            dot={false}
                            name="projects"
                          />
                          <Line
                            yAxisId="R"
                            type="monotone"
                            dataKey="payments"
                            stroke="#0ea5e9"
                            strokeWidth={2}
                            dot={false}
                            name="payments"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        No data for this period
                      </div>
                    )}
                  </div>
                </>
              )}
            </Panel>
          </div>

          {/* 2) Quality / Trust — Score + Area */}
          <div>
            <Panel title="Completion rate" icon={TrendingUp}>
              {loading ? (
                <Skeleton className="h-[180px]" />
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-4xl font-extrabold"
                      style={{ color: PRIMARY }}
                    >
                      {completionRate}%
                    </span>
                    <span className="text-slate-500 text-sm">
                      projects completed
                    </span>
                  </div>
                  <div className="mt-4 h-24">
                    {projectsByDay.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={projectsByDay.map((d) => ({
                            ...d,
                            count: Number(d.count),
                          }))}
                        >
                          <defs>
                            <linearGradient
                              id="areaOrange"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.4} />
                              <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke={PRIMARY}
                            fill="url(#areaOrange)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center text-slate-400 text-xs">
                        No trend data
                      </div>
                    )}
                  </div>
                </>
              )}
            </Panel>
          </div>

          {/* 3) By Country */}
          <div>
            <Panel title="Users by country" icon={MapPin}>
              {loading ? (
                <Skeleton className="h-[220px]" />
              ) : byCountry.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                  No country data
                </div>
              ) : (
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {byCountry.slice(0, 10).map((row, i) => (
                    <li
                      key={row.country}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate text-slate-700">
                        {row.country}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className="h-2 rounded-full bg-slate-100 overflow-hidden"
                          style={{ width: 60 }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (row.count / (byCountry[0]?.count || 1)) * 100
                              )}%`,
                              backgroundColor: PRIMARY,
                            }}
                          />
                        </div>
                        <span className="font-semibold text-slate-900 w-8 text-right">
                          {row.count}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* 4) Top 10 Projects */}
          <div>
            <Panel title="Top projects (recent)" icon={Award} actionLabel="View all">
              {loading ? (
                <Skeleton className="h-[220px]" />
              ) : topProjects.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                  No projects in range
                </div>
              ) : (
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {topProjects.map((p, i) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2 text-sm py-1 border-b border-slate-50 last:border-0"
                    >
                      <span className="truncate flex-1 text-slate-800" title={p.title}>
                        {p.title || `#${p.id}`}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className="h-1.5 rounded-full bg-slate-100"
                          style={{ width: 40 }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (p.applications / (topProjects[0]?.applications || 1)) *
                                  100
                              )}%`,
                              backgroundColor: PRIMARY,
                            }}
                          />
                        </div>
                        <span
                          className="font-semibold w-6 text-right"
                          style={{ color: PRIMARY }}
                        >
                          {p.applications}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* 5) By Status — Donut */}
          <div>
            <Panel title="Projects by status" icon={PieChart}>
              {loading ? (
                <Skeleton className="h-[200px]" />
              ) : byStatus.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                  No status data
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <RechartsPie>
                      <Pie
                        data={byStatus.map((s) => ({
                          name: String(s.status),
                          value: Number(s.count),
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {byStatus.map((entry, i) => (
                          <Cell
                            key={entry.status}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          value,
                          name,
                        ]}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <Legend
                    layout="horizontal"
                    formatter={(value) => (
                      <span className="text-xs text-slate-600">{value}</span>
                    )}
                  />
                </div>
              )}
            </Panel>
          </div>

          {/* 6) By Type — Bar */}
          <div>
            <Panel title="Projects by type" icon={FolderKanban}>
              {loading ? (
                <Skeleton className="h-[180px]" />
              ) : byType.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                  No type data
                </div>
              ) : (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={byType.map((t) => ({
                        name: String(t.type),
                        count: Number(t.count),
                      }))}
                      margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={72}
                        tick={{ fontSize: 11 }}
                      />
                      <Bar
                        dataKey="count"
                        fill={PRIMARY}
                        radius={[0, 4, 4, 0]}
                      />
                      <Tooltip />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>
          </div>

          {/* 7) Users by role */}
          <div>
            <Panel title="Users by role" icon={Users}>
              {loading ? (
                <Skeleton className="h-[180px]" />
              ) : !kpis?.usersByRole?.length ? (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                  No role data
                </div>
              ) : (
                <div className="space-y-2">
                  {kpis.usersByRole.map((r, i) => (
                    <div
                      key={r.label}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-slate-700">{r.label}</span>
                      <span
                        className="font-bold"
                        style={{ color: PRIMARY }}
                      >
                        {r.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          {/* 8) Top categories */}
          <div>
            <Panel title="Top categories" icon={FolderKanban}>
              {loading ? (
                <Skeleton className="h-[180px]" />
              ) : topCategories.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                  No category data
                </div>
              ) : (
                <ul className="space-y-2">
                  {topCategories.map((c, i) => (
                    <li
                      key={c.name}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate text-slate-700">{c.name}</span>
                      <span className="font-semibold text-slate-900 shrink-0">
                        {c.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
