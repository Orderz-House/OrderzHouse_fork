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
import { MOCK_ENABLED, mockFetch } from "../mockData"; // 👈 موك

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
// 1 = admin, 2 = client, 3 = freelancer, 5 = partner
const mapRole = (roleId) => {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  if (roleId === 5) return "partner";
  return "user";
};

const fmtMoney = (n, c = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(+n) ? +n : 0);

/* ---------- endpoints per-role ---------- */
const endpoints = {
  admin: { url: "/payments" }, // كل الحركات
  client: { url: "/client/payments" }, // تاريخ العميل
  freelancer: { url: "/freelancer/payments" }, // تاريخ الفريلانسر
  partner: { url: "/partner/payments" }, // تاريخ البارتنر (role_id = 5)
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

        let data;

        // 1) لو الموك شغال نستخدمه أولاً
        if (MOCK_ENABLED) {
          const mock = mockFetch(url);
          if (mock) {
            data = mock;
          }
        }

        // 2) لو ما فيه موك (أو MOCK_ENABLED = false) نرجع للـ API الحقيقي
        if (!data) {
          const res = await axios.get(url, {
            // headers: { authorization: `Bearer ${token}` },
            // silent: true
          });
          data = res.data;
        }

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
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [role, token]);

  // فلترة محلية بسيطة (لو حابب تستخدمها للبحث أو الفلاتر)
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((it) => {
      const matchQ =
        !t ||
        Object.values(it).some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(t)
        );
      const matchStatus =
        status === "all" || String(it.status).toLowerCase() === status;
      const matchMethod =
        method === "all" || String(it.method).toLowerCase() === method;
      return matchQ && matchStatus && matchMethod;
    });
  }, [rows, q, status, method]);

  const tableTitle =
    role === "admin"
      ? "Payments"
      : role === "client"
      ? "Billing"
      : role === "freelancer"
      ? "Earnings"
      : role === "partner"
      ? "Partner payments"
      : "Payments";

  // فلاتر إضافية للـ admin فقط (لو حابب تستخدمها في PeopleTable)
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
    Number(totals?.earned || 0) -
      Number(totals?.clearing || 0) -
      Number(totals?.withdrawn || 0);

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden py-6">
      {/* كروت الفريلانسر (الرصيد الكلي + القابل للسحب) */}
      {role === "freelancer" && (
        <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 mx-4">
          <Kpi
            title="TOTAL BALANCE"
            value={fmtMoney(totals?.earned ?? 0)}
            icon={<DollarSign className="w-5 h-5" />}
            caption="All earnings including pending"
            trend="+12%"
          />
          <Kpi
            title="AVAILABLE TO WITHDRAW"
            value={fmtMoney(available)}
            icon={<CreditCard className="w-5 h-5" />}
            caption="Ready to cash out"
            trend="+7%"
          />
        </div>
      )}

      {/* جدول الـ history لكل الرولات */}
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
function Kpi({ icon, title, value, caption, trend }) {
  return (
    <div
      className={`${card} flex items-center sm:items-start gap-4`}
      style={ringStyle}
    >
      {/* المربع الفاتح مع الأيقونة */}
      <div
        className="shrink-0 w-12 h-12 rounded-[1.1rem] flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(2,195,154,0.15), rgba(2,128,144,0.06))",
        }}
      >
        <div className="w-7 h-7 rounded-xl bg-white/80 flex items-center justify-center text-[#028090]">
          {icon}
        </div>
      </div>

      {/* النصوص */}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
          {title}
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-semibold text-slate-900 truncate">
            {value}
          </div>

          {trend && (
            <span className="text-xs font-semibold text-emerald-600">
              {trend}
            </span>
          )}
        </div>

        {caption && (
          <p className="mt-1 text-xs text-slate-500 leading-snug">
            {caption}
          </p>
        )}
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
            return String(v).includes(",")
              ? `"${String(v).replace(/"/g, '""')}"`
              : v;
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