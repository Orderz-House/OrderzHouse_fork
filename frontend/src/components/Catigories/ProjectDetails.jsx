import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, X } from "lucide-react";
import {
  getProjectByIdApi,
  getProjectFilesApi,
  applyToProjectApi,
  checkIfAssignedApi,
} from "./api/projects";
import { sendOfferApi, getOffersForProjectApi } from "./api/offers";
import { getTaskByIdApi, submitPaymentProofApi } from "./api/tasks";
import { useSelector } from "react-redux";
import { useToast } from "../../components/toast/ToastProvider";
import AttachmentList from "../Attachments/AttachmentList";
import ProjectInfoCard from "./ProjectInfoCard";
import axios from "axios";

const THEME = "#028090";
const THEME_DARK = "#05668D";

const COVER_HEIGHT = "h-[360px]";

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

  const paymentInputRef = useRef(null);

  const inferredMode = location.pathname.startsWith("/tasks") ? "tasks" : "projects";
  const mode = propMode || inferredMode;

  const readOnly = !!location.state?.readOnly;
  const roleLabel = location.state?.role || "guest";
  const { userData } = useSelector((s) => s?.auth || {}) || {};

  const roleIdFromRedux = userData?.role_id ?? userData?.roleId ?? userData?.role ?? null;
  const roleId =
    (typeof roleIdFromRedux === "number" ? roleIdFromRedux : null) ??
    (typeof window !== "undefined" && /^\d+$/.test(localStorage.getItem("role") || "")
      ? Number(localStorage.getItem("role"))
      : null);

  const isClient = roleId === 2;
  const isFreelancer = roleId === 3;

  // =============================== Fetch Project/Task
  useEffect(() => {
    const stateObj = location.state?.project;
    if (stateObj && String(stateObj.id) === String(id)) {
      setItem(stateObj);
      return;
    }
    const loader = mode === "tasks" ? getTaskByIdApi : getProjectByIdApi;
    loader(id)
      .then((res) => setItem(res.task || res.project || res))
      .catch(() => toast.error("Failed to load details."));
  }, [id, location.state, mode]);

  // =============================== Files
  useEffect(() => {
    if (!id || mode !== "projects") return;
    getProjectFilesApi(id)
      .then((files) => setProjectFiles(files))
      .catch(() => toast.error("Failed to load project files."));
  }, [id, mode]);

  // =============================== Applied/Assigned
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

  // =============================== Offers
  // determine current logged-in user id
  const currentUserId = userData?.id ?? userData?.user_id ?? userData?.userId ?? Number(localStorage.getItem("userId"));

  useEffect(() => {
    console.debug("[ProjectDetails] fetching offers for project...");
    // only fetch offers for the project if current user is the project owner (client)
    if (!item || !isClient || !currentUserId) {
      console.debug("[ProjectDetails] skipping offers fetch - missing requirements", { item: !!item, isClient, currentUserId });
      return;
    }
    if (String(item.user_id ?? item.userId ?? item.client_id ?? "") !== String(currentUserId)) {
      console.debug("[ProjectDetails] skipping offers fetch - not project owner");
      return;
    }
    let cancelled = false;

    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.debug("[ProjectDetails] skipping offers fetch - no token");
        return;
      }
      try {
        console.debug("[ProjectDetails] calling getOffersForProjectApi with projectId:", item.id);
        // fetch offers specifically for this project (backend joins freelancer stats)
        const offers = await getOffersForProjectApi(item.id, token);
        console.debug("[ProjectDetails] offersForProject api returned:", offers);
        if (cancelled) return;

        // map incoming rows into consistent shape for display
        const normalized = (offers || []).map((o) => ({
          offer_id: o.offer_id ?? o.id,
          freelancer_id: o.freelancer_id,
          freelancer_name: (o.first_name || "") + (o.last_name ? ` ${o.last_name}` : "") || o.freelancer_name || o.username || "Freelancer",
          bid_amount: o.bid_amount ?? o.bid_amount,
          proposal: o.proposal || "",
          offer_status: o.offer_status ?? o.status,
          submitted_at: o.submitted_at || o.created_at,
          rating: o.rating ?? null,
          completed_jobs: o.completed_jobs ?? o.completed_count ?? 0,
          avg_delivery_days: o.avg_delivery_days ?? o.avg_delivery_time ?? null,
        }));

        console.debug("[ProjectDetails] normalized offers:", normalized);
        setOffersForProject(normalized);
      } catch (err) {
        console.error("Failed to load offers for project", err);
        console.debug("[ProjectDetails] getOffersForProjectApi error:", err?.response?.data || err.message || err);
        try {
          toast.error((err && err.message) || "Failed to load offers for this project.");
        } catch {}
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [item, isClient, currentUserId, toast]);

  // =============================== Handlers
  const onApplyToProject = () => {
    if (mode === "tasks") return toast.error("This is only for projects.");
    if (!isFreelancer) return toast.error("Only freelancers can apply to projects.");
    if (hasApplied) return toast.error("You already applied or are assigned to this project.");
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
            message: "",           // IMPORTANT: backend expects "message" here
            delivery_time: 0,      // optional but prevents backend errors
            cover_letter: ""       // optional but prevents backend errors
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

  const onContact = () => {
    if (mode === "tasks") navigate(`/chat/task/${id}`);
    else navigate(`/chat/project/${id}`);
  };

  const triggerPaymentUpload = () => paymentInputRef.current?.click();

  const onPaymentSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isClient) return toast.error("Only clients can upload payment proofs.");
    if (busy) return;
    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("file", file);
      await submitPaymentProofApi(id, fd);
      toast.success("Payment proof submitted. Awaiting admin confirmation.");
    } catch {
      toast.error("Failed to submit payment proof.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  // =============================== Skeleton
  if (!item) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-6 w-32 rounded bg-slate-200 animate-pulse mb-6" />
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          <div>
            <div className={`w-full ${COVER_HEIGHT} rounded-2xl bg-slate-200 animate-pulse mb-4`} />
            <div className="mt-8 space-y-3">
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

  // =============================== UI
  /* ===============================
     🎨 UI Computations
  =============================== */
  const title = item.title;
  const cover = item.cover_pic || item.cover;
  const projectType = item?.project_type ?? item?.type;
  const isTasks = mode === "tasks";

  let canAccept = true;
  if (isTasks && isFreelancer) canAccept = false;
  if (!isTasks && isClient) canAccept = false;
  if (isFreelancer && hasApplied) canAccept = false;

  const acceptLabel = hasApplied
    ? "Already Applied"
    : !isTasks && isFreelancer && projectType === "bidding"
    ? "Send Offer"
    : isTasks
    ? "Get this task"
    : "Apply to Project";

  const acceptClasses =
    "w-full h-11 rounded-xl text-white font-semibold transition " +
    (canAccept ? "hover:shadow-lg" : "opacity-40 grayscale cursor-not-allowed hover:shadow-none");

  const contactClasses =
    "w-full h-11 rounded-xl border text-slate-700 font-semibold transition hover:bg-slate-50";

  // =============================== Render
  return (
    <section className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: THEME_DARK }}>
            {title}
          </h1>
          {readOnly && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Read-only ({roleLabel})
            </span>
          )}
        </header>

        <div className="grid lg:grid-cols-[1fr,380px] gap-10">
          <div>
            {/* ✅ نفس مساحة الـ placeholder دائماً */}
            {cover ? (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white mb-4">
                <div className={`w-full ${COVER_HEIGHT} bg-slate-50 flex items-center justify-center`}>
                  <img
                    src={cover}
                    alt={title}
                    className="max-h-full w-auto object-contain"
                  />
                </div>
              </div>
            ) : (
              <div
                className={`w-full ${COVER_HEIGHT} rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 mb-4`}
              >
                No cover image
              </div>
            )}

            {/* أي صورة داخل الوصف بنفس المقاس */}
            <div
              className={`mt-8 [&_img]:w-full [&_img]:${COVER_HEIGHT} [&_img]:object-contain [&_img]:bg-slate-50 [&_img]:p-2 [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200`}
            >
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                {isTasks ? "About this task" : "About this project"}
              </h2>
              <p className="leading-7 text-slate-700">
                {item.description || "No description provided."}
              </p>
            </div>

            {item.attachments && (
              <AttachmentList attachments={item.attachments} title="Project Attachments" />
            )}

            {projectFiles.length > 0 && (
              <AttachmentList
                attachments={projectFiles.map((f) => f.file_url)}
                title="Project Files"
              />
            )}
          </div>

          <aside className="lg:sticky lg:top-24">
            <ProjectInfoCard
              item={item}
              isTasks={isTasks}
              isClient={isClient}
              isFreelancer={isFreelancer}
              busy={busy}
              onContact={onContact}
              onApplyToProject={!isTasks ? onApplyToProject : undefined}
              acceptLabel={acceptLabel}
              contactLabel="Contact"
              acceptClasses={acceptClasses}
              contactClasses={contactClasses}
              triggerPaymentUpload={triggerPaymentUpload}
              onPaymentSelected={onPaymentSelected}
              refs={{ paymentInputRef }}
            />
            <button
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex items-center gap-2 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </aside>
        </div>

        {/* Offers Section */}
        {isClient && String(item.user_id ?? item.userId ?? item.client_id ?? "") === String(currentUserId) && (
          <div className="mt-8 rounded-2xl border-2 border-teal-100 bg-gradient-to-br from-white to-teal-50/30 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                Offers Received
                <span className="ml-2 inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full" style={{ backgroundColor: THEME }}> 
                  {offersForProject.length}
                </span>
              </h3>
            </div>
            
            {/* 24-Hour Rule Notice */}
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-amber-500 mr-2">⚠️</span>
                <div className="text-sm">
                  <span className="font-semibold text-amber-800">Important:</span>{" "}
                  <span className="text-amber-700">
                    Clients must accept or reject offers within 24 hours. After this period, offers will automatically expire.
                  </span>
                </div>
              </div>
            </div>

            {offersForProject.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-slate-400 text-5xl mb-3">📭</div>
                <p className="text-base font-medium text-slate-600">No offers submitted yet.</p>
                <p className="text-sm text-slate-500 mt-1">Freelancers will submit their proposals here</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {offersForProject.map((o) => {
                  // normalized offer object (from getOffersForProjectApi)
                  const statusColors = {
                    pending: "bg-amber-50 text-amber-700 border-amber-200",
                    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    rejected: "bg-red-50 text-red-700 border-red-200",
                    expired: "bg-gray-100 text-gray-700 border-gray-300"
                  };
                  const statusColor = statusColors[o.offer_status] || statusColors.pending;
                  const isPending = String(o.offer_status || "").toLowerCase() === "pending";
                  
                  return (
                    <li key={o.offer_id || `${o.freelancer_id}-${o.submitted_at}`} className="p-5 rounded-xl border-2 border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                              {(o.freelancer_name || "F").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-base font-bold text-slate-800">{o.freelancer_name || o.username || "Freelancer"}</div>
                              <div className="text-xs text-slate-500">
                                Submitted: {new Date(o.submitted_at).toLocaleString()}
                                {isPending && (
                                  <span className="ml-2 text-amber-600">
                                    {/* Calculate expiration time (24 hours from submission) */}
                                    {(() => {
                                      const submitTime = new Date(o.submitted_at);
                                      const expireTime = new Date(submitTime.getTime() + 24 * 60 * 60 * 1000);
                                      const now = new Date();
                                      const hoursLeft = Math.max(0, Math.floor((expireTime - now) / (1000 * 60 * 60)));
                                      const minsLeft = Math.max(0, Math.floor((expireTime - now) / (1000 * 60)) % 60);
                                      
                                      if (hoursLeft > 0) {
                                        return `Expires in ${hoursLeft}h ${minsLeft}m`;
                                      } else if (minsLeft > 0) {
                                        return `Expires in ${minsLeft}m`;
                                      } else {
                                        return "Expired";
                                      }
                                    })()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-teal-600" style={{ color: THEME }}>${o.bid_amount ?? "—"}</div>
                          <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full border ${statusColor}`}>
                            {(o.offer_status ?? "pending").charAt(0).toUpperCase() + (o.offer_status ?? "pending").slice(1)}
                          </span>
                        </div>
                      </div>

                      {o.proposal && (
                        <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="text-xs font-semibold text-slate-600 mb-1">Proposal:</div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{o.proposal}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500">⭐</span>
                          <span>Rating: <span className="font-bold text-slate-800">{o.rating ?? "N/A"}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-teal-500">✓</span>
                          <span>Completed: <span className="font-bold text-slate-800">{o.completed_jobs ?? 0}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-500">⏱</span>
                          <span>Avg delivery: <span className="font-bold text-slate-800">{o.avg_delivery_days ? `${Number(o.avg_delivery_days).toFixed(1)}d` : "N/A"}</span></span>
                        </div>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                          <button
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              if (!token) {
                                toast.error("Please login first.");
                                return;
                              }
                              try {
                                const API_URL = import.meta.env.VITE_APP_API_URL || "";
                                await axios.post(
                                  `${API_URL}/offers/offers/approve-reject`,
                                  { offerId: o.offer_id, action: "accept" },
                                  { headers: { Authorization: `Bearer ${token}` } }
                                );
                                // Update the accepted offer and reject all others
                                setOffersForProject((prev) =>
                                  prev.map((x) => {
                                    if (x.offer_id === o.offer_id) {
                                      return { ...x, offer_status: "accepted" };
                                    }
                                    // Reject all other pending offers
                                    if (x.offer_status === "pending") {
                                      return { ...x, offer_status: "rejected" };
                                    }
                                    return x;
                                  })
                                );
                                toast.success("Offer accepted successfully! Other offers rejected.");
                              } catch (err) {
                                console.error("Accept offer failed", err);
                                // Check if the error is due to offer expiration
                                if (err?.response?.data?.message?.includes("expired")) {
                                  // Update the offer status to expired in the UI
                                  setOffersForProject((prev) =>
                                    prev.map((x) =>
                                      x.offer_id === o.offer_id
                                        ? { ...x, offer_status: "expired" }
                                        : x
                                    )
                                  );
                                }
                                toast.error(err?.response?.data?.message || "Failed to accept offer");
                              }
                            }}
                            className="flex-1 h-10 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Accept Offer
                          </button>
                          <button
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              if (!token) {
                                toast.error("Please login first.");
                                return;
                              }
                              try {
                                const API_URL = import.meta.env.VITE_APP_API_URL || "";
                                await axios.post(
                                  `${API_URL}/offers/offers/approve-reject`,
                                  { offerId: o.offer_id, action: "reject" },
                                  { headers: { Authorization: `Bearer ${token}` } }
                                );
                                setOffersForProject((prev) =>
                                  prev.map((x) =>
                                    x.offer_id === o.offer_id
                                      ? { ...x, offer_status: "rejected" }
                                      : x
                                  )
                                );
                                toast.success("Offer rejected.");
                              } catch (err) {
                                console.error("Reject offer failed", err);
                                // Check if the error is due to offer expiration
                                if (err?.response?.data?.message?.includes("expired")) {
                                  // Update the offer status to expired in the UI
                                  setOffersForProject((prev) =>
                                    prev.map((x) =>
                                      x.offer_id === o.offer_id
                                        ? { ...x, offer_status: "expired" }
                                        : x
                                    )
                                  );
                                }
                                toast.error(err?.response?.data?.message || "Failed to reject offer");
                              }
                            }}
                            className="flex-1 h-10 rounded-xl bg-white border-2 border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-[scale-in_0.2s_ease-out]">
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
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {applyModalType === "offer" ? "Send Your Offer" : "Apply to Project"}
              </h3>

              <p className="text-slate-600 mb-6">
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
                      className="w-full h-12 pl-8 pr-4 border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:outline-none text-lg font-semibold"
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
                  {busy ? "Sending..." : applyModalType === "offer" ? "Send Offer" : "Yes, Apply!"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
      `}</style>
    </section>
  );
}
