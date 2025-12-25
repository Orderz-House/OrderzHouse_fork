// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Mail,
  Bell,
  ArrowRight,
  ArrowUpRight,
  Plus,
  FolderPlus,
  ClipboardList,
  Wallet,
  CreditCard,
  RefreshCw,
  HelpCircle,
  Clock,
  Activity,
  UserCheck,
  Users,
} from "lucide-react";

// 🧩 API (كما هو عندك)
import {
  fetchAdminDashboard,
  fetchFreelancerDashboard,
  fetchClientDashboard,
} from "../api/dashboard";

/* ===================== Helpers (Role + Base paths) ===================== */
function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  if (roleId === 5) return "partner";
  return "user";
}

function getBasePrefix(pathname) {
  if (pathname.startsWith("/client")) return "/client";
  if (pathname.startsWith("/freelancer")) return "/freelancer";
  if (pathname.startsWith("/apm")) return "/apm";
  if (pathname.startsWith("/partner")) return "/partner";
  return "/admin";
}

function useRoleBase() {
  const location = useLocation();
  return getBasePrefix(location.pathname);
}

/* ===================== UI tokens ===================== */
const UI = {
  pageBg: "bg-slate-50",
  container: "mx-auto w-full max-w-6xl px-4",
  card: "rounded-3xl bg-white border border-slate-100 shadow-sm",
  softCard: "rounded-3xl bg-white/80 backdrop-blur border border-slate-200/70 shadow-sm",
  ring: { border: "1px solid rgba(15,23,42,.10)" },
  violetGrad:
    "bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500",
  chip:
    "rounded-2xl bg-white border border-slate-200/70 shadow-sm",
};

function cx(...x) {
  return x.filter(Boolean).join(" ");
}

function parseNumberLike(v) {
  if (v == null) return null;
  const s = String(v);
  const m = s.replace(/[^\d.]/g, "");
  const n = Number(m);
  return Number.isFinite(n) ? n : null;
}

function InfoTip({ text }) {
  if (!text) return null;
  return (
    <span className="relative inline-flex items-center group">
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-200/70"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
      </button>

      <span
        className="
          pointer-events-none absolute left-1/2 top-0
          -translate-x-1/2 -translate-y-[120%]
          w-[260px] max-w-[75vw]
          rounded-xl bg-slate-900 text-white
          text-[11px] leading-5 px-3 py-2
          opacity-0 scale-95
          group-hover:opacity-100 group-hover:scale-100
          group-focus-within:opacity-100 group-focus-within:scale-100
          transition shadow-[0_18px_40px_rgba(0,0,0,0.35)]
          z-50
        "
        role="tooltip"
      >
        {text}
        <span
          className="
            absolute left-1/2 bottom-[-6px] -translate-x-1/2
            h-0 w-0 border-x-[6px] border-x-transparent
            border-t-[6px] border-t-slate-900
          "
        />
      </span>
    </span>
  );
}

/* ===================== Top bar (مثل الصورة) ===================== */
function DashTopBar({ query, setQuery, userLabel, onInbox }) {
  return (
    <div className={cx(UI.softCard, "px-4 py-3 sm:px-5 sm:py-4")}>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="h-11 w-full rounded-2xl bg-white pl-10 pr-3 text-sm text-slate-800 outline-none"
            style={UI.ring}
          />
        </div>

        {/* Icons */}
        <button
          type="button"
          onClick={onInbox}
          className="hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white hover:bg-slate-50"
          style={UI.ring}
          aria-label="Inbox"
        >
          <Mail className="h-4 w-4 text-slate-500" />
        </button>

        <button
          type="button"
          className="hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white hover:bg-slate-50"
          style={UI.ring}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-slate-500" />
        </button>

        {/* User chip */}
        <div
          className="hidden sm:flex items-center gap-2 rounded-2xl bg-white px-3 h-11"
          style={UI.ring}
          title={userLabel || "User"}
        >
          <div className="h-8 w-8 rounded-2xl bg-slate-100 grid place-items-center">
            <Users className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-sm font-semibold text-slate-800 max-w-[160px] truncate">
            {userLabel || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Hero banner (Join now -> Create project) ===================== */
function HeroBanner({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  onCta,
  rightSlot,
}) {
  return (
    <div className={cx(UI.card, UI.violetGrad, "relative overflow-hidden")}>
      {/* decorations */}
      <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute left-10 bottom-[-80px] h-64 w-64 rounded-full bg-black/10 blur-2xl" />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {eyebrow ? (
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/70 font-semibold">
                {eyebrow}
              </div>
            ) : null}

            <h2 className="mt-2 text-[22px] sm:text-[26px] font-extrabold leading-tight text-white">
              {title}
            </h2>

            {subtitle ? (
              <p className="mt-2 text-sm text-white/80 max-w-xl">
                {subtitle}
              </p>
            ) : null}

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={onCta}
                className="h-11 rounded-2xl bg-black/80 hover:bg-black text-white px-4 text-sm font-semibold inline-flex items-center gap-2"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </button>

              <span className="hidden sm:inline-flex text-xs text-white/70">
                Fast & clear flow
              </span>
            </div>
          </div>

          {rightSlot ? (
            <div className="hidden md:block shrink-0">{rightSlot}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ===================== Mini KPI chips (scroll on mobile) ===================== */
function MiniKpi({ icon: Icon, label, value, tone = "violet" }) {
  const toneBg =
    tone === "orange"
      ? "bg-orange-50 text-orange-700 border-orange-200/70"
      : tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
      : "bg-violet-50 text-violet-700 border-violet-200/70";

  const SafeIcon = typeof Icon === "function" ? Icon : null;

  return (
    <div className={cx(UI.chip, "px-3 py-2.5 min-w-[210px] sm:min-w-0")} style={UI.ring}>
      <div className="flex items-center gap-3">
        <div className={cx("h-9 w-9 rounded-2xl grid place-items-center border", toneBg)}>
          {SafeIcon ? <SafeIcon className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-slate-500 font-semibold truncate">
            {label}
          </div>
          <div className="text-sm font-extrabold text-slate-900 truncate">
            {value ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiRow({ items }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className="mt-4">
      {/* desktop: grid / mobile: horizontal swipe */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((it, i) => (
          <MiniKpi
            key={it?.id || it?.title || i}
            icon={it?.icon}
            label={it?.title || it?.label || "KPI"}
            value={it?.value}
            tone={i % 3 === 0 ? "violet" : i % 3 === 1 ? "orange" : "emerald"}
          />
        ))}
      </div>

      <div className="sm:hidden -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-3 w-max pb-2 snap-x snap-mandatory">
          {list.map((it, i) => (
            <div key={it?.id || it?.title || i} className="snap-start">
              <MiniKpi
                icon={it?.icon}
                label={it?.title || it?.label || "KPI"}
                value={it?.value}
                tone={i % 3 === 0 ? "violet" : i % 3 === 1 ? "orange" : "emerald"}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===================== Continue cards (carousel on mobile) ===================== */
function ContinueCard({ badge, title, metaLeft, metaRight, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cx(UI.card, "text-left overflow-hidden hover:shadow-md transition-shadow")}
      style={UI.ring}
    >
      <div className="h-28 sm:h-32 bg-slate-100 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 via-white to-slate-200 opacity-80" />
        {badge ? (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full bg-white/90 border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
              {badge}
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <div className="text-sm font-extrabold text-slate-900 line-clamp-2">
          {title || "Untitled"}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-500">
          <span className="truncate">{metaLeft || "—"}</span>
          <span className="font-semibold text-slate-800 truncate">
            {metaRight || ""}
          </span>
        </div>
      </div>
    </button>
  );
}

function ContinueSection({ title, rightAction, items, renderItem }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
        {rightAction}
      </div>

      {/* desktop grid */}
      <div className="hidden sm:grid mt-3 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((it, i) => renderItem?.(it, i))}
      </div>

      {/* mobile carousel */}
      <div className="sm:hidden mt-3 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-3 w-max pb-2 snap-x snap-mandatory">
          {list.map((it, i) => (
            <div key={it?.id || it?._id || i} className="w-[260px] snap-start">
              {renderItem?.(it, i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===================== Right column: Statistic + List ===================== */
function RingProgress({ percent = 0, label, subLabel }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;

  return (
    <div className={cx(UI.card, "p-5")} style={UI.ring}>
      <div className="flex items-start justify-between">
        <div className="text-sm font-extrabold text-slate-900">Statistic</div>
        <button type="button" className="text-slate-400 hover:text-slate-600">
          •••
        </button>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div className="relative h-28 w-28">
          <svg viewBox="0 0 100 100" className="h-28 w-28">
            <circle
              cx="50"
              cy="50"
              r={r}
              stroke="rgba(15,23,42,.10)"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r={r}
              stroke="rgba(139,92,246,1)"
              strokeWidth="10"
              fill="none"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>

          <div className="absolute inset-0 grid place-items-center">
            <div className="h-14 w-14 rounded-full bg-slate-100 grid place-items-center">
              <Users className="h-6 w-6 text-slate-500" />
            </div>
          </div>

          <div className="absolute right-0 top-2">
            <span className="inline-flex items-center rounded-full bg-violet-50 text-violet-700 border border-violet-200/70 px-2 py-0.5 text-[10px] font-bold">
              {Math.round(p)}%
            </span>
          </div>
        </div>

        <div className="mt-3 text-sm font-extrabold text-slate-900">
          {label || "Keep going 🚀"}
        </div>
        {subLabel ? (
          <div className="mt-1 text-[11px] text-slate-500 text-center">
            {subLabel}
          </div>
        ) : null}

        {/* tiny bars */}
        <div className="mt-4 w-full">
          <div className="flex items-end justify-between gap-2 h-16">
            {[22, 45, 30, 60, 28].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-xl bg-slate-100 overflow-hidden"
              >
                <div
                  className="w-full rounded-xl bg-violet-400"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-400">
            <span>W1</span>
            <span>W2</span>
            <span>W3</span>
            <span>W4</span>
            <span>W5</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RightListCard({ title, items, onSeeAll, renderRow }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className={cx(UI.card, "p-5")} style={UI.ring}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
        {onSeeAll ? (
          <button
            type="button"
            onClick={onSeeAll}
            className="h-8 w-8 rounded-2xl bg-slate-50 border border-slate-200/70 grid place-items-center hover:bg-slate-100"
          >
            <Plus className="h-4 w-4 text-slate-600" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-[11px] text-slate-500">
            Nothing to show.
          </div>
        ) : (
          list.slice(0, 3).map((it, idx) => (
            <div
              key={it?.id || it?.assignment_id || idx}
              className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-200/70 px-3 py-2.5"
            >
              {renderRow?.(it, idx)}
            </div>
          ))
        )}

        {onSeeAll ? (
          <button
            type="button"
            onClick={onSeeAll}
            className="w-full h-10 rounded-2xl bg-violet-50 text-violet-700 border border-violet-200/70 text-sm font-semibold hover:bg-violet-100"
          >
            See All
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ===================== Skeletons ===================== */
function Sk({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />;
}

function DashboardSkeletonV2() {
  return (
    <div className="space-y-4">
      <div className={cx(UI.softCard, "p-4")}><Sk className="h-11 w-full" /></div>
      <div className={cx(UI.card, "p-6")}><Sk className="h-28 w-full" /></div>
      <div className="grid grid-cols-2 gap-3">
        <Sk className="h-16" /><Sk className="h-16" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Sk className="h-56" /><Sk className="h-56" /><Sk className="h-56" />
      </div>
    </div>
  );
}

/* ===================== Admin (keep old behavior - minimal changes) ===================== */
function AdminDashboard() {
  const navigate = useNavigate();
  const base = useRoleBase();

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
        const payload = await fetchAdminDashboard();

        setTopStats(Array.isArray(payload?.topStats) ? payload.topStats : []);
        setPendingVerifications(
          Array.isArray(payload?.pendingVerifications)
            ? payload.pendingVerifications
            : []
        );
        setRevenuePoints(
          Array.isArray(payload?.revenuePoints) ? payload.revenuePoints : []
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

  // لو تبغى نعمل Admin بنفس ستايل الصورة أيضاً—قلّي، وحأطبّقه بنفس النمط.
  return (
    <div className="space-y-4">
      {error ? (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2">
          {error}
        </div>
      ) : null}

      <div className={cx(UI.card, "p-5")} style={UI.ring}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold text-slate-900">Admin Overview</div>
          <button
            type="button"
            onClick={() => navigate(`${base}/operation/verifications`)}
            className="h-10 px-4 rounded-2xl bg-white border border-slate-200/70 text-sm font-semibold hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4 text-slate-600" />
            Verifications
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(topStats || []).slice(0, 4).map((s, i) => (
            <MiniKpi
              key={s?.id || s?.title || i}
              icon={s?.icon}
              label={s?.title}
              value={s?.value}
              tone={i % 3 === 0 ? "violet" : i % 3 === 1 ? "orange" : "emerald"}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className={cx(UI.card, "p-5 lg:col-span-2")} style={UI.ring}>
            <div className="text-sm font-extrabold text-slate-900">Revenue</div>
            <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200/70 h-36 grid place-items-center text-xs text-slate-400">
              (Chart stays as your existing implementation)
            </div>
          </div>

          <div className={cx(UI.card, "p-5")} style={UI.ring}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-slate-900">Pending</div>
              <span className="text-xs text-slate-500">
                {pendingVerifications.length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {(pendingVerifications || []).slice(0, 3).map((p, idx) => (
                <div
                  key={p?.id || p?.email || idx}
                  className="rounded-2xl bg-slate-50 border border-slate-200/70 px-3 py-2"
                >
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {p?.name || "—"}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {p?.email || p?.role || "—"}
                  </div>
                </div>
              ))}
              {pendingVerifications.length === 0 && (
                <div className="text-[11px] text-slate-500">No pending.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Freelancer (v2 like screenshot) ===================== */
function FreelancerDashboard() {
  const navigate = useNavigate();
  const base = useRoleBase();
  const { userData, user } = useSelector((s) => s.auth || {});
  const userLabel =
    userData?.username ||
    [userData?.first_name, userData?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "Freelancer";

  const [query, setQuery] = useState("");
  const [balanceCards, setBalanceCards] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [latestClientProjects, setLatestClientProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const payload = await fetchFreelancerDashboard();

      setBalanceCards(Array.isArray(payload?.balanceCards) ? payload.balanceCards : []);
      setActiveProjects(Array.isArray(payload?.activeProjects) ? payload.activeProjects : []);
      setLatestClientProjects(
        Array.isArray(payload?.latestClientProjects) ? payload.latestClientProjects : []
      );
    } catch (e) {
      console.error(e);
      setError("حدث خطأ أثناء تحميل بيانات لوحة التحكم.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredActive = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return activeProjects;
    return (activeProjects || []).filter((p) =>
      [p?.title, p?.client, p?.status, p?.due, p?.budget]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" ")
        .includes(q)
    );
  }, [activeProjects, query]);

  // progress percent (best effort): available/total if values exist
  const totalBal = parseNumberLike(balanceCards?.[0]?.value);
  const availBal = parseNumberLike(balanceCards?.[1]?.value);
  const pct =
    totalBal && availBal != null && totalBal > 0
      ? Math.round((availBal / totalBal) * 100)
      : 32;

  const showSkeleton =
    loading &&
    !error &&
    balanceCards.length === 0 &&
    activeProjects.length === 0 &&
    latestClientProjects.length === 0;

  if (showSkeleton) return <DashboardSkeletonV2 />;

  return (
    <div className={cx(UI.pageBg, "py-6")}>
      <div className={UI.container}>
        <div className="space-y-4">
          {/* Top bar */}
          {/* <DashTopBar
            query={query}
            setQuery={setQuery}
            userLabel={userLabel}
            onInbox={() => navigate(`${base}/inbox`)}
          /> */}

          {error ? (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2">
              {error}
            </div>
          ) : null}

          {/* Main grid */}
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* LEFT */}
            <div>
              <HeroBanner
                eyebrow="FREELANCER DASHBOARD"
                title="Manage your work, deliver faster, earn more."
                subtitle="Track active projects and jump into new client opportunities."
                ctaLabel="Browse projects"
                onCta={() => navigate(`${base}/projects`)}
                rightSlot={
                  <button
                    type="button"
                    onClick={load}
                    className="h-11 px-4 rounded-2xl bg-white/15 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold inline-flex items-center gap-2"
                  >
                    <RefreshCw className={cx("h-4 w-4", loading ? "animate-spin" : "")} />
                    Refresh
                  </button>
                }
              />

              {/* KPI row */}
              <KpiRow items={balanceCards} />

              {/* Continue watching = Active projects */}
              <ContinueSection
                title="Continue Working"
                rightAction={
                  <button
                    type="button"
                    onClick={() => navigate(`${base}/projects`)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
                  >
                    See all <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                }
                items={filteredActive}
                renderItem={(p, i) => (
                  <ContinueCard
                    key={p?.id || p?._id || i}
                    badge={p?.status || "Active"}
                    title={p?.title || "Untitled"}
                    metaLeft={(p?.client && `Client: ${p.client}`) || "Client: —"}
                    metaRight={p?.budget || ""}
                    onOpen={() =>
                      p?.id
                        ? navigate(`/project/${p.id}`, {
                            state: { project: p, readOnly: true, role: "freelancer" },
                          })
                        : navigate(`${base}/projects`)
                    }
                  />
                )}
              />
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              <RingProgress
                percent={pct}
                label={`Good morning ${userLabel} 🔥`}
                subLabel="Stay on top of deliveries and deadlines."
              />

              <RightListCard
                title="Latest client projects"
                items={latestClientProjects}
                onSeeAll={() => navigate(`${base}/projects`)}
                renderRow={(p) => (
                  <>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {p?.title || "Project"}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {p?.type || p?.project_type || "—"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (p?.id) {
                          navigate(`${base}/projects/${p.id}`);
                        } else {
                          navigate(`${base}/projects`);
                        }
                      }}
                      className="shrink-0 h-9 px-3 rounded-2xl bg-white border border-slate-200/70 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Open
                    </button>
                  </>
                )}
              />

              <div className={cx(UI.card, "p-5")} style={UI.ring}>
                <div className="text-sm font-extrabold text-slate-900">Quick actions</div>
                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`${base}/projects`)}
                    className="h-11 rounded-2xl bg-white border border-slate-200/70 hover:bg-slate-50 text-sm font-semibold text-slate-800 px-4 flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-violet-600" />
                      View my projects
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`${base}/payments`)}
                    className="h-11 rounded-2xl bg-white border border-slate-200/70 hover:bg-slate-50 text-sm font-semibold text-slate-800 px-4 flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                      Go to payouts
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Client/Partner (v2 like screenshot) ===================== */
function ClientDashboard() {
  const navigate = useNavigate();
  const base = useRoleBase();
  const { userData, user } = useSelector((s) => s.auth || {});
  const userLabel =
    userData?.username ||
    [userData?.first_name, userData?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "Client";

  const [query, setQuery] = useState("");
  const [stats, setStats] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [attention, setAttention] = useState({
    pendingApplications: [],
    pendingReviews: [],
    pendingPayments: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const payload = await fetchClientDashboard();

      setStats(Array.isArray(payload?.stats) ? payload.stats : []);
      setRecentProjects(Array.isArray(payload?.recentProjects) ? payload.recentProjects : []);
      setAttention({
        pendingApplications: Array.isArray(payload?.attention?.pendingApplications)
          ? payload.attention.pendingApplications
          : [],
        pendingReviews: Array.isArray(payload?.attention?.pendingReviews)
          ? payload.attention.pendingReviews
          : [],
        pendingPayments: Array.isArray(payload?.attention?.pendingPayments)
          ? payload.attention.pendingPayments
          : [],
      });
    } catch (e) {
      console.error(e);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRecent = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return recentProjects;
    return (recentProjects || []).filter((p) =>
      [p?.title, p?.status, p?.completion_status, p?.budget]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" ")
        .includes(q)
    );
  }, [recentProjects, query]);

  // best-effort completion percent from stats
  const total =
    parseNumberLike(
      (stats || []).find((s) => String(s?.title || "").toLowerCase().includes("total"))?.value
    ) ?? parseNumberLike((stats || []).find((s) => String(s?.title || "").toLowerCase().includes("project"))?.value);

  const completed =
    parseNumberLike(
      (stats || []).find((s) => String(s?.title || "").toLowerCase().includes("completed"))?.value
    ) ?? null;

  const pct =
    total && completed != null && total > 0 ? Math.round((completed / total) * 100) : 32;

  const showSkeleton =
    loading &&
    !error &&
    stats.length === 0 &&
    recentProjects.length === 0 &&
    !attention.pendingApplications.length &&
    !attention.pendingReviews.length &&
    !attention.pendingPayments.length;

  if (showSkeleton) return <DashboardSkeletonV2 />;

  return (
    <div className={cx(UI.pageBg, "py-6")} dir="ltr">
      <div className={UI.container}>
        <div className="space-y-4">
          {/* Top bar */}
          {/* <DashTopBar
            query={query}
            setQuery={setQuery}
            userLabel={userLabel}
            onInbox={() => navigate(`${base}/inbox`)}
          /> */}

          {error ? (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2">
              {error}
            </div>
          ) : null}

          {/* Main grid */}
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* LEFT */}
            <div>
              <HeroBanner
                eyebrow="CLIENT DASHBOARD"
                title="Create projects, review deliveries, and pay securely."
                subtitle="Everything you need to keep your projects moving—fast."
                ctaLabel="Create project"
                onCta={() => navigate(`${base}/projects/new`)}
                rightSlot={
                  <button
                    type="button"
                    onClick={load}
                    className="h-11 px-4 rounded-2xl bg-white/15 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold inline-flex items-center gap-2"
                  >
                    <RefreshCw className={cx("h-4 w-4", loading ? "animate-spin" : "")} />
                    Refresh
                  </button>
                }
              />

              {/* KPI row (from stats) */}
              <KpiRow items={(stats || []).slice(0, 6)} />

              {/* Continue watching = Recent projects */}
              <ContinueSection
                title="Continue"
                rightAction={
                  <button
                    type="button"
                    onClick={() => navigate(`${base}/projects`)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
                  >
                    See all <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                }
                items={filteredRecent}
                renderItem={(p, i) => (
                  <ContinueCard
                    key={p?.id || p?._id || i}
                    badge={p?.status || p?.completion_status || "Project"}
                    title={p?.title || "Untitled"}
                    metaLeft={
                      (p?.completion_status && `Status: ${p.completion_status}`) ||
                      (p?.status && `Status: ${p.status}`) ||
                      "—"
                    }
                    metaRight={p?.amount_to_pay ?? p?.budget ?? ""}
                    onOpen={() =>
                      p?.id
                        ? navigate(`${base}/projects/${p.id}`)
                        : navigate(`${base}/projects`)
                    }
                  />
                )}
              />
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              <RingProgress
                percent={pct}
                label={`Good morning ${userLabel} 🔥`}
                subLabel="Review deliveries and approve work faster."
              />

              {/* Like "Your mentor" but using your attention data */}
              <RightListCard
                title="Needs your action"
                items={[
                  ...(attention.pendingApplications || []).slice(0, 1).map((x) => ({
                    _type: "applications",
                    title: x.project_title || x.projectTitle || "Applications",
                    meta:
                      (x.freelancer_name || x.freelancerName || "Freelancer") +
                      " • " +
                      (x.assigned_at || x.applied_at || ""),
                  })),
                  ...(attention.pendingReviews || []).slice(0, 1).map((x) => ({
                    _type: "deliveries",
                    title: x.title || "Delivery",
                    meta: x.completion_status || x.completionStatus || x.status || "—",
                  })),
                  ...(attention.pendingPayments || []).slice(0, 1).map((x) => ({
                    _type: "payments",
                    title: x.title || "Payment",
                    meta: x.amount_to_pay ?? x.amountToPay ?? x.budget ?? "—",
                  })),
                ]}
                onSeeAll={() => navigate(`${base}/projects`)}
                renderRow={(it) => (
                  <>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {it?.title || "—"}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {it?.meta || "—"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (it?._type === "payments") navigate(`${base}/payments`);
                        else navigate(`${base}/projects`);
                      }}
                      className="shrink-0 h-9 px-3 rounded-2xl bg-white border border-slate-200/70 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Open
                    </button>
                  </>
                )}
              />

              <div className={cx(UI.card, "p-5")} style={UI.ring}>
                <div className="text-sm font-extrabold text-slate-900">
                  Quick actions
                  <span className="ml-2 align-middle">
                    <InfoTip text="Shortcuts to keep things moving." />
                  </span>
                </div>

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`${base}/projects/new`)}
                    className="h-11 rounded-2xl bg-white border border-slate-200/70 hover:bg-slate-50 text-sm font-semibold text-slate-800 px-4 flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FolderPlus className="h-4 w-4 text-violet-600" />
                      Post a new project
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`${base}/projects`)}
                    className="h-11 rounded-2xl bg-white border border-slate-200/70 hover:bg-slate-50 text-sm font-semibold text-slate-800 px-4 flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-orange-600" />
                      Go to my projects
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`${base}/payments`)}
                    className="h-11 rounded-2xl bg-white border border-slate-200/70 hover:bg-slate-50 text-sm font-semibold text-slate-800 px-4 flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-600" />
                      Payments
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* (اختياري) مساحة تحت مثل "Your lesson" لو تبغى نضيف جدول/قائمة */}
        </div>
      </div>
    </div>
  );
}

/* ===================== Main exported component ===================== */
export default function Dashboard() {
  const { userData, roleId: storeRoleId } = useSelector((s) => s.auth || {});
  const outletCtx = useOutletContext() || {};
  const { clearTopBarRight } = outletCtx;

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
  if (role === "client" || role === "partner") return <ClientDashboard />;
  return <AdminDashboard />;
}
