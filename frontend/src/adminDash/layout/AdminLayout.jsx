import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
} from "lucide-react";


export default function AdminLayout() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
  { id: "overview", name: "Overview", icon: Home, onClick: () => navigate("/admin") },
  { id: "clients", name: "Clients", icon: Users, onClick: () => navigate("/admin/people/clients") },
  { id: "freelancers", name: "Freelancers", icon: Users, onClick: () => navigate("/admin/people/freelancers") },
  { id: "courses", name: "Courses", icon: BookOpen, onClick: () => navigate("/admin/learning/courses") },
  { id: "categories", name: "Categories", icon: FolderKanban, onClick: () => navigate("/admin/learning/categories") },
  { id: "appointments", name: "Appointments", icon: Calendar, onClick: () => navigate("/admin/operation/appointments") },
  { id: "verifications", name: "Verifications", icon: Shield, onClick: () => navigate("/admin/operation/verifications") },
  { id: "projects", name: "Projects", icon: Clipboard, onClick: () => navigate("/admin/operation/projects") },
  { id: "news", name: "News", icon: FileText, onClick: () => navigate("/admin/community/news") },
  { id: "payments", name: "Payments", icon: CreditCard, onClick: () => navigate("/admin/finance/payments") },
  { id: "plans", name: "Plans", icon: DollarSign, onClick: () => navigate("/admin/finance/plans") },
  { id: "analytics", name: "Analytics", icon: BarChart2, onClick: () => navigate("/admin/analytics") },
];


  const bottomNavigation = [
    { id: "profile", name: "Profile", icon: User, onClick: () => navigate("/admin/profile") },
    {
      id: "logout",
      name: "Logout",
      icon: LogOut,
      onClick: () => {
        console.log("User logged out");
      },
    },
  ];

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
