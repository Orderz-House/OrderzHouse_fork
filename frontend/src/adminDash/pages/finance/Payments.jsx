import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import API from "../../api/axios.js";
import { RefreshCcw, CreditCard, DollarSign, CheckCircle2, Wallet } from "lucide-react";

/* ---------- theme (OrderzHouse – keep) ---------- */
const T = {
  primary: "#028090",
  orange: "#ea580c",
  orangeLight: "#fed7aa",
  orangeBg: "rgba(234, 88, 12, 0.08)",
  surface: "rgba(255,255,255,.82)",
  ring: "rgba(15,23,42,.06)",
};

/* ---------- helpers ---------- */
const mapRole = (roleId) => {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  if (roleId === 5) return "partner";
  return "user";
};

const fmtAmount = (n) => {
  const num = Number.isFinite(+n) ? +n : 0;
  const formatted = num % 1 === 0 ? num.toString() : num.toFixed(2);
  return `${formatted} JD`;
};

function pickArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.payments)) return data.payments;
  const nested = Object.values(data || {}).find(Array.isArray);
  return nested || [];
}

const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const getCurrency = (rows) => rows?.find((r) => r?.currency)?.currency || "JD";
const norm = (v) => String(v ?? "").toLowerCase();
const cx = (...a) => a.filter(Boolean).join(" ");

/**
 * Amount display by viewer role: freelancer = recipient (incoming), client = payer (outgoing).
 * No API change: derived from role + transaction purpose/source/type.
 */
function getAmountDisplay(item, role) {
  const status = norm(item?.status ?? "");
  const type = norm(item?.type ?? "");
  const source = norm(item?.source ?? "");
  const purpose = norm(item?.purpose ?? "");
  const isPaid = status === "paid" || status === "success" || status === "succeeded" || status === "completed";

  if (role === "freelancer") {
    const isIncoming = isPaid || type === "credit" || source === "wallet";
    return { prefix: isIncoming ? "+" : "", isIncoming: !!isIncoming };
  }
  if (role === "client") {
    const isRefundOrCredit = type === "credit" || type === "refund" || purpose === "refund" || source === "refund";
    const isIncoming = isRefundOrCredit;
    return { prefix: isIncoming ? "+" : "-", isIncoming: !!isIncoming };
  }
  return { prefix: "", isIncoming: false };
}

function fmtDate(d) {
  if (!d) return "—";
  try {
    const date = new Date(d);
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
}

/* ---------- UI: Balance Hero (same gradient as "My assigned projects" – AdminProjects) ---------- */
function BalanceHero({ title, balanceFormatted, subtitle, onRefresh, loading }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-sm"
      style={{
        background: "linear-gradient(135deg, #F7933F 0%, #F56A45 55%, #F34A4A 100%)",
      }}
    >
      <div className="relative px-5 py-4 sm:px-6 sm:py-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-white/80">
              {title}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {loading ? "…" : balanceFormatted}
            </p>
            <p className="mt-0.5 text-sm text-white/80">{subtitle}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
              <span className="text-xs text-white/70">Today</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="shrink-0 rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-white/30 hover:border-white/40"
          >
            <RefreshCcw className="inline h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI: Summary stat (compact on mobile, full on sm+) ---------- */
function SummaryStat({ icon: Icon, label, value }) {
  return (
    <div
      className="min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm sm:rounded-2xl sm:px-4 sm:py-3.5 px-2.5 py-2.5"
      style={{ borderColor: T.ring }}
    >
      {/* Mobile: vertical compact layout */}
      <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 sm:h-9 sm:w-9 sm:rounded-xl"
          style={{ backgroundColor: T.orangeBg }}
        >
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: T.orange }} />
        </div>
        <div className="min-w-0 w-full sm:w-auto">
          <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-[11px]">
            {label}
          </p>
          <p
            className="mt-0.5 truncate text-sm font-semibold text-slate-900 sm:mt-0.5 sm:text-base"
            title={typeof value === "string" ? value : String(value)}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI: Filter pills (same theme) ---------- */
function FilterPills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = norm(opt) === norm(value);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              isActive
                ? "border text-orange-700"
                : "border bg-white text-slate-600 hover:bg-slate-50"
            )}
            style={
              isActive
                ? { backgroundColor: T.orangeLight, borderColor: "rgba(234, 88, 12, 0.25)" }
                : { borderColor: T.ring }
            }
          >
            {opt === "all" ? "All" : opt === "plan" ? "Subscriptions" : opt === "project" ? "Projects" : opt === "wallet" ? "Wallet" : opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- UI: Transaction row (for desktop table) ---------- */
function TransactionRow({ item, fmtAmount, role }) {
  const purpose = item?.purpose ?? item?.source ?? item?.title ?? "—";
  const refLabel =
    item?.plan_name ?? item?.project_title ?? item?.title ?? (item?.reference_id != null ? `#${item.reference_id}` : "—");
  const status = item?.status ?? "—";
  const amount = item?.amount ?? 0;
  const dateStr = fmtDate(item?.created_at ?? item?.createdAt ?? item?.date);
  const { prefix, isIncoming } = getAmountDisplay(item, role);

  const amountClass =
    role === "client" && !isIncoming
      ? "text-slate-700"
      : isIncoming
      ? "text-emerald-600"
      : "text-slate-800";
  const statusBadgeClass =
    norm(status) === "paid"
      ? role === "client" && !isIncoming
        ? "bg-slate-100 text-slate-600"
        : "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-600";

  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50/50">
      <td className="py-3 pl-4 pr-2 text-left">
        <p className="font-medium text-slate-900">{purpose}</p>
        <p className="text-xs text-slate-400">{refLabel}</p>
      </td>
      <td className="py-3 px-2 text-left text-sm text-slate-500">{dateStr}</td>
      <td className="py-3 px-2 text-right">
        <span className={cx("font-semibold", amountClass)}>
          {prefix}
          {fmtAmount(amount)}
        </span>
      </td>
      <td className="py-3 pl-2 pr-4 text-right">
        <span className={cx("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", statusBadgeClass)}>
          {status}
        </span>
      </td>
    </tr>
  );
}

/* ---------- UI: Transaction card (mobile) ---------- */
function TransactionCard({ item, fmtAmount, role }) {
  const purpose = item?.purpose ?? item?.source ?? item?.title ?? "—";
  const refLabel =
    item?.plan_name ?? item?.project_title ?? item?.title ?? (item?.reference_id != null ? `#${item.reference_id}` : "—");
  const status = item?.status ?? "—";
  const amount = item?.amount ?? 0;
  const dateStr = fmtDate(item?.created_at ?? item?.createdAt ?? item?.date);
  const { prefix, isIncoming } = getAmountDisplay(item, role);

  const amountClass =
    role === "client" && !isIncoming
      ? "text-slate-700"
      : isIncoming
      ? "text-emerald-600"
      : "text-slate-800";
  const statusBadgeClass =
    norm(status) === "paid"
      ? role === "client" && !isIncoming
        ? "bg-slate-100 text-slate-600"
        : "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div
      className="flex items-center gap-3 rounded-xl border bg-white p-3.5 shadow-sm transition hover:shadow"
      style={{ borderColor: T.ring }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600"
        style={{ backgroundColor: T.orangeBg }}
      >
        <Wallet className="h-5 w-5" style={{ color: T.orange }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{purpose}</p>
        <p className="truncate text-xs text-slate-500">{refLabel}</p>
        <p className="mt-0.5 text-xs text-slate-400">{dateStr}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cx("text-base font-semibold", amountClass)}>
          {prefix}
          {fmtAmount(amount)}
        </p>
        <span className={cx("mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", statusBadgeClass)}>
          {status}
        </span>
      </div>
    </div>
  );
}

/* ---------- UI: Available to withdraw (same theme, refined) ---------- */


/* =========================================================
   Payments Page – same logic, refined UI (same theme, cleaner)
   ========================================================= */
export default function Payments() {
  const { userData, user, token } = useSelector((s) => s.auth);
  const roleId =
    userData?.role_id ?? user?.role_id ?? userData?.roleId ?? user?.roleId ?? userData?.role ?? user?.role;
  const role = mapRole(roleId);
  const userId = userData?.id ?? user?.id ?? userData?.user_id ?? user?.user_id ?? null;

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
  const [typeFilter, setTypeFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (role === "freelancer") {
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
              available: Number(data?.availableToWithdraw ?? data?.balance ?? data?.totals?.available ?? 0),
              totalAmount: Number(data?.totalAmount ?? data?.balance ?? data?.totals?.totalAmount ?? 0),
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

  const statusOptions = useMemo(() => {
    const s = new Set(rows.map((r) => norm(r?.status)).filter(Boolean).map((x) => x));
    return ["all", ...Array.from(s)];
  }, [rows]);

  const typePillOptions = useMemo(() => {
    const types = new Set(rows.map((r) => r?.source ?? r?.purpose).filter(Boolean).map((x) => norm(x)));
    const order = ["all", "wallet", "project", "plan"];
    const out = ["all"];
    order.forEach((t) => {
      if (t !== "all" && types.has(t)) out.push(t);
    });
    types.forEach((t) => {
      if (!out.includes(t)) out.push(t);
    });
    return out.length > 1 ? out : ["all"];
  }, [rows]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((it) => {
      const matchQ = !t || Object.values(it).some((v) => String(v ?? "").toLowerCase().includes(t));
      const matchStatus = status === "all" || norm(it.status) === status;
      const matchMethod = method === "all" || norm(it.method) === method;
      const matchType = typeFilter === "all" || norm(it?.source ?? it?.purpose ?? "") === typeFilter;
      return matchQ && matchStatus && matchMethod && matchType;
    });
  }, [rows, q, status, method, typeFilter]);

  const currency = getCurrency(rows);
  const totalTx = filtered.length;
  const totalAmount = useMemo(() => {
    if (Number.isFinite(+totals?.totalAmount)) return +totals.totalAmount;
    return filtered.reduce((acc, r) => acc + toNum(r?.amount), 0);
  }, [filtered, totals]);

  const statusCounts = useMemo(() => {
    const paidKeys = ["paid", "success", "succeeded", "completed"];
    let paid = 0;
    for (const r of filtered) {
      const s = norm(r?.status);
      if (paidKeys.includes(s)) paid++;
    }
    return { paid };
  }, [filtered]);

  const available =
    totals?.available ?? toNum(totals?.earned) - toNum(totals?.clearing) - toNum(totals?.withdrawn);

  const pageTitle =
    role === "admin" ? "Payments" : role === "client" ? "Billing" : role === "freelancer" ? "Payments" : "Payments";

  const heroSubtitle = role === "freelancer" ? "Available balance" : "Balance overview";

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="mx-auto space-y-5">
        {/* 1) Hero – same theme, simpler & less tall */}
        <BalanceHero
          title={pageTitle}
          balanceFormatted={
            role === "freelancer" ? fmtAmount(available ?? 0) : fmtAmount(totalAmount)
          }
          subtitle={heroSubtitle}
          onRefresh={load}
          loading={loading}
        />

        {/* 2) Summary cards – 3 in a row on all sizes; compact on mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <SummaryStat
            icon={CreditCard}
            label="Transactions"
            value={loading ? "…" : totalTx}
          />
          <SummaryStat
            icon={DollarSign}
            label="Total amount"
            value={loading ? "…" : fmtAmount(totalAmount)}
          />
          <SummaryStat
            icon={CheckCircle2}
            label="Paid"
            value={loading ? "…" : statusCounts.paid}
          />
        </div>

      

        {/* 4) Filter pills */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Filter
          </p>
          <FilterPills
            options={typePillOptions.length > 1 ? typePillOptions : statusOptions}
            value={typePillOptions.length > 1 ? typeFilter : status}
            onChange={typePillOptions.length > 1 ? setTypeFilter : setStatus}
          />
        </div>

        {/* 5) Transactions – table on desktop, cards on mobile */}
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-800">Transaction log</p>
          {loading ? (
            <div className="flex justify-center py-10">
              <div
                className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: T.orangeBg, borderTopColor: T.orange }}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="rounded-2xl border bg-white py-10 text-center shadow-sm"
              style={{ borderColor: T.ring }}
            >
              <p className="text-slate-500">No transactions yet</p>
              <p className="mt-0.5 text-sm text-slate-400">
                Your balance and transactions will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop: light table */}
              <div className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm md:block" style={{ borderColor: T.ring }}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-50/80" style={{ borderColor: T.ring }}>
                      <th className="py-2.5 pl-4 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Description
                      </th>
                      <th className="py-2.5 px-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                      <th className="py-2.5 px-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Amount
                      </th>
                      <th className="py-2.5 pl-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, index) => (
                      <TransactionRow
                        key={item?.id ?? index}
                        item={item}
                        fmtAmount={fmtAmount}
                        role={role}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile: cards */}
              <div className="space-y-2.5 md:hidden">
                {filtered.map((item, index) => (
                  <TransactionCard
                    key={item?.id ?? index}
                    item={item}
                    fmtAmount={fmtAmount}
                    role={role}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
