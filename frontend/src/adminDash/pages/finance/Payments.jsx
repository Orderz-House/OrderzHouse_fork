import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownToLine,
} from "lucide-react";
import PeopleTable from "../Tables";

/* ---------- theme tokens (soft) ---------- */
const T = {
  primary: "#028090",
  dark: "#05668D",
  light: "#02C39A",
  surface: "rgba(255,255,255,.82)",
  ring: "rgba(15,23,42,.10)",
};

/* ---------- helpers ---------- */
const mapRole = (roleId) =>
  roleId === 1 ? "admin" : roleId === 2 ? "client" : roleId === 3 ? "freelancer" : "user";

const fmtMoney = (n, c = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  }).format(n);

const card = "rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5";
const ringStyle = { border: `1px solid ${T.ring}` };

/* ---------- real endpoints ---------- */
const endpoints = {
  admin: { url: "/api/payments" },
  client: { url: "/api/client/payments" },
  freelancer: { url: "/api/freelancer/payments" },
  user: { url: "/api/payments" },
};

/* =========================================================
   Root (role-aware)
   ========================================================= */
export default function Payments() {
  const { userData, user, token } = useSelector((s) => s.auth);
  const role = mapRole(userData?.role_id ?? user?.role_id);

  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);

  // simple filters for cards
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const { url } = endpoints[role] ?? endpoints.user;

        const { data } = await axios.get(url, {
          // ⬇️ إن احتجت توكن، أضِفه هنا
          // headers: { authorization: `Bearer ${token}` },
        });

        if (!alive) return;

        // نتوقع هيكلة مثل: { items: [...], totals: {...} }
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        const totalsObj = data?.totals ?? {};

        setRows(items);
        setTotals(totalsObj);
      } catch (e) {
        console.error("Payments fetch failed:", e);
        if (alive) {
          setRows([]);
          setTotals({});
        }
      } finally {
        alive && setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [role, token]);

  // filter for client/freelancer cards
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((it) => {
      const matchQ =
        !t || Object.values(it).some((v) => String(v ?? "").toLowerCase().includes(t));
      const matchStatus = status === "all" || String(it.status).toLowerCase() === status;
      const matchMethod = method === "all" || String(it.method).toLowerCase() === method;
      return matchQ && matchStatus && matchMethod;
    });
  }, [rows, q, status, method]);

  if (role === "admin") {
    return (
      <AdminFinance
        totals={totals}
        loading={loading}
        tableProps={{
          title: "Payments",
          addLabel: "Add Payment",
          initialRows: rows, // يُستخدم فقط إن لم يُمرر endpoint داخل PeopleTable
          endpoint: endpoints.admin.url,
          columns: [
            { label: "User", key: "user" },
            { label: "Project", key: "project" },
            { label: "Amount", key: "amount" },
            { label: "Method", key: "method" },
            { label: "Status", key: "status" },
            { label: "Date", key: "date" },
            { label: "Reference", key: "ref" },
          ],
          filters: [
            { key: "status", label: "Status" },
            { key: "method", label: "Method" },
          ],
          hideCrudActions: true,
        }}
      />
    );
  }

  if (role === "freelancer") {
    return (
      <FreelancerEarnings
        loading={loading}
        rows={filtered}
        totals={totals}
        q={q}
        setQ={setQ}
        status={setStatus}
        method={setMethod}
      />
    );
  }

  // default: client
  return (
    <ClientBilling
      loading={loading}
      rows={filtered}
      totals={totals}
      q={q}
      setQ={setQ}
      status={setStatus}
      method={setMethod}
    />
  );
}

/* =========================================================
   Admin — Finance (KPIs + PeopleTable)
   ========================================================= */
function AdminFinance({ totals, loading, tableProps }) {
  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <header className={`${card}`} style={ringStyle}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold" style={{ color: T.dark }}>
              Payments
            </h1>
            <p className="text-slate-500 text-sm">Finance overview · admin</p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white hover:bg-slate-50"
            style={ringStyle}
            onClick={() => exportCSV(tableProps.initialRows || [], "payments_admin.csv")}
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Kpi icon={<DollarSign />} title="Total volume" value={fmtMoney(totals?.volume ?? 0)} />
        <Kpi icon={<TrendingUp />} title="Paid" value={fmtMoney(totals?.paid ?? 0)} />
        <Kpi icon={<Calendar />} title="Pending" value={fmtMoney(totals?.pending ?? 0)} />
        <Kpi icon={<TrendingDown />} title="Failed" value={fmtMoney(totals?.failed ?? 0)} />
      </div>

      {/* Table section */}
      <section className={`${card}`} style={ringStyle}>
        <PeopleTable {...tableProps} />
      </section>
    </div>
  );
}

/* =========================================================
   Client — Billing (clean timeline)
   ========================================================= */
function ClientBilling({ loading, rows, totals, q, setQ, status, method }) {
  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      <header className={`${card}`} style={ringStyle}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold" style={{ color: T.dark }}>
              Billing
            </h1>
            <p className="text-slate-500 text-sm">Your payments & invoices</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white hover:bg-slate-50"
              style={ringStyle}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm">Add funds</span>
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white hover:bg-slate-50"
              style={ringStyle}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">Pay invoice</span>
            </button>
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <MiniKpi title="Paid" value={fmtMoney(totals?.paid ?? 0)} icon={<TrendingUp />} />
        <MiniKpi title="Due" value={fmtMoney(totals?.due ?? 0)} icon={<Calendar />} />
        <MiniKpi title="Refunds" value={fmtMoney(totals?.refunds ?? 0)} icon={<TrendingDown />} />
      </div>

      {/* Filters */}
      <section className={`${card}`} style={ringStyle}>
        <div className="grid sm:flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search payment or project…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white outline-none"
              style={ringStyle}
            />
          </div>
          <Select label="Status" options={["all", "paid", "due", "failed"]} onChange={status} />
          <Select label="Method" options={["all", "card", "paypal", "wire", "escrow"]} onChange={method} />
        </div>
      </section>

      {/* Timeline */}
      <section className="grid gap-3 sm:gap-4">
        {loading ? (
          <div className={`${card} text-center text-slate-500`} style={ringStyle}>
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className={`${card} text-center text-slate-500`} style={ringStyle}>
            No payments found.
          </div>
        ) : (
          rows.map((p) => (
            <div key={p.id ?? p._id} className={`${card} flex items-center justify-between gap-3`} style={ringStyle}>
              <div className="min-w-0">
                <div className="text-slate-800 font-medium truncate">
                  {p.title} • <span className="text-slate-500">{p.project}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {p.method} • {p.date}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={toneFromStatus(p.status)}>{p.status}</Badge>
                <div className="font-semibold">{fmtMoney(p.amount ?? 0)}</div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

/* =========================================================
   Freelancer — Earnings (wallet-style)
   ========================================================= */
function FreelancerEarnings({ loading, rows, totals, q, setQ, status, method }) {
  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      <header className={`${card}`} style={ringStyle}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold" style={{ color: T.dark }}>
              Earnings
            </h1>
            <p className="text-slate-500 text-sm">Available balance & payouts</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white hover:bg-slate-50" style={ringStyle}>
              <ArrowDownToLine className="w-4 h-4" />
              <span className="text-sm">Withdraw</span>
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white hover:bg-slate-50"
              style={ringStyle}
              onClick={() => exportCSV(rows, "earnings.csv")}
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <MiniKpi title="Total earned" value={fmtMoney(totals?.earned ?? 0)} icon={<DollarSign />} />
        <MiniKpi title="Awaiting clearance" value={fmtMoney(totals?.clearing ?? 0)} icon={<Calendar />} />
        <MiniKpi title="Withdrawn" value={fmtMoney(totals?.withdrawn ?? 0)} icon={<CreditCard />} />
      </div>

      <section className={`${card}`} style={ringStyle}>
        <div className="grid sm:flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search earning or payout…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white outline-none"
              style={ringStyle}
            />
          </div>
          <Select label="Status" options={["all", "available", "clearing", "withdrawn"]} onChange={status} />
          <Select label="Method" options={["all", "escrow", "paypal", "wire"]} onChange={method} />
        </div>
      </section>

      <section className="grid gap-3 sm:gap-4">
        {loading ? (
          <div className={`${card} text-center text-slate-500`} style={ringStyle}>
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className={`${card} text-center text-slate-500`} style={ringStyle}>
            No items found.
          </div>
        ) : (
          rows.map((r) => (
            <div key={r.id ?? r._id} className={`${card}`} style={ringStyle}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-slate-800 font-medium truncate">{r.title}</div>
                  <div className="text-xs text-slate-500">
                    {r.method} • {r.date}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={toneFromStatus(r.status)}>{r.status}</Badge>
                  <div className="font-semibold">{fmtMoney(r.amount ?? 0)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

/* ================= UI bits ================= */
function Kpi({ icon, title, value }) {
  return (
    <div className={`${card} flex items-center gap-3`} style={ringStyle}>
      <div className="w-10 h-10 grid place-items-center rounded-xl text-white" style={{ background: T.primary }}>
        {icon}
      </div>
      <div>
        <div className="text-slate-500 text-xs">{title}</div>
        <div className="text-lg font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}

function MiniKpi({ icon, title, value }) {
  return (
    <div className={`${card} text-center`} style={ringStyle}>
      <div className="mx-auto mb-2 w-9 h-9 grid place-items-center rounded-xl text-white" style={{ background: T.primary }}>
        {icon}
      </div>
      <div className="text-slate-500 text-xs">{title}</div>
      <div className="text-base font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function Select({ label, options, onChange }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="relative">
        <select
          className="appearance-none rounded-xl pl-3 pr-8 py-2 bg-white text-sm outline-none"
          style={ringStyle}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((x) => (
            <option key={x} value={x}>
              {x[0].toUpperCase() + x.slice(1)}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function Badge({ tone = "neutral", children }) {
  const palette = {
    success: { bg: "rgba(2,195,154,.12)", color: "#05856C" },
    warn: { bg: "rgba(255,184,0,.15)", color: "#8a5c00" },
    danger: { bg: "rgba(239,68,68,.12)", color: "#b91c1c" },
    neutral: { bg: "rgba(15,23,42,.08)", color: "#0f172a" },
  }[tone];
  return (
    <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: palette.bg, color: palette.color }}>
      {children}
    </span>
  );
}

function toneFromStatus(s = "") {
  const t = s.toLowerCase();
  if (["paid", "available", "success"].includes(t)) return "success";
  if (["pending", "clearing", "due"].includes(t)) return "warn";
  if (["failed", "cancelled", "withdrawn_failed"].includes(t)) return "danger";
  return "neutral";
}

function exportCSV(rows, filename) {
  if (!rows?.length) return;
  const keys = Object.keys(rows[0]);
  const csv =
    keys.join(",") +
    "\n" +
    rows
      .map((r) =>
        keys
          .map((k) => {
            const v = r[k] ?? "";
            return String(v).includes(",") ? `"${String(v).replace(/"/g, '""')}"` : v;
          })
          .join(",")
      )
      .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
