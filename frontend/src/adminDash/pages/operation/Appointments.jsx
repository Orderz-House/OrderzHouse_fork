import React from "react";
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

const primary = "#028090";
const themeDark = "#05668D";
const ring = "rgba(15,23,42,.10)";
const ringStyle = { border: `1px solid ${ring}` };

function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 3) return "freelancer";
  return "client";
}

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

function AdminHero() {
  return (
    <div
      className="rounded-2xl bg-white/80 backdrop-blur p-4 sm:p-5 shadow-sm relative overflow-hidden"
      style={ringStyle}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25"
          style={{
            background: `radial-gradient(closest-side, ${primary}22, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20"
          style={{
            background: `radial-gradient(closest-side, ${themeDark}22, transparent 70%)`,
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap relative z-10">
        <div>
          <h1
            className="text-lg sm:text-xl font-semibold"
            style={{ color: themeDark }}
          >
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
          >
            <Plus className="w-4 h-4" /> New
          </button>
          <button
            className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
            style={ringStyle}
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
            style={ringStyle}
          >
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
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-25"
          style={{
            background: `radial-gradient(closest-side, ${primary}22, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-20"
          style={{
            background: `radial-gradient(closest-side, ${themeDark}22, transparent 70%)`,
          }}
        />
      </div>

      <div className="flex items-start justify-between gap-3 flex-wrap relative z-10">
        <div className="min-w-0">
          <h1
            className="text-lg sm:text-xl font-semibold"
            style={{ color: themeDark }}
          >
            My meetings
          </h1>
          <p className="text-slate-500 text-sm">
            Request, track, and join on time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
            style={ringStyle}
          >
            <CalIcon className="w-4 h-4 mr-1" />
            Connect
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white shadow-sm"
            style={{ backgroundColor: primary }}
          >
            <Plus className="w-4 h-4" /> Request
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-xl p-4 bg-white shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl grid place-items-center text-white"
            style={{ background: primary }}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-800 truncate">
              Next: Design review
            </div>
            <div className="text-xs text-slate-500 truncate">
              Oct 21, 10:30 • with Atlas
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl px-3 py-2 text-white"
            style={{ background: primary }}
          >
            Join
          </button>
          <button
            className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
            style={ringStyle}
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, label }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white shadow-sm border border-slate-200/80"
      title={label}
    >
      <span
        className="w-7 h-7 rounded-lg grid place-items-center text-white"
        style={{ background: primary }}
      >
        {icon}
      </span>
      <span className="text-slate-700">{label}</span>
    </div>
  );
}

function canJoin(row) {
  if (!row) return false;
  if (row.status !== "accepted") return false;
  if (row.channel !== "online") return false;
  if (!row.meeting_url) return false;
  const start = new Date(row.date).getTime();
  if (Number.isNaN(start)) return true;
  const now = Date.now();
  const openWindowMs = 10 * 60 * 1000;
  return now >= start - openWindowMs;
}

export default function Appointments() {
  const { userData, token } = useSelector((s) => s.auth);
  const role = mapRole(userData?.role_id);

  if (role !== "admin" && role !== "freelancer") return <AccessDenied />;

  const statusOptions = ["pending", "accepted", "rejected", "completed"];
  const channelOptions = ["online", "in_company"];

  const ADMIN_CFG = {
    title: "Appointments",
    addLabel: "Add Appointment",
    endpoint: "/appointments/get",
    createEndpoint: "/appointments/admin/appointments",
    columns: [
      { label: "Freelancer", key: "freelancer_id" },
      { label: "Type", key: "appointment_type" },
      { label: "Date", key: "appointment_date" },
      { label: "Status", key: "status" },
      { label: "Message", key: "message" },
    ],
    formFields: [
      { key: "freelancer_id", label: "Freelancer ID", required: true },
      {
        key: "appointment_date",
        label: "Date & time",
        type: "datetime-local",
        required: true,
      },
      {
        key: "appointment_type",
        label: "Type",
        type: "select",
        options: channelOptions,
        defaultValue: "online",
      },
      { key: "message", label: "Message", type: "textarea" },
    ],
    chips: [
      { label: "All", value: "" },
      { label: "Pending", value: "pending" },
      { label: "Accepted", value: "accepted" },
      { label: "Rejected", value: "rejected" },
      { label: "Completed", value: "completed" },
    ],
    chipField: "status",
    filters: [{ key: "appointment_type", label: "Type", options: channelOptions }],
    hideCrudActions: false,
    renderActions: ({ row }) => {
      const id = row?.id;
      const approve = async () => {
        await fetch(`/appointments/accept/${id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      };
      const reject = async () => {
        await fetch(`/appointments/reject/${id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      };
      return (
        <div className="flex items-center gap-1.5">
          {row?.status === "pending" && (
            <>
              <button
                onClick={approve}
                className="rounded-xl px-3 py-2 text-white"
                style={{ backgroundColor: primary }}
              >
                Approve
              </button>
              <button
                onClick={reject}
                className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
                style={ringStyle}
              >
                Reject
              </button>
            </>
          )}
        </div>
      );
    },
  };

  const FREELANCER_CFG = {
    title: "My meetings",
    addLabel: "Request Meeting",
    endpoint: "/appointments/my",
    createEndpoint: "/appointments",
    columns: [
      { label: "Type", key: "appointment_type" },
      { label: "Date", key: "appointment_date" },
      { label: "Status", key: "status" },
      { label: "Message", key: "message" },
    ],
    formFields: [
      {
        key: "appointment_date",
        label: "Preferred date & time",
        type: "datetime-local",
        required: true,
      },
      {
        key: "appointment_type",
        label: "Type",
        type: "select",
        options: channelOptions,
        defaultValue: "online",
      },
      { key: "message", label: "Message", type: "textarea" },
    ],
    chips: [
      { label: "All", value: "" },
      { label: "Pending", value: "pending" },
      { label: "Accepted", value: "accepted" },
      { label: "Rejected", value: "rejected" },
      { label: "Completed", value: "completed" },
    ],
    chipField: "status",
    filters: [{ key: "appointment_type", label: "Type", options: channelOptions }],
    hideCrudActions: true,
    renderActions: ({ row }) => {
      const joinEnabled = canJoin(row);
      const joinUrl = row?.meeting_url || "#";
      const onJoin = () => {
        if (!joinEnabled) return;
        window.open(joinUrl, "_blank", "noopener,noreferrer");
      };
      const onReschedule = async () => {
        const newDate = prompt("Enter new date (YYYY-MM-DD HH:mm):");
        if (!newDate) return;
        await fetch(`/appointments/reschedule/${row.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ appointment_date: newDate }),
        });
      };
      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={onJoin}
            disabled={!joinEnabled}
            className={`rounded-xl px-3 py-2 text-white ${
              joinEnabled ? "" : "opacity-50 cursor-not-allowed"
            }`}
            style={{ backgroundColor: primary }}
          >
            Join
          </button>
          <button
            onClick={onReschedule}
            className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50"
            style={ringStyle}
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
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-28 -right-16 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-20"
          style={{
            background: `radial-gradient(closest-side, ${primary}22, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-28 -left-16 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-20"
          style={{
            background: `radial-gradient(closest-side, ${themeDark}22, transparent 70%)`,
          }}
        />
      </div>

      {role === "admin" ? <AdminHero /> : <FreelancerHero />}

      <PeopleTable
        title={cfg.title}
        addLabel={cfg.addLabel}
        endpoint={cfg.endpoint}
        createEndpoint={cfg.createEndpoint}
        columns={cfg.columns}
        formFields={cfg.formFields}
        chips={cfg.chips}
        chipField={cfg.chipField}
        filters={cfg.filters}
        hideCrudActions={cfg.hideCrudActions}
        renderActions={cfg.renderActions}
        token={token}
      />
    </div>
  );
}
