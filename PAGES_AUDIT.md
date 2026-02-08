# Frontend Pages & Routes Audit

**Scope:** React/Vite web frontend. Role-based: guest, client (role_id 2), freelancer (role_id 3), admin (role_id 1), partner (role_id 5).  
**Date:** Audit of existing routes, UI references, missing routes, orphans, and completeness.

---

## 1. Summary

- **Router:** `App.jsx` (top-level) + `adminDash/routes/index.jsx` (nested under `/admin`, `/client`, `/freelancer`, `/partner`).
- **Guards:** `ProtectedRoute` (redirects to `/login`, `/account/suspended`, or `/access-denied`); role-based via `allowedRoles={[1]}` etc.
- **Missing routes:** Chat (`/chat`), offer/escrow detail pages (`/offers/:id`, `/escrow/:id`), freelancer tasks list/detail (`/freelancer/tasks`, `/freelancer/tasks/:id`), `my-projects` redirect, dashboard alias (`/dashboard`), and (commented) courses.
- **Orphan pages:** `createprojects.jsx` (CreateAdminProject for role 4), `test.jsx`, `MySubscription.jsx` (no route or nav link).
- **Broken/bad references:** AccountSuspended links to `/dashboard` (no such route); createprojects navigates to `/admin-role-4/dashboard` (no base path); PaymentSuccess uses `/my-projects` (no route); SubCategories navigates to `/category/sub-category/:id` (outside dashboard).

---

## 2. Route Map (What Exists)

### 2.1 Top-level routes (`App.jsx`)

| Path | Component | Role | Guard |
|------|-----------|------|--------|
| `/` | OrderzHousePage (Main.jsx) | guest | — |
| `/privacy` | PrivacyPolicyPage (Policy.jsx) | guest | — |
| `/about` | ModernAboutPage (About.jsx) | guest | — |
| `/plans` | Plans | guest | — |
| `/contact` | ContactUsPage | guest | — |
| `/login` | Login | guest | — |
| `/register` | Register | guest | — |
| `/terms` | Terms | guest | — |
| `/help` | Help | guest | — |
| `/blogs` | Blogs | guest | — |
| `/blogs/:id` | BlogPost | guest | — |
| `/account/suspended` | AccountSuspended | guest | — |
| `/create-project` | CreateProjectPage | any logged-in | ProtectedRoute |
| `/tasks` | ProjectsPage (mode=tasks) | any logged-in | ProtectedRoute |
| `/tasks/create` | CreateTaskPage | any logged-in | ProtectedRoute |
| `/tasks/:id` | ProjectDetails (mode=tasks) | any logged-in | ProtectedRoute |
| `/access-denied` | AccessDenied | guest | — |
| `/notifications` | NotificationsPage | any logged-in | ProtectedRoute |
| `/projectsPage` | ProjectsPage | any logged-in | ProtectedRoute |
| `/appointments` | RoleBasedAppointments | any logged-in | ProtectedRoute |
| `/admin/appointments` | AdminAppointments | any logged-in | ProtectedRoute |
| `/my-appointments` | FreelancerAppointments | any logged-in | ProtectedRoute |
| `/admin/*` | AdminRouter | role 1 (admin) | ProtectedRoute allowedRoles={[1]} |
| `/client/*` | AdminRouter | role 2 (client) | ProtectedRoute allowedRoles={[2]} |
| `/freelancer/*` | AdminRouter | role 3 (freelancer) | ProtectedRoute allowedRoles={[3]} |
| `/partner/*` | AdminRouter | role 5 (partner) | ProtectedRoute allowedRoles={[5]} |
| `/projects/:id` | ProjectDetails (Catigories) | any logged-in | ProtectedRoute |
| `/copywriting-test` | CopywritingTest | role 3 | ProtectedRoute allowedRoles={[3]} |
| `/payment/success` | PaymentSuccess | guest | — |
| `/freelancer/contract-terms` | FreelancerContractTerms | guest | — |
| `/freelancer/contract-signup` | FreelancerContractSignup | guest | — |
| `*` | NotFound | — | — |

### 2.2 Nested dashboard routes (`adminDash/routes/index.jsx`)

**Prefix:** `/admin`, `/client`, `/freelancer`, or `/partner`. Layout: `AdminLayout` (sidebar + outlet).

| Path (relative to prefix) | Component | File |
|---------------------------|-----------|------|
| `/` (index) | Dashboard | pages/Dashboard.jsx |
| `people/admins` | Admins | pages/people/Admins.jsx |
| `people/clients` | Clients | pages/people/Clients.jsx |
| `people/freelancers` | Freelancers | pages/people/Freelancers.jsx |
| `learning/categories` | Categories | pages/learning/Categories.jsx |
| `learning/categories/:categoryId` | SubCategories | pages/learning/SubCategories.jsx |
| `learning/categories/:categoryId/sub/:subCategoryId` | SubSubCategories | pages/learning/SubSubCategories.jsx |
| `operation/verifications` | Verifications | pages/operation/Verifications.jsx |
| `operation/projects` | AdminProjects | pages/operation/Projects/AdminProjects.jsx |
| `operation/projects/:projectId` | ProjectDetailsDash | pages/operation/Projects/ProjectDetailsDash.jsx |
| `project/:projectId` | ProjectDetailsDash | (same) |
| `community/blogs` | Blogs | pages/community/Blogs.jsx |
| `finance/payments` | Payments | pages/finance/Payments.jsx |
| `finance/plans` | Plans | pages/finance/Plans.jsx |
| `analytics` | Analytics | pages/insights/Analytics.jsx |
| `profile` | Profile | pages/Profile.jsx |
| `editprofile` | EditProfile | pages/EditProfile.jsx |
| `settings` | AccountSettings | components/profile/AccountSettings.jsx |
| `projects` | ProjectsSwitch → ClientsProjects / FreelancersProjects / Navigate | pages/operation/Projects/ClientsProjects.jsx etc. |
| `payments` | Payments | (same as finance/payments) |

### 2.3 Commented-out routes (not active)

- **App.jsx:** `/courses/:id` (CourseDetail), `/my-courses` (MyRestrictedCourses), `/admin/courses` (AdminCourseManagement), `/admin/course-access` (AdminAccessControl), `/chat` (ChatPage), `/chat/:chatType/:chatId` (ChatPage).
- **adminDash/routes/index.jsx:** `learning/courses` (Courses), `operation/tasks` (Tasks), `courses`, `tasks`.

---

## 3. UI Navigation References (Expected Paths)

Collected from `<Link to>`, `navigate()`, `href`, sidebar/nav configs, and notification routes.

### 3.1 Public / guest

- `/`, `/about`, `/blogs`, `/blogs/:id`, `/contact`, `/plans`, `/privacy`, `/terms`, `/help`, `/login`, `/register`, `/create-project` (when logged in), `/projectsPage` (when logged in).

### 3.2 Role-base dashboard entry

- `getDashboardPath(roleId)` in Nav.jsx: `/admin`, `/client`, `/freelancer`, `/apm`, `/partner`, else `/login`.

### 3.3 Dashboard internal (with role prefix)

- `/{admin|client|freelancer|partner}/` (overview)
- `/{admin|client|freelancer|partner}/profile`, `/{base}/editprofile` (via Profile Settings button)
- `/{base}/projects`, `/{base}/payments`
- `/{base}/project/:id` (project details from dashboard)
- Admin-only: `/{base}/people/admins`, `/{base}/people/clients`, `/{base}/people/freelancers`, `/{base}/learning/categories`, `/{base}/learning/categories/:categoryId`, `/{base}/learning/categories/:categoryId/sub/:subCategoryId`, `/{base}/operation/verifications`, `/{base}/operation/projects`, `/{base}/operation/projects/:projectId`, `/{base}/community/blogs`, `/{base}/finance/payments`, `/{base}/finance/plans`, `/{base}/analytics`.

### 3.4 Other referenced paths (some missing or wrong)

- `/dashboard` — AccountSuspended.jsx (no route; should use getDashboardPath or role base).
- `/admin/dashboard`, `/admin-role-4/dashboard` — createprojects.jsx (no `dashboard` child route; index is dashboard; `/admin-role-4` not in App).
- `/chat/project/:id` — ProjectDetailsDash.jsx, ProjectDetails.jsx (onContact); Chat routes commented out.
- `/offers/:id` — NotificationsPage.jsx (no route).
- `/escrow/:id` — NotificationsPage.jsx (no route).
- `/my-projects` — PaymentSuccess.jsx (no route).
- `/freelancer/tasks`, `/freelancer/tasks/:id` — CreateTaskPage.jsx, Tasks.jsx (no routes under /freelancer for tasks).
- `/category/sub-category/:id` — SubCategories.jsx (outside dashboard; likely should be `/{base}/learning/categories/:categoryId/sub/:subCategoryId`).
- `/my-courses`, `/course/:id`, `/admin/courses`, `/admin/course-access` — commented in App.
- `/contracts/contract.pdf` — Plans.jsx (href; static asset, not a route).

---

## 4. Missing Routes / Pages to Create

| # | Path | Referenced in | Suggested component | Role | Minimal UI spec | Likely API |
|---|------|----------------|----------------------|------|------------------|------------|
| 1 | `/chat` | ProjectDetailsDash, ProjectDetails (onContact) | ChatPage (already exists, route commented) | logged-in | Chat list; project chat deep link | chats/project/:id, messages |
| 2 | `/chat/project/:id` | Same | Same ChatPage with params | logged-in | Project chat thread | same |
| 3 | `/offers/:id` | NotificationsPage (getNotificationRoute) | OfferDetailPage | logged-in | Single offer view; accept/reject if allowed | offers/:id |
| 4 | `/escrow/:id` | NotificationsPage | EscrowDetailPage | logged-in | Escrow/payment status | escrow or payments API |
| 5 | `/my-projects` | PaymentSuccess.jsx | MyProjectsPage or redirect to role projects | client/freelancer | List of user’s projects; or redirect to /client/projects / /freelancer/projects | projects (filtered by user) |
| 6 | `/freelancer/tasks` | CreateTaskPage.jsx (after create) | Tasks list for freelancer | role 3 | Task list (freelancer view) | tasks API |
| 7 | `/freelancer/tasks/:id` | Tasks.jsx | Task detail for freelancer | role 3 | Single task view | tasks/:id |
| 8 | `/dashboard` | AccountSuspended.jsx | Redirect to getDashboardPath(role) or login | — | Redirect only | — |
| 9 | `/admin/dashboard` (alias) | createprojects.jsx | Redirect to /admin | admin | Redirect only | — |
| 10 | `/admin-role-4/*` (optional) | createprojects.jsx | Role-4 dashboard + create project | role 4 | If role 4 is used: layout + create flow | adminRole4 API |

**Priority**

- **P0:** `/chat` and `/chat/project/:id` (Contact from project details is broken without them); `/dashboard` redirect (fix AccountSuspended).
- **P1:** `/offers/:id`, `/escrow/:id` (notifications lead to 404); `/my-projects` (payment success flow); `/freelancer/tasks` and `/freelancer/tasks/:id` (task creation flow).
- **P2:** `/admin/dashboard` redirect, `/admin-role-4/*` (only if role 4 is in use).

---

## 5. Orphan Pages (Not Registered in Routes)

| File | Purpose | Suggestion |
|------|---------|------------|
| `adminDash/pages/operation/Projects/createprojects.jsx` | CreateAdminProject (role 4) | Add under `/admin-role-4/create-project` if role 4 is supported; else remove or document as legacy. |
| `adminDash/pages/test.jsx` | Test/category API UI | Add dev-only route or remove. |
| `adminDash/pages/finance/MySubscription.jsx` | User subscription view | Add route (e.g. `/{base}/finance/my-subscription`) and link from Plans/Profile if product is active. |
| `adminDash/pages/Tables.jsx` | PeopleTable (reusable table) | Component only; not a page. No route needed. |
| `adminDash/pages/expandedRow.jsx` | Expanded row content | Component only. No route needed. |
| `adminDash/routes/adminRole4Routes.jsx` | Empty | Remove or implement role-4 routes. |

---

## 6. Page Completeness (Critical Pages)

| Page | Loading | Empty state | Error state |
|------|---------|-------------|-------------|
| Login | ✅ (isLoading) | N/A | ✅ (message) |
| Register | ✅ | N/A | ✅ |
| Dashboard (admin/client/freelancer) | ✅ (loading, skeletons) | ✅ (sections handle empty) | ✅ (error state) |
| CreateProjectPage | — | N/A | — |
| CreateTaskPage | — | N/A | — |
| ProjectsPage (marketplace) | — | — | ❌ (console.error only) |
| ProjectDetails (marketplace) | — | — | ❌ (toast only) |
| ProjectDetailsDash | ✅ (skeleton when !item) | ✅ (no cover) | ❌ (toast only) |
| Payments | ✅ | ❌ | ❌ (console.error) |
| Profile | ✅ (fetchLoading) | N/A | ✅ (toast) |
| EditProfile | ✅ (fetchLoading) | N/A | ✅ (message) |
| AdminProjects | — | — | — |
| NotificationsPage | ✅ | — | ✅ (error) |

---

## 7. Sitemap by Role

### Guest

1. Home `/`
2. About `/about`
3. Blogs `/blogs`, `/blogs/:id`
4. Plans `/plans`
5. Contact `/contact`
6. Privacy `/privacy`, Terms `/terms`, Help `/help`
7. Login `/login`, Register `/register`
8. Payment success (post-payment) `/payment/success`
9. Freelancer contracts `/freelancer/contract-terms`, `/freelancer/contract-signup`

### Client (role 2)

1. Dashboard `/client` (overview)
2. Projects `/client/projects` (list)
3. Project detail `/client/project/:id`
4. Create project `/create-project`
5. Payments `/client/payments` or `/client/finance/payments`
6. Profile `/client/profile`
7. Edit profile `/client/editprofile`
8. Settings `/client/settings`
9. Notifications `/notifications`
10. Appointments (if shown) `/appointments`
11. Marketplace projects `/projectsPage`, `/projects/:id`

### Freelancer (role 3)

1. Dashboard `/freelancer` (overview)
2. Projects `/freelancer/projects` (list)
3. Project detail `/freelancer/project/:id`
4. Tasks (if routes added) `/freelancer/tasks`, `/freelancer/tasks/:id`
5. Create task `/tasks/create`
6. Payments `/freelancer/payments`
7. Profile `/freelancer/profile`
8. Edit profile `/freelancer/editprofile`
9. Settings `/freelancer/settings`
10. Notifications `/notifications`
11. Appointments `/my-appointments`
12. Copywriting test `/copywriting-test`
13. Marketplace `/projectsPage`, `/tasks`, `/projects/:id`, `/tasks/:id`

### Admin (role 1)

1. Dashboard `/admin` (overview)
2. People: Admins `/admin/people/admins`, Clients `/admin/people/clients`, Freelancers `/admin/people/freelancers`
3. Learning: Categories `/admin/learning/categories`, Sub/SubSub under same tree
4. Operation: Verifications `/admin/operation/verifications`, Projects `/admin/operation/projects`, Project detail `/admin/operation/projects/:id` or `/admin/project/:id`
5. Community: Blogs `/admin/community/blogs`
6. Finance: Payments `/admin/finance/payments`, Plans `/admin/finance/plans`
7. Analytics `/admin/analytics`
8. Profile `/admin/profile`, Edit profile `/admin/editprofile`, Settings `/admin/settings`

### Partner (role 5)

Same structure as Client under `/partner/*` (projects, payments, profile, editprofile, settings).

---

## 8. Recommended Next Pages to Build (Top 10)

1. **Chat page route** — Uncomment or re-add `/chat` and `/chat/:chatType/:chatId` (or `/chat/project/:id`) and use existing ChatPage so “Contact” from project details works. **P0**
2. **`/dashboard` redirect** — Resolve `/dashboard` to `getDashboardPath(role)` or `/login` in App or ProtectedRoute. **P0**
3. **Offer detail page** — Add `/offers/:id` (or under role base) and wire from NotificationsPage. **P1**
4. **Escrow detail page** — Add `/escrow/:id` (or under payments) and wire from notifications. **P1**
5. **My Projects** — Add `/my-projects` that redirects to `/client/projects` or `/freelancer/projects`, or a dedicated list page used from PaymentSuccess. **P1**
6. **Freelancer tasks list** — Add `/freelancer/tasks` and use from CreateTaskPage success navigation. **P1**
7. **Freelancer task detail** — Add `/freelancer/tasks/:id` and use from Tasks.jsx. **P1**
8. **Payments empty + error UI** — Add explicit empty and error states in Payments.jsx. **P1**
9. **ProjectsPage/ProjectDetails error UI** — Surface error state in UI (not only console/toast). **P2**
10. **My Subscription page** — Route and link for `MySubscription.jsx` if the product is in scope. **P2**

---

*End of audit. No code was changed; only this report was added.*
