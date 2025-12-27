import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import {
  getProjectByIdApi,
  getProjectFilesApi,
  applyToProjectApi,
  checkIfAssignedApi,
} from "./api/projects";
import {
  sendOfferApi,
  getOffersForProjectApi,
  checkMyPendingOfferApi,
} from "./api/offers";
import { useSelector } from "react-redux";

import { useToast } from "../../components/toast/ToastProvider";
import AttachmentList from "../Attachments/AttachmentList";
import ProjectInfoCard from "./ProjectInfoCard";
import OffersReceived from "../OffersReceived";

const THEME = "#F97316";
const THEME_DARK = "#C2410C";

// ✅ أصغر على الموبايل + أكبر على الشاشات
const COVER_HEIGHT = "h-[210px] sm:h-[260px] lg:h-[360px]";

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

function MobileSummaryCard({ item }) {
  const budget = item?.budget ?? item?.price ?? item?.amount ?? null;
  const projectType = item?.project_type ?? item?.type ?? "—";
  const duration = item?.duration ?? item?.delivery_time ?? item?.days ?? null;
  const category =
    item?.category ?? item?.category_name ?? item?.categoryTitle ?? null;
  const createdAt =
    item?.created_at ?? item?.createdAt ?? item?.created ?? null;

  return (
    <div className="lg:hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">Budget</p>
          <p className="text-xl font-extrabold" style={{ color: THEME_DARK }}>
            {budget !== null ? `$${budget}` : "—"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Type</p>
          <p className="text-sm font-semibold text-slate-800">
            {valueOrDash(projectType)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Duration</p>
          <p className="font-semibold text-slate-800">
            {duration !== null ? `${duration} day(s)` : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Created</p>
          <p className="font-semibold text-slate-800">
            {formatDateSafe(createdAt)}
          </p>
        </div>

        <div className="col-span-2 rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Category</p>
          <p className="font-semibold text-slate-800">
            {valueOrDash(category)}
          </p>
        </div>
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
  );
}

function MobileBottomBar({
  hidden,
  acceptLabel,
  contactLabel,
  onAccept,
  onContact,
  acceptDisabled,
}) {
  if (hidden) return null;
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur">
      <div className="px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="flex gap-3">
          <button
            onClick={onAccept}
            disabled={acceptDisabled}
            className={
              "flex-1 h-12 rounded-2xl text-white font-semibold transition " +
              (acceptDisabled
                ? "opacity-40 grayscale cursor-not-allowed"
                : "active:scale-[0.99]")
            }
            style={{ backgroundColor: THEME }}
          >
            {acceptLabel}
          </button>

          <button
            onClick={onContact}
            className="flex-1 h-12 rounded-2xl border border-slate-300 bg-white text-slate-800 font-semibold transition active:scale-[0.99]"
          >
            {contactLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetails({ mode: propMode }) {
  const { id } = useParams();
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

  const paymentInputRef = useRef(null);

  // ✅ إصلاح inferredMode (كان مفقود)
  const inferredMode = useMemo(() => {
    // لو عندك tasks فعلاً، عدّلها كما تريد
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

  // =============================== Fetch Project
  useEffect(() => {
    const stateObj = location.state?.project;
    if (stateObj && String(stateObj.id) === String(id)) {
      setItem(stateObj);
      return;
    }

    // ✅ إصلاح loader (كان غير معرّف)
    const loader = getProjectByIdApi;

    loader(id)
      .then((res) => setItem(res?.task || res?.project || res))
      .catch(() => toast.error("Failed to load details."));
  }, [id, location.state, toast]);

  // =============================== Files
  useEffect(() => {
    if (!id || mode !== "projects") return;
    getProjectFilesApi(id)
      .then((files) => setProjectFiles(files))
      .catch(() => toast.error("Failed to load project files."));
  }, [id, mode, toast]);

  // =============================== Applied/Assigned
 useEffect(() => {
  if (!isFreelancer || mode !== "projects" || !id) return;

  (async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const projectType = item?.project_type ?? item?.type;

      if (projectType === "bidding") {
        const r = await checkMyPendingOfferApi(id, token); // endpoint الجديد
        setHasApplied(!!r?.hasPendingOffer); // مهم: true/false
      } else {
        const isAssigned = await checkIfAssignedApi(id);
        setHasApplied(!!isAssigned); // مهم: true/false
      }
    } catch (e) {
      console.error(e);
    }
  })();
}, [id, isFreelancer, mode, item]);


  // =============================== Offers
  const currentUserId =
    userData?.id ??
    userData?.user_id ??
    userData?.userId ??
    Number(localStorage.getItem("userId"));

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
  }, [item, isClient, currentUserId, toast]);

  // =============================== Handlers
  const onApplyToProject = () => {
    if (!isFreelancer)
      return toast.error("Only freelancers can apply to projects.");
    if (hasApplied)
      return toast.error(
        "You already applied or are assigned to this project."
      );
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

  // ✅ إصلاح onContact (كان غير معرّف)
  const onContact = () => {
    navigate(`/chat/project/${id}`);
  };

  // =============================== Skeleton
  if (!item) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-6 w-32 rounded bg-slate-200 animate-pulse mb-6" />
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          <div>
            <div
              className={`w-full ${COVER_HEIGHT} rounded-2xl bg-slate-200 animate-pulse mb-4`}
            />
            <div className="mt-6 space-y-3">
              <div className="h-5 w-1/2 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <aside className="h-[420px] rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
          </aside>
        </div>
      </section>
    );
  }

  // =============================== UI Computations
  const title = item.title || "Project";
  const cover = item.cover_pic || item.cover;
  const projectType = item?.project_type ?? item?.type;

  let canAccept = true;
  if (isFreelancer && hasApplied) canAccept = false;

  // ✅ إصلاح acceptLabel (كان غير معرّف)
  const acceptLabel = isFreelancer
    ? hasApplied
      ? "Already Applied"
      : projectType === "bidding"
      ? "Send Offer"
      : "Apply"
    : "Apply";

  const acceptClasses =
    "w-full h-11 rounded-xl text-white font-semibold transition " +
    (canAccept
      ? "hover:shadow-lg"
      : "opacity-40 grayscale cursor-not-allowed hover:shadow-none");

  

  const description = item.description || "No description provided.";
  const shortDesc =
    description.length > 260 ? description.slice(0, 260) + "…" : description;

  // =============================== Render
  return (
    <section className="relative bg-white">


      {/* ✅ App Bar للموبايل */}
      <div className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur lg:hidden">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <p className="text-sm font-extrabold text-slate-900 truncate max-w-[70%]">
            {title}
          </p>

          {readOnly ? (
            <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">
              Read-only
            </span>
          ) : (
            <span className="w-8" />
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 lg:py-8">
        {/* Header للديسكتوب */}
       {/* Header للديسكتوب */}
<header className="mb-6 hidden lg:grid lg:grid-cols-[1fr,600px] lg:gap-10 lg:items-start">
  <h1
    className="min-w-0 text-3xl md:text-4xl font-black tracking-tight leading-tight break-all"
    style={{ color: THEME_DARK }}
  >
    {title}
  </h1>

  <div className="flex justify-end">
    {readOnly && (
      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
        Read-only ({roleLabel})
      </span>
    )}
  </div>
</header>

        <div className="grid lg:grid-cols-[1fr,380px] gap-6 lg:gap-10">
          {/* Main */}
          <div className="space-y-4">
            {/* Cover */}
            {cover ? (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <div
                  className={`w-full ${COVER_HEIGHT} bg-slate-50 flex items-center justify-center`}
                >
                  <img
                    src={cover}
                    alt={title}
                    className="max-h-full w-auto object-contain"
                  />
                </div>
              </div>
            ) : (
              <div
                className={`w-full ${COVER_HEIGHT} rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400`}
              >
                No cover image
              </div>
            )}

            {/* ✅ Summary Card للموبايل */}
            <MobileSummaryCard item={item} />

            {/* About */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
  <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
    About this project
  </h2>

  <p className="text-slate-700 text-sm sm:text-base leading-6 sm:leading-7 break-words [overflow-wrap:anywhere]">
    {descExpanded ? description : shortDesc}
  </p>

  {description?.length > 260 && (
    <button
      type="button"
      onClick={() => setDescExpanded((v) => !v)}
      className="mt-3 inline-flex items-center text-sm font-semibold text-orange-700 hover:text-orange-800"
    >
      {descExpanded ? "Show less" : "Read more"}
    </button>
  )}
</div>


            {/* Attachments */}
            {item.attachments && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                <AttachmentList
                  attachments={item.attachments}
                  title="Project Attachments"
                />
              </div>
            )}

            {projectFiles.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                <AttachmentList
                  attachments={projectFiles.map((f) => f.file_url)}
                  title="Project Files"
                />
              </div>
            )}

            {/* Back link للديسكتوب */}
            <button
              onClick={() => navigate(-1)}
              className="hidden lg:inline-flex items-center gap-2 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>

          {/* Aside للديسكتوب فقط */}
          <aside className="hidden lg:block lg:sticky lg:top-24">
            <ProjectInfoCard
              item={item}
              isTasks={mode === "tasks"}
              isClient={isClient}
              isFreelancer={isFreelancer}
              busy={busy}
              onContact={onContact}
              onApplyToProject={isFreelancer ? onApplyToProject : undefined}
              acceptLabel={acceptLabel}
              contactLabel="Contact"
              acceptClasses={acceptClasses}
              // لو عندك payment فعلاً داخل ProjectInfoCard اتركها، وإلا احذفها من ProjectInfoCard نفسه
              triggerPaymentUpload={() => paymentInputRef.current?.click()}
              onPaymentSelected={() => {}}
              refs={{ paymentInputRef }}
            />
          </aside>
        </div>

        {/* Offers */}
        {isClient &&
          String(item.user_id ?? item.userId ?? item.client_id ?? "") ===
            String(currentUserId) && (
            <OffersReceived
              item={item}
              offersForProject={offersForProject}
              setOffersForProject={setOffersForProject}
            />
          )}
      </div>

      {/* ✅ Bottom Action Bar للموبايل */}
      <MobileBottomBar
        hidden={readOnly}
        acceptLabel={acceptLabel}
        contactLabel="Contact"
        onAccept={onApplyToProject}
        onContact={onContact}
        acceptDisabled={!canAccept || busy || !isFreelancer}
      />

      {/* Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-[scale-in_0.2s_ease-out]">
            <button
              onClick={() => {
                setShowApplyModal(false);
                setOfferAmount("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
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

      {/* ✅ إصلاح الـ style (كان ناقص قوس) */}
      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}
