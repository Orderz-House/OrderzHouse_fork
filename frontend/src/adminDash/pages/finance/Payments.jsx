import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import API from "../../api/axios.js";
import {
  CreditCard,
  DollarSign,
  Search,
  ChevronDown,
  RefreshCcw,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import PeopleTable from "../Tables";

/* ---------- theme tokens (keep yours) ---------- */
const T = {
  primary: "#028090",
  dark: "#05668D",
  light: "#02C39A",
  surface: "rgba(255,255,255,.82)",
  ring: "rgba(15,23,42,.10)",
};
const ringStyle = { border: `1px solid ${T.ring}` };

/* ---------- shared UI (dashboard-like) ---------- */
const UI = {
  page: "overflow-x-hidden",
  card: "rounded-3xl bg-white/80 backdrop-blur shadow-sm",
  ring: ringStyle,
  violetHero:
    "rounded-3xl overflow-hidden text-white bg-gradient-to-b from-orange-400 to-red-500",
};

/* ---------- helpers ---------- */
// 1 = admin, 2 = client, 3 = freelancer, 5 = partner
const mapRole = (roleId) => {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  if (roleId === 5) return "partner";
  return "user";
};

// Format amount as "number JD" (e.g., "250 JD")
const fmtAmount = (n) => {
  const num = Number.isFinite(+n) ? +n : 0;
  // Format with up to 2 decimal places if needed, otherwise integer
  const formatted = num % 1 === 0 ? num.toString() : num.toFixed(2);
  return `${formatted} JD`;
};

/* ---------- endpoints ---------- */
/* ---------- columns (dashboard-like) ---------- */
/* ---------- pick array safely from any backend shape ---------- */
function pickArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.payments)) return data.payments; // (matches your controller shape)
  const nested = Object.values(data || {}).find(Array.isArray);
  return nested || [];
}

/* ---------- tiny utils ---------- */
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const getCurrency = (rows) =>
  rows?.find((r) => r?.currency)?.currency || "JD";
const norm = (v) => String(v ?? "").toLowerCase();
const cx = (...a) => a.filter(Boolean).join(" ");

function StatPill({ icon: Icon, label, value, tone = "slate" }) {
  const toneCls =
    tone === "violet"
      ? "bg-orange-50 border-orange-200/70 text-orange-700"
      : tone === "emerald"
      ? "bg-emerald-50 border-emerald-200/70 text-emerald-700"
      : tone === "amber"
      ? "bg-amber-50 border-amber-200/70 text-amber-700"
      : tone === "orange"
      ? "bg-orange-50 border-orange-200/70 text-orange-700"
      : "bg-slate-50 border-slate-200/70 text-slate-700";

  return (
    <div className={cx("rounded-2xl border px-3 py-3 bg-white", toneCls)}>
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cx(
            "h-9 w-9 rounded-2xl grid place-items-center border bg-white/60 shrink-0",
            toneCls
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold opacity-80 truncate">
            {label}
          </div>
          <div className="text-sm font-extrabold text-slate-900">{value}</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Payments Page (dashboard-like UI, same logic)
   ========================================================= */
export default function Payments() {
  const { userData, user, token } = useSelector((s) => s.auth);
  // دعم كل أشكال تخزين الدور: role_id, roleId, role (من الـ API أو الـ store)
  const roleId =
    userData?.role_id ?? user?.role_id ?? userData?.roleId ?? user?.roleId ?? userData?.role ?? user?.role;
  const role = mapRole(roleId);

  const userId =
    userData?.id ?? user?.id ?? userData?.user_id ?? user?.user_id ?? null;

  // الفريلانسر: نفس الـ endpoint للصفحة والجدول حتى يُعرض الرصيد + المعاملات من /payments/history
  const endpoint =
    role === "admin"
      ? "/payments/admin/payments"
      : role === "client"
      ? "/payments/client/history"
      : role === "freelancer"
      ? "/payments/history"
      : null;



  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let data;

      if (role === "freelancer") {
        // الفريلانسر: استخدم /payments/history للحصول على الرصيد + المعاملات معاً
        const res = await API.get("/payments/history", { params: { type: "all" } });
        data = res.data;
      }

      if (!data) {
        const res = await API.get(endpoint, {});
        data = res.data;
      }

      let items = pickArray(data);
      if (role === "freelancer" && Array.isArray(items)) {
        items = items.map((t) => ({
          ...t,
          created_at: t.created_at ?? t.createdAt,
          purpose: t.purpose ?? t.source ?? t.title ?? "—",
          project_title: t.project_title ?? t.title,
          reference_id: t.reference?.referenceId ?? t.reference_id,
        }));
      }
      const totalsObj =
        role === "freelancer"
          ? {
              available: data?.balance ?? 0,
              totalAmount: data?.balance ?? 0,
              ...(data?.totals || {}),
            }
          : data?.totals ?? {};

      setRows(items);
      setTotals(totalsObj);
    } catch (e) {
      console.error("Payments fetch failed:", e);
      setRows([]);
      setTotals({});
    } finally {
      setLoading(false);
    }
  }, [endpoint, role]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await load();
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  // options for filters (derived from current data)
  const statusOptions = useMemo(() => {
    const s = new Set(
      rows
        .map((r) => norm(r?.status))
        .filter(Boolean)
        .map((x) => x)
    );
    return ["all", ...Array.from(s)];
  }, [rows]);

  const methodOptions = useMemo(() => {
    const m = new Set(
      rows
        .map((r) => norm(r?.method))
        .filter(Boolean)
        .map((x) => x)
    );
    return ["all", ...Array.from(m)];
  }, [rows]);

  // local filtering
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
        status === "all" || norm(it.status) === status;
      const matchMethod =
        method === "all" || norm(it.method) === method;
      return matchQ && matchStatus && matchMethod;
    });
  }, [rows, q, status, method]);

  const columns = useMemo(() => {
    const fmtDate = (d) => {
      if (!d) return "—";
      try {
        const date = new Date(d);
        // Format: "14 Feb 2026, 5:52 PM" (shorter format)
        return date.toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      } catch {
        return String(d);
      }
    };

    const amountCell = (r) => fmtAmount(r?.amount);

    const cols = [];

    // Add row numbering as first column
    cols.push({
      label: "#",
      key: "_rowNumber",
      width: "w-[60px]",
      align: "center",
      render: (r, index) => <div className="text-center">{index + 1}</div>,
    });

    if (role === "admin") {
      cols.push({
        label: "User",
        key: "user",
        width: "w-auto",
        align: "left",
        render: (r) => r?.user_email || r?.user_name || (r?.user_id != null ? `#${r.user_id}` : "—"),
      });
    }

    cols.push({
      label: "Purpose",
      key: "purpose",
      width: "w-[180px]",
      align: "center",
      render: (r) => {
        const purpose = r?.purpose ?? r?.source ?? r?.title ?? "—";
        return <div className="text-center truncate" title={purpose}>{purpose}</div>;
      },
    });

    cols.push({
      label: "Reference",
      key: "reference",
      width: "w-[140px]",
      align: "center",
      render: (r) => {
        const ref =
          r?.plan_name ??
          r?.project_title ??
          r?.title ??
          (r?.reference_id != null ? `#${r.reference_id}` : r?.reference?.referenceId != null ? `#${r.reference.referenceId}` : "—");
        return <div className="text-center truncate" title={ref}>{ref}</div>;
      },
    });

    cols.push({ 
      label: "Amount", 
      key: "amount", 
      width: "w-[140px]",
      align: "center",
      render: (r) => <div className="text-center font-medium">{amountCell(r)}</div>
    });

    cols.push({
      label: "Status",
      key: "status",
      width: "w-[130px]",
      align: "center",
      render: (r) => <div className="text-center">{r?.status || "—"}</div>,
    });

    cols.push({
      label: "Date",
      key: "created_at",
      width: "w-[190px]",
      align: "center",
      render: (r) => {
        const dateStr = fmtDate(r?.created_at ?? r?.createdAt);
        return <div className="text-center truncate" title={dateStr}>{dateStr}</div>;
      },
    });

    return cols;
  }, [role]);

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

  const heroTitle =
    role === "admin"
      ? "Payments overview"
      : role === "client"
      ? "Billing & invoices"
      : role === "freelancer"
      ? "Earnings & payouts"
      : role === "partner"
      ? "Partner payments"
      : "Payments";

  const heroSubtitle =
    role === "admin"
      ? "Monitor transactions, statuses, and recent activity in one place."
      : role === "client"
      ? "Track your charges and download receipts whenever you need."
      : role === "freelancer"
      ? "See what’s earned, pending, and available — fast and clear."
      : "Track your payment history and transactions.";

  const filters = role === "admin" ? [{ key: "status", label: "Status" }] : [];

  const crudConfig =
    role === "admin"
      ? { showDetails: true, showRowEdit: true, showDelete: true }
      : { showDetails: false, showRowEdit: false, showDelete: false };

  // ====== KPI Computations (works with or without backend totals) ======
  const currency = getCurrency(rows);

  const totalTx = filtered.length;
  const totalAmount = useMemo(() => {
    // prefers totals if present, else sums rows.amount
    if (Number.isFinite(+totals?.totalAmount)) return +totals.totalAmount;
    return filtered.reduce((acc, r) => acc + toNum(r?.amount), 0);
  }, [filtered, totals]);

  const statusCounts = useMemo(() => {
    const paidKeys = ["paid", "success", "succeeded", "completed"];
    const failedKeys = ["failed", "canceled", "cancelled", "refunded", "declined"];

    let paid = 0;
    let failed = 0;

    for (const r of filtered) {
      const s = norm(r?.status);
      if (!s) continue;
      if (paidKeys.includes(s)) paid++;
      else if (failedKeys.includes(s)) failed++;
    }
    return { paid, failed };
  }, [filtered]);

  // freelancer: keep your "available" behavior (from totals if provided)
  const available =
    totals?.available ??
    toNum(totals?.earned) - toNum(totals?.clearing) - toNum(totals?.withdrawn);

  return (
    <div className={UI.page}>
      <div className="space-y-5 sm:space-y-6">
        {/* HERO (dashboard-like) */}
        <div className={UI.violetHero} style={UI.ring}>
          <div className="relative p-4 sm:p-5 lg:p-6">
            <div className="absolute -right-20 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute left-6 -bottom-24 h-56 w-56 rounded-full bg-black/10 blur-2xl" />

            <div className="relative">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/70 font-semibold">
                  {tableTitle}
                </div>
                <h2 className="mt-2 text-[18px] sm:text-[22px] lg:text-[26px] font-extrabold leading-tight text-white">
                  {heroTitle}
                </h2>
                <p className="mt-2 text-[12px] sm:text-sm text-white/80 max-w-xl">
                  {heroSubtitle}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={load}
                    className="h-10 sm:h-11 px-4 rounded-2xl bg-black/80 hover:bg-black text-white text-[13px] sm:text-sm font-semibold inline-flex items-center gap-2"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* KPIs row (StatPill style) */}
<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
  <StatPill
    icon={CreditCard}
    label="Transactions"
    value={loading ? "…" : totalTx}
    tone="orange"
  />

  <StatPill
    icon={DollarSign}
    label="Total amount"
    value={loading ? "…" : fmtAmount(totalAmount)}
    tone="emerald"
  />

  <StatPill
    icon={CheckCircle2}
    label="Paid"
    value={loading ? "…" : statusCounts.paid}
    tone="slate"
  />
</div>

        {/* Freelancer extra: Available card (keeps your meaning) */}
        {role === "freelancer" ? (
          <div className={UI.card} style={UI.ring}>
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-slate-900">
                  Available to withdraw
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Uses backend totals if provided (earned / clearing / withdrawn).
                </div>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                {fmtAmount(available || 0)}
              </div>
            </div>
          </div>
        ) : null}

   

        {/* Table */}
        <div className="w-full min-w-0">
          <PeopleTable
            title={tableTitle}
            addLabel="Add Payment"
            endpoint={endpoint}
            columns={columns}
            filters={filters}
            crudConfig={crudConfig}
            token={token}
          />
        </div>
      </div>
    </div>
  );
}

/* ================= UI bits ================= */
function toneClasses(tone) {
  if (tone === "violet") return "bg-orange-50 border-orange-200/70 text-orange-700";
  if (tone === "emerald") return "bg-emerald-50 border-emerald-200/70 text-emerald-700";
  if (tone === "amber") return "bg-amber-50 border-amber-200/70 text-amber-700";
  return "bg-slate-50 border-slate-200/70 text-slate-700";
}

function KpiCard({ icon, title, value, caption, tone = "slate" }) {
  const toneCls = toneClasses(tone);

  return (
    <div className={UI.card} style={UI.ring}>
      <div className="p-4 sm:p-5 flex items-center gap-4">
        <div className={`shrink-0 w-12 h-12 rounded-[1.1rem] border grid place-items-center ${toneCls}`}>
          <div className="w-7 h-7 rounded-xl bg-white/80 flex items-center justify-center">
            <span className="text-current">{icon}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
            {title}
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 truncate">
            {value}
          </div>
          {caption ? (
            <p className="mt-1 text-xs text-slate-500 leading-snug">
              {caption}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MiniKpi({ icon: Icon, label, value, tone = "white" }) {
  return (
    <div className="rounded-2xl bg-white/12 border border-white/15 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-white/15 border border-white/20 grid place-items-center">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-white/75 truncate">
            {label}
          </div>
          <div className="text-sm font-extrabold text-white truncate">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function Select({ label, options, value, onChange }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="relative">
        <select
          value={value}
          className="appearance-none rounded-2xl pl-3 pr-8 h-11 bg-white text-sm outline-none border border-slate-200/70"
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((x) => (
            <option key={x} value={x}>
              {x === "all" ? "All" : x[0].toUpperCase() + x.slice(1)}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

