// pages/operation/Projects/ClientsProjects.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PeopleTable from "../../Tables";
import {
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

/* ---------- Axios ---------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

/* ===================== Client Projects Page ===================== */
export default function Projects() {
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewFor, setReviewFor] = useState(null);

  // Actions inside project cards
  const renderActions = (row, helpers) => {
    const id = helpers.getId(row);
    return (
      <div className="flex gap-2 w-full">
        <button
          onClick={() =>
            navigate(
              `/chat?projectId=${encodeURIComponent(id)}&with=${encodeURIComponent(
                row.assignee || "Freelancer"
              )}`
            )
          }
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm px-2"
          style={ringStyle}
        >
          <MessageSquare className="w-3 h-3" />
          Chat
        </button>
        <button
          onClick={() => {
            setReviewFor(row);
            setReviewOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl text-white text-xs hover:shadow px-2"
          style={{ backgroundColor: T.primary }}
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
        desktopAsCards
        crudConfig={{ showDetails: false, showRowEdit: false, showDelete: true }}
        renderActions={renderActions}
        // ⬇️ النقرة على صورة الكارد تفتح صفحة التفاصيل
        onCardClick={(row, h) =>
          navigate(`/project/${h.getId(row)}`, {
            state: { project: row, readOnly: true, role: "client" },
          })
        }
      />

      {reviewOpen && reviewFor && (
        <ClientReviewDrawer
          project={reviewFor}
          onClose={() => {
            setReviewOpen(false);
            setReviewFor(null);
          }}
          onApprove={async (projectId, versionId) => {
            await api.post(
              `/api/client/projects/${projectId}/approve`,
              { versionId },
              { headers: token ? { authorization: `Bearer ${token}` } : undefined }
            );
          }}
          onRequestChanges={async (projectId, versionId, message) => {
            await api.post(
              `/api/client/projects/${projectId}/request-changes`,
              { versionId, message },
              { headers: token ? { authorization: `Bearer ${token}` } : undefined }
            );
          }}
          token={token}
        />
      )}
    </>
  );
}

/* ===================== Client Review Drawer ===================== */
function ClientReviewDrawer({ project, onClose, onApprove, onRequestChanges, token }) {
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Lock scroll while drawer open
  useState(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Fetch delivery versions
  useState(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/client/projects/${project.id}/deliveries`, {
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
        });
        if (!alive) return;
        const list = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        list.sort((a, b) => new Date(b.at) - new Date(a.at));
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
            <div className="font-semibold text-slate-800">
              Receive Project — {project.title}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            {/* Latest delivery */}
            <section className="rounded-2xl bg-white p-4" style={ringStyle}>
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-800">Latest delivery</div>
                <button
                  className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50"
                  style={ringStyle}
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 400);
                  }}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {!latest ? (
                <div className="text-sm text-slate-500 mt-3">No deliveries yet.</div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="text-xs text-slate-500">
                    Delivered on {new Date(latest.at).toLocaleString()}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Primary">
                      <a
                        className="text-sky-700 hover:underline break-all"
                        href={latest.links?.primary}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {latest.links?.primary}
                      </a>
                    </Field>
                    {latest.links?.secondary && (
                      <Field label="Secondary">
                        <a
                          className="text-sky-700 hover:underline break-all"
                          href={latest.links?.secondary}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {latest.links?.secondary}
                        </a>
                      </Field>
                    )}
                  </div>

                  {latest.notes && (
                    <Field label="Notes">
                      <div className="text-sm text-slate-700 whitespace-pre-wrap">
                        {latest.notes}
                      </div>
                    </Field>
                  )}

                  <Field label="Attachments">
                    {latest.attachments?.length ? (
                      <ul className="list-disc ml-4 text-sm text-slate-700">
                        {latest.attachments.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-500 text-sm">—</span>
                    )}
                  </Field>
                </div>
              )}
            </section>

            {/* Approve / Request changes */}
            <section className="rounded-2xl bg-white p-4" style={ringStyle}>
              <div className="flex items-center gap-2">
                <button
                  disabled={!latest || submitting}
                  onClick={approve}
                  className="h-11 px-4 rounded-xl text-white text-sm inline-flex items-center gap-2"
                  style={{
                    backgroundColor: T.primary,
                    opacity: !latest || submitting ? 0.75 : 1,
                  }}
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  type="button"
                  disabled={!latest || submitting}
                  onClick={() => setRequesting((v) => !v)}
                  className="h-11 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm inline-flex items-center gap-2"
                  style={ringStyle}
                >
                  <Undo2 className="w-4 h-4" /> Request changes
                </button>
              </div>

              {requesting && (
                <div className="mt-3">
                  <textarea
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="Briefly describe what needs to be changed..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none min-h-[80px]"
                    style={ringStyle}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      disabled={!requestText.trim() || submitting}
                      onClick={request}
                      className="h-10 px-3 rounded-xl text-white text-sm"
                      style={{
                        backgroundColor: T.dark,
                        opacity: !requestText.trim() || submitting ? 0.75 : 1,
                      }}
                    >
                      Send request
                    </button>
                    <button
                      type="button"
                      className="h-10 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm"
                      style={ringStyle}
                      onClick={() => setRequesting(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Delivery history */}
            <section className="rounded-2xl bg-white p-4" style={ringStyle}>
              <div className="font-medium text-slate-800">History</div>
              {versions.length === 0 ? (
                <div className="text-sm text-slate-500 mt-2">No history yet.</div>
              ) : (
                <ol className="mt-3 space-y-3">
                  {versions.map((v) => (
                    <li key={v.id} className="rounded-xl bg-white p-3" style={ringStyle}>
                      <div className="text-xs text-slate-500">
                        {new Date(v.at).toLocaleString()} — {v.id}
                      </div>
                      <div className="mt-1 text-sm text-slate-700">
                        {v.notes || "—"}
                      </div>
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

/* ---------- Helper ---------- */
function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
