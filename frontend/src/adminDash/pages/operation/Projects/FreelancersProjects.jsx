import { useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PeopleTable from "../../Tables";
import {
  Eye,
  MessageSquare,
  SendHorizontal,
  X,
  RefreshCw,
  Check,
  Undo2,
  Loader2,
  FileText,
  Code,
  Palette,
  Link2,
} from "lucide-react";

/* ---------- Theme ---------- */
const T = { primary: "#028090", dark: "#05668D", ring: "rgba(15,23,42,.10)" };
const ringStyle = { border: `1px solid ${T.ring}` };

/* ---------- Role map ---------- */
function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  return "user";
}

/* ---------- Axios base ---------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

/* ===================== Entry ===================== */
export default function Projects() {
  const { userData } = useSelector((s) => s.auth);
  const role = mapRole(userData?.role_id);

  if (role === "admin") return <AdminProjects />;
  if (role === "freelancer") return <FreelancerProjects />;
  return <ClientProjects />;
}

/* ===================== Admin ===================== */
function AdminProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname || "";
  const base = pathname.startsWith("/client") ? "/client" : pathname.startsWith("/freelancer") ? "/freelancer" : "/admin";
  const { token } = useSelector((s) => s.auth);

  // columns
  const columns = [
    { label: "Title", key: "title" },
    { label: "Client", key: "client" },
    { label: "Owner", key: "owner" },
    { label: "Due", key: "due" },
    { label: "Budget", key: "budget" },
    { label: "Progress", key: "progress" },
    { label: "Status", key: "status" },
  ];

  // form fields
  const formFields = [
    { label: "Title", key: "title", type: "text", required: true },
    { label: "Client", key: "client", type: "text" },
    { label: "Owner", key: "owner", type: "text" },
    { label: "Due", key: "due", type: "date" },
    { label: "Budget", key: "budget", type: "number" },
    { label: "Progress", key: "progress", type: "number" },
    { label: "Status", key: "status", type: "select", options: ["pending", "in-progress", "delivered", "done"] },
  ];

  // badges
  const chips = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In progress" },
    { value: "delivered", label: "Delivered" },
    { value: "done", label: "Done" },
  ];

  // actions inside card
  const renderActions = (row, h) => {
    const id = h.getId(row);
    const isDone = row.status === "done" || row.status === "delivered";
    return (
      <div className="flex gap-2 w-full">
        <button
          onClick={() => navigate(`/chat?projectId=${encodeURIComponent(id)}&with=${encodeURIComponent(row.client || "Client")}`)}
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm px-2"
          style={ringStyle}
          title="Open chat"
        >
          <MessageSquare className="w-3 h-3" />
          Chat
        </button>
        <button
          onClick={() => navigate(`${base}/project/${id}`, { state: { project: row, readOnly: false, role: "admin" } })}
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl text-white text-xs hover:shadow px-2"
          style={{ backgroundColor: T.dark }}
          title="Open details"
        >
          <Eye className="w-3 h-3" />
          Details
        </button>
      </div>
    );
  };

  return (
    <PeopleTable
      title="Projects"
      endpoint="/api/admin/projects"
      token={token}
      columns={columns}
      formFields={formFields}
      chips={chips}
      chipField="status"
      filters={[{ key: "status", label: "Status", options: chips.slice(1).map(c => c.value) }]}
      /* UI */
      desktopAsCards
      /* Admin wants default CRUD inside cards */
      crudConfig={{ showDetails: false, showRowEdit: true, showDelete: true }}
      /* open details */
      onCardClick={(row, h) => navigate(`${base}/project/${h.getId(row)}`)}
    />
  );
}

/* ===================== Client ===================== */
function ClientProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname || "";
  const base = pathname.startsWith("/client") ? "/client" : pathname.startsWith("/freelancer") ? "/freelancer" : "/admin";
  const { token } = useSelector((s) => s.auth);

  // لوحات العميل
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewFor, setReviewFor] = useState(null);

  // أزرار العميل داخل الكارد
  const renderActions = (row, helpers) => {
    const id = helpers.getId(row);
    return (
      <div className="flex gap-2 w-full">
        <button
          onClick={() => navigate(`/chat?projectId=${encodeURIComponent(id)}&with=${encodeURIComponent(row.assignee || "Freelancer")}`)}
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm px-2"
          style={ringStyle}
          title="Open chat"
        >
          <MessageSquare className="w-3 h-3" />
          Chat
        </button>
        <button
          onClick={() => { setReviewFor(row); setReviewOpen(true); }}
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl text-white text-xs hover:shadow px-2"
          style={{ backgroundColor: T.primary }}
          title="Review & receive delivery"
        >
          <SendHorizontal className="w-3 h-3" />
          Receive
        </button>
      </div>
    );
  };

  return (
    <>
      <PeopleTable
        title="My Projects"
        endpoint="/projects/myprojects"
        token={token}
        columns={[
          { label: "Title", key: "title" },
          { label: "Freelancer", key: "assignee" },
          { label: "Due", key: "due" },
          { label: "Budget", key: "budget" },
          { label: "Progress", key: "progress" },
          { label: "Status", key: "status" },
        ]}
        formFields={[]}
        /* UI */
        desktopAsCards
        crudConfig={{ showDetails: false, showRowEdit: false, showDelete: true }}
        renderActions={renderActions}
        // ⬇️ النقرة على صورة الكارد تفتح صفحة التفاصيل مع بادئة الدور
        onCardClick={(row, h) =>
          navigate(`${base}/project/${h.getId(row)}`, {
            state: { project: row, readOnly: true, role: "client" },
          })
        }
      />

      {reviewOpen && reviewFor && (
        <ReviewModal
          project={reviewFor}
          onClose={() => { setReviewOpen(false); setReviewFor(null); }}
          onSubmit={(payload) => submitClientReview({ project: reviewFor, payload, token })}
        />
      )}
    </>
  );
}

/* ===================== Freelancer ===================== */
function FreelancerProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname || "";
  const base = pathname.startsWith("/client") ? "/client" : pathname.startsWith("/freelancer") ? "/freelancer" : "/admin";
  const { token } = useSelector((s) => s.auth);

  const [deliverOpen, setDeliverOpen] = useState(false);
  const [deliverFor, setDeliverFor] = useState(null);
  const [deliverSubmitting, setDeliverSubmitting] = useState(false);

  // columns
  const columns = [
    { label: "Title", key: "title" },
    { label: "Client", key: "client" },
    { label: "Due", key: "due" },
    { label: "Budget", key: "budget" },
    { label: "Progress", key: "progress" },
    { label: "Status", key: "status" },
  ];

  const renderActions = (row, helpers) => {
    const id = helpers.getId(row);
    const isDone = row.status === "done" || row.status === "delivered";
    return (
      <div className="flex gap-2 w-full">
        <button
          onClick={() => navigate(`/chat?projectId=${encodeURIComponent(id)}&with=${encodeURIComponent(row.client || "Client")}`)}
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm px-2"
          style={ringStyle}
          title="Open chat"
        >
          <MessageSquare className="w-3 h-3" />
          Chat
        </button>
        <button
          onClick={() => { setDeliverFor(row); setDeliverOpen(true); }}
          disabled={isDone}
          className={`inline-flex items-center justify-center gap-2 h-10 rounded-xl text-white text-xs px-2 ${isDone ? "opacity-60 cursor-not-allowed" : "hover:shadow"}`}
          style={{ backgroundColor: T.primary }}
          title={isDone ? "Already delivered" : "Deliver this project"}
        >
          <SendHorizontal className="w-3 h-3" />
          {isDone ? "Delivered" : "Deliver"}
        </button>
      </div>
    );
  };

  const submitDelivery = async ({ project, payload, token }) => {
    setDeliverSubmitting(true);
    try {
      await api.post(`/api/freelancer/projects/${project.id}/deliveries`, payload, {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      setDeliverOpen(false);
      setDeliverFor(null);
    } finally {
      setDeliverSubmitting(false);
    }
  };

  return (
    <>
      <PeopleTable
        title="My Projects"
        endpoint="/projects/myprojects"
        token={token}
        columns={columns}
        formFields={[]}
        /* UI */
        desktopAsCards
        crudConfig={{ showDetails: false, showRowEdit: false, showDelete: false }}
        renderActions={renderActions}
        onCardClick={(row, h) =>
          navigate(`${base}/project/${h.getId(row)}`, {
            state: { project: row, readOnly: true, role: "freelancer" },
          })
        }
      />

      {deliverOpen && deliverFor && (
        <DeliverModal
          project={deliverFor}
          onClose={() => { setDeliverOpen(false); setDeliverFor(null); }}
          onSubmit={(payload) => submitDelivery({ project: deliverFor, payload, token })}
          submitting={deliverSubmitting}
        />
      )}
    </>
  );
}

/* ===================== Client Review Modal ===================== */
function ReviewModal({ project, onClose, onSubmit }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ comment, rating });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-4 top-8 bottom-8 bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Review Delivery</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100%-57px)]">
          <div className="flex-1 p-5 space-y-4 overflow-auto">
            <Field label="Rating">
              <div className="inline-flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`w-9 h-9 rounded-full ring-1 ${r <= rating ? "bg-yellow-400/90 ring-yellow-400" : "bg-white ring-slate-200"}`}
                    onClick={() => setRating(r)}
                    title={`Set rating ${r}`}
                  />
                ))}
              </div>
            </Field>
            <Field label="Comment">
              <textarea
                className="w-full h-32 resize-none rounded-xl ring-1 ring-slate-200 p-3 focus:outline-none focus:ring-slate-300"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your feedback..."
              />
            </Field>
          </div>

          <div className="p-5 border-t border-slate-100 flex items-center gap-3">
            <button type="button" onClick={onClose} className="h-11 px-4 rounded-xl bg-white hover:bg-slate-50 ring-1 ring-slate-200 text-slate-700 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="h-11 px-4 rounded-xl text-white text-sm hover:shadow" style={{ backgroundColor: T.primary, opacity: loading ? 0.75 : 1 }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/* ===================== Deliver Modal (Freelancer) ===================== */
function DeliverModal({ project, onClose, onSubmit, submitting }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [fileUrls, setFileUrls] = useState([""]);
  const requiredOk = title.trim().length > 0 && desc.trim().length > 0;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-4 top-6 bottom-6 bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Submit Delivery</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 flex-1 overflow-auto space-y-4">
          <Field label="Title">
            <input
              className="w-full h-11 rounded-xl ring-1 ring-slate-200 px-3 focus:outline-none focus:ring-slate-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Delivery title"
            />
          </Field>

          <Field label="Description">
            <textarea
              className="w-full h-28 resize-none rounded-xl ring-1 ring-slate-200 px-3 py-2 focus:outline-none focus:ring-slate-300"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What did you deliver?"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Public URL">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 h-11 rounded-xl ring-1 ring-slate-200 px-3 focus:outline-none focus:ring-slate-300"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
                <a href={url || "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800">
                  <Link2 className="w-3 h-3" />
                  Open
                </a>
              </div>
            </Field>

            <Field label="Private Repo (optional)">
              <input
                className="w-full h-11 rounded-xl ring-1 ring-slate-200 px-3 focus:outline-none focus:ring-slate-300"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="GitHub/GitLab repo"
              />
            </Field>
          </div>

          <Field label="Files (links)">
            <div className="space-y-2">
              {fileUrls.map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="flex-1 h-11 rounded-xl ring-1 ring-slate-200 px-3 focus:outline-none focus:ring-slate-300"
                    value={u}
                    onChange={(e) => setFileUrls((arr) => arr.map((v, idx) => (idx === i ? e.target.value : v)))}
                    placeholder={`https://files.example.com/file-${i + 1}.zip`}
                  />
                  <button
                    type="button"
                    onClick={() => setFileUrls((arr) => arr.filter((_, idx) => idx !== i))}
                    className="h-11 aspect-square inline-flex items-center justify-center rounded-xl ring-1 ring-slate-200 hover:bg-slate-50"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFileUrls((arr) => [...arr, ""])}
                className="h-11 px-3 rounded-xl inline-flex items-center gap-2 ring-1 ring-slate-200 hover:bg-slate-50 text-slate-700 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Add another link
              </button>
            </div>
          </Field>
        </div>

        <div className="p-5 border-t border-slate-100 flex items-center gap-3">
          <button type="button" onClick={onClose} className="h-11 px-4 rounded-xl bg-white hover:bg-slate-50 ring-1 ring-slate-200 text-slate-700 text-sm" style={ringStyle} disabled={submitting}>Cancel</button>
          <button type="submit" disabled={!requiredOk || submitting} onClick={() => onSubmit({ title, desc, url, code, files: fileUrls.filter(Boolean) })} className="h-11 px-4 rounded-xl text-white text-sm hover:shadow" style={{ backgroundColor: T.primary, opacity: !requiredOk || submitting ? 0.75 : 1 }}>
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Delivery
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ---------- Small helpers ---------- */
function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function capitalize(s) { return (s || "").charAt(0).toUpperCase() + (s || "").slice(1); }
