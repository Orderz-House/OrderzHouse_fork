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

export default function Router() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* People */}
        <Route path="people/clients" element={<Clients />} />
        <Route path="people/freelancers" element={<Freelancers />} />

        {/* Learning */}
        <Route path="learning/courses" element={<Courses />} />
        <Route path="learning/categories" element={<Categories />} />

        {/* Operations */}
        <Route path="operation/appointments" element={<Appointments />} />
        <Route path="operation/verifications" element={<Verifications />} />
        <Route path="operation/projects" element={<Projects />} />

        {/* Community */}
        <Route path="news" element={<News />} />

        {/* Finance */}
        <Route path="finance/payments" element={<Payments />} />
        <Route path="finance/plans" element={<Plans />} />

        {/* Insights */}
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Not Found Page */}
      <Route path="*" element={<div style={{ padding: 16 }}>Not Found</div>} />
    </Routes>
  );
}
