import { useSelector } from "react-redux";
import PeopleTable from "../Tables";
import {
  Plus,
  Download,
  Settings,
  Calendar as CalIcon,
  Video,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

/* ===================== THEME ===================== */
const primary = "#028090";
const themeDark = "#05668D";
const ring = "rgba(15,23,42,.10)";
const ringStyle = { border: `1px solid ${ring}` };

/* ===================== ROLE MAP ===================== */
function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 3) return "freelancer";
  return "client"; // no access here
}

/* ===================== ACCESS GUARD (NON-ADMIN/NON-FREELANCER) ===================== */
function AccessDenied() {
  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="rounded-2xl bg-white/80 backdrop-blur shadow-sm p-8 border border-slate-200/80">
        <h2 className="text-xl font-semibold" style={{ color: themeDark }}>
          Access denied
        </h2>
        <p className="mt-2 text-slate-600">
          Appointments are available to Admins and Freelancers only.
        </p>
      </div>
    </div>
  );
}

/* ===================== HERO SECTIONS ===================== */
function AdminHero() {
  return (
    <div
      className="rounded-2xl bg-white/80 backdrop-blur p-4 sm:p-5 shadow-sm relative overflow-hidden"
      style={ringStyle}
    >
      {/* soft background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25"
          style={{ background: `radial-gradient(closest-side, ${primary}22, transparent 70%)` }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(closest-side, ${themeDark}22, transparent 70%)` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap relative z-10">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold" style={{ color: themeDark }}>
            Appointments
          </h1>
          <p className="text-slate-500 text-sm">
            Review, approve, or edit meeting requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white shadow-sm"
            style={{ backgroundColor: primary }}
            title="New appointment"
          >
            <Plus className="w-4 h-4" /> New
          </button>
          <button className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50" style={ringStyle} title="Export">
            <Download className="w-4 h-4" />
          </button>
          <button className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50" style={ringStyle} title="Settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
        <Badge icon={<Video className="w-4 h-4" />} label="Online" />
        <Badge icon={<Phone className="w-4 h-4" />} label="Phone" />
        <Badge icon={<MapPin className="w-4 h-4" />} label="On-site" />
        <Badge icon={<CalIcon className="w-4 h-4" />} label="Calendar sync" />
      </div>
    </div>
  );
}

function FreelancerHero() {
  return (
    <div
      className="rounded-2xl bg-white/80 backdrop-blur p-4 sm:p-5 shadow-sm relative overflow-hidden"
      style={ringStyle}
    >
      {/* soft background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-25"
          style={{ background: `radial-gradient(closest-side, ${primary}22, transparent 70%)` }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(closest-side, ${themeDark}22, transparent 70%)` }}
        />
      </div>

      <div className="flex items-start justify-between gap-3 flex-wrap relative z-10">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold" style={{ color: themeDark }}>
            My meetings
          </h1>
          <p className="text-slate-500 text-sm">Request, track, and join on time</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
            style={ringStyle}
            title="Connect calendar"
          >
            <CalIcon className="w-4 h-4 mr-1" />
            Connect
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white shadow-sm"
            style={{ backgroundColor: primary }}
            title="Request meeting"
          >
            <Plus className="w-4 h-4" /> Request
          </button>
        </div>
      </div>

      {/* Next meeting teaser card */}
      <div className="mt-3 rounded-xl p-4 bg-white shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl grid place-items-center text-white" style={{ background: primary }}>
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-800 truncate">Next: Design review</div>
            <div className="text-xs text-slate-500 truncate">Oct 21, 10:30 • with Atlas</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl px-3 py-2 text-white" style={{ background: primary }} title="Join">
            Join
          </button>
          <button className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50" style={ringStyle} title="Reschedule">
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== SMALL BADGE ===================== */
function Badge({ icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white shadow-sm border border-slate-200/80" title={label}>
      <span className="w-7 h-7 rounded-lg grid place-items-center text-white" style={{ background: primary }}>
        {icon}
      </span>
      <span className="text-slate-700">{label}</span>
    </div>
  );
}

/* ===================== HELPERS ===================== */

function canJoin(row) {
  if (!row) return false;
  if (row.status !== "Approved") return false;
  if (row.channel !== "Online") return false;
  if (!row.meeting_url) return false;
  const start = new Date(row.date).getTime();
  if (Number.isNaN(start)) return true; // if invalid date, allow temporarily
  const now = Date.now();
  const openWindowMs = 10 * 60 * 1000; // opens 10 minutes before start
  return now >= start - openWindowMs;
}

/* ===================== PAGE ===================== */
export default function Appointments() {
  const { userData } = useSelector((s) => s.auth);
  const role = mapRole(userData?.role_id);

  // Non-admin / non-freelancer: block the page
  if (role !== "admin" && role !== "freelancer") {
    return <AccessDenied />;
  }

  // Shared enumerations used in forms/filters
  const statusOptions = ["Pending", "Approved", "Rejected", "Completed", "Canceled"];
  const channelOptions = ["Online", "Phone", "On-site"];

  /* ===================== ADMIN CONFIG ===================== */
  const ADMIN_CFG = {
    title: "Appointments",
    addLabel: "Add Appointment",
    endpoint: "/api/admin/appointments",
    // Notes: when channel is Online prefer filling meeting_url, when On-site prefer location
    columns: [
      { label: "Subject", key: "subject" },
      { label: "With", key: "with" },
      { label: "Date", key: "date" },
      { label: "Channel", key: "channel" },
      { label: "Status", key: "status" },
      { label: "Location", key: "location" },
      { label: "Meeting URL", key: "meeting_url" },
    ],
    // Admin creates/edits appointments and ensures correct fields are set
    formFields: [
      { key: "name", label: "Title (internal)", required: true },
      { key: "subject", label: "Subject", required: true },
      { key: "with", label: "With" },
      { key: "date", label: "Date & time", type: "datetime-local", required: true },
      { key: "channel", label: "Channel", type: "select", options: channelOptions, defaultValue: "Online" },
      { key: "meeting_url", label: "Meeting URL (Zoom/Meet)" },
      { key: "location", label: "Location (if on-site)" },
      { key: "status", label: "Status", type: "select", options: statusOptions, defaultValue: "Pending" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Optional…" },
    ],
    chips: [
      { label: "All", value: "" },
      { label: "Pending", value: "Pending" },
      { label: "Approved", value: "Approved" },
      { label: "Rejected", value: "Rejected" },
      { label: "Completed", value: "Completed" },
      { label: "Canceled", value: "Canceled" },
    ],
    chipField: "status",
    filters: [{ key: "channel", label: "Channel", options: channelOptions }],
    // Keep CRUD actions visible, and add quick Approve/Reject buttons
    hideCrudActions: false,
    renderActions: ({ row }) => {
      const id = row?.id ?? row?._id;
      const approve = async () => {
        // TODO: integrate with your backend:
        // PATCH /api/admin/appointments/:id { status: 'Approved' }
        // then trigger a refetch in PeopleTable or force a refresh
        alert(`Approve appointment ${id}`);
      };
      const reject = async () => {
        // TODO: integrate with your backend:
        // PATCH /api/admin/appointments/:id { status: 'Rejected' }
        alert(`Reject appointment ${id}`);
      };
      return (
        <div className="flex items-center gap-1.5">
          {row?.status === "Pending" && (
            <>
              <button
                onClick={approve}
                className="rounded-xl px-3 py-2 text-white"
                style={{ backgroundColor: primary }}
                title="Approve"
              >
                Approve
              </button>
              <button
                onClick={reject}
                className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
                style={ringStyle}
                title="Reject"
              >
                Reject
              </button>
            </>
          )}
        </div>
      );
    },
  };

  /* ===================== FREELANCER CONFIG ===================== */
  const FREELANCER_CFG = {
    title: "My meetings",
    addLabel: "Request Meeting",
    endpoint: "/api/freelancer/appointments",
    // If appointment is On-site show Location, if Online expect Meeting URL (Join action below)
    columns: [
      { label: "Subject", key: "subject" },
      { label: "With", key: "with" },
      { label: "Date", key: "date" },
      { label: "Channel", key: "channel" },
      { label: "Status", key: "status" },
      { label: "Location", key: "location" },
    ],
    // Freelancer submits request as Pending; admin later approves/rejects and sets link/place
    formFields: [
      { key: "name", label: "Title (internal)", required: true },
      { key: "subject", label: "Subject", required: true },
      { key: "with", label: "With" },
      { key: "date", label: "Preferred date & time", type: "datetime-local", required: true },
      { key: "channel", label: "Preferred channel", type: "select", options: channelOptions, defaultValue: "Online" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Anything helpful for the meeting…" },
      // No meeting_url/status fields here; admin handles these upon approval
    ],
    chips: [
      { label: "All", value: "" },
      { label: "Pending", value: "Pending" },
      { label: "Approved", value: "Approved" },
      { label: "Rejected", value: "Rejected" },
      { label: "Completed", value: "Completed" },
      { label: "Canceled", value: "Canceled" },
    ],
    chipField: "status",
    filters: [{ key: "channel", label: "Channel", options: channelOptions }],
    hideCrudActions: true, // hide Edit/Delete for freelancer
    renderActions: ({ row }) => {
      const joinEnabled = canJoin(row);
      const joinUrl = row?.meeting_url || "#";
      const onJoin = () => {
        if (!joinEnabled) return;
        window.open(joinUrl, "_blank", "noopener,noreferrer");
      };
      const onReschedule = () => {
        // TODO: open a lightweight dialog to request a new date/time (PATCH)
        alert("We will open a reschedule dialog here.");
      };
      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={onJoin}
            disabled={!joinEnabled}
            className={`rounded-xl px-3 py-2 text-white ${joinEnabled ? "" : "opacity-50 cursor-not-allowed"}`}
            style={{ backgroundColor: primary }}
            title={joinEnabled ? "Join now" : "Join opens near the scheduled time"}
          >
            Join
          </button>
          <button
            onClick={onReschedule}
            className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
            style={ringStyle}
            title="Reschedule"
          >
            Reschedule
          </button>
        </div>
      );
    },
  };

  const cfg = role === "admin" ? ADMIN_CFG : FREELANCER_CFG;

  return (
    <div className="relative space-y-4 sm:space-y-6 px-3 sm:px-4 overflow-x-hidden">
      {/* soft page background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-28 -right-16 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(closest-side, ${primary}22, transparent 70%)` }}
        />
        <div
          className="absolute -bottom-28 -left-16 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(closest-side, ${themeDark}22, transparent 70%)` }}
        />
      </div>

      {role === "admin" ? <AdminHero /> : <FreelancerHero />}

      {/* unified table component with role-specific config */}
      <PeopleTable
        title={cfg.title}
        addLabel={cfg.addLabel}
        endpoint={cfg.endpoint}
        columns={cfg.columns}
        formFields={cfg.formFields}
        chips={cfg.chips}
        chipField={cfg.chipField}
        filters={cfg.filters}
        hideCrudActions={cfg.hideCrudActions}
        renderActions={cfg.renderActions}
      />
    </div>
  );
}
 