import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const primary = "#05668D";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

const MOCK = true;
const DEMO = {
  kpis: { users: 12450, revenue: 53210, orders: 1840, projects: 96 },
  series: [
    4200, 5100, 6100, 5800, 6900, 7300, 6800, 7600, 8100, 7900, 8400, 9000,
  ],
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

export default function Analytics() {
  const [range, setRange] = useState("30d");
  const [kpis, setKpis] = useState({
    users: 0,
    revenue: 0,
    orders: 0,
    projects: 0,
  });
  const [series, setSeries] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    if (MOCK) {
      setKpis(DEMO.kpis);
      setSeries(DEMO.series);
      setLabels(DEMO.labels);
      return;
    }
    (async () => {
      const { data } = await api.get("/api/analytics/summary", {
        params: { range },
      });
      setKpis(data.kpis);
      setSeries(data.series);
      setLabels(data.labels);
    })();
  }, [range]);

  const maxVal = Math.max(1, ...series);
  const total = useMemo(() => series.reduce((a, b) => a + b, 0), [series]);

  return (
    <div className="space-y-6 w-full max-w-[100svw] overflow-x-clip px-3 sm:px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Analytics</h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title="Users" value={kpis.users.toLocaleString()} />
        <Kpi title="Revenue" value={`$${kpis.revenue.toLocaleString()}`} />
        <Kpi title="Orders" value={kpis.orders.toLocaleString()} />
        <Kpi title="Projects" value={kpis.projects.toLocaleString()} />
      </div>

      {/* Bar chart (Mobile + Desktop) */}
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div className="mb-2 text-slate-700 font-medium">
          Revenue (sum: ${total.toLocaleString()})
        </div>

        <div className="sm:hidden">
          <div className="flex items-end gap-1 h-48 select-none">
            {series.map((v, i) => (
              <div
                key={i}
                className="flex-1 min-w-0 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${(v / maxVal) * 100}%`,
                    backgroundColor: primary,
                  }}
                />
                <div
                  className={`text-[10px] leading-3 text-slate-500 truncate ${
                    i % 3 !== 0 ? "invisible" : ""
                  }`}
                >
                  {labels[i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ≥ sm: scrollable when needed ===== */}
        <div className="hidden sm:block overflow-x-auto w-full max-w-full [-webkit-overflow-scrolling:touch]">
          <div className="min-w-[560px] pr-2">
            <div className="flex items-end gap-2 h-48 select-none">
              {series.map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-6 rounded-t"
                    style={{
                      height: `${(v / maxVal) * 100}%`,
                      backgroundColor: primary,
                    }}
                  />
                  <div className="text-[10px] text-slate-500">{labels[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="text-slate-500 text-sm">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-800">{value}</div>
    </div>
  );
}
