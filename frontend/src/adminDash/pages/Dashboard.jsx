// Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Users,
  User,
  Briefcase,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  BarChart2,
  FileText,
  BookOpen,
  Plus,
  ListChecks,
} from "lucide-react";

const primary = "#028090";
const themeDark = "#05668D";
const themeLight = "#02C39A";

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || "",
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
    payments: 1204,
    tasks: 58,
    courses: 24,
  },
  revenue: {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    series: [4200,5100,6100,5800,6900,7300,6800,7600,8100,7900,8400,9000],
  },
  recentSignups: [
    { id:"s1", name:"Ahmed", type:"Client", city:"Cairo", date:"2025-10-03" },
    { id:"s2", name:"Lina", type:"Freelancer", city:"Amman", date:"2025-10-03" },
    { id:"s3", name:"Omar", type:"Client", city:"Riyadh", date:"2025-10-02" },
    { id:"s4", name:"Sara", type:"Freelancer", city:"Dubai", date:"2025-10-02" },
  ],
  recentProjects: [
    { id:"p1", title:"Smart ERP Website", client:"ACME", status:"Active", due:"2025-11-10" },
    { id:"p2", title:"Mobile App", client:"Atlas", status:"Planning", due:"2025-12-20" },
    { id:"p3", title:"Backoffice", client:"Innova", status:"On hold", due:"2026-01-15" },
  ],
  pendingVerifications: [
    { id:"v1", name:"Khaled F.", email:"khaled@example.com", phone:"079xxxxxxx", role:"Freelancer", specialization:"Design", createdAt:"2025-10-03" },
    { id:"v2", name:"Maha S.", email:"maha@example.com", phone:"078xxxxxxx", role:"Client", specialization:"—", createdAt:"2025-10-02" },
  ],
  tasksMine: [
    { id:"t1", title:"Review proposal", project:"ERP Website", due:"2025-10-20", status:"In progress" },
    { id:"t2", title:"Send invoice", project:"Mobile App", due:"2025-10-22", status:"Pending" },
    { id:"t3", title:"Upload assets", project:"Landing Page", due:"2025-10-25", status:"Pending" },
  ],
  appointmentsMine: [
    { id:"a1", title:"Kickoff call", with:"ACME", date:"2025-10-18 14:00" },
    { id:"a2", title:"Design review", with:"Atlas", date:"2025-10-21 10:30" },
  ],
  coursesMine: [
    { id:"c1", title:"Design Systems 101", progress:"45%" },
    { id:"c2", title:"Advanced React Patterns", progress:"70%" },
  ],
};

function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  return "user";
}

export default function Dashboard() {
  const { userData } = useSelector((s) => s.auth);
  const role = mapRole(userData?.role_id);

  const [kpis, setKpis] = useState({
    clients: 0, freelancers: 0, projects: 0, appointments: 0,
    revenue: 0, pendingVerifications: 0, payments: 0, tasks: 0, courses: 0
  });
  const [revSeries, setRevSeries] = useState([]);
  const [revLabels, setRevLabels] = useState([]);
  const [signups, setSignups] = useState([]);
  const [projects, setProjects] = useState([]);
  const [verifs, setVerifs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
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
      setTasks(DEMO.tasksMine);
      setMyAppointments(DEMO.appointmentsMine);
      setMyCourses(DEMO.coursesMine);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true); setErr("");
        const reqs = [
          api.get("/overview/summary"),
          api.get("/overview/recent-signups", { params: { limit: 5 } }),
          api.get("/overview/recent-projects", { params: { limit: 5 } }),
          api.get("/verifications", { params: { status: "pending", limit: 5 } }),
        ];
        const [{ data: summary }, { data: sgs }, { data: prj }, { data: vfs }] = await Promise.all(reqs);
        setKpis({ ...DEMO.kpis, ...(summary.kpis || {}) });
        setRevSeries(summary.revenue?.series || []);
        setRevLabels(summary.revenue?.labels || []);
        setSignups(Array.isArray(sgs) ? sgs : sgs?.items ?? []);
        setProjects(Array.isArray(prj) ? prj : prj?.items ?? []);
        setVerifs(Array.isArray(vfs) ? vfs : vfs?.items ?? []);
      } catch (e) {
        console.error(e); setErr("Failed to load overview.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxRev = useMemo(() => Math.max(1, ...revSeries), [revSeries]);
  const totalRev = useMemo(() => revSeries.reduce((a, b) => a + b, 0), [revSeries]);

  const approve = async (id) => {
    const prev = verifs;
    setVerifs((arr) => arr.filter((x) => (x.id ?? x._id) !== id));
    if (MOCK) {
      setKpis((k) => ({ ...k, pendingVerifications: Math.max(0, k.pendingVerifications - 1) }));
      return;
    }
    try {
      await api.post(`/verifications/${id}/approve`);
      setKpis((k) => ({ ...k, pendingVerifications: Math.max(0, k.pendingVerifications - 1) }));
    } catch {
      alert("Approve failed"); setVerifs(prev);
    }
  };
  const reject = async (id) => {
    const prev = verifs;
    setVerifs((arr) => arr.filter((x) => (x.id ?? x._id) !== id));
    if (MOCK) {
      setKpis((k) => ({ ...k, pendingVerifications: Math.max(0, k.pendingVerifications - 1) }));
      return;
    }
    try {
      await api.post(`/verifications/${id}/reject`);
      setKpis((k) => ({ ...k, pendingVerifications: Math.max(0, k.pendingVerifications - 1) }));
    } catch {
      alert("Reject failed"); setVerifs(prev);
    }
  };

  const isAdmin = role === "admin";
  const isClient = role === "client";
  const isFreelancer = role === "freelancer";

  const kpiList = useMemo(() => {
    if (isAdmin) {
      return [
        { title:"Clients", value:kpis.clients.toLocaleString(), icon:<Users /> },
        { title:"Freelancers", value:kpis.freelancers.toLocaleString(), icon:<User /> },
        { title:"Projects", value:kpis.projects.toLocaleString(), icon:<Briefcase /> },
        { title:"Appointments", value:kpis.appointments.toLocaleString(), icon:<Calendar /> },
        { title:"Revenue", value:`$${kpis.revenue.toLocaleString()}`, icon:<CreditCard /> },
        { title:"Verifications", value:kpis.pendingVerifications.toLocaleString(), icon:<BarChart2 /> },
      ];
    }
    if (isClient) {
      return [
        { title:"My Projects", value:kpis.projects.toLocaleString(), icon:<Briefcase /> },
        { title:"Payments", value:kpis.payments.toLocaleString(), icon:<CreditCard /> },
        { title:"Tasks", value:kpis.tasks.toLocaleString(), icon:<ListChecks /> },
      ];
    }
    if (isFreelancer) {
      return [
        { title:"My Projects", value:kpis.projects.toLocaleString(), icon:<Briefcase /> },
        { title:"Payments", value:kpis.payments.toLocaleString(), icon:<CreditCard /> },
        { title:"Tasks", value:kpis.tasks.toLocaleString(), icon:<ListChecks /> },
        { title:"Courses", value:kpis.courses.toLocaleString(), icon:<BookOpen /> },
        { title:"Appointments", value:kpis.appointments.toLocaleString(), icon:<Calendar /> },
      ];
    }
    return [{ title:"Projects", value:kpis.projects.toLocaleString(), icon:<Briefcase /> }];
  }, [isAdmin, isClient, isFreelancer, kpis]);

  const quickActions = useMemo(() => {
    if (isAdmin) {
      return [
        { to:"/admin/people/clients", icon:<User />, label:"New Client" },
        { to:"/admin/operation/projects", icon:<Briefcase />, label:"New Project" },
        { to:"/admin/learning/courses", icon:<BookOpen />, label:"New Course" },
        { to:"/admin/community/news", icon:<FileText />, label:"Post News" },
      ];
    }
    if (isClient) {
      return [
        { to:"/admin/client/projects", icon:<Briefcase />, label:"New Project" },
        { to:"/admin/client/payments", icon:<CreditCard />, label:"Payments" },
        { to:"/admin/client/tasks", icon:<ListChecks />, label:"Tasks" },
      ];
    }
    if (isFreelancer) {
      return [
        { to:"/admin/freelancer/projects", icon:<Briefcase />, label:"My Projects" },
        { to:"/admin/freelancer/payments", icon:<CreditCard />, label:"Payments" },
        { to:"/admin/freelancer/tasks", icon:<ListChecks />, label:"Tasks" },
        { to:"/admin/freelancer/courses", icon:<BookOpen />, label:"Courses" },
        { to:"/admin/freelancer/appointments", icon:<Calendar />, label:"Appointments" },
      ];
    }
    return [];
  }, [isAdmin, isClient, isFreelancer]);

  const titleText =
    isAdmin ? "Admin overview" :
    isClient ? "Client overview" :
    isFreelancer ? "Freelancer overview" : "Dashboard";

  return (
    <div className="relative w-full max-w-[100svw] overflow-x-clip">
      {/* خلفيات ناعمة */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-24 -right-20 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
          style={{ background:`radial-gradient(closest-side, ${primary}22, transparent 70%)` }}
        />
        <div
          className="absolute -bottom-28 -left-24 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-20"
          style={{ background:`radial-gradient(closest-side, ${themeLight}22, transparent 70%)` }}
        />
      </div>

      {/* تصغير عام للصفحة */}
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-0 max-w-5xl mx-auto pt-4 min-w-0 text-[13.5px] sm:text-[14px]">
        {/* عنوان + أكشنات */}
        <div className="flex items-center justify-between min-w-0">
          <h1 className="text-base sm:text-lg font-semibold truncate" style={{ color: themeDark }}>
            {titleText}
          </h1>
          <div className="hidden sm:flex gap-2">
            {quickActions.map((q) => (
              <Link key={q.label} to={q.to} title={q.label}>
                <button className="h-8 px-2.5 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-2 text-xs">
                  <Plus className="w-4 h-4" />
                  {q.icon}
                  <span className="hidden md:inline">{q.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {kpiList.map((k) => (
            <Kpi key={k.title} title={k.title} value={k.value} icon={k.icon} />
          ))}
        </div>

        {/* ====== Admin ====== */}
        {isAdmin ? (
          <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* Revenue */}
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur p-3 sm:p-4 shadow-sm min-w-0">
              <div className="mb-2 flex items-center justify-between min-w-0">
                <div className="font-medium text-slate-700 text-sm sm:text-base truncate">
                  Revenue (last 12 months) — <span className="text-slate-500">sum:</span>{" "}
                  <span className="text-slate-800">${totalRev.toLocaleString()}</span>
                </div>
              </div>

              <div className="w-full max-w-full overflow-hidden">
                <div className="px-1 sm:px-2">
                  <div className="flex items-end gap-[6px] sm:gap-2 h-32 sm:h-40">
                    {revSeries.map((v, i) => (
                      <div key={i} className="flex-1 min-w-0 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t" style={{ height:`${(v / maxRev) * 100}%`, backgroundColor: primary }} />
                        <div className="text-[10px] text-slate-500 truncate">{revLabels[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pending verifications */}
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur p-3 sm:p-4 shadow-sm min-w-0">
              <div className="mb-2 font-semibold text-slate-800 text-sm">Pending verifications</div>
              {loading && <div className="text-slate-500">Loading…</div>}
              {!loading && err && <div className="text-red-600">{"Failed to load."}</div>}
              {!loading && !err && verifs.length === 0 && (
                <div className="text-slate-500">No pending requests.</div>
              )}
              <ul className="space-y-2.5">
                {verifs.map((v) => {
                  const id = v.id ?? v._id;
                  return (
                    <li key={id} className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur p-3 overflow-hidden shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800 break-words whitespace-normal">{v.name}</div>
                          <div className="text-[12px] text-slate-500 break-words whitespace-normal">
                            {v.role} • {v.specialization ?? "—"}{v.city ? ` • ${v.city}` : ""} {v.email ? ` • ${v.email}` : ""}
                          </div>
                        </div>
                        <div className="flex gap-2 sm:justify-end flex-wrap">
                          <button
                            onClick={() => approve(id)}
                            className="h-8 px-2.5 rounded-full border border-[#028090] text-[#028090] hover:bg-[#028090]/5 inline-flex items-center gap-1.5 text-xs"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => reject(id)}
                            className="h-8 px-2.5 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5 text-xs"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          /* ====== Client / Freelancer ====== */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Projects */}
            <Card
              title={isClient ? "My recent projects" : "Recent projects"}
              action={
                <Link className="text-[12px] text-slate-600 hover:underline"
                      to={isClient ? "/admin/client/projects" : isFreelancer ? "/admin/freelancer/projects" : "/admin/operation/projects"}>
                  View all
                </Link>
              }
            >
              <ul className="sm:hidden space-y-2.5">
                {projects.length === 0 && (
                  <li className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur p-3 text-slate-500 text-center shadow-sm">No data.</li>
                )}
                {projects.map((p) => (
                  <li key={p.id ?? p._id} className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-slate-800 font-medium break-words">{p.title}</div>
                        <div className="text-[12px] text-slate-500 break-words">{p.client} • {p.status}</div>
                      </div>
                      <div className="text-[12px] text-slate-500">{p.due}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="hidden sm:block">
                <Table header={["Title","Client","Status","Due"]}
                       rows={projects.map((p) => [p.title, p.client, p.status, p.due])} />
              </div>
            </Card>

            {/* Client-only: tasks */}
            {isClient && (
              <Card title="My tasks">
                <Table header={["Title","Project","Due","Status"]}
                       rows={tasks.map((t) => [t.title, t.project, t.due, t.status])} />
              </Card>
            )}

            {/* Freelancer-only */}
            {isFreelancer && (
              <>
                <Card title="My tasks">
                  <Table header={["Title","Project","Due","Status"]}
                         rows={tasks.map((t) => [t.title, t.project, t.due, t.status])} />
                </Card>
                <Card title="Appointments">
                  <Table header={["Title","With","Date"]}
                         rows={myAppointments.map((a) => [a.title, a.with, a.date])} />
                </Card>
                <Card title="Courses" >
                  <Table header={["Course","Progress"]}
                         rows={myCourses.map((c) => [c.title, c.progress])} />
                </Card>
              </>
            )}
          </div>
        )}

        {/* Admin: additional rows */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <Card title="Recent signups">
              <ul className="sm:hidden space-y-2.5">
                {signups.length === 0 && (
                  <li className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur p-3 text-slate-500 text-center shadow-sm">No data.</li>
                )}
                {signups.map((s) => (
                  <li key={s.id ?? s._id} className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-slate-800 font-medium break-words">{s.name}</div>
                        <div className="text-[12px] text-slate-500 break-words">{s.type}{s.city ? ` • ${s.city}` : ""}</div>
                      </div>
                      <div className="text-[12px] text-slate-500">{s.date}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="hidden sm:block">
                <Table header={["Name","Type","City","Date"]}
                       rows={signups.map((s) => [s.name, s.type, s.city ?? "—", s.date])} />
              </div>
            </Card>

            <Card
              title="Recent projects"
              action={<Link className="text-[12px] text-slate-600 hover:underline" to="/admin/operation/projects">View all</Link>}
            >
              <ul className="sm:hidden space-y-2.5">
                {projects.length === 0 && (
                  <li className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur p-3 text-slate-500 text-center shadow-sm">No data.</li>
                )}
                {projects.map((p) => (
                  <li key={p.id ?? p._id} className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-slate-800 font-medium break-words">{p.title}</div>
                        <div className="text-[12px] text-slate-500 break-words">{p.client} • {p.status}</div>
                      </div>
                      <div className="text-[12px] text-slate-500">{p.due}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="hidden sm:block">
                <Table header={["Title","Client","Status","Due"]}
                       rows={projects.map((p) => [p.title, p.client, p.status, p.due])} />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ UI bits ============ */
function Kpi({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur p-3 sm:p-4 shadow-sm min-w-0">
      <div className="flex items-center gap-3">
        <div
          className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl text-white shrink-0"
          style={{ backgroundColor: primary }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-slate-500 text-[12px] sm:text-xs">{title}</div>
          <div className="mt-0.5 text-base sm:text-lg font-semibold text-slate-800 truncate">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, action, children }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur p-3 sm:p-4 shadow-sm min-w-0">
      <div className="mb-2.5 flex items-center justify-between gap-2 min-w-0">
        <div className="font-semibold text-slate-800 text-sm sm:text-base truncate">{title}</div>
        {action}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Table({ header = [], rows = [] }) {
  return (
    <div className="overflow-x-auto w-full max-w-full">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden rounded-xl border border-slate-200/60">
          <table className="min-w-[420px] w-full table-fixed">
            <thead className="bg-slate-50/70 text-slate-500 text-[11px] sm:text-xs">
              <tr>
                {header.map((h, i) => (
                  <th key={i} className="text-left font-medium px-3 sm:px-4 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={header.length} className="px-4 py-6 text-center text-slate-500">No data.</td>
                </tr>
              )}
              {rows.map((cells, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {cells.map((c, j) => (
                    <td key={j} className="px-3 sm:px-4 py-2.5 truncate break-words whitespace-normal">{c}</td>
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
