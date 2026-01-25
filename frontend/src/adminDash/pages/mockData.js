export const MOCK_ENABLED = false;

/* ============= Existing mocks ============= */
const mockCategories = [
  { id: "cat-design", name: "Design", slug: "design", description: "Branding, UI/UX", image: "https://picsum.photos/seed/design/960/540" },
  { id: "cat-programming", name: "Programming", slug: "programming", description: "Web & mobile", image: "https://picsum.photos/seed/code/960/540" },
  { id: "cat-content", name: "Content", slug: "content", description: "Copy & blog", image: "https://picsum.photos/seed/content/960/540" },
];

const mockSubCategories = {
  "cat-design": [
    { id: "sub-logo", name: "Logo", slug: "logo", description: "Marks & symbols" },
    { id: "sub-ui", name: "UI Design", slug: "ui-design", description: "Interfaces" },
  ],
  "cat-programming": [
    { id: "sub-web", name: "Web Apps", slug: "web", description: "React, Next, APIs" },
    { id: "sub-mobile", name: "Mobile Apps", slug: "mobile", description: "iOS/Android" },
  ],
  "cat-content": [
    { id: "sub-blog", name: "Blog", slug: "blog", description: "Articles" },
    { id: "sub-social", name: "Social", slug: "social", description: "Posts" },
  ],
};

const mockSubSub = {
  "cat-design|sub-logo": [
    { id: "ss-emblem", name: "Emblem", slug: "emblem", description: "Vintage marks" },
    { id: "ss-wordmark", name: "Wordmark", slug: "wordmark", description: "Typography logos" },
  ],
  "cat-programming|sub-web": [
    { id: "ss-next", name: "Next.js", slug: "next", description: "SSR/SSG apps" },
    { id: "ss-nest", name: "NestJS", slug: "nest", description: "API services" },
  ],
};

const mockProjects = [
  { id: "p-1", title: "Website Revamp", client: "Acme", status: "Active", due: "2025-12-01", budget: 5000, image: "https://picsum.photos/seed/proj1/960/540" },
  { id: "p-2", title: "Mobile MVP", client: "Globex", status: "Scheduled", due: "2025-11-10", budget: 8000 },
  { id: "p-3", title: "Brand Kit", client: "Umbrella", status: "Resolved", due: "2025-09-05", budget: 3000 },
];

const mockClients = [
  { id: "c-1", name: "John Carter", email: "info@battechno.com", country: "UAE", status: "Online", avatar: "https://i.pravatar.cc/80?img=12" },
  { id: "c-2", name: "Mina Rose", email: "info@battechno.com", country: "KSA", status: "Offline" },
];

const mockFreelancers = [
  { id: "f-1", name: "Ali Hassan", email: "info@battechno.com", role: "Designer", status: "Online", verified: "Yes", avatar: "https://i.pravatar.cc/80?img=5" },
  { id: "f-2", name: "Sara Noor", email: "info@battechno.com", role: "Frontend", status: "Offline", verified: "Yes" },
];

const mockAdmins = [
  { id: "a-1", name: "Admin One", email: "info@battechno.com", role: "Super Admin", status: "Online", verified: "Yes" },
  { id: "a-2", name: "Admin Two", email: "info@battechno.com", role: "Moderator", status: "Offline" },
];

const mockVerifications = [
  { id: "v-1", name: "Talal", email: "info@battechno.com", phone: "+971...", specialization: "UI", submittedAt: "2025-10-01", status: "Pending" },
  { id: "v-2", name: "Nora",  email: "info@battechno.com",  phone: "+966...", specialization: "Backend", submittedAt: "2025-10-02", status: "Approved" },
];

/* ============= NEW: Tasks mock ============= */
const mockTasks = [
  {
    id: "t-1",
    title: "Design landing hero",
    assignee: "Ali Hassan",
    assignee_name: "Ali Hassan",
    project: "Website Revamp",
    project_name: "Website Revamp",
    due: "2025-11-12",
    due_date: "2025-11-12",
    status: "in_progress",
    priority: "High",
  },
  {
    id: "t-2",
    title: "API integration",
    assignee: "Sara Noor",
    assignee_name: "Sara Noor",
    project: "Mobile MVP",
    project_name: "Mobile MVP",
    due: "2025-11-20",
    due_date: "2025-11-20",
    status: "todo",
    priority: "Medium",
  },
  {
    id: "t-3",
    title: "Prepare brand style",
    assignee: "Ali Hassan",
    assignee_name: "Ali Hassan",
    project: "Brand Kit",
    project_name: "Brand Kit",
    due: "2025-10-10",
    due_date: "2025-10-10",
    status: "done",
    priority: "Low",
  },
];


/* ============= NEW: Courses mock ============= */
const mockCourses = [
  {
    id: "course-1",
    title: "UI Design Foundations",
    category: "Design",
    level: "Beginner",
    duration: "6h",
    instructor: "Jane Doe",
    status: "Published",
    price: 49,
    description: "Learn fundamentals of layout, color, and typography.",
    image: "https://picsum.photos/seed/ui/960/540",
    progress: 40,             
    assignedTo: "f-1",  
    assignedToName: "Ali Hassan",
  },
  {
    id: "course-2",
    title: "React for Web",
    category: "Programming",
    level: "Intermediate",
    duration: "10h",
    instructor: "John Smith",
    status: "Draft",
    price: 99,
    description: "Build SPAs with React, hooks, and routing.",
    image: "https://picsum.photos/seed/react/960/540",
    progress: 0,
    assignedTo: null,
  },
  {
    id: "course-3",
    title: "Marketing Basics",
    category: "Marketing",
    level: "Beginner",
    duration: "4h",
    instructor: "Emily Clark",
    status: "Published",
    price: 39,
    description: "Essential marketing strategies for small teams.",
    image: "https://picsum.photos/seed/marketing/960/540",
    progress: 75,
    assignedTo: "f-2",
    assignedToName: "Sara Noor",
  },
];

/* ============= NEW: Dashboard mock ============= */
const mockDashboardAdmin = {
  topStats: [
    {
      id: "dash-admin-stat-clients",
      title: "Clients",
      value: "3,120",
      sub: "Active on the platform",
      trend: "+4.2%",
    },
    {
      id: "dash-admin-stat-freelancers",
      title: "Freelancers",
      value: "1,850",
      sub: "Available to hire",
      trend: "+3.1%",
    },
    {
      id: "dash-admin-stat-projects",
      title: "Projects",
      value: "96",
      sub: "Open / in progress",
      trend: "+1.4%",
    },
    {
      id: "dash-admin-stat-revenue",
      title: "Revenue",
      value: "$53,210",
      sub: "Last 30 days",
      trend: "+7.8%",
    },
  ],
  pendingVerifications: [
    {
      id: "dash-admin-verif-1",
      name: "Khaled F.",
      role: "Freelancer • Design",
      email: "info@battechno.com",
    },
    {
      id: "dash-admin-verif-2",
      name: "Maha S.",
      role: "Client • —",
      email: "info@battechno.com",
    },
  ],
  // نفس النقاط اللي كانت في SimpleAreaChart
  revenuePoints: [40, 60, 55, 70, 90, 80, 95, 110, 120, 140, 130, 160],
};

const mockDashboardFreelancer = {
  balanceCards: [
    {
      id: "dash-free-balance-total",
      title: "Total balance",
      value: "$2,430",
      sub: "All earnings including pending",
      trend: "+12%",
    },
    {
      id: "dash-free-balance-available",
      title: "Available to withdraw",
      value: "$1,120",
      sub: "Ready to cash out",
      trend: "+7%",
    },
    {
      id: "dash-free-balance-review",
      title: "In review",
      value: "$890",
      sub: "Waiting for client approval",
      trend: "+3%",
    },
  ],
  activeProjects: [
    {
      id: "dash-free-active-1",
      title: "Landing page redesign",
      client: "Acme Inc.",
      status: "In progress",
      due: "3 days left",
      budget: "$800",
    },
    {
      id: "dash-free-active-2",
      title: "Mobile app UI kit",
      client: "Startup XYZ",
      status: "Feedback required",
      due: "Today",
      budget: "$1,200",
    },
    {
      id: "dash-free-active-3",
      title: "Branding package",
      client: "Coffee House",
      status: "In progress",
      due: "1 week left",
      budget: "$650",
    },
  ],
  latestClientProjects: [
    {
      id: "dash-free-latest-1",
      title: "Full-stack dashboard",
      budget: "$2,000",
      type: "Fixed • Remote",
    },
    {
      id: "dash-free-latest-2",
      title: "Social media designs",
      budget: "$500",
      type: "Monthly • Part time",
    },
    {
      id: "dash-free-latest-3",
      title: "React developer (long term)",
      budget: "$30/h",
      type: "Hourly • Remote",
    },
  ],
};

const mockDashboardClient = {
  stats: [
    {
      id: "dash-client-stat-active-projects",
      title: "Active projects",
      value: "4",
      sub: "Running with freelancers",
      trend: "+1",
    },
    {
      id: "dash-client-stat-open-jobs",
      title: "Open jobs",
      value: "2",
      sub: "Awaiting proposals",
      trend: "+2",
    },
    {
      id: "dash-client-stat-total-spent",
      title: "Total spent",
      value: "$9,540",
      sub: "Across all projects",
      trend: "+18%",
    },
    {
      id: "dash-client-stat-hired",
      title: "Hired freelancers",
      value: "7",
      sub: "All-time",
      trend: "+1",
    },
  ],
  recentProjects: [
    {
      id: "dash-client-recent-1",
      title: "Multi‑step checkout flow",
      status: "In progress",
      budget: "$1,400",
    },
    {
      id: "dash-client-recent-2",
      title: "Logo & brand refresh",
      status: "Reviewing",
      budget: "$600",
    },
    {
      id: "dash-client-recent-3",
      title: "Marketing landing page",
      status: "Completed",
      budget: "$900",
    },
  ],
};

/* ============= NEW: Payments mock ============= */
const mockPayments = [
  // shared fields for admin table and cards
  { id: "pay-1", user: "John Carter", project: "Website Revamp", amount: 1200, method: "card", status: "paid",   date: "2025-10-10", ref: "INV-1001", title: "Milestone 1" },
  { id: "pay-2", user: "Mina Rose",   project: "Mobile MVP",     amount: 800,  method: "paypal", status: "due",    date: "2025-10-15", ref: "INV-1002", title: "Phase A" },
  { id: "pay-3", user: "John Carter", project: "Brand Kit",       amount: 500,  method: "wire",   status: "failed", date: "2025-10-18", ref: "INV-1003", title: "Logo pack" },
  { id: "pay-4", user: "Ali Hassan",  project: "Website Revamp", amount: 700,  method: "escrow", status: "paid",   date: "2025-10-22", ref: "INV-1004", title: "Fixes" },
];

const totalsAdmin = { volume: 3200, paid: 1900, pending: 800, failed: 500 };
const totalsClient = { paid: 1200, due: 800, refunds: 0 };
const totalsFreelancer = { earned: 1900, clearing: 400, withdrawn: 500 };

/* ============= helpers ============= */
function applyFilters(list, params = {}) {
  const q = String(params.q ?? "").toLowerCase().trim();
  const rest = { ...params };
  delete rest.q;

  let out = [...list];

  if (q) {
    out = out.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }
  for (const [k, v] of Object.entries(rest)) {
    if (v == null || String(v).trim() === "") continue;
    out = out.filter((row) => String(row[k] ?? "").toLowerCase() === String(v).toLowerCase());
  }
  return out;
}

/* ============= Router-like mockFetch ============= */
export function mockFetch(endpoint = "", params = {}) {
  if (!MOCK_ENABLED) return null;

  // categories
  if (/^\/categories$/.test(endpoint)) {
    return applyFilters(mockCategories, params);
  }
  if (/^\/categories\/[^/]+\/subcategories$/.test(endpoint)) {
    const catId = endpoint.split("/")[2];
    return applyFilters(mockSubCategories[catId] || [], params);
  }
  if (/^\/categories\/[^/]+\/subcategories\/[^/]+\/children$/.test(endpoint)) {
    const [, , catId, , subId] = endpoint.split("/");
    const key = `${catId}|${subId}`;
    return applyFilters(mockSubSub[key] || [], params);
  }

  // people
  if (/\/clients$/.test(endpoint))     return applyFilters(mockClients, params);
  if (/\/freelancers$/.test(endpoint)) return applyFilters(mockFreelancers, params);
  if (/\/admins$/.test(endpoint))      return applyFilters(mockAdmins, params);

  // verifications
  if (/verifications$/.test(endpoint)) return applyFilters(mockVerifications, params);

  // projects (any flavor: /projects, /api/admin/projects, ...)
  if (/projects(\/.*)?$/.test(endpoint)) return applyFilters(mockProjects, params);

  // tasks (admin/client/freelancer)
  if (/tasks(\/.*)?$/.test(endpoint))   return applyFilters(mockTasks, params);

  // courses listing + single by id
  /* ============= Courses (admin / freelancer / generic) ============= */
if (/courses(\/.*)?$/.test(endpoint)) {
  // تفاصيل كورس واحد: /courses/:id أو /api/.../courses/:id
  if (/\/courses\/[^/]+$/.test(endpoint)) {
    const id = endpoint.split("/").pop();
    const one = mockCourses.find((x) => (x.id ?? x._id) === id);
    return one ?? null;
  }

  // قائمة الكورسات
  let list = applyFilters(mockCourses, params);

  // حالة الفريلانسر: نعرض فقط المنشورة + (اختياريًا) المخصصة له
  if (/\/freelancer\/courses$/.test(endpoint)) {
    const currentFreelancerId = params.userId || "f-1"; // لأغراض الموك
    list = list.filter(
      (c) => c.status === "Published" && (!c.assignedTo || c.assignedTo === currentFreelancerId)
    );
    return list;
  }

  // حالة الأدمن: كل شيء
  if (/\/admin\/courses$/.test(endpoint)) {
    return list;
  }

  // مسار عام: /courses
  return list;
}


  // payments (return shape {items, totals} لأن الصفحة تتوقّعه)
  if (/^\/payments$/.test(endpoint)) {
    return { items: applyFilters(mockPayments, params), totals: totalsAdmin };
  }
  if (/^\/client\/payments$/.test(endpoint)) {
    return { items: applyFilters(mockPayments, params), totals: totalsClient };
  }
  if (/^\/freelancer\/payments$/.test(endpoint)) {
    return { items: applyFilters(mockPayments, params), totals: totalsFreelancer };
  }
  // dashboard (admin / freelancer / client)
  if (/^\/dashboard\/admin$/.test(endpoint)) {
    return mockDashboardAdmin;
  }
  if (/^\/dashboard\/freelancer$/.test(endpoint)) {
    return mockDashboardFreelancer;
  }
  if (/^\/dashboard\/client$/.test(endpoint)) {
    return mockDashboardClient;
  }

  return null;
}
