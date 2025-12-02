import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Users,
  Folder,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Activity,
  CalendarDays,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Search,
  Download,
} from "lucide-react";
import { MOCK_ENABLED, mockFetch } from "../mockData.js";

/* ===== Theme ===== */
const T = {
  primary: "#028090",
  dark: "#05668D",
  light: "#02C39A",
  ring: "rgba(15,23,42,.10)",
  surface: "rgba(255,255,255,.82)",
};
const ringStyle = { border: `1px solid ${T.ring}` };

/* ===== Charts helpers (pure SVG) ===== */
function linePath(data, w = 520, h = 140, pad = 12) {
  if (!data?.length) return "";
  const xs = data.map((_, i) => i);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const dx = (w - pad * 2) / (xs.length - 1 || 1);
  const norm = (v) => {
    if (max === min) return h / 2;
    return h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  };
  return xs.map((x, i) => `${i ? "L" : "M"} ${pad + x * dx} ${norm(data[i])}`).join(" ");
}

function donutSlices(items, cx = 90, cy = 90, r = 60) {
  const total = items.reduce((s, it) => s + Number(it.value || 0), 0) || 1;
  let a0 = -Math.PI / 2;
  const parts = [];
  items.forEach((it) => {
    const frac = Number(it.value || 0) / total;
    const a1 = a0 + frac * Math.PI * 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0),
      y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1),
      y1 = cy + r * Math.sin(a1);
    const d = `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
    parts.push({ d });
    a0 = a1;
  });
  return parts;
}

/* ===== Small UI atoms ===== */
function StatCard({ icon, label, value, delta = null, good = true }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5" style={ringStyle}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-slate-500 text-xs">{label}</div>
          <div className="mt-1 text-xl font-semibold text-slate-800 truncate">{value}</div>
          {delta != null && (
            <div
              className={`mt-1 inline-flex items-center gap-1 text-xs ${
                good ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {good ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {delta}
            </div>
          )}
        </div>
        <div
          className="w-9 h-9 rounded-xl grid place-items-center text-white shrink-0"
          style={{ background: T.primary }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function LineChart({ data = [] }) {
  const w = 520,
    h = 140;
  const d = linePath(data, w, h);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[160px]">
      <rect x="0" y="0" width={w} height={h} fill="#fff" opacity="0" />
      <path d={d} fill="none" stroke={T.primary} strokeWidth="2.5" />
    </svg>
  );
}

function DonutChart({ items = [] }) {
  const colors = ["#028090", "#02C39A", "#91E5F6", "#56CFE1", "#B8FFF9", "#7CC9B5"];
  const slices = donutSlices(items);
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 180 180" className="w-[180px] h-[180px]">
        {slices.map((p, i) => (
          <path key={i} d={p.d} fill={colors[i % colors.length]} opacity="0.9" />
        ))}
        <circle cx="90" cy="90" r="38" fill="white" />
        <text x="90" y="90" textAnchor="middle" dominantBaseline="middle" className="fill-slate-700 text-sm">
          {items.reduce((s, it) => s + Number(it.value || 0), 0)}
        </text>
      </svg>
      <div className="grid gap-1 text-sm">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2 text-slate-700">
            <span className="w-3.5 h-3.5 rounded-sm" style={{ background: colors[i % colors.length] }} />
            <span className="truncate">{it.label}</span>
            <span className="ml-auto text-slate-500">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Main (Admin-only) ===== */
export default function Analytics() {
  const { userData, token } = useSelector((s) => s.auth);
  const isAdmin = Number(userData?.role_id) === 1;

  // Guard: Admin only
  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Only administrators can access Analytics.
      </div>
    );
  }

  const [range, setRange] = useState("last_30");
  const [loading, setLoading] = useState(true);

  const [cards, setCards] = useState([]);
  const [line, setLine] = useState([]);
  const [donut, setDonut] = useState([]);

  const api = useMemo(
    () =>
      axios.create({
        baseURL: import.meta.env.VITE_API_URL || "",
        headers: { "Content-Type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      }),
    [token]
  );

  const ENDPOINT = "/analytics/admin";

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        let res;
        if (MOCK_ENABLED) {
          res = mockFetch(`${ENDPOINT}?range=${range}`) || {};
        } else {
          const { data } = await api.get(ENDPOINT, { params: { range } });
          res = data;
        }
        if (!alive) return;

        setCards(
          Array.isArray(res?.cards)
            ? res.cards
            : [
                { label: "Active Users", value: 982, delta: "+3.1%", good: true },
                { label: "Projects", value: 469, delta: "+1.2%", good: true },
                { label: "Tasks", value: 755, delta: "-0.7%", good: false },
                { label: "Revenue", value: "$93K", delta: "+4.4%", good: true },
                { label: "Meetings", value: 249 },
                { label: "Conversions", value: 931 },
                { label: "Views", value: 681 },
                { label: "Avg. Session", value: "00:00:30" },
              ]
        );

        setLine(Array.isArray(res?.line) ? res.line : [42, 28, 36, 50, 22, 40, 18, 46, 24, 38, 20, 44]);

        setDonut(
          Array.isArray(res?.donut)
            ? res.donut
            : [
                { label: "Email", value: 40 },
                { label: "Referral", value: 37 },
                { label: "Direct", value: 28 },
                { label: "Organic", value: 10 },
              ]
        );
      } catch (e) {
        console.error("Analytics load failed:", e);
        if (alive) {
          setCards([]);
          setLine([]);
          setDonut([]);
        }
      } finally {
        alive && setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [api, range]);

  const ICONS = [Users, Folder, ClipboardList, DollarSign, TrendingUp, Activity, CalendarDays, CheckCircle2];

  return (
    <div className="space-y-4 py-6 sm:space-y-6">
    
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line */}
        <div className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5" style={ringStyle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <BarChart3 className="w-4 h-4 text-[color:var(--t)]" style={{ ["--t"]: T.primary }} />
              <span>Sessions</span>
            </div>
            <span className="text-slate-400 text-xs">trend</span>
          </div>
          <div className="mt-2">
            {loading ? <div className="p-10 text-center text-slate-500">Loading…</div> : <LineChart data={line} />}
          </div>
        </div>

        {/* Donut */}
        <div className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5" style={ringStyle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <PieChart className="w-4 h-4 text-[color:var(--t)]" style={{ ["--t"]: T.primary }} />
              <span>Traffic sources</span>
            </div>
            <span className="text-slate-400 text-xs">distribution</span>
          </div>
          <div className="mt-2">
            {loading ? <div className="p-10 text-center text-slate-500">Loading…</div> : <DonutChart items={donut} />}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(loading ? Array.from({ length: 8 }, () => ({})) : cards).map((c, i) => {
          const Icon = ICONS[i % ICONS.length] || Users;
          return (
            <StatCard
              key={i}
              icon={<Icon className="w-4 h-4" />}
              label={c.label || "—"}
              value={c.value || "—"}
              delta={c.delta}
              good={c.good !== false}
            />
          );
        })}
      </div>
    </div>
  );
}
