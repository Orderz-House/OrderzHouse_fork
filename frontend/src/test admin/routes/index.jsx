import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import Dashboard from "../pages/Dashboard.jsx";

import Clients from "../pages/people/Clients.jsx";
import Freelancers from "../pages/people/Freelancers.jsx";

export default function Router() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="people/clients" element={<Clients />} />
        <Route path="people/freelancers" element={<Freelancers />} />
      </Route>

      <Route path="*" element={<div style={{ padding: 16 }}>Not Found</div>} />
    </Routes>
  );
}
