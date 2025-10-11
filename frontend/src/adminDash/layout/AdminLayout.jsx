import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  FiHome,
  FiUser,
  FiUsers,
  FiBookOpen,
  FiTag,
  FiCalendar,
  FiShield,
  FiBriefcase,
  FiFileText,
  FiCreditCard,
  FiLayers,
  FiBarChart2,
} from "react-icons/fi";

const adminSections = [
  {
    title: "GENERAL",
    items: [{ to: "/admin", label: "Overview", icon: FiHome, exact: true }],
  },
  {
    title: "USERS",
    items: [
      { to: "/admin/people/clients", label: "Clients", icon: FiUser },
      { to: "/admin/people/freelancers", label: "Freelancers", icon: FiUsers },
    ],
  },
  {
    title: "LEARNING",
    items: [
      { to: "/admin/learning/courses", label: "Courses", icon: FiBookOpen },
      { to: "/admin/learning/categories", label: "Categories", icon: FiTag },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { to: "/admin/operation/appointments", label: "Appointments", icon: FiCalendar },
      { to: "/admin/operation/verifications", label: "Verifications", icon: FiShield },
      { to: "/admin/operation/projects", label: "Projects", icon: FiBriefcase },
    ],
  },
  {
    title: "COMMUNITY",
    items: [{ to: "/admin/news", label: "News", icon: FiFileText }],
  },
  {
    title: "FINANCE",
    items: [
      { to: "/admin/finance/payments", label: "Payments", icon: FiCreditCard },
      { to: "/admin/finance/plans", label: "Plans", icon: FiLayers },
    ],
  },
  {
    title: "INSIGHTS",
    items: [{ to: "/admin/analytics", label: "Analytics", icon: FiBarChart2 }],
  },
];

export default function AdminLayout() {
  return (
    <div className="min-h-[100dvh] md:min-h-screen flex bg-slate-50 text-slate-800">
      {/* تمرير البيانات إلى السايد بار */}
      <Sidebar sections={adminSections} />

      {/* المحتوى الرئيسي */}
      <main className="flex-1 px-4 md:px-6 pt-[104px] md:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
