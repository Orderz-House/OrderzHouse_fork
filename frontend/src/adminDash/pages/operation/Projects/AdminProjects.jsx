import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getClientProjects } from "../../../api/projects";
import PeopleTable from "../../Tables";
import { useToast } from "../../../../components/toast/ToastProvider";
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
  Download,
  FolderOpen,
} from "lucide-react";

/* ---------- Theme ---------- */
const T = { primary: "#C2410C", dark: "#9A3412", ring: "rgba(15,23,42,.10)" };
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
  baseURL: import.meta.env.VITE_APP_API_URL || "",
  // headers: { "Content-Type": "application/json" },
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
    { label: "Client", key: "client_name" },
    { label: "Freelancer", key: "freelancer_name" },
    { label: "Type", key: "project_type" },
    { label: "Status", key: "status" },
    { label: "Completion", key: "completion_status" },
    { label: "Category", key: "project_category" },
    {
      label: "Created",
      key: "created_at",
      render: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
    },
  ];

  // form fields
  const formFields = [
    { key: "title", label: "Title", required: true },
    { key: "client", label: "Client" },
    { key: "owner", label: "Owner" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Planning", "Active", "On hold", "Done"],
      defaultValue: "Planning",
    },
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
      endpoint="/projects/admin/projects"
      token={token}
      columns={columns}
      formFields={formFields}
      chips={chips}
      chipField="status"
      filters={[
        {
          key: "status",
          label: "Status",
          options: chips.slice(1).map((c) => c.value),
        },
      ]}
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

  // لوحات العميل (استلام التسليم)
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewFor, setReviewFor] = useState(null);
  const [offersMap, setOffersMap] = useState({});

  // طلبات الفريلانسَر (applications)
  const [applicationsMap, setApplicationsMap] = useState({});
  const [appsProject, setAppsProject] = useState(null);
  const [appsOpen, setAppsOpen] = useState(false);
  const [appsSubmitting, setAppsSubmitting] = useState(false);
  const [reviewHelpers, setReviewHelpers] = useState(null);

  // جلب عروض العميل لكل مشاريعه مرة واحدة
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get("/offers/my-projects/offers", {
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
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

  // // جلب طلبات التقديم (applications) لكل مشاريع الكلينت
  // useEffect(() => {
  //   if (!token) return;
  //   let cancelled = false;

  //   (async () => {
  //     try {
  //       const { data } = await api.get("/projects/applications/my-projects", {
  //         headers: token ? { authorization: `Bearer ${token}` } : undefined,
  //       });

  //       const list = Array.isArray(data?.applications)
  //         ? data.applications
  //         : Array.isArray(data?.data)
  //         ? data.data
  //         : Array.isArray(data)
  //         ? data
  //         : [];

  //       const map = {};
  //       for (const app of list) {
  //         const pid = app.project_id ?? app.projectId;
  //         if (!pid) continue;
  //         if (!map[pid]) map[pid] = [];
  //         map[pid].push(app);
  //       }

  //       if (!cancelled) setApplicationsMap(map);
  //     } catch (e) {
  //       console.error("Failed to fetch applications for client projects", e);
  //     }
  //   })();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [token]);

  const fetchApplicationsForProject = async (projectId) => {
    if (!token) return;
    try {
      const { data } = await api.get(
        `/projects/project/${projectId}/applications`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );

      const list = Array.isArray(data?.applications)
        ? data.applications
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setApplicationsMap((prev) => ({
        ...prev,
        [projectId]: list,
      }));
    } catch (e) {
      console.error("Failed to fetch applications for project", projectId, e);
    }
  };

  // تحديث حالة application (accept / reject)
  const handleApplicationAction = async (assignmentId, projectId, action) => {
    if (!token) return;
    setAppsSubmitting(true);
    try {
      await api.post("/projects/applications/decision", { assignmentId, id: assignmentId, projectId, action },
        {
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
          timeout: 15000, // 15s
        }
      );

      setApplicationsMap((prev) => {
        const next = { ...prev };
        const list = next[projectId] ? [...next[projectId]] : [];
        if (!list.length) {
          next[projectId] = list;
          return next;
        }

        if (action === "accept") {
          // واحد مقبول والباقي not_chosen حسب الباك إند
          next[projectId] = list.map((app) => {
            const key = app.assignment_id ?? app.id;
            if (key === assignmentId) {
              return { ...app, status: "active" };
            }
            const statusKey = String(app.status || "").toLowerCase();
            if (statusKey === "pending_client_approval") {
              return { ...app, status: "not_chosen" };
            }
            return app;
          });
        } else {
          // reject فقط لهذا الـ assignment
          next[projectId] = list.map((app) => {
            const key = app.assignment_id ?? app.id;
            if (key === assignmentId) {
              return { ...app, status: "rejected" };
            }
            return app;
          });
        }

        return next;
      });
    } catch (err) {
      console.error("Failed to update application status", err);
      try {
        alert(
          err?.response?.data?.message ||
            "Failed to update application. Please try again."
        );
      } catch {}
    } finally {
      setAppsSubmitting(false);
    }
  };

  // أزرار العميل داخل الكارد
  const renderActions = (row, helpers) => {
    const id = helpers.getId(row);
    const pid = row.id ?? row._id ?? id;
    const appsForProject = applicationsMap[pid] || [];
    const projectType = String(row.project_type || "").toLowerCase();
    const isBidding = projectType === "bidding";

    const pendingCount = appsForProject.filter(
      (a) => String(a.status || "").toLowerCase() === "pending_client_approval"
    ).length;

    const statusKey = String(row.completion_status || row.status || "").toLowerCase();
    const isCompleted = statusKey === "completed" || statusKey === "done";


    return (
      <div className="flex flex-wrap gap-2 w-full">
        <button
          onClick={() => {
            setReviewHelpers(helpers);
            setReviewFor(row);
            setReviewOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl text-white text-xs hover:shadow px-2"
          style={{ backgroundColor: T.primary }}
          title={isCompleted ? "View project files" : "Review & receive delivery"}
        >
          {isCompleted ? (
            <FolderOpen className="w-3 h-3" />
          ) : (
            <SendHorizontal className="w-3 h-3" />
          )}
          {isCompleted ? "Files" : "Receive"}
        </button>

        <button
          onClick={async () => {
            setAppsProject({ id: pid, title: row.title });
            await fetchApplicationsForProject(pid);
            setAppsOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs px-2"
          style={ringStyle}
        >
          <Eye className="w-3 h-3" />
          Applicants
        </button>
      </div>
    );
  };

  const currentApplications =
    appsProject && applicationsMap[appsProject.id]
      ? applicationsMap[appsProject.id]
      : [];

  return (
    <>
      <PeopleTable
        /* header */
        title="My Projects"
        /* data */
        endpoint="/projects/myprojects"
        token={token}
        columns={[
          { label: "Title", key: "title" },
          { label: "Freelancer", key: "assignee" },
          { label: "Due", key: "due" },
          { label: "Budget", key: "budget" },
          { label: "Progress", key: "progress" },
          { label: "Status", key: "completion_status" },
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
        /* UI */
        desktopAsCards
        crudConfig={{
          showDetails: false,
          showRowEdit: false,
          showDelete: false,
        }}
        renderActions={renderActions}
        renderSubtitle={(row) => {
          const pid = row.id ?? row._id;
          const stats = offersMap[pid];
          if (!stats) {
            return <span className="text-xs text-slate-400">Offers: 0</span>;
          }
          return (
            <span className="text-xs text-slate-600">
              Offers: <span className="font-semibold">{stats.total}</span>
              {stats.pending ? ` • Pending: ${stats.pending}` : ""}
              {stats.accepted ? ` • Accepted: ${stats.accepted}` : ""}
            </span>
          );
        }}
        onCardClick={(row, h) =>
          navigate(`/project/${h.getId(row)}`, {
            state: { project: row, readOnly: true, role: "client" },
          })
        }
      />

      {reviewOpen && reviewFor && (
        <ClientReviewDrawer
          project={reviewFor}
          readOnly={String(reviewFor?.completion_status || reviewFor?.status || "").toLowerCase() === "completed"}
          onClose={() => {
            setReviewOpen(false);
            setReviewFor(null);
          }}
          onApprove={async (projectId) => {
            await api.put(
              `/projects/${projectId}/approve`,
              { action: "approve" },
              {
                headers: token
                  ? { authorization: `Bearer ${token}` }
                  : undefined,
              }
            );

            // ✅ تحديث فوري للـ chip بدون ريفرش صفحة
            reviewHelpers?.setRows?.((prev) =>
              prev.map((r) => {
                const rid = reviewHelpers?.getId?.(r) ?? r.id ?? r._id;
                if (String(rid) !== String(projectId)) return r;

                return {
                  ...r,
                  completion_status: "completed", // إذا أنت تعرض completion_status
                  status: "completed", // احتياط لو تعرض status
                };
              })
            );

            // ✅ اختياري: إعادة جلب من السيرفر للتأكيد
            reviewHelpers?.refresh?.();
          }}
          token={token}
        />
      )}

      {appsOpen && appsProject && (
        <ClientApplicationsDrawer
          project={appsProject}
          applications={currentApplications}
          onClose={() => {
            setAppsOpen(false);
            setAppsProject(null);
          }}
          onAction={handleApplicationAction}
          submitting={appsSubmitting}
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
  const toast = useToast(); // ✅

  const renderActions = (row, helpers) => {
    const id = helpers.getId(row);
    const isDone = (row.status ?? "").toLowerCase() === "done";
    return (
      <div className="flex gap-2 w-full">
        <button
          onClick={() => {
            setDeliverFor(row);
            setDeliverOpen(true);
          }}
          disabled={isDone}
          className={`inline-flex items-center justify-center gap-2 h-10 rounded-xl text-white text-xs px-2 ${
            isDone ? "opacity-60 cursor-not-allowed" : "hover:shadow"
          }`}
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
      (payload.files || []).forEach((f) => fd.append("project_files", f));

      await api.post(`/projects/${project.id}/deliver`, fd, {
        headers: { ...(token ? { authorization: `Bearer ${token}` } : {}) },
      });

      toast?.success?.("Delivery submitted successfully ✅");
      setDeliverOpen(false);
      setDeliverFor(null);
    } catch (err) {
      console.error(err);
      toast?.error?.(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setDeliverSubmitting(false);
    }
  };

  return (
    <>
      <PeopleTable
        /* header */
        title="My Assigned Projects"
        /* data */
        endpoint="/projects/myprojects"
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
        crudConfig={{
          showDetails: false,
          showRowEdit: false,
          showDelete: false,
        }}
        renderActions={renderActions}
        onCardClick={(row, h) =>
          navigate(`/project/${h.getId(row)}`, {
            state: { project: row, readOnly: true, role: "freelancer" },
          })
        }
      />

      {deliverOpen && deliverFor && (
        <DeliverModal
          project={deliverFor}
          onClose={() => {
            setDeliverOpen(false);
            setDeliverFor(null);
          }}
          onSubmit={(payload) =>
            submitDelivery({ project: deliverFor, payload, token })
          }
          submitting={deliverSubmitting}
        />
      )}
    </>
  );
}

/* ===================== Client Drawer (استلام التسليم) ===================== */
function ClientReviewDrawer({
  project,
  onClose,
  onApprove,
  onRequestChanges,
  token,
  readOnly = false,
}) {
  const toast = useToast(); // ✅

  const { userData } = useSelector((s) => s.auth);
  const myId = userData?.id ?? userData?.userId ?? userData?.user_id;

  const freelancerId =
    project?.freelancer_id ??
    project?.freelancerId ??
    project?.assigned_freelancer_id ??
    project?.assignedFreelancerId;

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ states كانت ناقصة
  const [submitting, setSubmitting] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestText, setRequestText] = useState("");

  const canRequest = typeof onRequestChanges === "function";

  /* ---------- Download attachments ---------- */
  const [downloadingMap, setDownloadingMap] = useState({});

  const isAbsoluteUrl = (u) => /^https?:\/\//i.test(String(u || ""));

  const resolveUrl = (u) => {
    if (!u) return null;
    const raw = String(u);
    if (isAbsoluteUrl(raw)) return raw;

    // If api.baseURL is empty, keep it relative (browser will use current origin).
    const base = String(api.defaults.baseURL || "").trim();
    if (!base) return raw;

    const cleanBase = base.replace(/\/$/, "");
    const cleanPath = raw.startsWith("/") ? raw : `/${raw}`;
    return `${cleanBase}${cleanPath}`;
  };

  const fileNameFromContentDisposition = (cd) => {
    if (!cd) return null;
    // filename*=UTF-8''... OR filename="..."
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
    const v = m?.[1] || m?.[2];
    if (!v) return null;
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };

  const fileNameFromUrl = (u) => {
    try {
      const urlObj = new URL(u, window.location.href);
      const last = urlObj.pathname.split("/").filter(Boolean).pop();
      return last || null;
    } catch {
      const parts = String(u || "").split("?")[0].split("/");
      return parts.filter(Boolean).pop() || null;
    }
  };

  const startDownload = async ({ url, name, id }, idx) => {
    const target = resolveUrl(url);
    if (!target) return;

    const key = String(id ?? `${name || "file"}-${idx}`);
    setDownloadingMap((m) => ({ ...m, [key]: true }));

    try {
      const absolute = isAbsoluteUrl(target);
      const client = absolute ? axios : api;
      const headers = !absolute && token ? { authorization: `Bearer ${token}` } : undefined;

      const res = await client.get(target, {
        responseType: "blob",
        headers,
      });

      const cd = res?.headers?.["content-disposition"];
      const fromHeader = fileNameFromContentDisposition(cd);
      const fromUrl = fileNameFromUrl(target);
      const fileName = fromHeader || name || fromUrl || `attachment-${idx + 1}`;

      const blob = res?.data instanceof Blob ? res.data : new Blob([res.data]);
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      toast?.error?.("Failed to download attachment.");
      // Fallback: open in new tab (some servers block blob downloads / CORS)
      try {
        window.open(target, "_blank", "noopener,noreferrer");
      } catch {}
    } finally {
      setDownloadingMap((m) => {
        const next = { ...m };
        delete next[key];
        return next;
      });
    }
  };

  // lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  
  // Backend returns deliveries already grouped:
  // { id, sent_at, files: [ { file_name, file_url, file_size, id, ... } ] }
  const normalizeDelivery = (d, idx) => {
    const at = d?.sent_at ?? d?.sentAt ?? d?.at ?? null;

    const arr = Array.isArray(d?.files)
      ? d.files
      : Array.isArray(d?.attachments)
      ? d.attachments
      : [];

    const attachments = arr.map((f, i) => ({
      id: f?.id ?? `${idx}-${i}`,
      name:
        f?.file_name ??
        f?.name ??
        f?.filename ??
        f?.originalname ??
        `Attachment ${i + 1}`,
      url: f?.file_url ?? f?.url ?? f?.path ?? null,
      size: f?.file_size ?? f?.size ?? 0,
      senderId: f?.sender_id ?? f?.senderId ?? null,
    }));

    return {
      id: d?.id ?? (at ? new Date(at).toISOString() : `delivery-${idx}`),
      at,
      // optional fields (if you later add them in backend)
      notes: d?.notes ?? "",
      links: d?.links ?? {},
      attachments,
    };
  };

  const versions = (Array.isArray(deliveries) ? deliveries : [])
    .map(normalizeDelivery)
    .sort((a, b) => {
      const ta = a.at ? new Date(a.at).getTime() : 0;
      const tb = b.at ? new Date(b.at).getTime() : 0;
      return tb - ta;
    });

  const latest = (() => {
    if (!versions.length) return null;

    // If we know the freelancer id for this project, always prefer the latest delivery from that freelancer.
    if (freelancerId != null) {
      const fromFreelancer = versions.find((v) =>
        (v.attachments || []).some(
          (a) =>
            a?.senderId != null &&
            String(a.senderId) === String(freelancerId)
        )
      );
      if (fromFreelancer) return fromFreelancer;
    }

    if (myId != null) {
      // Otherwise, prefer the most recent delivery that contains files NOT sent by me.
      const other = versions.find((v) =>
        (v.attachments || []).some(
          (a) => a?.senderId != null && String(a.senderId) !== String(myId)
        )
      );
      if (other) return other;
    }

    return versions[0] || null;
  })();

  const filterAttachmentsForDisplay = (atts) => {
    const arr = Array.isArray(atts) ? atts : [];
    if (freelancerId != null) {
      return arr.filter(
        (a) => !a?.senderId || String(a.senderId) === String(freelancerId)
      );
    }
    if (myId != null) {
      return arr.filter(
        (a) => !a?.senderId || String(a.senderId) !== String(myId)
      );
    }
    return arr;
  };

  const shownAttachments = latest
    ? filterAttachmentsForDisplay(latest.attachments)
    : [];

  const latestKey = latest ? String(latest.id ?? latest.at ?? "") : "";
  const historyVersions = latest
    ? versions.filter((v) => String(v.id ?? v.at ?? "") !== latestKey)
    : versions;

// ✅ fetch حقيقي (زر Refresh كان بس يعمل spinner بدون fetch)
  useEffect(() => {
    if (!project?.id || !token) return;
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/projects/${project.id}/deliveries`, {
          headers: { authorization: `Bearer ${token}` },
        });

        if (!alive) return;

        const list = Array.isArray(data?.deliveries)
          ? data.deliveries
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        setDeliveries(list);
      } catch (e) {
        if (alive) console.error("Failed to load deliveries", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [project?.id, token]);

  const refresh = async () => {
    if (!project?.id || !token) return;
    try {
      setLoading(true);
      const { data } = await api.get(
        `/projects/${project.id}/deliveries`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );

      const list = Array.isArray(data?.deliveries)
        ? data.deliveries
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setDeliveries(list);
    } catch (e) {
      console.error("Failed to refresh deliveries", e);
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    try {
      setSubmitting(true);
      await onApprove(project.id); // يستدعي PUT /projects/:id/approve :contentReference[oaicite:4]{index=4}
      toast?.success?.("Project approved ✅");
      onClose();
    } catch (err) {
      console.error(err);
      toast?.error?.(err?.response?.data?.message || "فشل اعتماد المشروع.");
    } finally {
      setSubmitting(false);
    }
  };

  const request = async () => {
    const msg = requestText.trim();
    if (!msg) return;
    if (!canRequest) {
      toast?.error?.("Request changes endpoint is not configured.");
      return;
    }

    try {
      setSubmitting(true);
      await onRequestChanges(project.id, msg);
      toast?.info?.("Change request sent ✉️");
      onClose();
    } catch (err) {
      console.error(err);
      toast?.error?.(
        err?.response?.data?.message || "فشل إرسال طلب التعديلات."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="font-semibold text-slate-800">
              {readOnly ? "Project Files" : "Receive Project"} — {project.title}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            <section className="rounded-2xl bg-white p-4" style={ringStyle}>
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-800">
                  Latest delivery
                </div>
                <button
                  className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50"
                  style={ringStyle}
                  onClick={refresh}
                  disabled={loading}
                  type="button"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>

              {!latest ? (
                <div className="text-sm text-slate-500 mt-3">
                  {loading ? "Loading..." : "No deliveries yet."}
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="text-xs text-slate-500">
                    Delivered on{" "}
                    {latest.at ? new Date(latest.at).toLocaleString() : "—"}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Primary">
                      {latest.links?.primary ? (
                        <a
                          className="text-sky-700 hover:underline break-all"
                          href={latest.links.primary}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {latest.links.primary}
                        </a>
                      ) : (
                        <span className="text-slate-500 text-sm">—</span>
                      )}
                    </Field>

                    {latest.links?.secondary ? (
                      <Field label="Secondary">
                        <a
                          className="text-sky-700 hover:underline break-all"
                          href={latest.links.secondary}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {latest.links.secondary}
                        </a>
                      </Field>
                    ) : null}
                  </div>

                  {latest.notes ? (
                    <Field label="Notes">
                      <div className="text-sm text-slate-700 whitespace-pre-wrap">
                        {latest.notes}
                      </div>
                    </Field>
                  ) : null}

                  <Field label="Attachments">
                    {shownAttachments?.length ? (
                      <ul className="space-y-2 text-sm text-slate-700">
                        {shownAttachments.map((f, idx) => {
                          const name =
                            typeof f === "string"
                              ? f
                              : f?.name ||
                                f?.filename ||
                                f?.originalname ||
                                f?.url ||
                                `Attachment ${idx + 1}`;
                          const url =
                            typeof f === "object" ? f?.url || f?.path : null;
                          const openUrl = url ? resolveUrl(url) : null;
                          const id = typeof f === "object" ? f?.id : null;
                          const key = String(id ?? `${name}-${idx}`);
                          const isDownloading = !!downloadingMap[key];

                          return (
                            <li
                              key={key}
                              className="flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                {openUrl ? (
                                  <a
                                    className="text-sky-700 hover:underline break-all"
                                    href={openUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Open attachment"
                                  >
                                    {name}
                                  </a>
                                ) : (
                                  <span className="break-all">{name}</span>
                                )}
                              </div>

                              {openUrl ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    startDownload({ url: openUrl, name, id }, idx)
                                  }
                                  disabled={isDownloading}
                                  className="inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs shrink-0"
                                  style={ringStyle}
                                  title="Download"
                                >
                                  {isDownloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                  Download
                                </button>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="text-slate-500 text-sm">—</span>
                    )}
                  </Field>
                </div>
              )}
            </section>

            {!readOnly && (
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
                  type="button"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>

                <button
                  type="button"
                  disabled={!latest || submitting || !canRequest}
                  onClick={() => setRequesting((v) => !v)}
                  className="h-11 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm inline-flex items-center gap-2"
                  style={ringStyle}
                >
                  <Undo2 className="w-4 h-4" /> Request changes
                </button>
              </div>

              {requesting ? (
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
                      type="button"
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
              ) : null}
            </section>

            )}
            {/* History */}
            <section className="rounded-2xl bg-white p-4" style={ringStyle}>
              <div className="font-medium text-slate-800">History</div>
              {historyVersions.length === 0 ? (
                <div className="text-sm text-slate-500 mt-2">
                  {loading ? "Loading..." : "No history yet."}
                </div>
              ) : (
                <ol className="mt-3 space-y-3">
                  {historyVersions.map((v) => {
                    const list = filterAttachmentsForDisplay(v.attachments);
                    return (
                      <li
                        key={v.id || v.at}
                        className="rounded-xl bg-white p-3"
                        style={ringStyle}
                      >
                        <div className="text-xs text-slate-500">
                          {v.at ? new Date(v.at).toLocaleString() : "—"}
                        </div>

                        {v.notes ? (
                          <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                            {v.notes}
                          </div>
                        ) : null}

                        <div className="mt-2 text-xs text-slate-500">
                          Attachments
                        </div>

                        {list?.length ? (
                          <ul className="mt-1 space-y-2 text-sm text-slate-700">
                            {list.map((f, idx) => {
                              const name =
                                typeof f === "string"
                                  ? f
                                  : f?.name ||
                                    f?.filename ||
                                    f?.originalname ||
                                    f?.url ||
                                    `Attachment ${idx + 1}`;

                              const url =
                                typeof f === "object" ? f?.url || f?.path : null;

                              const openUrl = url ? resolveUrl(url) : null;
                              const fid = typeof f === "object" ? f?.id : null;

                              const key = String(fid ?? `${name}-${idx}`);
                              const isDownloading = !!downloadingMap[key];

                              return (
                                <li
                                  key={`${v.id || v.at}-${key}`}
                                  className="flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0">
                                    {openUrl ? (
                                      <a
                                        className="text-sky-700 hover:underline break-all"
                                        href={openUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Open attachment"
                                      >
                                        {name}
                                      </a>
                                    ) : (
                                      <span className="break-all">{name}</span>
                                    )}
                                  </div>

                                  {openUrl ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        startDownload(
                                          { url: openUrl, name, id: fid },
                                          idx
                                        )
                                      }
                                      disabled={isDownloading}
                                      className="inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs shrink-0"
                                      style={ringStyle}
                                      title="Download"
                                    >
                                      {isDownloading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Download className="w-4 h-4" />
                                      )}
                                      Download
                                    </button>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <div className="text-sm text-slate-500 mt-1">—</div>
                        )}
                      </li>
                    );
                  })}
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

/* ===================== Client Applications Drawer ===================== */
function ClientApplicationsDrawer({
  project,
  applications,
  onClose,
  onAction,
  submitting,
}) {
  const formatStatus = (status) => {
    const key = String(status || "").toLowerCase();
    if (key === "pending_client_approval") return "Waiting for your decision";
    if (key === "active") return "Accepted";
    if (key === "rejected") return "Rejected";
    if (key === "not_chosen") return "Not chosen";
    return status || "Unknown";
  };

  const statusClasses = (status) => {
    const key = String(status || "").toLowerCase();
    if (key === "pending_client_approval")
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (key === "active")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (key === "rejected") return "bg-rose-50 text-rose-700 border-rose-200";
    if (key === "not_chosen")
      return "bg-slate-50 text-slate-600 border-slate-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="font-semibold text-slate-800">
              Freelancer applications — {project.title}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {applications.length === 0 ? (
              <div className="text-sm text-slate-500">
                No freelancers have applied to this project yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {applications.map((app) => {
                  const key = app.assignment_id ?? app.id;
                  const statusKey = String(app.status || "").toLowerCase();
                  const isPending = statusKey === "pending_client_approval";

                  return (
                    <li
                      key={key}
                      className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-slate-800">
                          {app.freelancer_name || "Freelancer"}
                          {app.freelancer_id && (
                            <span className="ml-2 text-xs text-slate-500">
                              # {app.freelancer_id}
                            </span>
                          )}
                        </div>
                        {app.freelancer_email && (
                          <div className="text-xs text-slate-500">
                            {app.freelancer_email}
                          </div>
                        )}
                        <div className="text-xs text-slate-500">
                          Applied:{" "}
                          {app.assigned_at
                            ? new Date(app.assigned_at).toLocaleString()
                            : "—"}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusClasses(
                              app.status
                            )}`}
                          >
                            {formatStatus(app.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col gap-2 sm:items-end">
                        <button
                          type="button"
                          disabled={!isPending || submitting}
                          onClick={() => onAction(key, project.id, "accept")}
                          className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs text-white ${
                            isPending && !submitting
                              ? "hover:shadow"
                              : "opacity-60 cursor-not-allowed"
                          }`}
                          style={{ backgroundColor: T.primary }}
                        >
                          {submitting && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          <Check className="w-3 h-3" />
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={!isPending || submitting}
                          onClick={() => onAction(key, project.id, "reject")}
                          className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs bg-white text-slate-700 ${
                            isPending && !submitting
                              ? "hover:bg-slate-50"
                              : "opacity-60 cursor-not-allowed"
                          }`}
                          style={ringStyle}
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
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
  const requiredOk = confirmed && files.length > 0;

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
    if (category === "content")
      return <FileText className="w-5 h-5" style={{ color: T.dark }} />;
    if (category === "design")
      return <Palette className="w-5 h-5" style={{ color: T.dark }} />;
    return <Code className="w-5 h-5" style={{ color: T.dark }} />;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <HeaderIcon />
              <div className="font-semibold text-slate-800">
                Deliver Project — {project.title}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* body */}
          <form onSubmit={submit} className="p-5 space-y-5">
            {/* Attachments */}
            <div>
              <label className="text-sm text-slate-600">
                Attachments (optional)
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <label
                  className="inline-flex items-center gap-2 h-11 px-3 rounded-xl bg-white hover:bg-slate-50 cursor-pointer text-sm"
                  style={ringStyle}
                >
                  Upload files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  />
                </label>
                {files.length > 0 && (
                  <div className="text-xs text-slate-600">
                    {files.length} file{files.length > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>
            </div>

            {/* Confirm */}
            <label
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white cursor-pointer"
              style={ringStyle}
            >
              <input
                type="checkbox"
                className="accent-emerald-600"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span className="text-sm text-slate-700">
                I confirm this delivery matches the project requirements.
              </span>
            </label>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Trusted links are preferred over large uploads.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm"
                  style={ringStyle}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!requiredOk || submitting}
                  className="h-11 px-4 rounded-xl text-white text-sm inline-flex items-center gap-2"
                  style={{
                    backgroundColor: T.primary,
                    opacity: !requiredOk || submitting ? 0.75 : 1,
                  }}
                >
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
function capitalize(s) {
  return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}

export { AdminProjects, ClientProjects, FreelancerProjects };
