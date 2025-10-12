import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FiUsers,
  FiUser,
  FiBriefcase,
  FiCreditCard,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiBarChart2,
  FiFileText,
  FiBookOpen,
  FiPlus,
} from "react-icons/fi";

import OutlineButton from "../../components/buttons/OutlineButton.jsx";
import GradientButton from "../../components/buttons/GradientButton.jsx";

const primary = "#028090";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

const MOCK = true;
const DEMO = {
  kpis: {
    clients: 3120,
    freelancers: 1850,
    projects: 96,
    appointments: 42,
    revenue: 53210,
    pendingVerifications: 7,
  },
  revenue: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    series: [
      4200, 5100, 6100, 5800, 6900, 7300, 6800, 7600, 8100, 7900, 8400, 9000,
    ],
  },
  recentSignups: [
    {
      id: "s1",
      name: "Ahmed",
      type: "Client",
      city: "Cairo",
      date: "2025-10-03",
    },
    {
      id: "s2",
      name: "Lina",
      type: "Freelancer",
      city: "Amman",
      date: "2025-10-03",
    },
    {
      id: "s3",
      name: "Omar",
      type: "Client",
      city: "Riyadh",
      date: "2025-10-02",
    },
    {
      id: "s4",
      name: "Sara",
      type: "Freelancer",
      city: "Dubai",
      date: "2025-10-02",
    },
  ],
  recentProjects: [
    {
      id: "p1",
      title: "Smart ERP Website",
      client: "ACME",
      status: "Active",
      due: "2025-11-10",
    },
    {
      id: "p2",
      title: "Mobile App",
      client: "Atlas",
      status: "Planning",
      due: "2025-12-20",
    },
    {
      id: "p3",
      title: "Backoffice",
      client: "Innova",
      status: "On hold",
      due: "2026-01-15",
    },
  ],
  pendingVerifications: [
    {
      id: "v1",
      name: "Khaled F.",
      email: "khaled@example.com",
      phone: "079xxxxxxx",
      role: "Freelancer",
      specialization: "Design",
      createdAt: "2025-10-03",
    },
    {
      id: "v2",
      name: "Maha S.",
      email: "maha@example.com",
      phone: "078xxxxxxx",
      role: "Client",
      specialization: "—",
      createdAt: "2025-10-02",
    },
  ],
};

export default function Dashboard() {
  const [kpis, setKpis] = useState({
    clients: 0,
    freelancers: 0,
    projects: 0,
    appointments: 0,
    revenue: 0,
    pendingVerifications: 0,
  });
  const [revSeries, setRevSeries] = useState([]);
  const [revLabels, setRevLabels] = useState([]);
  const [signups, setSignups] = useState([]);
  const [projects, setProjects] = useState([]);
  const [verifs, setVerifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (MOCK) {
      setKpis(DEMO.kpis);
      setRevSeries(DEMO.revenue.series);
      setRevLabels(DEMO.revenue.labels);
      setSignups(DEMO.recentSignups);
      setProjects(DEMO.recentProjects);
      setVerifs(DEMO.pendingVerifications);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [{ data: summary }, { data: sgs }, { data: prj }, { data: vfs }] =
          await Promise.all([
            api.get("/api/overview/summary"),
            api.get("/api/overview/recent-signups", { params: { limit: 5 } }),
            api.get("/api/overview/recent-projects", { params: { limit: 5 } }),
            api.get("/api/verifications", {
              params: { status: "pending", limit: 5 },
            }),
          ]);
        setKpis(summary.kpis);
        setRevSeries(summary.revenue.series);
        setRevLabels(summary.revenue.labels);
        setSignups(Array.isArray(sgs) ? sgs : sgs?.items ?? []);
        setProjects(Array.isArray(prj) ? prj : prj?.items ?? []);
        setVerifs(Array.isArray(vfs) ? vfs : vfs?.items ?? []);
      } catch (e) {
        console.error(e);
        setErr("Failed to load overview.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxRev = useMemo(() => Math.max(1, ...revSeries), [revSeries]);
  const totalRev = useMemo(
    () => revSeries.reduce((a, b) => a + b, 0),
    [revSeries]
  );

  const approve = async (id) => {
    const prev = verifs;
    setVerifs((arr) => arr.filter((x) => (x.id ?? x._id) !== id));
    if (MOCK) {
      setKpis((k) => ({
        ...k,
        pendingVerifications: Math.max(0, k.pendingVerifications - 1),
      }));
      return;
    }
    try {
      await api.post(`/api/verifications/${id}/approve`);
      setKpis((k) => ({
        ...k,
        pendingVerifications: Math.max(0, k.pendingVerifications - 1),
      }));
    } catch {
      alert("Approve failed");
      setVerifs(prev);
    }
  };
  const reject = async (id) => {
    const prev = verifs;
    setVerifs((arr) => arr.filter((x) => (x.id ?? x._id) !== id));
    if (MOCK) {
      setKpis((k) => ({
        ...k,
        pendingVerifications: Math.max(0, k.pendingVerifications - 1),
      }));
      return;
    }
    try {
      await api.post(`/api/verifications/${id}/reject`);
      setKpis((k) => ({
        ...k,
        pendingVerifications: Math.max(0, k.pendingVerifications - 1),
      }));
    } catch {
      alert("Reject failed");
      setVerifs(prev);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 w-full max-w-[100svw] overflow-x-clip">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
          Dashboard
        </h1>
        <div className="hidden sm:flex gap-2">
          <Quick
            to="/admin/people/clients"
            icon={<FiUser />}
            label="New Client"
          />
          <Quick
            to="/admin/projects"
            icon={<FiBriefcase />}
            label="New Project"
          />
          <Quick
            to="/admin/learning/courses"
            icon={<FiBookOpen />}
            label="New Course"
          />
          <Quick to="/admin/news" icon={<FiFileText />} label="Post News" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Kpi
          title="Clients"
          value={kpis.clients.toLocaleString()}
          icon={<FiUsers />}
        />
        <Kpi
          title="Freelancers"
          value={kpis.freelancers.toLocaleString()}
          icon={<FiUser />}
        />
        <Kpi
          title="Projects"
          value={kpis.projects.toLocaleString()}
          icon={<FiBriefcase />}
        />
        <Kpi
          title="Appointments"
          value={kpis.appointments.toLocaleString()}
          icon={<FiCalendar />}
        />
        <Kpi
          title="Revenue"
          value={`$${kpis.revenue.toLocaleString()}`}
          icon={<FiCreditCard />}
        />
        <Kpi
          title="Verifications"
          value={kpis.pendingVerifications.toLocaleString()}
          icon={<FiBarChart2 />}
        />
      </div>

      {/* Chart + Pending */}
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(560px,2fr)_minmax(340px,1fr)]">
        {/* Revenue chart */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-medium text-slate-700 text-sm sm:text-base">
              Revenue (last 12 months) —{" "}
              <span className="text-slate-500">sum:</span>{" "}
              <span className="text-slate-800">
                ${totalRev.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="w-full max-w-full overflow-hidden">
            <div className="px-1 sm:px-2">
              <div className="flex items-end gap-[6px] sm:gap-2 h-36 sm:h-44">
                {revSeries.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-0 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${(v / maxRev) * 100}%`,
                        backgroundColor: primary,
                      }}
                    />
                    <div className="text-[10px] text-slate-500 truncate">
                      {revLabels[i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pending verifications */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm min-w-0">
          <div className="mb-3 font-semibold text-slate-800">
            Pending verifications
          </div>
          {loading && <div className="text-slate-500">Loading…</div>}
          {!loading && err && <div className="text-red-600">{err}</div>}
          {!loading && !err && verifs.length === 0 && (
            <div className="text-slate-500">No pending requests.</div>
          )}
          <ul className="space-y-3">
            {verifs.map((v) => {
              const id = v.id ?? v._id;
              return (
                <li
                  key={id}
                  className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 break-words whitespace-normal">
                        {v.name}
                      </div>
                      <div className="text-xs text-slate-500 break-words whitespace-normal">
                        {v.role} • {v.specialization ?? "—"}
                        {v.city ? ` • ${v.city}` : ""}{" "}
                        {v.email ? ` • ${v.email}` : ""}
                      </div>
                    </div>
                    <div className="flex gap-2 sm:justify-end flex-wrap no-wrap-1700">
                      <GradientButton
                        onClick={() => approve(id)}
                        className="flex-1 sm:flex-none gap-1"
                        title="Approve"
                      >
                        <FiCheckCircle />
                        <span className="text-sm">Approve</span>
                      </GradientButton>

                      <OutlineButton
                        onClick={() => reject(id)}
                        className=""
                        title="Reject"
                      >
                        <FiXCircle />
                        <span className="text-sm">Reject</span>
                      </OutlineButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Recent Signups & Projects */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Card title="Recent signups">
          <ul className="sm:hidden space-y-3">
            {signups.length === 0 && (
              <li className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 text-center">
                No data.
              </li>
            )}
            {signups.map((s) => (
              <li
                key={s.id ?? s._id}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-slate-800 font-medium">{s.name}</div>
                    <div className="text-xs text-slate-500">
                      {s.type} {s.city ? `• ${s.city}` : ""}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{s.date}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden sm:block">
            <Table
              header={["Name", "Type", "City", "Date"]}
              rows={signups.map((s) => [s.name, s.type, s.city ?? "—", s.date])}
            />
          </div>
        </Card>

        <Card
          title="Recent projects"
          action={
            <Link
              className="text-sm text-slate-600 hover:underline"
              to="/admin/projects"
            >
              View all
            </Link>
          }
        >
          <ul className="sm:hidden space-y-3">
            {projects.length === 0 && (
              <li className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 text-center">
                No data.
              </li>
            )}
            {projects.map((p) => (
              <li
                key={p.id ?? p._id}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-slate-800 font-medium">{p.title}</div>
                    <div className="text-xs text-slate-500">
                      {p.client} • {p.status}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{p.due}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden sm:block">
            <Table
              header={["Title", "Client", "Status", "Due"]}
              rows={projects.map((p) => [p.title, p.client, p.status, p.due])}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============ UI bits ============ */
function Kpi({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 sm:p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl text-white"
          style={{ backgroundColor: primary }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-slate-500 text-xs sm:text-sm">{title}</div>
          <div className="mt-0.5 text-lg sm:text-xl font-semibold text-slate-800 truncate">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, action, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="font-semibold text-slate-800 text-base">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Table({ header = [], rows = [] }) {
  return (
    <div className="overflow-x-auto w-full max-w-full">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-[560px] w-full table-fixed">
            <thead className="bg-slate-50/70 text-slate-500 text-xs sm:text-sm">
              <tr>
                {header.map((h, i) => (
                  <th
                    key={i}
                    className="text-left font-medium px-3 sm:px-4 py-2"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 text-sm">
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={header.length}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No data.
                  </td>
                </tr>
              )}
              {rows.map((cells, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {cells.map((c, j) => (
                    <td key={j} className="px-3 sm:px-4 py-3 truncate">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Quick({ to, icon, label }) {
  return (
    <Link to={to} title={label}>
      <OutlineButton
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          borderColor: primary,
          color: primary,
        }}
      >
        <FiPlus />
        {icon}
        <span className="hidden md:inline">{label}</span>
      </OutlineButton>
    </Link>
  );
}
