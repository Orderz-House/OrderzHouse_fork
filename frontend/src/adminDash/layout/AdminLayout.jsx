import React, { useEffect, useState } from "react";
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
  Star, 
} from "lucide-react";

function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  return "user";
}

function getBasePrefix(pathname) {
  if (pathname.startsWith("/client")) return "/client";
  if (pathname.startsWith("/freelancer")) return "/freelancer";
  return "/admin";
}

function getActiveFromPath(pathname) {
  const base = getBasePrefix(pathname);
  const p = pathname.replace(base, "") || "/";

  if (p === "/" || p === "") return "overview";
  if (p.startsWith("/people/clients")) return "clients";
  if (p.startsWith("/people/freelancers")) return "freelancers";
  if (p.startsWith("/learning/courses")) return "courses";
  if (p.startsWith("/learning/categories")) return "categories";
  if (p.startsWith("/operation/appointments")) return "appointments";
  if (p.startsWith("/operation/verifications")) return "verifications";
  if (p.startsWith("/operation/projects")) return "projects";
  if (p.startsWith("/operation/tasks")) return "tasks";
  if (p.startsWith("/community/news")) return "news";
  if (p.startsWith("/finance/payments")) return "payments";
  if (p.startsWith("/finance/plans")) return "plans";
  if (p.startsWith("/analytics")) return "analytics";
  if (p.startsWith("/projects")) return "projects";
  if (p.startsWith("/payments")) return "payments";
  if (p.startsWith("/tasks")) return "tasks";
  if (p.startsWith("/courses")) return "courses";
  if (p.startsWith("/appointments")) return "appointments";
  if (p.startsWith("/my-subscription")) return "my-subscription"; 
  if (p.startsWith("/profile")) return "profile";
  return "overview";
}

function getNav(role, navigate, base) {
  if (role === "admin") {
    const navigation = [
      { id: "overview", name: "Overview", icon: Home, onClick: () => navigate(`${base}/`) },
      { id: "clients", name: "Clients", icon: Users, onClick: () => navigate(`${base}/people/clients`) },
      { id: "freelancers", name: "Freelancers", icon: Users, onClick: () => navigate(`${base}/people/freelancers`) },
      { id: "courses", name: "Courses", icon: BookOpen, onClick: () => navigate(`${base}/learning/courses`) },
      { id: "categories", name: "Categories", icon: FolderKanban, onClick: () => navigate(`${base}/learning/categories`) },
      { id: "appointments", name: "Appointments", icon: Calendar, onClick: () => navigate(`${base}/operation/appointments`) },
      { id: "verifications", name: "Verifications", icon: Shield, onClick: () => navigate(`${base}/operation/verifications`) },
      { id: "projects", name: "Projects", icon: Clipboard, onClick: () => navigate(`${base}/operation/projects`) },
      { id: "news", name: "News", icon: FileText, onClick: () => navigate(`${base}/community/news`) },
      { id: "payments", name: "Payments", icon: CreditCard, onClick: () => navigate(`${base}/finance/payments`) },
      { id: "plans", name: "Plans", icon: DollarSign, onClick: () => navigate(`${base}/finance/plans`) },
      { id: "analytics", name: "Analytics", icon: BarChart2, onClick: () => navigate(`${base}/analytics`) },
    ];
    const bottomNavigation = [
      { id: "profile", name: "Profile", icon: User, onClick: () => navigate(`/profile`) },
      { id: "logout", name: "Logout", icon: LogOut, onClick: () => console.log("User logged out") },
    ];
    return { navigation, bottomNavigation };
  }

  if (role === "client") {
    const navigation = [
      { id: "overview", name: "Overview", icon: Home, onClick: () => navigate(`${base}/`) },
      { id: "projects", name: "Projects", icon: Clipboard, onClick: () => navigate(`${base}/projects`) },
      { id: "payments", name: "Payments", icon: CreditCard, onClick: () => navigate(`${base}/payments`) },
      { id: "tasks", name: "Tasks", icon: ListChecks, onClick: () => navigate(`${base}/tasks`) },
    ];
    const bottomNavigation = [
      { id: "profile", name: "Profile", icon: User, onClick: () => navigate(`/profile`) },
      { id: "logout", name: "Logout", icon: LogOut, onClick: () => console.log("User logged out") },
    ];
    return { navigation, bottomNavigation };
  }

  if (role === "freelancer") {
    const navigation = [
      { id: "overview", name: "Overview", icon: Home, onClick: () => navigate(`${base}/`) },
      { id: "projects", name: "Projects", icon: Clipboard, onClick: () => navigate(`${base}/projects`) },
      { id: "payments", name: "Payments", icon: CreditCard, onClick: () => navigate(`${base}/payments`) },
      { id: "tasks", name: "Tasks", icon: ListChecks, onClick: () => navigate(`${base}/tasks`) },
      { id: "courses", name: "Courses", icon: BookOpen, onClick: () => navigate(`${base}/courses`) },
      { id: "appointments", name: "Appointments", icon: Calendar, onClick: () => navigate(`${base}/appointments`) },
      { id: "my-subscription", name: "My Subscription", icon: Star, onClick: () => navigate(`${base}/my-subscription`) }, 
    ];
    const bottomNavigation = [
      { id: "profile", name: "Profile", icon: User, onClick: () => navigate(`/profile`) },
      { id: "logout", name: "Logout", icon: LogOut, onClick: () => console.log("User logged out") },
    ];
    return { navigation, bottomNavigation };
  }

  const navigation = [{ id: "overview", name: "Overview", icon: Home, onClick: () => navigate(`${base}/`) }];
  const bottomNavigation = [
    { id: "profile", name: "Profile", icon: User, onClick: () => navigate(`/profile`) },
    { id: "logout", name: "Logout", icon: LogOut, onClick: () => console.log("User logged out") },
  ];
  return { navigation, bottomNavigation };
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useSelector((s) => s.auth);

  const roleId = userData?.role_id ?? Number(localStorage.getItem("roled"));
  const role = mapRole(roleId);

  const base = getBasePrefix(location.pathname);
  const { navigation, bottomNavigation } = getNav(role, navigate, base);

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
