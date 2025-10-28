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
  { id: "c-1", name: "John Carter", email: "john@acme.io", country: "UAE", status: "Online", avatar: "https://i.pravatar.cc/80?img=12" },
  { id: "c-2", name: "Mina Rose", email: "mina@globex.com", country: "KSA", status: "Offline" },
];

const mockFreelancers = [
  { id: "f-1", name: "Ali Hassan", email: "ali@example.com", role: "Designer", status: "Online", verified: "Yes", avatar: "https://i.pravatar.cc/80?img=5" },
  { id: "f-2", name: "Sara Noor", email: "sara@example.com", role: "Frontend", status: "Offline", verified: "Yes" },
];

const mockAdmins = [
  { id: "a-1", name: "Admin One", email: "a1@site.com", role: "Super Admin", status: "Online", verified: "Yes" },
  { id: "a-2", name: "Admin Two", email: "a2@site.com", role: "Moderator", status: "Offline" },
];

const mockVerifications = [
  { id: "v-1", name: "Talal", email: "talal@x.com", phone: "+971...", specialization: "UI", submittedAt: "2025-10-01", status: "Pending" },
  { id: "v-2", name: "Nora",  email: "nora@x.com",  phone: "+966...", specialization: "Backend", submittedAt: "2025-10-02", status: "Approved" },
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
    progress: 40, // for freelancer view
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
    progress: 0,
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
    progress: 75,
  },
];

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
  if (endpoint === "/courses")          return applyFilters(mockCourses, params);
  if (/^\/courses\/[^/]+$/.test(endpoint)) {
    const id = endpoint.split("/")[2];
    const one = mockCourses.find(x => (x.id ?? x._id) === id);
    return one ?? null;
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

  return null;
}
