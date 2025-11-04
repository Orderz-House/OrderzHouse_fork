import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import Dashboard from "../pages/Dashboard.jsx";

import Admins from "../pages/people/Admins.jsx";
import Clients from "../pages/people/Clients.jsx";
import Freelancers from "../pages/people/Freelancers.jsx";
import Courses from "../pages/learning/Courses.jsx";
import Categories from "../pages/learning/Categories.jsx";
import SubCategories from "../pages/learning/SubCategories.jsx";
import SubSubCategories from "../pages/learning/SubSubCategories.jsx";
import Appointments from "../pages/operation/Appointments.jsx";
import Verifications from "../pages/operation/Verifications.jsx";
import Projects from "../pages/operation/Projects/ClientsProjects.jsx";

// import AdminProjects from "../pages/operation/Projects/AdminProjects.jsx";
import ClientsProjects from "../pages/operation/Projects/ClientsProjects.jsx";
// import FreelancersProjects from "../pages/operation/Projects/FreelancersProjects.jsx";
import ProjectDetails from "../pages/operation/Projects/ProjectDetails.jsx";

import Blogs from "../pages/community/Blogs.jsx";
import Payments from "../pages/finance/Payments.jsx";
import Plans from "../pages/finance/Plans.jsx";
import Analytics from "../pages/insights/Analytics.jsx";
import Tasks from "../pages/operation/Tasks.jsx";
import Profile from "../pages/Profile.jsx";

function ProjectsSwitch() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/client")) return <ClientsProjects />;
  return <Navigate to="/admin/operation/projects" replace />;
}

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {/* index */}
        <Route index element={<Dashboard />} />

        {/* admin-only sections */}
        <Route path="people/admins" element={<Admins />} />
        <Route path="people/clients" element={<Clients />} />
        <Route path="people/freelancers" element={<Freelancers />} />
        <Route path="learning/courses" element={<Courses />} />
        <Route path="learning/categories" element={<Categories />} />
        <Route path="learning/categories/:categoryId" element={<SubCategories />} />
        <Route
          path="learning/categories/:categoryId/sub/:subCategoryId"
          element={<SubSubCategories />}
        />
        <Route path="operation/appointments" element={<Appointments />} />
        <Route path="operation/verifications" element={<Verifications />} />

        {/* <Route path="operation/projects" element={<AdminProjects />} /> */}
        <Route path="project/:projectId" element={<ProjectDetails />} />

        <Route path="operation/tasks" element={<Tasks />} />
        <Route path="community/blogs" element={<Blogs />} />
        <Route path="finance/payments" element={<Payments />} />
        <Route path="finance/plans" element={<Plans />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />

        {/* generic sections —  /admin  /client  /freelancer */}
        <Route path="projects" element={<ProjectsSwitch />} />
        <Route path="payments" element={<Payments />} />
        <Route path="courses" element={<Courses />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="tasks" element={<Tasks />} />
      </Route>
    </Routes>
  );
}

/* (Appointment Manager) */
export function APMRouter() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {/* overview */}
        <Route
          index
          element={
            <div className="p-6 rounded-2xl border border-slate-200 bg-white">
              APM Overview (coming soon)
            </div>
          }
        />

        <Route path="appointment" element={<Appointments />} />

        <Route
          path="history"
          element={
            <div className="p-6 rounded-2xl border border-slate-2 00 bg-white">
              History (coming soon)
            </div>
          }
        />
        <Route
          path="questions"
          element={
            <div className="p-6 rounded-2xl border border-slate-200 bg-white">
              Questions (coming soon)
            </div>
          }
        />
        <Route
          path="survey"
          element={
            <div className="p-6 rounded-2xl border border-slate-200 bg-white">
              Survey (coming soon)
            </div>
          }
        />
        <Route
          path="videos"
          element={
            <div className="p-6 rounded-2xl border border-slate-200 bg-white">
              Videos (coming soon)
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
