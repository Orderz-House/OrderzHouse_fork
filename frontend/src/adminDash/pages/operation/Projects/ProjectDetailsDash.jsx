import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  X,
  Wallet,
  Clock,
  Tag,
  FolderOpen,
  Paperclip,
  MessageSquareText,
  SendHorizontal,
  ClipboardList,
  User,
  TrendingUp,
  Calendar,
} from "lucide-react";


import {
  getProjectByIdApi,
  getProjectFilesApi,
  applyToProjectApi,
  checkIfAssignedApi,
} from "../../../../components/Catigories/api/projects";
import { sendOfferApi, getOffersForProjectApi } from "../../../../components/Catigories/api/offers";

import { useSelector } from "react-redux";
import { useToast } from "../../../../components/toast/ToastProvider";
import AttachmentList from "../../../../components/Attachments/AttachmentList";



const THEME = "#F97316";
const THEME_DARK = "#C2410C";

const cx = (...a) => a.filter(Boolean).join(" ");

function formatDateSafe(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
}

function valueOrDash(v) {
  if (v === null || v === undefined || v === "") return "—";
  return v;
}

function StatusChip({ status }) {
  const s = String(status || "").toLowerCase();
  const tone =
    s.includes("completed") || s.includes("done") || s.includes("finished")
      ? "bg-emerald-50 border-emerald-200/70 text-emerald-700"
      : s.includes("pending") || s.includes("await")
      ? "bg-amber-50 border-amber-200/70 text-amber-700"
      : s.includes("bidding")
      ? "bg-violet-50 border-violet-200/70 text-violet-700"
      : "bg-slate-50 border-slate-200/70 text-slate-700";

  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        tone
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", s ? "" : "opacity-40")} style={{ backgroundColor: THEME }} />
      {status ? String(status) : "—"}
    </span>
  );
}

function StatPill({ icon: Icon, label, value, tone = "slate" }) {
  const toneCls =
    tone === "violet"
      ? "bg-violet-50 border-violet-200/70 text-violet-700"
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
          <div className="text-sm font-extrabold text-slate-900 truncate">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, right }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-slate-200/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {Icon ? (
            <span className="h-9 w-9 rounded-2xl border border-slate-200 bg-slate-50 grid place-items-center shrink-0">
              <Icon className="h-4 w-4 text-slate-700" />
            </span>
          ) : null}
          <h3 className="font-extrabold text-slate-900 truncate">{title}</h3>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function MobileBottomBar({ hidden, acceptLabel, onAccept, onContact, acceptDisabled }) {
  if (hidden) return null;
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/85 backdrop-blur">
      <div className="px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="flex gap-3">
          <button
            onClick={onAccept}
            disabled={acceptDisabled}
            className={
              "flex-1 h-12 rounded-2xl text-white font-semibold transition " +
              (acceptDisabled ? "opacity-40 grayscale cursor-not-allowed" : "active:scale-[0.99]")
            }
            style={{ backgroundColor: THEME }}
          >
            {acceptLabel}
          </button>

          <button
            onClick={onContact}
            className="flex-1 h-12 rounded-2xl border border-slate-300 bg-white text-slate-800 font-semibold transition active:scale-[0.99]"
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard-themed Project Details (same endpoints/logic as old ProjectDetails).
 * Works for:
 * - Marketplace view (freelancer -> Apply / Send offer)
 * - Read-only view from "My Projects" cards (client/freelancer)
 */
export default function ProjectDetailsDashboard({ mode: propMode }) {
  // NOTE: keep compatible with different route param names (id / projectId)
  const params = useParams();
  const id = params?.id ?? params?.projectId;
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [item, setItem] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyModalType, setApplyModalType] = useState("apply");
  const [offerAmount, setOfferAmount] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [offersForProject, setOffersForProject] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);

  // ✅ inferred mode (projects/tasks) — keep compatible with old file
  const inferredMode = useMemo(() => {
    return location.pathname.startsWith("/tasks") ? "tasks" : "projects";
  }, [location.pathname]);
  const mode = propMode || inferredMode;

  const readOnly = !!location.state?.readOnly;
  const roleLabel = location.state?.role || "guest";

  const { userData } = useSelector((s) => s?.auth || {}) || {};
  const roleIdFromRedux =
    userData?.role_id ?? userData?.roleId ?? userData?.role ?? null;

  const roleId =
    (typeof roleIdFromRedux === "number" ? roleIdFromRedux : null) ??
    (typeof window !== "undefined" &&
    /^\d+$/.test(localStorage.getItem("role") || "")
      ? Number(localStorage.getItem("role"))
      : null);

  const isClient = roleId === 2;
  const isFreelancer = roleId === 3;

  const currentUserId =
    userData?.id ??
    userData?.user_id ??
    userData?.userId ??
    Number(localStorage.getItem("userId"));

  // =============================== Fetch Project
  useEffect(() => {
    if (!id) return;
    const stateObj = location.state?.project;
    if (stateObj && String(stateObj.id) === String(id)) {
      setItem(stateObj);
      return;
    }

    getProjectByIdApi(id)
      .then((res) => setItem(res?.task || res?.project || res))
      .catch(() => toast.error("Failed to load details."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // =============================== Files
  useEffect(() => {
    if (!id || mode !== "projects") return;
    getProjectFilesApi(id)
      .then((files) => setProjectFiles(files))
      .catch(() => toast.error("Failed to load project files."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode]);

  // =============================== Applied/Assigned (freelancer)
  useEffect(() => {
    if (!isFreelancer || mode !== "projects" || !id) return;
    (async () => {
      try {
        const isAssigned = await checkIfAssignedApi(id);
        if (isAssigned) setHasApplied(true);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id, isFreelancer, mode]);

  // =============================== Offers (client owner only)
  useEffect(() => {
    if (!item || !isClient || !currentUserId) return;
    if (
      String(item.user_id ?? item.userId ?? item.client_id ?? "") !==
      String(currentUserId)
    )
      return;

    let cancelled = false;

    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const offers = await getOffersForProjectApi(item.id, token);
        if (cancelled) return;

        const normalized = (offers || []).map((o) => ({
          offer_id: o.offer_id ?? o.id,
          freelancer_id: o.freelancer_id,
          freelancer_name:
            (o.first_name || "") + (o.last_name ? ` ${o.last_name}` : "") ||
            o.freelancer_name ||
            o.username ||
            "Freelancer",
          bid_amount: o.bid_amount ?? o.bid_amount,
          proposal: o.proposal || "",
          offer_status: o.offer_status ?? o.status,
          submitted_at: o.submitted_at || o.created_at,
          rating: o.rating ?? null,
          completed_jobs: o.completed_jobs ?? o.completed_count ?? 0,
          avg_delivery_days: o.avg_delivery_days ?? o.avg_delivery_time ?? null,
        }));

        setOffersForProject(normalized);
      } catch (err) {
        console.error("Failed to load offers for project", err);
        try {
          toast.error(
            (err && err.message) || "Failed to load offers for this project."
          );
        } catch {}
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, isClient, currentUserId]);

  // =============================== Handlers
  const onContact = () => navigate(`/chat/project/${id}`);

  // =============================== Guard
  // إذا كان الرابط لا يحتوي على id صحيح
  if (!id) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">Invalid project link</div>
              <div className="text-sm text-slate-500 mt-1">The project id is missing from the URL.</div>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold hover:bg-slate-50"
            >
              Go back
            </button>
          </div>
        </div>
      </section>
    );
  }

  const onApplyToProject = () => {
    if (readOnly) return;
    if (!isFreelancer)
      return toast.error("Only freelancers can apply to projects.");
    if (hasApplied)
      return toast.error("You already applied or are assigned to this project.");
    setApplyModalType(item?.project_type === "bidding" ? "offer" : "apply");
    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first.");
      setShowApplyModal(false);
      return;
    }
    if (busy) return;

    setShowApplyModal(false);
    try {
      setBusy(true);

      let response;
      if (applyModalType === "offer") {
        if (!offerAmount) {
          toast.error("Please enter an offer amount.");
          return;
        }
        response = await sendOfferApi(
          id,
          {
            offer_amount: offerAmount,
            message: "",
            delivery_time: 0,
            cover_letter: "",
          },
          token
        );
      } else {
        response = await applyToProjectApi(id, { proposal: "" }, token);
      }

      toast.success(response?.message || "Application sent successfully!");
      setHasApplied(true);
      setOfferAmount("");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to apply to project.");
    } finally {
      setBusy(false);
    }
  };

  // =============================== Skeleton
  if (!item) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-12 rounded-3xl bg-slate-200 animate-pulse mb-4" />
        <div className="grid lg:grid-cols-[1fr,360px] gap-6">
          <div className="space-y-4">
            <div className="h-[220px] rounded-3xl bg-slate-200 animate-pulse" />
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="h-14 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-14 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-14 rounded-2xl bg-slate-200 animate-pulse sm:col-span-2" />
            </div>
            <div className="h-40 rounded-3xl bg-slate-200 animate-pulse" />
          </div>
          <div className="h-[420px] rounded-3xl bg-slate-200 animate-pulse" />
        </div>
      </section>
    );
  }

  // =============================== Normalized fields
  const title = item.title || "Project";
  const cover = item.cover_pic || item.cover;

  const budget = item?.budget ?? item?.price ?? item?.amount ?? null;
  const projectType = item?.project_type ?? item?.type ?? "—";
  const duration = item?.duration ?? item?.delivery_time ?? item?.days ?? null;
  const category =
    item?.category ?? item?.category_name ?? item?.categoryTitle ?? null;
  const createdAt = item?.created_at ?? item?.createdAt ?? item?.created ?? null;
  const status = item?.completion_status ?? item?.status ?? "—";


  const due = item?.due ?? item?.due_date ?? item?.deadline ?? null;
  const progress = item?.progress ?? item?.progress_percent ?? item?.progress_percentage ?? null;
  const clientName =
    item?.client_name ??
    item?.client ??
    item?.owner ??
    item?.user_name ??
    item?.username ??
    null;
  const freelancerName =
    item?.freelancer_name ??
    item?.assignee ??
    item?.assigned_to ??
    item?.assignedFreelancer ??
    null;
  const offersCount =
    item?.offers_count ??
    item?.offers ??
    item?.offersTotal ??
    null;
  const description = item.description || "No description provided.";
  const shortDesc =
    description.length > 260 ? description.slice(0, 260) + "…" : description;

  // accept label / state (same logic)
  const acceptLabel = isFreelancer
    ? hasApplied
      ? "Already Applied"
      : String(projectType || "").toLowerCase() === "bidding"
      ? "Send Offer"
      : "Apply"
    : "Apply";

  const acceptDisabled =
    readOnly || busy || !isFreelancer || (isFreelancer && hasApplied);

  const isOwnerClient =
    isClient &&
    String(item.user_id ?? item.userId ?? item.client_id ?? "") ===
      String(currentUserId);

  return (
    <section className="relative">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur lg:hidden">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-700"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <p className="text-sm font-extrabold text-slate-900 truncate min-w-0">
            {title}
          </p>

          {readOnly ? (
            <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 shrink-0">
              Read-only
            </span>
          ) : (
            <span className="w-8" />
          )}
        </div>
      </div>

      <div className="mx-auto">
        {/* Hero */}
        <div className="rounded-3xl overflow-hidden">
          <div
            className="relative p-4 sm:p-6 text-white"
            style={{ background: "linear-gradient(135deg,#7C3AED,#6366F1,#8B5CF6)" }}
          >
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute left-8 -bottom-28 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/70 font-semibold">
                    PROJECT
                  </span>
                  {readOnly ? (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/15 border border-white/20">
                      Read-only ({roleLabel})
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-2 text-[20px] sm:text-[26px] lg:text-[30px] font-black tracking-tight leading-tight break-words [overflow-wrap:anywhere]">
                  {title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusChip status={status} />
                  <span className="text-white/80 text-xs">
                    Created: {formatDateSafe(createdAt)}
                  </span>
                </div>

                <p className="mt-3 text-white/85 text-sm max-w-3xl line-clamp-2">
                  {description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-2xl bg-white/15 border border-white/20 px-4 py-3 min-w-[160px]">
                  <div className="text-[11px] text-white/75 font-semibold">
                    Budget
                  </div>
                  <div className="text-xl font-extrabold">
                    {budget !== null ? `$${budget}` : "—"}
                  </div>
                </div>

               
              </div>
            </div>
          </div>

          {/* Cover */}
          <div className="bg-white p-4 sm:p-5">
            {cover ? (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                <div className="w-full max-h-[420px] flex items-center justify-center">
                  <img
                    src={cover}
                    alt={title}
                    className="max-h-[420px] w-auto object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-100 h-[220px] flex items-center justify-center text-slate-400">
                No cover image
              </div>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-6 grid lg:grid-cols-[1fr,360px] gap-6 lg:gap-8">
          {/* Left */}
          <div className="space-y-6 min-w-0">
            {/* KPI pills */}
            <div className="grid gap-3 sm:grid-cols-2">
              <StatPill
                icon={Wallet}
                label="Budget"
                value={budget !== null ? `$${budget}` : "—"}
                tone="orange"
              />
              <StatPill
                icon={Tag}
                label="Type"
                value={valueOrDash(projectType)}
                tone="violet"
              />
              <StatPill
                icon={Clock}
                label="Duration"
                value={duration !== null ? `${duration} day(s)` : "—"}
                tone="amber"
              />
              <StatPill
                icon={Tag}
                label="Category"
                value={valueOrDash(category)}
                tone="slate"
              />
            </div>


            {/* Key details */}
            <SectionCard title="Key details" icon={ClipboardList}>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                    <Calendar className="h-4 w-4" />
                    Due date
                  </div>
                  <div className="mt-1 font-extrabold text-slate-900 break-words [overflow-wrap:anywhere]">
                    {formatDateSafe(due)}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                    <TrendingUp className="h-4 w-4" />
                    Progress
                  </div>
                  <div className="mt-1 font-extrabold text-slate-900">
                    {progress !== null && progress !== undefined ? `${progress}%` : "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                    <User className="h-4 w-4" />
                    Client
                  </div>
                  <div className="mt-1 font-extrabold text-slate-900 break-words [overflow-wrap:anywhere]">
                    {valueOrDash(clientName)}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                    <User className="h-4 w-4" />
                    Freelancer
                  </div>
                  <div className="mt-1 font-extrabold text-slate-900 break-words [overflow-wrap:anywhere]">
                    {valueOrDash(freelancerName)}
                  </div>
                </div>

                <div className="sm:col-span-2 rounded-2xl border border-slate-200/70 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                    <SendHorizontal className="h-4 w-4" />
                    Offers
                  </div>
                  <div className="mt-1 font-extrabold text-slate-900">
                    {offersCount !== null && offersCount !== undefined ? offersCount : "—"}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* About */}
            <SectionCard title="About this project" icon={Tag}>
              <p className="text-slate-700 text-sm sm:text-base leading-6 sm:leading-7 break-words [overflow-wrap:anywhere]">
                {descExpanded ? description : shortDesc}
              </p>

              {description?.length > 260 && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-3 inline-flex items-center text-sm font-semibold hover:opacity-90"
                  style={{ color: THEME_DARK }}
                >
                  {descExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </SectionCard>

            {/* Attachments */}
            {item.attachments ? (
              <SectionCard title="Project Attachments" icon={Paperclip}>
                <AttachmentList attachments={item.attachments} title="" />
              </SectionCard>
            ) : null}

            {projectFiles.length > 0 ? (
              <SectionCard title="Project Files" icon={FolderOpen}>
                <AttachmentList
                  attachments={projectFiles.map((f) => f.file_url)}
                  title=""
                />
              </SectionCard>
            ) : null}

          
          </div>

          {/* Right */}
          <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-500">
                    Status
                  </div>
                  <div className="mt-1">
                    <StatusChip status={status} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500">
                    Created
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">
                    {formatDateSafe(createdAt)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-3">
                  <div className="text-[11px] text-slate-500 font-semibold">
                    Budget
                  </div>
                  <div className="text-base font-extrabold" style={{ color: THEME_DARK }}>
                    {budget !== null ? `$${budget}` : "—"}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-3">
                  <div className="text-[11px] text-slate-500 font-semibold">
                    Type
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 truncate">
                    {valueOrDash(projectType)}
                  </div>
                </div>
                <div className="col-span-2 rounded-2xl bg-slate-50 border border-slate-200/60 p-3">
                  <div className="text-[11px] text-slate-500 font-semibold">
                    Category
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 break-words [overflow-wrap:anywhere]">
                    {valueOrDash(category)}
                  </div>
                </div>
              </div>

          
              {readOnly ? (
                <div className="mt-3 text-[12px] text-slate-500">
                  Read-only mode: actions are disabled.
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5">
              <div className="text-sm font-extrabold text-slate-900">
                Trust & safety
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  Secure checkout
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  Money back guarantee
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  24/7 support
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile action bar: show only for freelancers in interactive mode */}
      <MobileBottomBar
        hidden={readOnly || !isFreelancer}
        acceptLabel={acceptLabel}
        onAccept={onApplyToProject}
        onContact={onContact}
        acceptDisabled={acceptDisabled}
      />

      {/* Apply/Offer Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-[scale-in_0.2s_ease-out]">
            <button
              onClick={() => {
                setShowApplyModal(false);
                setOfferAmount("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                {applyModalType === "offer"
                  ? "Send Your Offer"
                  : "Apply to Project"}
              </h3>

              <p className="text-slate-600 mb-6 text-sm sm:text-base">
                {applyModalType === "offer"
                  ? "Enter your offer amount to get started"
                  : "Are you sure you want to apply to this project?"}
              </p>

              {applyModalType === "offer" && (
                <div className="mb-6">
                  <label className="block text-left text-sm font-medium text-slate-700 mb-2">
                    Offer Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 pl-8 pr-4 border-2 border-slate-200 rounded-xl focus:border-orange-400 focus:outline-none text-lg font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setOfferAmount("");
                  }}
                  className="flex-1 h-12 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApply}
                  className="flex-1 h-12 rounded-xl text-white font-semibold hover:shadow-lg transition"
                  style={{ backgroundColor: THEME }}
                  disabled={busy}
                >
                  {busy
                    ? "Sending..."
                    : applyModalType === "offer"
                    ? "Send Offer"
                    : "Yes, Apply!"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}
