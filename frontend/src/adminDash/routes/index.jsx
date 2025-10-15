import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import Dashboard from "../pages/Dashboard.jsx";

import Clients from "../pages/people/Clients.jsx";
import Freelancers from "../pages/people/Freelancers.jsx";
import Courses from "../pages/learning/Courses.jsx";
import Categories from "../pages/learning/Categories.jsx";
import Appointments from "../pages/operation/Appointments.jsx";
import Verifications from "../pages/operation/Verifications.jsx";
import Projects from "../pages/operation/Projects.jsx";
import News from "../pages/community/News.jsx";
import Payments from "../pages/finance/Payments.jsx";
import Plans from "../pages/finance/Plans.jsx";
import Analytics from "../pages/insights/Analytics.jsx";
// import Tasks from "../pages/operation/Tasks.jsx";

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {/* index */}
        <Route index element={<Dashboard />} />

        {/* admin-only sections */}
        <Route path="people/clients" element={<Clients />} />
        <Route path="people/freelancers" element={<Freelancers />} />
        <Route path="learning/courses" element={<Courses />} />
        <Route path="learning/categories" element={<Categories />} />
        <Route path="operation/appointments" element={<Appointments />} />
        <Route path="operation/verifications" element={<Verifications />} />
        <Route path="operation/projects" element={<Projects />} />
        <Route path="community/news" element={<News />} />
        <Route path="finance/payments" element={<Payments />} />
        <Route path="finance/plans" element={<Plans />} />
        <Route path="analytics" element={<Analytics />} />

        {/* generic sections — تُستخدم تحت /admin و /client و /freelancer */}
        <Route path="projects" element={<Projects />} />
        <Route path="payments" element={<Payments />} />
        {/* <Route path="tasks" element={<Tasks />} /> */}
        <Route path="courses" element={<Courses />} />
        <Route path="appointments" element={<Appointments />} />
      </Route>
    </Routes>
  );
}
