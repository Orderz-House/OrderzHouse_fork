import React, { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
  CalendarDays,
  History,
  HelpCircle,
  ListChecks as SurveyIcon,
  PlaySquare,
} from "lucide-react";
import Cookies from "js-cookie";
import { setLogout } from "../../slice/auth/authSlice";
import { disconnectSocket } from "../../services/socketService";
import TopBar from "../components/TopBar.jsx";
import { useToast } from "../../components/toast/ToastProvider.jsx";

function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  if (roleId === 5) return "partner";
  return "user";
}

function getBasePrefix(pathname) {
  if (pathname.startsWith("/client")) return "/client";
  if (pathname.startsWith("/freelancer")) return "/freelancer";
  if (pathname.startsWith("/apm")) return "/apm";
  if (pathname.startsWith("/partner")) return "/partner";
  return "/admin";
}

function getActiveFromPath(pathname) {
  const base = getBasePrefix(pathname);
  const p = pathname.replace(base, "") || "/";

  // مشترك بين الكل
  if (p === "/" || p === "") return "overview";

  // ===== admin =====
  if (base === "/admin") {
    if (p.startsWith("/people/admins")) return "admins";
    if (p.startsWith("/people/clients")) return "clients";
    if (p.startsWith("/people/freelancers")) return "freelancers";
    // if (p.startsWith("/learning/courses")) return "courses";
    if (p.startsWith("/learning/categories")) return "categories";
    if (p.startsWith("/operation/verifications")) return "verifications";
    if (p.startsWith("/operation/projects")) return "projects";
    // if (p.startsWith("/operation/tasks")) return "tasks";
    if (p.startsWith("/community/blogs")) return "blogs";
    if (p.startsWith("/finance/payments")) return "payments";
    if (p.startsWith("/finance/plans")) return "plans";
    if (p.startsWith("/analytics")) return "analytics";
    if (p.startsWith("/projects")) return "projects";
    if (p.startsWith("/payments")) return "payments";
    if (p.startsWith("/profile")) return "profile";
  }

  // ===== client =====
  if (base === "/client") {
    if (p.startsWith("/projects")) return "projects";
    if (p.startsWith("/payments")) return "payments";
    if (p.startsWith("/profile")) return "profile";
  }

  if (base === "/partner") {
    if (p.startsWith("/projects")) return "projects";
    if (p.startsWith("/payments")) return "payments";
    if (p.startsWith("/profile")) return "profile";
  }

  // ===== freelancer =====
  if (base === "/freelancer") {
    if (p.startsWith("/projects")) return "projects";
    if (p.startsWith("/payments")) return "payments";
    if (p.startsWith("/profile")) return "profile";
  }

  // ===== apm =====
  if (base === "/apm") {
    if (p.startsWith("/history")) return "history";
    if (p.startsWith("/questions")) return "questions";
    if (p.startsWith("/survey")) return "survey";
    if (p.startsWith("/videos")) return "videos";
  }

  return "overview";
}

function getNav(role, navigate, base, onLogout) {
  if (role === "admin") {
    const navigation = [
      {
        id: "overview",
        name: "Overview",
        icon: Home,
        onClick: () => navigate(`${base}/`),
      },
      {
        id: "admins",
        name: "Admins",
        icon: Users,
        onClick: () => navigate(`${base}/people/admins`),
      },
      {
        id: "clients",
        name: "Clients",
        icon: Users,
        onClick: () => navigate(`${base}/people/clients`),
      },
      {
        id: "freelancers",
        name: "Freelancers",
        icon: Users,
        onClick: () => navigate(`${base}/people/freelancers`),
      },
      // { id: "courses", name: "Courses", icon: BookOpen, onClick: () => navigate(`${base}/learning/courses`) },
      {
        id: "categories",
        name: "Categories",
        icon: FolderKanban,
        onClick: () => navigate(`${base}/learning/categories`),
      },
      {
        id: "verifications",
        name: "Verifications",
        icon: Shield,
        onClick: () => navigate(`${base}/operation/verifications`),
      },
      {
        id: "projects",
        name: "Projects",
        icon: Clipboard,
        onClick: () => navigate(`${base}/operation/projects`),
      },
      // { id: "tasks", name: "Tasks", icon: Clipboard, onClick: () => navigate(`${base}/operation/tasks`) },
      {
        id: "blogs",
        name: "Blogs",
        icon: FileText,
        onClick: () => navigate(`${base}/community/blogs`),
      },
      {
        id: "payments",
        name: "Payments",
        icon: CreditCard,
        onClick: () => navigate(`${base}/finance/payments`),
      },
      {
        id: "plans",
        name: "Plans",
        icon: DollarSign,
        onClick: () => navigate(`${base}/finance/plans`),
      },
      {
        id: "analytics",
        name: "Analytics",
        icon: BarChart2,
        onClick: () => navigate(`${base}/analytics`),
      },
    ];
    const bottomNavigation = [
      {
        id: "profile",
        name: "Profile",
        icon: User,
        onClick: () => navigate(`${base}/profile`),
      },
      {
        id: "logout",
        name: "Logout",
        icon: LogOut,
        onClick: onLogout || (() => {}),
      },
    ];
    return { navigation, bottomNavigation };
  }

  if (role === "apm") {
    const navigation = [
      {
        id: "overview",
        name: "Overview",
        icon: Home,
        onClick: () => navigate(`${base}/`),
      },
      {
        id: "history",
        name: "History",
        icon: History,
        onClick: () => navigate(`${base}/history`),
      },
      {
        id: "questions",
        name: "Questions",
        icon: HelpCircle,
        onClick: () => navigate(`${base}/questions`),
      },
      {
        id: "survey",
        name: "Survey",
        icon: SurveyIcon,
        onClick: () => navigate(`${base}/survey`),
      },
      {
        id: "videos",
        name: "Videos",
        icon: PlaySquare,
        onClick: () => navigate(`${base}/videos`),
      },
    ];
    const bottomNavigation = [
      {
        id: "profile",
        name: "Profile",
        icon: User,
        onClick: () => navigate(`${base}/profile`),
      },
      {
        id: "logout",
        name: "Logout",
        icon: LogOut,
        onClick: onLogout || (() => {}),
      },
    ];
    return { navigation, bottomNavigation };
  }

  if (role === "client" || role === "partner") {
    const navigation = [
      {
        id: "overview",
        name: "Overview",
        icon: Home,
        onClick: () => navigate(`${base}/`),
      },
      {
        id: "projects",
        name: "Projects",
        icon: Clipboard,
        onClick: () => navigate(`${base}/projects`),
      },
      {
        id: "payments",
        name: "Payments",
        icon: CreditCard,
        onClick: () => navigate(`${base}/payments`),
      },
    ];
    const bottomNavigation = [
      {
        id: "profile",
        name: "Profile",
        icon: User,
        onClick: () => navigate(`${base}/profile`),
      },
      {
        id: "logout",
        name: "Logout",
        icon: LogOut,
        onClick: onLogout || (() => {}),
      },
    ];
    return { navigation, bottomNavigation };
  }

  if (role === "freelancer") {
    const navigation = [
      {
        id: "overview",
        name: "Overview",
        icon: Home,
        onClick: () => navigate(`${base}/`),
      },
      {
        id: "projects",
        name: "Projects",
        icon: Clipboard,
        onClick: () => navigate(`${base}/projects`),
      },
      {
        id: "payments",
        name: "Payments",
        icon: CreditCard,
        onClick: () => navigate(`${base}/payments`),
      },
    ];
    const bottomNavigation = [
      {
        id: "profile",
        name: "Profile",
        icon: User,
        onClick: () => navigate(`${base}/profile`),
      },
      {
        id: "logout",
        name: "Logout",
        icon: LogOut,
        onClick: onLogout || (() => {}),
      },
    ];
    return { navigation, bottomNavigation };
  }

  const navigation = [
    {
      id: "overview",
      name: "Overview",
      icon: Home,
      onClick: () => navigate(`${base}/`),
    },
  ];
  const bottomNavigation = [
    {
      id: "profile",
      name: "Profile",
      icon: User,
      onClick: () => navigate(`/profile`),
    },
    {
      id: "logout",
      name: "Logout",
      icon: LogOut,
      onClick: onLogout || (() => {}),
    },
  ];
  return { navigation, bottomNavigation };
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userData } = useSelector((s) => s.auth);

  const roleId = userData?.role_id ?? Number(localStorage.getItem("roled"));
  const role = mapRole(roleId);

  const handleLogout = () => {
    try {
      disconnectSocket();
    } catch (_) {}
    Cookies.remove("userData");
    dispatch(setLogout());
    try {
      localStorage.removeItem("roled");
    } catch (_) {}
    navigate("/");
    window.location.reload();
  };

  const base = getBasePrefix(location.pathname);
  const { navigation, bottomNavigation } = getNav(
    role,
    navigate,
    base,
    handleLogout
  );

  // Center FAB action (mobile bottom bar) for client/freelancer
  const handleCreateProject = useCallback(() => {
    // عدّل المسار حسب الراوت عندك
    navigate(`/create-project`);
  }, [navigate, base]);

  const handleCreateTask = useCallback(() => {
    // عدّل المسار حسب الراوت عندك
    navigate(`${base}/tasks/create`);
  }, [navigate, base]);

  const [activePage, setActivePage] = useState(() =>
    getActiveFromPath(location.pathname)
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // NEW: تحكم في ظهور السايدبار الديسكتوب + محتوى التوب بار
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);
  const [pageTitle, setPageTitle] = useState("Overview");
  const [topBarRight, setTopBarRight] = useState(null);

  const clearTopBarRight = useCallback(() => {
    setTopBarRight(null);
  }, []);

  // تحديث الصفحة النشطة من الـ path
  useEffect(() => {
    setActivePage(getActiveFromPath(location.pathname));
  }, [location.pathname]);

  // تحديث عنوان الصفحة حسب الـ navigation
  useEffect(() => {
    const allItems = [...navigation, ...bottomNavigation];
    const found = allItems.find((item) => item.id === activePage);
    setPageTitle(found?.name || "Overview");
  }, [navigation, bottomNavigation, activePage]);

  // زر إظهار/إخفاء السايدبار
  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      // موبايل: افتح/اغلق المنيو فقط في رول الادمن (لأن باقي الرولات عندها زر إنشاء بالمنتصف)
      if (role === "admin") setIsMobileMenuOpen((prev) => !prev);
    } else {
      // ديسكتوب → اخفي/اظهر السايدبار
      setShowDesktopSidebar((prev) => !prev);
    }
  };

  return (
    <div className="min-h-[100dvh] md:min-h-screen flex bg-slate-50 text-slate-800">
      <Sidebar
        activePage={activePage}
        setActivePage={(id) => {
          setActivePage(id);
          const found = [...navigation, ...bottomNavigation].find(
            (item) => item.id === id
          );
          if (found?.onClick) found.onClick();
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navigation={navigation}
        bottomNavigation={bottomNavigation}
        onLogout={handleLogout}
        showDesktopSidebar={showDesktopSidebar} // 👈 جديد
        role={role}
        onCreateProject={handleCreateProject}
        onCreateTask={handleCreateTask}
      />

      <main
        className="flex-1 relative"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <TopBar
          title={pageTitle}
          onToggleSidebar={handleToggleSidebar}
          rightContent={topBarRight}
        />
        <div className="p-3 md:p-5  ">
          <Outlet
            context={{
              setTopBarRight,
              clearTopBarRight,
            }}
          />
        </div>
      </main>
    </div>
  );
}
