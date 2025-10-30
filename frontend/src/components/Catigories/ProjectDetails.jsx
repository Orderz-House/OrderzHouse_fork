import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getProjectByIdApi } from "./api/projects";
import {
  getTaskByIdApi,
  requestTaskApi,
  submitPaymentProofApi,
  submitWorkCompletionApi,
  resubmitWorkCompletionApi,
  approveWorkCompletionApi,
  addTaskFilesApi,
} from "./api/tasks";
import { useSelector } from "react-redux";

const THEME = "#028090";
const THEME_DARK = "#05668D";

export default function ProjectDetails({ mode: propMode }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  // infer mode based on URL (/tasks or /projects)
  const inferredMode = location.pathname.startsWith("/tasks") ? "tasks" : "projects";
  const mode = propMode || inferredMode;

  // read-only & role info
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

  // loading flags
  const [busy, setBusy] = useState(false);

  // file inputs refs (لا نغيّر الواجهة—نضيف inputs مخفية)
  const paymentInputRef = useRef(null);
  const submitWorkInputRef = useRef(null);
  const resubmitWorkInputRef = useRef(null);
  const addFilesInputRef = useRef(null);

  useEffect(() => {
    const stateObj = location.state?.project;
    if (stateObj && String(stateObj.id) === String(id)) {
      setItem(stateObj);
      return;
    }

    // choose correct loader: task or project
    const loader = mode === "tasks" ? getTaskByIdApi : getProjectByIdApi;
    loader(id)
      .then((res) => setItem(res.task || res.project || res))
      .catch((e) => {
        console.error(e);
        alert("Failed to load details.");
      });
  }, [id, location.state, mode]);

  // Loading placeholder
  if (!item) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-6 w-32 rounded bg-slate-200 animate-pulse mb-6" />
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          <div>
            <div className="aspect-[16/9] w-full rounded-2xl bg-slate-200 animate-pulse mb-4" />
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

  const title = item.title;
  const cover = item.cover;
  const price = item?.budget ?? item?.price;
  const duration = item.duration_days ?? "—";
  const projectType = item?.type;
  const isTasks = mode === "tasks";

  // permission logic (نفس منطقك الأصلي)
  let canAccept = true;
  if (isTasks && isFreelancer) canAccept = false;
  if (!isTasks && isClient) canAccept = false;

  let canContact = true;
  if (!isTasks && isClient) canContact = false;

  let acceptLabel = isTasks ? "Get this task" : "Get this project";
  if (!isTasks && isFreelancer && projectType === "bidding") {
    acceptLabel = "Send Offer";
  }
  const contactLabel = isTasks ? "Contact freelancer" : "Contact seller";

  const acceptTitle = !canAccept
    ? isTasks
      ? "Freelancers can't accept tasks. Only clients can accept tasks."
      : "Clients can't accept projects. You can accept tasks."
    : "";

  const contactTitle = !canContact ? "Clients can't contact sellers on projects." : "";

  const acceptClasses =
    "w-full h-11 rounded-xl text-white font-semibold transition " +
    (canAccept ? "hover:shadow-lg" : "opacity-40 grayscale cursor-not-allowed hover:shadow-none");
  const contactClasses =
    "w-full h-11 rounded-xl border text-slate-700 font-semibold transition " +
    (canContact ? "hover:bg-slate-50" : "opacity-40 grayscale cursor-not-allowed hover:bg-white");

  /* =========================
     Handlers — real API calls
  ==========================*/

  // 1) Client requests a task
  const onRequestTask = async () => {
    if (!isTasks) {
      alert("Requesting is only for tasks.");
      return;
    }
    if (!isClient) {
      alert("Only clients can request tasks.");
      return;
    }
    if (busy) return;

    try {
      setBusy(true);
      // رسالة اختيارية من المستخدم (بسيطة بدون UI إضافي)
      const msg = window.prompt("Add a note to the freelancer (optional):", "") || "";
      const fd = new FormData();
      fd.append("message", msg);
      const res = await requestTaskApi(id, fd);
      alert(res?.message || "Task requested successfully.");
    } catch (e) {
      console.error(e);
      alert(e?.message || e?.data?.message || "Failed to request task.");
    } finally {
      setBusy(false);
    }
  };

  // 2) Contact — go to chat route
  const onContact = () => {
    // نوجّه لمسار الشات الخاص بالتاسك
    // عندك ChatPage يقرأ projectId | taskId من useParams
    // فبنروح على /chat/task/:taskId
    if (isTasks) navigate(`/chat/task/${id}`);
    else navigate(`/chat/project/${id}`);
  };

  // 3) Client: submit payment proof
  const triggerPaymentUpload = () => paymentInputRef.current?.click();
  const onPaymentSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isClient) return alert("Only clients can upload payment proofs.");
    if (busy) return;

    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await submitPaymentProofApi(id, fd); // id هنا taskId (حسب باك إندك)
      alert(res?.message || "Payment proof submitted. Awaiting admin confirmation.");
    } catch (err) {
      console.error(err);
      alert(err?.message || err?.data?.message || "Failed to submit payment proof.");
    } finally {
      setBusy(false);
      e.target.value = ""; // reset
    }
  };

  // 4) Freelancer: submit work
  const triggerSubmitWork = () => submitWorkInputRef.current?.click();
  const onSubmitWorkSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!isFreelancer) return alert("Only freelancers can submit work.");
    if (busy) return;

    try {
      setBusy(true);
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      // انت تحتاج requestId، عندك هنا فقط taskId
      // غالبًا عندك واجهة تعرض طلبات (request list) وتستخرج منها requestId
      // كحل مؤقت: اطلب من المستخدم إدخال requestId
      const reqId = window.prompt("Enter requestId to submit work for:", "");
      if (!reqId) throw new Error("requestId is required.");
      const res = await submitWorkCompletionApi(reqId, fd);
      alert(res?.message || "Work submitted for review.");
    } catch (err) {
      console.error(err);
      alert(err?.message || err?.data?.message || "Failed to submit work.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  // 5) Freelancer: resubmit (after revisions)
  const triggerResubmit = () => resubmitWorkInputRef.current?.click();
  const onResubmitSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!isFreelancer) return alert("Only freelancers can resubmit.");
    if (busy) return;

    try {
      setBusy(true);
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const reqId = window.prompt("Enter requestId to resubmit for:", "");
      if (!reqId) throw new Error("requestId is required.");
      const res = await resubmitWorkCompletionApi(reqId, fd);
      alert(res?.message || "Work resubmitted for review.");
    } catch (err) {
      console.error(err);
      alert(err?.message || err?.data?.message || "Failed to resubmit.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  // 6) Client: approve or ask for review
  const onClientApprove = async () => {
    if (!isClient) return alert("Only clients can approve.");
    if (busy) return;

    try {
      setBusy(true);
      const reqId = window.prompt("Enter requestId to approve:", "");
      if (!reqId) throw new Error("requestId is required.");
      const fd = new FormData(); // بدون ملفات
      const res = await approveWorkCompletionApi(reqId, "completed", fd);
      alert(res?.message || "Work marked completed.");
    } catch (err) {
      console.error(err);
      alert(err?.message || err?.data?.message || "Failed to approve.");
    } finally {
      setBusy(false);
    }
  };

  const onClientRequestReview = async () => {
    if (!isClient) return alert("Only clients can request revisions.");
    if (busy) return;

    try {
      setBusy(true);
      const reqId = window.prompt("Enter requestId to request review for:", "");
      if (!reqId) throw new Error("requestId is required.");

      // يمكن العميل يرفق ملفات توضيحية للمراجعة
      // عشان ما نغيّر الواجهة، بس نسأل لو بده يرفع الآن
      const withFiles = window.confirm("Attach reference files for review?");
      const fd = new FormData();
      if (withFiles) {
        // إن احتجت رفع ملفات فعليًا، استخدم addTaskFiles تحت
        alert("Use 'Add lifecycle files' button to upload review references.");
      }
      const res = await approveWorkCompletionApi(reqId, "reviewing", fd);
      alert(res?.message || "Sent back for reviewing.");
    } catch (err) {
      console.error(err);
      alert(err?.message || err?.data?.message || "Failed to send for review.");
    } finally {
      setBusy(false);
    }
  };

  // 7) Shared: add files during lifecycle (in_progress / reviewing)
  const triggerAddFiles = () => addFilesInputRef.current?.click();
  const onAddFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (busy) return;

    try {
      setBusy(true);
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const reqId = window.prompt("Enter requestId to attach files to:", "");
      if (!reqId) throw new Error("requestId is required.");
      const res = await addTaskFilesApi(reqId, fd);
      alert(res?.message || "Files added successfully.");
    } catch (err) {
      console.error(err);
      alert(err?.message || err?.data?.message || "Failed to add files.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <section className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1
              className="text-3xl md:text-4xl font-black tracking-tight"
              style={{ color: THEME_DARK }}
            >
              {title}
            </h1>

            {readOnly && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                Read-only ({roleLabel})
              </span>
            )}
          </div>
        </header>

        {/* Main layout */}
        <div className="grid lg:grid-cols-[1fr,380px] gap-10">
          {/* Left content */}
          <div>
            {cover && (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white mb-4">
                <div className="aspect-[16/9] bg-slate-50">
                  <img src={cover} alt={title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                {isTasks ? "About this task" : "About this project"}
              </h2>
              <p className="leading-7 text-slate-700">
                {item.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                {/* Budget & duration */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Budget</span>
                    <span className="text-2xl font-black" style={{ color: THEME_DARK }}>
                      ${price ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-semibold text-slate-700">{duration} day(s)</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-6 space-y-3">
                <div title={acceptTitle || undefined}>
                  <button
                    className={acceptClasses}
                    style={{ backgroundColor: THEME }}
                    disabled={!canAccept || busy}
                    aria-disabled={!canAccept || busy}
                    onClick={isTasks ? onRequestTask : undefined}
                  >
                    {busy ? "Please wait..." : acceptLabel}
                  </button>
                </div>

                <div title={contactTitle || undefined}>
                  <button
                    className={contactClasses}
                    disabled={!canContact || busy}
                    aria-disabled={!canContact || busy}
                    onClick={onContact}
                  >
                    {contactLabel}
                  </button>
                </div>

                {/* Extra details */}
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Secure checkout
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Money-back guarantee
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 24/7 support
                  </li>
                </ul>

                {/* ====== Lifecycle quick actions (اختياريّة) ====== */}
                <div className="mt-6 border-t pt-4 space-y-2">
                  {/* Client only: payment proof */}
                  {isClient && isTasks && (
                    <>
                      <button
                        className="w-full h-10 rounded-lg border text-sm hover:bg-slate-50"
                        onClick={triggerPaymentUpload}
                        disabled={busy}
                      >
                        Upload payment proof
                      </button>
                      <input
                        ref={paymentInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        hidden
                        onChange={onPaymentSelected}
                      />
                    </>
                  )}

                  {/* Freelancer only: submit / resubmit */}
                  {isFreelancer && isTasks && (
                    <>
                      <button
                        className="w-full h-10 rounded-lg border text-sm hover:bg-slate-50"
                        onClick={triggerSubmitWork}
                        disabled={busy}
                      >
                        Submit work
                      </button>
                      <input
                        ref={submitWorkInputRef}
                        type="file"
                        multiple
                        hidden
                        onChange={onSubmitWorkSelected}
                      />
                      <button
                        className="w-full h-10 rounded-lg border text-sm hover:bg-slate-50"
                        onClick={triggerResubmit}
                        disabled={busy}
                      >
                        Resubmit after review
                      </button>
                      <input
                        ref={resubmitWorkInputRef}
                        type="file"
                        multiple
                        hidden
                        onChange={onResubmitSelected}
                      />
                    </>
                  )}

                  {/* Client only: approve / request review */}
                  {isClient && isTasks && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="h-10 rounded-lg border text-sm hover:bg-slate-50"
                        onClick={onClientApprove}
                        disabled={busy}
                      >
                        Approve completion
                      </button>
                      <button
                        className="h-10 rounded-lg border text-sm hover:bg-slate-50"
                        onClick={onClientRequestReview}
                        disabled={busy}
                      >
                        Ask for review
                      </button>
                    </div>
                  )}

                  {/* Shared: add lifecycle files */}
                  {isTasks && (
                    <>
                      <button
                        className="w-full h-10 rounded-lg border text-sm hover:bg-slate-50"
                        onClick={triggerAddFiles}
                        disabled={busy}
                      >
                        Add lifecycle files
                      </button>
                      <input
                        ref={addFilesInputRef}
                        type="file"
                        multiple
                        hidden
                        onChange={onAddFilesSelected}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* back button */}
            <button
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex items-center gap-2 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
