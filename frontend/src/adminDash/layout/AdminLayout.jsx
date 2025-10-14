import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import {
  Home,
  Users,
  BookOpen,
  FolderKanban,
  Calendar,
  Shield,
  Clipboard,
  FileText,
  CreditCard,
  DollarSign,
  BarChart2,
  User,
  LogOut,
  ListChecks,
} from "lucide-react";

function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  return "user";
}

// helper: إزالة بادئة /admin من المسار للمقارنة
function stripAdminPrefix(pathname) {
  if (!pathname) return "/";
  return pathname.startsWith("/admin") ? pathname.slice(6) || "/" : pathname;
}

// ✅ عناصر السايدبار بحسب الدور (كلها تحت /admin)
function getNav(role, navigate) {
  const go = (subPath) => navigate(`/admin${subPath}`);

  if (role === "admin") {
    const navigation = [
      { id: "overview", name: "Overview", icon: Home, onClick: () => go("") },
      { id: "clients", name: "Clients", icon: Users, onClick: () => go("/people/clients") },
      { id: "freelancers", name: "Freelancers", icon: Users, onClick: () => go("/people/freelancers") },
      { id: "courses", name: "Courses", icon: BookOpen, onClick: () => go("/learning/courses") },
      { id: "categories", name: "Categories", icon: FolderKanban, onClick: () => go("/learning/categories") },
      { id: "appointments", name: "Appointments", icon: Calendar, onClick: () => go("/operation/appointments") },
      { id: "verifications", name: "Verifications", icon: Shield, onClick: () => go("/operation/verifications") },
      { id: "projects", name: "Projects", icon: Clipboard, onClick: () => go("/operation/projects") },
      { id: "news", name: "News", icon: FileText, onClick: () => go("/community/news") },
      { id: "payments", name: "Payments", icon: CreditCard, onClick: () => go("/finance/payments") },
      { id: "plans", name: "Plans", icon: DollarSign, onClick: () => go("/finance/plans") },
      { id: "analytics", name: "Analytics", icon: BarChart2, onClick: () => go("/analytics") },
    ];
    const bottomNavigation = [
      { id: "profile", name: "Profile", icon: User, onClick: () => go("/profile") },
      { id: "logout", name: "Logout", icon: LogOut, onClick: () => console.log("User logged out") },
    ];
    return { navigation, bottomNavigation };
  }

  if (role === "client") {
    const navigation = [
      { id: "overview", name: "Overview", icon: Home, onClick: () => go("") },
      { id: "projects", name: "Projects", icon: Clipboard, onClick: () => go("/client/projects") },
      { id: "payments", name: "Payments", icon: CreditCard, onClick: () => go("/client/payments") },
      { id: "tasks", name: "Tasks", icon: ListChecks, onClick: () => go("/client/tasks") },
    ];
    const bottomNavigation = [
      { id: "profile", name: "Profile", icon: User, onClick: () => go("/profile") },
      { id: "logout", name: "Logout", icon: LogOut, onClick: () => console.log("User logged out") },
    ];
    return { navigation, bottomNavigation };
  }

  if (role === "freelancer") {
    const navigation = [
      { id: "overview", name: "Overview", icon: Home, onClick: () => go("") },
      { id: "projects", name: "Projects", icon: Clipboard, onClick: () => go("/freelancer/projects") },
      { id: "payments", name: "Payments", icon: CreditCard, onClick: () => go("/freelancer/payments") },
      { id: "tasks", name: "Tasks", icon: ListChecks, onClick: () => go("/freelancer/tasks") },
      { id: "courses", name: "Courses", icon: BookOpen, onClick: () => go("/freelancer/courses") },
      { id: "appointments", name: "Appointments", icon: Calendar, onClick: () => go("/freelancer/appointments") },
    ];
    const bottomNavigation = [
      { id: "profile", name: "Profile", icon: User, onClick: () => go("/profile") },
      { id: "logout", name: "Logout", icon: LogOut, onClick: () => console.log("User logged out") },
    ];
    return { navigation, bottomNavigation };
  }

  // fallback
  const navigation = [{ id: "overview", name: "Overview", icon: Home, onClick: () => go("") }];
  const bottomNavigation = [
    { id: "profile", name: "Profile", icon: User, onClick: () => go("/profile") },
    { id: "logout", name: "Logout", icon: LogOut, onClick: () => console.log("User logged out") },
  ];
  return { navigation, bottomNavigation };
}

// إبراز الأكتف من المسار الحالي (بعد إزالة /admin)
function getActiveFromPath(pathname) {
  const p = stripAdminPrefix(pathname);
  if (p === "/" || p === "") return "overview";

  // admin
  if (p.startsWith("/people/clients")) return "clients";
  if (p.startsWith("/people/freelancers")) return "freelancers";
  if (p.startsWith("/learning/courses")) return "courses";
  if (p.startsWith("/learning/categories")) return "categories";
  if (p.startsWith("/operation/appointments")) return "appointments";
  if (p.startsWith("/operation/verifications")) return "verifications";
  if (p.startsWith("/operation/projects")) return "projects";
  if (p.startsWith("/community/news")) return "news";
  if (p.startsWith("/finance/payments")) return "payments";
  if (p.startsWith("/finance/plans")) return "plans";
  if (p.startsWith("/analytics")) return "analytics";

  // client
  if (p.startsWith("/client/projects")) return "projects";
  if (p.startsWith("/client/payments")) return "payments";
  if (p.startsWith("/client/tasks")) return "tasks";

  // freelancer
  if (p.startsWith("/freelancer/projects")) return "projects";
  if (p.startsWith("/freelancer/payments")) return "payments";
  if (p.startsWith("/freelancer/tasks")) return "tasks";
  if (p.startsWith("/freelancer/courses")) return "courses";
  if (p.startsWith("/freelancer/appointments")) return "appointments";

  if (p.startsWith("/profile")) return "profile";
  return "overview";
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useSelector((s) => s.auth);

  const role = mapRole(userData?.role_id);
  const { navigation, bottomNavigation } = getNav(role, navigate);

  const [activePage, setActivePage] = useState(() => getActiveFromPath(location.pathname));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setActivePage(getActiveFromPath(location.pathname));
  }, [location.pathname]);

  return (
    <div className="min-h-[100dvh] md:min-h-screen flex bg-slate-50 text-slate-800">
      <Sidebar
        activePage={activePage}
        setActivePage={(id) => {
          setActivePage(id);
          const found = [...navigation, ...bottomNavigation].find((item) => item.id === id);
          if (found?.onClick) found.onClick();
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navigation={navigation}
        bottomNavigation={bottomNavigation}
        onLogout={() => console.log("Logout clicked")}
      />

      <main className="flex-1 px-4 md:px-6 pt-[104px] md:pt-6">
        <Outlet />
      </main>
    </div>
  );
}