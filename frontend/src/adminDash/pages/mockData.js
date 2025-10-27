export const MOCK_ENABLED = true;

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

function applyFilters(list, params = {}) {
  const q = String(params.q ?? "").toLowerCase().trim();
  const rest = { ...params };
  delete rest.q;

  let out = [...list];

  if (q) {
    out = out.filter((row) =>
      Object.values(row).some((v) =>
        typeof v === "string" && v.toLowerCase().includes(q)
      )
    );
  }
  for (const [k, v] of Object.entries(rest)) {
    if (v == null || String(v).trim() === "") continue;
    out = out.filter((row) => String(row[k] ?? "").toLowerCase() === String(v).toLowerCase());
  }
  return out;
}

export function mockFetch(endpoint = "", params = {}) {
  if (!MOCK_ENABLED) return null;

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

  if (/\/projects$/.test(endpoint))   return applyFilters(mockProjects, params);
  if (/\/clients$/.test(endpoint))    return applyFilters(mockClients, params);
  if (/\/freelancers$/.test(endpoint))return applyFilters(mockFreelancers, params);
  if (/\/admins$/.test(endpoint))     return applyFilters(mockAdmins, params);

  if (/verifications$/.test(endpoint)) return applyFilters(mockVerifications, params);

  return null;
}
