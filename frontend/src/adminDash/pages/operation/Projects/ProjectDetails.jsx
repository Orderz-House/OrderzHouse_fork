import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  MessageSquare, SendHorizontal, Check, Undo2, X, RefreshCw,
  Loader2, FileText, Code, Palette, Link2
} from "lucide-react";

const T = { primary: "#028090", dark: "#05668D", ring: "rgba(15,23,42,.10)" };
const ringStyle = { border: `1px solid ${T.ring}` };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

function mapRole(roleId){
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  return "user";
}

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, userData } = useSelector(s => s.auth);

  const initial = location.state?.project || null;
  const role = location.state?.role || mapRole(userData?.role_id);

  console.log("[ProjectDetails] Component mounted:", { projectId, role, hasToken: !!token, userData });

  const [project, setProject] = useState(initial);
  const [loading, setLoading] = useState(!initial);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState("");

  const [reviewOpen, setReviewOpen] = useState(false);

  const [deliverOpen, setDeliverOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    if (initial) return;
    (async () => {
      try {
        setLoading(true);
        const endpoint =
          role === "client"
            ? `/api/client/projects/${projectId}`
            : role === "freelancer"
            ? `/api/freelancer/projects/${projectId}`
            : `/api/projects/${projectId}`;
        const { data } = await api.get(endpoint, {
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
        });
        if (!alive) return;
        setProject(data?.project || data || null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [projectId, role, token, initial]);

  // ============ Load offers for this project (client owner) ============
  useEffect(() => {
    if (role !== "client" || !projectId || !token) {
      console.log("[ProjectDetails] Skipping offers fetch:", { role, projectId: !!projectId, token: !!token });
      return;
    }
    let alive = true;

    (async () => {
      try {
        setOffersLoading(true);
        setOffersError("");
        console.log("[ProjectDetails] Fetching offers for projectId:", projectId);
        const { data } = await api.get(`/api/offers/project/${projectId}/offers`, {
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
        });
        console.log("[ProjectDetails] Offers API response:", data);
        if (!alive) return;
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.offers)
          ? data.offers
          : [];
        console.log("[ProjectDetails] Parsed offers:", list);
        setOffers(list);
      } catch (e) {
        if (!alive) return;
        console.error("[ProjectDetails] Failed to load offers for project:", e);
        console.error("[ProjectDetails] Error response:", e.response?.data);
        setOffersError("Failed to load offers for this project.");
        setOffers([]);
      } finally {
        if (alive) setOffersLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [projectId, role, token]);

  const cover = useMemo(() => {
    return (
      project?.cover ||
      project?.image ||
      project?.thumbnail ||
      "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                <stop stop-color="#f1f5f9" offset="0%"/>
                <stop stop-color="#e2e8f0" offset="100%"/>
              </linearGradient>
            </defs>
            <rect fill="url(#g)" width="100%" height="100%"/>
          </svg>`
        )
    );
  }, [project]);

  const chatWith =
    role === "client" ? (project?.assignee || "Freelancer") : (project?.client || "Client");

  const isDone = (project?.status ?? "").toLowerCase() === "done";

  const RightActions = () => (
    <div className="space-y-3">
      <button
        onClick={() =>
          navigate(
            `/chat?projectId=${encodeURIComponent(projectId)}&with=${encodeURIComponent(chatWith)}`
          )
        }
        className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm"
        style={ringStyle}
        title="Open chat"
      >
        <MessageSquare className="w-4 h-4" />
        Chat
      </button>

      {role === "client" ? (
        <button
          onClick={() => setReviewOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl text-white text-sm hover:shadow"
          style={{ backgroundColor: T.primary }}
          title="Review & receive delivery"
        >
          <SendHorizontal className="w-4 h-4" />
          Receive
        </button>
      ) : role === "freelancer" ? (
        <button
          onClick={() => setDeliverOpen(true)}
          disabled={isDone}
          className={`w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl text-white text-sm ${
            isDone ? "opacity-60 cursor-not-allowed" : "hover:shadow"
          }`}
          style={{ backgroundColor: T.primary }}
          title={isDone ? "Already delivered" : "Deliver this project"}
        >
          <SendHorizontal className="w-4 h-4" />
          {isDone ? "Delivered" : "Deliver"}
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      {loading && (
        <div className="animate-pulse grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-3xl bg-slate-200 h-[56vh]" />
          <div className="rounded-3xl bg-slate-200 h-[56vh]" />
          <div className="h-4 rounded bg-slate-200 lg:col-span-2 mt-3" />
          <div className="h-4 rounded bg-slate-200 lg:col-span-2" />
          <div className="h-4 rounded bg-slate-200 w-1/2 lg:col-span-2" />
        </div>
      )}

      {!loading && project && (
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl overflow-hidden bg-white" style={ringStyle}>
              <img
                src={cover}
                alt={project?.title || "Project cover"}
                className="w-full h-[56vh] object-cover"
              />
            </div>

            <div className="rounded-3xl bg-white p-5" style={ringStyle}>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-800">
                {project?.title || "Untitled Project"}
              </h1>
              {project?.description ? (
                <p className="mt-2 text-slate-700 leading-7">{project.description}</p>
              ) : (
                <p className="mt-2 text-slate-500">No description provided.</p>
              )}

              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                <Info label="Status" value={project?.status || "—"} />
                <Info label="Budget" value={fmt(project?.budget)} />
                <Info label="Due" value={project?.due || "—"} />
                <Info
                  label={role === "client" ? "Freelancer" : "Client"}
                  value={role === "client" ? project?.assignee || "—" : project?.client || "—"}
                />
              </div>
            </div>

            {role === "client" && (
              <div className="rounded-3xl bg-gradient-to-br from-white to-teal-50/30 p-5 border-2 border-teal-100" style={ringStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    Offers Received
                    <span className="ml-2 inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full" style={{ backgroundColor: T.primary }}>
                      {offers.length}
                    </span>
                  </h2>
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

                {offersLoading && (
                  <div className="text-sm text-slate-500">Loading offers…</div>
                )}
                {offersError && !offersLoading && (
                  <div className="text-sm text-red-600">{offersError}</div>
                )}
                {!offersLoading && !offersError && offers.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-slate-400 text-5xl mb-3">📭</div>
                    <p className="text-base font-medium text-slate-600">No offers submitted yet.</p>
                    <p className="text-sm text-slate-500 mt-1">Freelancers will submit their proposals here</p>
                  </div>
                )}
                {!offersLoading && !offersError && offers.length > 0 && (
                  <div className="space-y-4">
                    {offers.map((o) => {
                      const status = String(o.offer_status || "").toLowerCase();
                      const isPending = status === "pending";
                      const statusColors = {
                        pending: "bg-amber-50 text-amber-700 border-amber-200",
                        accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
                        rejected: "bg-red-50 text-red-700 border-red-200",
                        expired: "bg-gray-100 text-gray-700 border-gray-300"
                      };
                      const statusColor = statusColors[status] || statusColors.pending;
                      
                      return (
                        <div
                          key={o.offer_id || o.id}
                          className="rounded-xl border-2 border-slate-200 bg-white p-4 hover:border-teal-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                                {(o.freelancer_name || o.username || "F").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">
                                  {o.freelancer_name ||
                                    o.username ||
                                    `Freelancer #${o.freelancer_id}`}
                                </div>
                                <div className="text-xs text-slate-500">
                                  Submitted: {o.submitted_at ? new Date(o.submitted_at).toLocaleString() : new Date(o.created_at).toLocaleString()}
                                  {isPending && (
                                    <span className="ml-2 text-amber-600">
                                      {/* Calculate expiration time (24 hours from submission) */}
                                      {(() => {
                                        const submitTime = new Date(o.submitted_at || o.created_at);
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
                            <div className="text-right">
                              <div className="text-2xl font-bold" style={{ color: T.primary }}>
                                {fmt(o.bid_amount)}
                              </div>
                              <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full border ${statusColor}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
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
                                className="flex-1 h-10 px-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={async () => {
                                  try {
                                    toast.loading("Accepting offer...", { id: "accept-offer" });
                                    await api.post(
                                      "/api/offers/offers/approve-reject",
                                      { offerId: o.offer_id || o.id, action: "accept" },
                                      {
                                        headers: token
                                          ? {
                                              authorization: `Bearer ${token}`,
                                            }
                                          : undefined,
                                      }
                                    );
                                    // Update the accepted offer and reject all others
                                    setOffers((prev) =>
                                      prev.map((x) => {
                                        if ((x.offer_id || x.id) === (o.offer_id || o.id)) {
                                          return { ...x, offer_status: "accepted" };
                                        }
                                        // Reject all other pending offers
                                        if (x.offer_status === "pending") {
                                          return { ...x, offer_status: "rejected" };
                                        }
                                        return x;
                                      })
                                    );
                                    toast.success("Offer accepted successfully! Other offers rejected.", { id: "accept-offer" });
                                  } catch (e) {
                                    console.error("Accept offer failed", e);
                                    // Check if the error is due to offer expiration
                                    if (e?.response?.data?.message?.includes("expired")) {
                                      // Update the offer status to expired in the UI
                                      setOffers((prev) =>
                                        prev.map((x) =>
                                          (x.offer_id || x.id) === (o.offer_id || o.id)
                                            ? { ...x, offer_status: "expired" }
                                            : x
                                        )
                                      );
                                    }
                                    toast.error(e?.response?.data?.message || "Failed to accept offer", { id: "accept-offer" });
                                  }
                                }}
                              >
                                Accept Offer
                              </button>
                              <button
                                className="flex-1 h-10 px-3 rounded-xl bg-white border-2 border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={async () => {
                                  try {
                                    toast.loading("Rejecting offer...", { id: "reject-offer" });
                                    await api.post(
                                      "/api/offers/offers/approve-reject",
                                      { offerId: o.offer_id || o.id, action: "reject" },
                                      {
                                        headers: token
                                          ? {
                                              authorization: `Bearer ${token}`,
                                            }
                                          : undefined,
                                      }
                                    );
                                    setOffers((prev) =>
                                      prev.map((x) =>
                                        (x.offer_id || x.id) ===
                                        (o.offer_id || o.id)
                                          ? {
                                              ...x,
                                              offer_status: "rejected",
                                            }
                                          : x
                                      )
                                    );
                                    toast.success("Offer rejected", { id: "reject-offer" });
                                  } catch (e) {
                                    console.error("Reject offer failed", e);
                                    // Check if the error is due to offer expiration
                                    if (e?.response?.data?.message?.includes("expired")) {
                                      // Update the offer status to expired in the UI
                                      setOffers((prev) =>
                                        prev.map((x) =>
                                          (x.offer_id || x.id) === (o.offer_id || o.id)
                                            ? { ...x, offer_status: "expired" }
                                            : x
                                        )
                                      );
                                    }
                                    toast.error(e?.response?.data?.message || "Failed to reject offer", { id: "reject-offer" });
                                  }
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="lg:col-span-1">
            <div className="rounded-3xl bg-white p-5 sticky top-4" style={ringStyle}>
              <RightActions />
            </div>
          </aside>

          <div className="lg:col-span-2 space-y-3">
            <div className="h-3 rounded bg-slate-200/70" />
            <div className="h-3 rounded bg-slate-200/70" />
            <div className="h-3 rounded bg-slate-200/70 w-2/3" />
          </div>
        </div>
      )}

      {role === "client" && reviewOpen && project && (
        <ClientReviewDrawer
          project={project}
          onClose={() => setReviewOpen(false)}
          onApprove={async (pid, vid) => {
            await api.post(`/api/client/projects/${pid}/approve`, { versionId: vid }, {
              headers: token ? { authorization: `Bearer ${token}` } : undefined,
            });
          }}
          onRequestChanges={async (pid, vid, message) => {
            await api.post(`/api/client/projects/${pid}/request-changes`, { versionId: vid, message }, {
              headers: token ? { authorization: `Bearer ${token}` } : undefined,
            });
          }}
          token={token}
        />
      )}

      {role === "freelancer" && deliverOpen && project && (
        <DeliverModal
          project={project}
          onClose={() => setDeliverOpen(false)}
          onSubmit={async (payload) => {
            const fd = new FormData();
            fd.append("category", payload.category);
            fd.append("notes", payload.notes || "");
            fd.append("links", JSON.stringify(payload.links || {}));
            fd.append("checklist", JSON.stringify(payload.checklist || {}));
            (payload.files || []).forEach((f) => fd.append("files", f));
            await api.post(`/api/freelancer/projects/${project.id}/deliver`, fd, {
              headers: token ? { authorization: `Bearer ${token}` } : undefined,
            });
          }}
          submitting={false}
        />
      )}
    </div>
  );
}

/* =============== Client Review Drawer =============== */
function ClientReviewDrawer({ project, onClose, onApprove, onRequestChanges, token }) {
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/client/projects/${project.id}/deliveries`, {
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
        });
        if (!alive) return;
        const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        list.sort((a, b) => new Date(b.at) - new Date(a.at));
        setVersions(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [project?.id, token]);

  const latest = versions[0];

  const approve = async () => {
    if (!latest) return;
    setSubmitting(true);
    await onApprove(project.id, latest.id);
    setSubmitting(false);
    onClose();
  };

  const request = async () => {
    if (!latest) return;
    setSubmitting(true);
    await onRequestChanges(project.id, latest.id, requestText.trim());
    setSubmitting(false);
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="font-semibold text-slate-800">Receive Project — {project.title}</div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <section className="rounded-2xl bg-white p-4" style={ringStyle}>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-800">Latest delivery</div>
                  <button
                    className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50"
                    style={ringStyle}
                    onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 400); }}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>

                {!latest ? (
                  <div className="text-sm text-slate-500 mt-3">No deliveries yet.</div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div className="text-xs text-slate-500">Delivered on {new Date(latest.at).toLocaleString()}</div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Primary">
                        <a className="text-sky-700 hover:underline break-all" href={latest.links?.primary} target="_blank" rel="noreferrer">
                          {latest.links?.primary}
                        </a>
                      </Field>
                      {latest.links?.secondary && (
                        <Field label="Secondary">
                          <a className="text-sky-700 hover:underline break-all" href={latest.links?.secondary} target="_blank" rel="noreferrer">
                            {latest.links?.secondary}
                          </a>
                        </Field>
                      )}
                    </div>

                    {latest.notes && (
                      <Field label="Notes">
                        <div className="text-sm text-slate-700 whitespace-pre-wrap">{latest.notes}</div>
                      </Field>
                    )}

                    <Field label="Attachments">
                      {latest.attachments?.length ? (
                        <ul className="list-disc ml-4 text-sm text-slate-700">
                          {latest.attachments.map((f) => <li key={f}>{f}</li>)}
                        </ul>
                      ) : <span className="text-slate-500 text-sm">—</span>}
                    </Field>
                  </div>
                )}
              </section>

              <section className="rounded-2xl bg-white p-4" style={ringStyle}>
                <div className="flex items-center gap-2">
                  <button disabled={!latest || submitting} onClick={approve} className="h-11 px-4 rounded-xl text-white text-sm inline-flex items-center gap-2" style={{ backgroundColor: T.primary, opacity: !latest || submitting ? 0.75 : 1 }}>
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button type="button" disabled={!latest || submitting} onClick={() => setRequesting(v => !v)} className="h-11 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm inline-flex items-center gap-2" style={ringStyle}>
                    <Undo2 className="w-4 h-4" /> Request changes
                  </button>
                </div>

                {requesting && (
                  <div className="mt-3">
                    <textarea value={requestText} onChange={(e) => setRequestText(e.target.value)} placeholder="Briefly describe what needs to be changed..." className="w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none min-h-[80px]" style={ringStyle} />
                    <div className="mt-2 flex items-center gap-2">
                      <button disabled={!requestText.trim() || submitting} onClick={request} className="h-10 px-3 rounded-xl text-white text-sm" style={{ backgroundColor: T.dark, opacity: !requestText.trim() || submitting ? 0.75 : 1 }}>
                        Send request
                      </button>
                      <button type="button" className="h-10 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm" style={ringStyle} onClick={() => setRequesting(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl bg-white p-4" style={ringStyle}>
                <div className="font-medium text-slate-800">History</div>
                {versions.length === 0 ? (
                  <div className="text-sm text-slate-500 mt-2">No history yet.</div>
                ) : (
                  <ol className="mt-3 space-y-3">
                    {versions.map((v) => (
                      <li key={v.id} className="rounded-xl bg-white p-3" style={ringStyle}>
                        <div className="text-xs text-slate-500">{new Date(v.at).toLocaleString()} — {v.id}</div>
                        <div className="mt-1 text-sm text-slate-700">{v.notes || "—"}</div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* =============== Freelancer Deliver Modal =============== */
function DeliverModal({ project, onClose, onSubmit, submitting }) {
  const [category, setCategory] = useState(project.category || "programming");
  const [primaryLink, setPrimaryLink] = useState("");
  const [secondaryLink, setSecondaryLink] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const readOnlyCategory = !!project.category;
  const requiredOk = !!(primaryLink && primaryLink.trim()) && !!confirmed;

  const HeaderIcon = () => {
    if (category === "content") return <FileText className="w-5 h-5" style={{ color: T.dark }} />;
    if (category === "design") return <Palette className="w-5 h-5" style={{ color: T.dark }} />;
    return <Code className="w-5 h-5" style={{ color: T.dark }} />;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!requiredOk) return;
    onSubmit({
      category,
      notes,
      links: { primary: primaryLink, secondary: secondaryLink },
      checklist: { confirmed },
      files,
    });
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <HeaderIcon />
                <div className="font-semibold text-slate-800">Deliver Project — {project.title}</div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-5">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Category</label>
                  {readOnlyCategory ? (
                    <div className="mt-1.5 px-3 py-2.5 rounded-xl bg-slate-50 text-slate-700" style={ringStyle}>
                      {capitalize(project.category)}
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none"
                      style={ringStyle}
                    >
                      <option value="programming">Programming</option>
                      <option value="content">Content Writing</option>
                      <option value="design">Design</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-sm text-slate-600">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything the client should know about this delivery…"
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none min-h-[44px]"
                    style={ringStyle}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600">
                    Primary delivery link <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1.5 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Link2 className="w-4 h-4" /></span>
                    <input
                      type="url"
                      required
                      value={primaryLink}
                      onChange={(e) => setPrimaryLink(e.target.value)}
                      placeholder="Repository / build / preview…"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white text-sm outline-none"
                      style={ringStyle}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Secondary link (optional)</label>
                  <div className="mt-1.5 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Link2 className="w-4 h-4" /></span>
                    <input
                      type="url"
                      value={secondaryLink}
                      onChange={(e) => setSecondaryLink(e.target.value)}
                      placeholder="Live URL / extra preview / backup…"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white text-sm outline-none"
                      style={ringStyle}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-600">Attachments (optional)</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 h-11 px-3 rounded-xl bg-white hover:bg-slate-50 cursor-pointer text-sm" style={ringStyle}>
                    Upload files
                    <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                  </label>
                  {files.length > 0 && (
                    <div className="text-xs text-slate-600">{files.length} file{files.length > 1 ? "s" : ""} selected</div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white cursor-pointer" style={ringStyle}>
                <input type="checkbox" className="accent-emerald-600" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                <span className="text-sm text-slate-700">I confirm this delivery matches the project requirements.</span>
              </label>

              <div className="flex items-center justify-end pt-3 border-t border-slate-200">
                <button type="button" onClick={onClose} className="h-11 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm mr-2" style={ringStyle}>Cancel</button>
                <button type="submit" disabled={!requiredOk || submitting} className="h-11 px-4 rounded-xl text-white text-sm inline-flex items-center gap-2" style={{ backgroundColor: T.primary, opacity: !requiredOk || submitting ? 0.75 : 1 }}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ---------- Small helpers ---------- */
function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2" style={ringStyle}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm text-slate-800 mt-0.5">{value ?? "—"}</div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function fmt(v){ if (v===0) return "0"; if (!v) return "—"; try{ return new Intl.NumberFormat().format(v);}catch{return String(v);} }
function capitalize(s){ return (s||"").charAt(0).toUpperCase() + (s||"").slice(1); }
function Portal({children}){ return (
  <div id="__portal">{children}</div>
);}
