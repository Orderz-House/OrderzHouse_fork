// Projects.jsx — كامل ومعدل
import { useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
    { key: "title", label: "Title", required: true },
    { key: "client", label: "Client" },
    { key: "owner", label: "Owner" },
    { key: "status", label: "Status", type: "select", options: ["Planning", "Active", "On hold", "Done"], defaultValue: "Planning" },
    { key: "progress", label: "Progress %", type: "number", defaultValue: 0 },
    { key: "budget", label: "Budget", type: "number", placeholder: "12000" },
    { key: "due", label: "Due", type: "date" },
    { key: "description", label: "Description", type: "textarea" },
  ];

  const chips = [
    { label: "All", value: "" },
    { label: "Planning", value: "Planning" },
    { label: "Active", value: "Active" },
    { label: "On hold", value: "On hold" },
    { label: "Done", value: "Done" },
  ];

  return (
    <PeopleTable
      /* header */
      title="Projects"
      addLabel="Add Project"
      /* data */
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
      /* open details (admin route غالباً نسبي) */
      onCardClick={(row, h) => navigate(`${h.getId(row)}`)}
    />
  );
}

/* ===================== Client ===================== */
function ClientProjects() {
  const navigate = useNavigate();
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
        /* header */
        title="My Projects"
        /* data */
        endpoint="/api/client/projects"
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
        onCardClick={(row, h) => navigate(`/project/${h.getId(row)}`, { state: { project: row, readOnly: true, role: "client" } })}
      />

      {reviewOpen && reviewFor && (
        <ClientReviewDrawer
          project={reviewFor}
          onClose={() => { setReviewOpen(false); setReviewFor(null); }}
          onApprove={async (projectId, versionId) => {
            await api.post(`/api/client/projects/${projectId}/approve`, { versionId }, { headers: token ? { authorization: `Bearer ${token}` } : undefined });
          }}
          onRequestChanges={async (projectId, versionId, message) => {
            await api.post(`/api/client/projects/${projectId}/request-changes`, { versionId, message }, { headers: token ? { authorization: `Bearer ${token}` } : undefined });
          }}
          token={token}
        />
      )}
    </>
  );
}

/* ===================== Freelancer ===================== */
function FreelancerProjects() {
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  // form deliver
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [deliverFor, setDeliverFor] = useState(null);
  const [deliverSubmitting, setDeliverSubmitting] = useState(false);

  const renderActions = (row, helpers) => {
    const id = helpers.getId(row);
    const isDone = (row.status ?? "").toLowerCase() === "done";
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
      const fd = new FormData();
      fd.append("category", payload.category);
      fd.append("notes", payload.notes || "");
      fd.append("links", JSON.stringify(payload.links || {}));
      fd.append("checklist", JSON.stringify(payload.checklist || {}));
      (payload.files || []).forEach((f) => fd.append("files", f));
      await api.post(`/api/freelancer/projects/${project.id}/deliver`, fd, {
        headers: { ...(token ? { authorization: `Bearer ${token}` } : {}) },
      });
    } catch (e) {
      alert("Failed to deliver. Please try again.");
    } finally {
      setDeliverSubmitting(false);
      setDeliverOpen(false);
      setDeliverFor(null);
    }
  };

  return (
    <>
      <PeopleTable
        /* header */
        title="My Assigned Projects"
        /* data */
        endpoint="/api/freelancer/projects"
        token={token}
        columns={[
          { label: "Title", key: "title" },
          { label: "Client", key: "client" },
          { label: "Due", key: "due" },
          { label: "Budget", key: "budget" },
          { label: "Progress", key: "progress" },
          { label: "Status", key: "status" },
        ]}
        formFields={[]}
        /* UI */
        desktopAsCards
        crudConfig={{ showDetails: false, showRowEdit: false, showDelete: false }}
        renderActions={renderActions}
        onCardClick={(row, h) => navigate(`/project/${h.getId(row)}`, { state: { project: row, readOnly: true, role: "freelancer" } })}
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

/* ===================== Client Drawer ===================== */
function ClientReviewDrawer({ project, onClose, onApprove, onRequestChanges, token }) {
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // lock scroll
  useState(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // fetch deliveries
  useState(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/client/projects/${project.id}/deliveries`, {
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
        });
        if (!alive) return;
        const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        list.sort((a, b) => new Date(b.at) - new Date(a.at)); // newest first
        setVersions(list);
      } catch {
        if (!alive) return;
        setVersions([]);
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

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="font-semibold text-slate-800">Receive Project — {project.title}</div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Body */}
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

            {/* Actions */}
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

            {/* History */}
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
    </div>,
    document.body
  );
}

/* ===================== Freelancer Modal ===================== */
function DeliverModal({ project, onClose, onSubmit, submitting }) {
  const [category, setCategory] = useState(project.category || "programming");
  const [primaryLink, setPrimaryLink] = useState("");
  const [secondaryLink, setSecondaryLink] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const readOnlyCategory = !!project.category;
  const requiredOk = !!(primaryLink && primaryLink.trim()) && !!confirmed;

  const handleFile = (e) => setFiles(Array.from(e.target.files || []));

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

  const HeaderIcon = () => {
    if (category === "content") return <FileText className="w-5 h-5" style={{ color: T.dark }} />;
    if (category === "design") return <Palette className="w-5 h-5" style={{ color: T.dark }} />;
    return <Code className="w-5 h-5" style={{ color: T.dark }} />;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <HeaderIcon />
              <div className="font-semibold text-slate-800">Deliver Project — {project.title}</div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* body */}
          <form onSubmit={submit} className="p-5 space-y-5">
            {/* Category + Notes */}
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

            {/* Links */}
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

            {/* Attachments */}
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

            {/* Confirm */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white cursor-pointer" style={ringStyle}>
              <input type="checkbox" className="accent-emerald-600" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              <span className="text-sm text-slate-700">I confirm this delivery matches the project requirements.</span>
            </label>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-500">Trusted links are preferred over large uploads.</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="h-11 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm" style={ringStyle} disabled={submitting}>Cancel</button>
                <button type="submit" disabled={!requiredOk || submitting} className="h-11 px-4 rounded-xl text-white text-sm inline-flex items-center gap-2" style={{ backgroundColor: T.primary, opacity: !requiredOk || submitting ? 0.75 : 1 }}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Delivery
                </button>
              </div>
            </div>
          </form>
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

