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
} from "lucide-react";
import PeopleTable from "../Tables";

/* ---------- theme tokens ---------- */
const T = {
  primary: "#028090",
  dark: "#05668D",
  light: "#02C39A",
  surface: "rgba(255,255,255,.82)",
  ring: "rgba(15,23,42,.10)",
};
const ringStyle = { border: `1px solid ${T.ring}` };
const card = "rounded-2xl bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5";

/* ---------- helpers ---------- */
const mapRole = (roleId) =>
  roleId === 1 ? "admin" : roleId === 2 ? "client" : roleId === 3 ? "freelancer" : "user";

const fmtMoney = (n, c = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(+n) ? +n : 0);

/* ---------- endpoints per-role ---------- */
const endpoints = {
  admin: { url: "/payments" },
  client: { url: "/client/payments" },
  freelancer: { url: "/freelancer/payments" },
  user: { url: "/payments" },
};

/* ---------- common table columns ---------- */
const columns = [
  { label: "User", key: "user" },
  { label: "Project", key: "project" },
  { label: "Amount", key: "amount" },
  { label: "Method", key: "method" },
  { label: "Status", key: "status" },
  { label: "Date", key: "date" },
  { label: "Reference", key: "ref" },
];

/* ---------- pick array safely from any backend shape ---------- */
function pickArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.list)) return data.list;
  const nested = Object.values(data || {}).find(Array.isArray);
  return nested || [];
}

/* =========================================================
   Root (role-aware): نفس PeopleTable للجميع + لوحات للـFreelancer
   ========================================================= */
export default function Payments() {
  const { userData, user, token } = useSelector((s) => s.auth);
  const role = mapRole(userData?.role_id ?? user?.role_id);

  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);

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
          // headers: { authorization: `Bearer ${token}` },
          // silent: true
        });

        if (!alive) return;

        const items = pickArray(data);
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

  const tableTitle =
    role === "admin" ? "Payments" : role === "client" ? "Billing" : role === "freelancer" ? "Earnings" : "Payments";

  const filters =
    role === "admin"
      ? [
          { key: "status", label: "Status" },
          { key: "method", label: "Method" },
        ]
      : [];

  const crudConfig =
    role === "admin"
      ? { showDetails: true, showRowEdit: true, showDelete: true }
      : { showDetails: true, showRowEdit: false, showDelete: false };

  /* ======== ـFreelancer ======== */
  const available =
    totals?.available ??
    (Number(totals?.earned || 0) - Number(totals?.clearing || 0) - Number(totals?.withdrawn || 0));

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <header className={`${card}`} style={ringStyle}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold" style={{ color: T.dark }}>
              {tableTitle}
            </h1>
            <p className="text-slate-500 text-sm">
              {role === "admin"
                ? "Finance overview · admin"
                : role === "client"
                ? "Your payments & invoices"
                : role === "freelancer"
                ? "Available balance & payouts"
                : "Finance"}
            </p>
          </div>

          {role === "admin" ? (
            <button
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white hover:bg-slate-50"
              style={ringStyle}
              onClick={() => exportCSV(filtered, "payments_admin.csv")}
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          ) : role === "client" ? (
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white hover:bg-slate-50" style={ringStyle}>
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Pay invoice</span>
              </button>
            </div>
          ) : role === "freelancer" ? (
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white hover:bg-slate-50" style={ringStyle}>
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {role === "freelancer" && (
        <div className="grid gap-3 sm:gap-4 grid-cols-2">
          <Kpi title="Total balance" value={fmtMoney(totals?.earned ?? 0)} icon={<DollarSign />} />
          <Kpi title="Withdrawable" value={fmtMoney(available)} icon={<CreditCard />} />
        </div>
      )}

    

        <PeopleTable
          title={tableTitle}
          addLabel="Add Payment"
          endpoint={(endpoints[role] ?? endpoints.user).url}
          initialRows={filtered}
          columns={columns}
          filters={filters}
          crudConfig={crudConfig}
          // token={token}
        />
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
