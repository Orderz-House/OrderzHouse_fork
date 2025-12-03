import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PeopleTable from "../../Tables";
import { useToast } from "../../../../components/toast/ToastProvider";
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
  baseURL: import.meta.env.VITE_APP_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

/* ===================== Client Projects Page ===================== */
export default function Projects() {
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);
  const location = useLocation();
  const pathname = location.pathname || "";
  const base = pathname.startsWith("/client") ? "/client" : pathname.startsWith("/freelancer") ? "/freelancer" : "/admin";

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewFor, setReviewFor] = useState(null);
  const toast = useToast();
  const [offersMap, setOffersMap] = useState({});

  // 🔍 جلب إحصائيات العروض لكل مشاريع العميل
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get("/offers/my-projects/offers", {
          headers: token
            ? { authorization: `Bearer ${token}` }
            : undefined,
        });

        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.offers)
          ? data.offers
          : [];

        const map = {};
        for (const o of list) {
          const pid = o.project_id ?? o.projectId;
          if (!pid) continue;
          if (!map[pid]) {
            map[pid] = { total: 0, pending: 0, accepted: 0 };
          }
          map[pid].total += 1;
          const status = String(o.offer_status || "").toLowerCase();
          if (status === "pending") map[pid].pending += 1;
          if (status === "accepted") map[pid].accepted += 1;
        }

        if (!cancelled) setOffersMap(map);
      } catch (e) {
        console.error("Failed to fetch offers for client projects", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

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
          onClick={() =>
            navigate(`${base}/project/${encodeURIComponent(id)}`, {
              state: { project: row, readOnly: true, role: "client", tab: "offers" },
            })
          }
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs px-2"
          style={ringStyle}
        >
          Offers
        </button>
        <button
          onClick={() => { setReviewFor(row); setReviewOpen(true); }}
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
          {
            label: "Offers",
            key: "offers",
            render: (row) => {
              const pid = row.id ?? row._id;
              const stats = offersMap[pid];
              if (!stats) return "0";
              const parts = [`${stats.total}`];
              if (stats.pending) parts.push(`pending: ${stats.pending}`);
              if (stats.accepted) parts.push(`accepted: ${stats.accepted}`);
              return parts.join(" | ");
            },
          },
        ]}
        formFields={[]}
        desktopAsCards
        crudConfig={{ showDetails: false, showRowEdit: false, showDelete: true }}
        renderActions={renderActions}
        renderSubtitle={(row) => {
          const pid = row.id ?? row._id;
          const stats = offersMap[pid];
          if (!stats) {
            return (
              <span className="text-xs text-slate-400">
                Offers: 0
              </span>
            );
          }
          return (
            <span className="text-xs text-slate-600">
              Offers:{" "}
              <span className="font-semibold">{stats.total}</span>
              {stats.pending ? ` • Pending: ${stats.pending}` : ""}
              {stats.accepted ? ` • Accepted: ${stats.accepted}` : ""}
            </span>
          );
        }}
        // ⬇️ النقرة على صورة الكارد تفتح صفحة التفاصيل مع بادئة الدور
        onCardClick={(row, h) =>
          navigate(`${base}/project/${h.getId(row)}`, {
            state: { project: row, readOnly: true, role: "client" },
          })
        }
          onDelete={async (row, idx, helpers) => {
            try {
              const projectId = row.id ?? row._id;
              if (!projectId) throw new Error("Missing project ID");
              // API base is set to VITE_APP_API_URL or '/api' — call project delete path relative to that
              await api.delete(`/projects/myprojects/${projectId}`, {
                headers: token ? { authorization: `Bearer ${token}` } : undefined,
              });
              helpers.setRows((prev) => prev.filter((p, i) => i !== idx));
              toast.success("Project deleted successfully.");
            } catch (err) {
              const msg = err?.response?.data?.message || err?.message || "Failed to delete project.";
              toast.error(msg);
            }
          }}
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

/* ===================== Review Modal ===================== */
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

/* ---------- helpers ---------- */
async function submitClientReview({ project, payload, token }) {
  await api.post(`/api/client/projects/${project.id}/reviews`, payload, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
=======
// src/pages/operation/Projects/ClientsProjects.jsx
import React from "react";
import { ClientProjects } from "./AdminProjects.jsx";

export default function ClientsProjects() {
  // صفحة العميل في المشاريع
  return <ClientProjects />;
>>>>>>> 16af400207628dcf9408e6163ac3c82d304a2ffa
}
