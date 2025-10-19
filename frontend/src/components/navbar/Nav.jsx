import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Menu,
  X,
  Bell,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLogout, setUserData } from "../../slice/auth/authSlice";
import axios from "axios";
import Cookies from "js-cookie";
import { disconnectSocket } from "../../services/socketService";
import logo from "../../assets/logo.png";
import CategoryMegaMenu from "../Catigories/CategoryMegaMenu";

export default function EnhancedNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isExploreMobileOpen, setIsExploreMobileOpen] = useState(false);

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const exploreRef = useRef(null);

  const dispatch = useDispatch();
  const { token, userData, IsAuthenticated } = useSelector((state) => ({
    token: state.auth.token,
    userData: state.auth.userData,
    IsAuthenticated: !!state.auth.token,
  }));

  const navigate = useNavigate();
  const location = useLocation();
  const path = (location.pathname || "").toLowerCase();

  // ===== Helper: unified dashboard path (like it was before)
  const getDashboardPath = (roleId) =>
    roleId === 1 || roleId === 2 || roleId === 3 ? "/admin" : "/login";

  // ========= Active link by route =========
  useEffect(() => {
    if (path === "/") setActiveLink("HOME");
    else if (
      path.startsWith("/about") ||
      path.startsWith("/contact") ||
      path.startsWith("/blogs") ||
      path.startsWith("/plans")
    )
      setActiveLink("EXPLORE");
    else if (
      path.startsWith("/projects") ||
      path.startsWith("/projectspage") ||
      path.startsWith("/dashboard/projects")
    )
      setActiveLink("PROJECTS");
    else if (path.startsWith("/admin-verification"))
      setActiveLink("VERIFICATION");
    else if (path.startsWith("/blogs/admin")) setActiveLink("BLOGS PENDING");
    else if (path.startsWith("/create-project")) setActiveLink("ADD PROJECT");
    else setActiveLink(null);
  }, [path]);

  // ===== Notifications API =====
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get("http://localhost:5000/notifications", {
        headers: { authorization: `Bearer ${token}` },
        params: { limit: 10, unreadOnly: false },
      });
      if (data.success) setNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(
        "http://localhost:5000/notifications/count",
        {
          headers: { authorization: `Bearer ${token}` },
          params: { unreadOnly: true },
        }
      );
      if (data.success) setUnreadCount(data.count);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/notifications/${notificationId}/read`,
        {},
        { headers: { authorization: `Bearer ${token}` } }
      );
      setNotifications((list) =>
        list.map((n) =>
          n.id === notificationId ? { ...n, read_status: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/notifications/read-all",
        {},
        { headers: { authorization: `Bearer ${token}` } }
      );
      setNotifications((list) => list.map((n) => ({ ...n, read_status: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Helpers
  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsMobileMenuOpen(false);
    disconnectSocket();
    Cookies.remove("userData");
    dispatch(setLogout());
    navigate("/");
    window.location.reload();
  };

  const handleNavigation = (p, label) => {
    setActiveLink(label);
    navigate(p);
  };

  const go = (p) => {
    navigate(p);
    setIsExploreOpen(false);
    setIsExploreMobileOpen(false);
  };

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  // fetch user + notifications
  useEffect(() => {
    if (!token) return;
    
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/users/getUserdata`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const user = { ...res.data.user, is_online: true };
        dispatch(setUserData(user));
        fetchNotifications();
        fetchUnreadCount();
      } catch (err) {
        console.error("Failed to fetch user data:", err.message);
        if (err.response?.status === 401) {
          handleLogout();
        }
      }
    };

    fetchUserData();
  }, [token, dispatch, location.pathname]); // FIXED: Added location.pathname

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target))
        setIsUserMenuOpen(false);

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      )
        setIsNotificationsOpen(false);

      if (exploreRef.current && !exploreRef.current.contains(event.target)) {
        if (isExploreOpen) setIsExploreOpen(false);
      }
      if (path === "/") setActiveLink("HOME");
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExploreOpen, path]);

  const setActiveFromChild = (label) => {
    if (path === "/" && (label === "CATEGORIES" || label === "EXPLORE")) {
      return;
    }
    setActiveLink(label);
  };

  // FIXED: Improved condition logic for Plans
  const navLinks = [
    { label: "HOME", path: "/", condition: true },
    {
      label: "PROJECTS",
      path: "/projectsPage",
      condition: userData && (userData.role_id === 2 || userData.role_id === 3),
    },
    // Plans (for non-clients and guests)
    {
      label: "PLANS",
      path: "/plans",
      condition: !userData || userData.role_id !== 2,
    },
  ];

  const exploreItems = [
    { label: "About", path: "/about" },
    { label: "Blogs", path: "/blogs" },
    { label: "Contact", path: "/contact" },
    { label: "Plans", path: "/plans" },
  ];

  const onExploreRoute =
    path.startsWith("/about") ||
    path.startsWith("/contact") ||
    path.startsWith("/blogs") ||
    path.startsWith("/plans");
  const exploreIsActive = isExploreOpen || onExploreRoute;

  return (
    <nav className="relative top-0 left-0 right-0 z-[9999] bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-23">
          {/* Logo */}
          <div className="flex items-center min-w-[140px]">
            <button
              onClick={() => handleNavigation("/", "HOME")}
              className="flex-shrink-0 flex items-center group cursor-pointer"
            >
              <img src={logo} alt="Logo" className="h-16 my-2 w-auto" />
            </button>
          </div>

          {/* Desktop Navigation (≥ xl) */}
          <div className="hidden xl:block flex-1">
            <div className="flex items-center justify-center space-x-1">
              {navLinks.map(
                (item) =>
                  item.condition && (
                    <button
                      key={item.label}
                      onClick={() => handleNavigation(item.path, item.label)}
                      className={`group relative px-5 py-3 text-base font-medium transition-all duration-300 font-inter ${
                        activeLink === item.label
                          ? "text-[#028090]"
                          : "text-gray-700"
                      }`}
                    >
                      {item.label}
                      <span
                        className={`absolute bottom-0 left-1/2 h-0.5 bg-[#028090] transition-all duration-300 ease-out transform -translate-x-1/2 ${
                          activeLink === item.label
                            ? "w-full"
                            : "w-0 group-hover:w-full"
                        }`}
                      />
                      <span className="absolute inset-0 text-[#028090] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        {item.label}
                      </span>
                    </button>
                  )
              )}

              {/* Explore (Desktop) */}
              <div className="relative" ref={exploreRef}>
                <button
                  onClick={() => setIsExploreOpen((v) => !v)}
                  className={`group relative px-5 py-3 text-base font-medium transition-all duration-300 font-inter flex items-center gap-1 ${
                    exploreIsActive ? "text-[#028090]" : "text-gray-700"
                  }`}
                >
                  Explore
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExploreOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span
                    className={`absolute bottom-0 left-1/2 h-0.5 bg-[#028090] transition-all duration-300 ease-out transform -translate-x-1/2 ${
                      exploreIsActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>

                {isExploreOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-2">
                      {exploreItems.map((it) => (
                        <button
                          key={it.path}
                          onClick={() => go(it.path)}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#028090] transition-colors font-inter"
                        >
                          {it.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Categories (Mega Menu) */}
              <CategoryMegaMenu
                activeLink={activeLink}
                onSetActiveLink={setActiveFromChild}
              />
            </div>
          </div>

          {/* Desktop Actions (≥ md) */}
          <div className="hidden md:flex items-center space-x-4">
            {userData?.role_id === 2 && (
              <Link
                to="/create-project"
                onClick={() => setActiveLink("ADD PROJECT")}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-[#028090] text-white hover:bg-[#026e7a] transition-all shadow-sm hover:shadow-md"
                title="Create a new project"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add project</span>
              </Link>
            )}

            {userData?.role_id === 3 && (
              <Link
                to="/freelancer/tasks/new"
                onClick={() => setActiveLink("ADD TASK")}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-[#028090] text-white hover:bg-[#026e7a] transition-all shadow-sm hover:shadow-md"
                title="Create a new task"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add task</span>
              </Link>
            )}

            {IsAuthenticated && (
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    if (!isNotificationsOpen) fetchNotifications();
                  }}
                  className="relative p-2 text-gray-600 hover:text-[#028090] hover:bg-gray-100 rounded-xl transition-all duration-200"
                  aria-label="Notifications"
                  type="button"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 font-inter">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-[#028090] hover:text-[#026e7a] font-medium font-inter"
                          type="button"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !n.read_status ? "bg-blue-50" : ""
                              }`}
                              onClick={() => markAsRead(n.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 font-inter">
                                    {n.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2 font-inter">
                                    {new Date(
                                      n.created_at
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                {!n.read_status && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-sm font-inter">
                            No notifications yet
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-100 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-sm text-[#028090] hover:text-[#026e7a] font-medium font-inter"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User menu / Auth */}
            {IsAuthenticated && userData ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-[#028090] hover:bg-gray-100 rounded-xl transition-all duration-200"
                  aria-label="User menu"
                  type="button"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#028090] to-[#026e7a] rounded-full flex items-center justify-center overflow-hidden">
                    {userData.profile_pic_url ? (
                      <img
                        src={userData.profile_pic_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-medium text-gray-900 font-inter">
                        {userData.first_name} {userData.last_name}
                      </p>
                      <p className="text-sm text-gray-500 break-words mt-1 font-inter">
                        {userData.email}
                      </p>
                    </div>
                    <div className="py-2">
                      {/* Dashboard (fixed to role-agnostic /admin) */}
                      <Link
                        to={getDashboardPath(userData.role_id)}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-[#028090] transition-all duration-200 font-inter"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      {/* Logout (fixed) */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-all duration-200 font-inter"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLogin}
                  className="px-6 py-2.5 text-gray-700 hover:text-[#028090] font-medium transition-all duration-200 hover:bg-gray-50 rounded-2xl font-inter"
                >
                  Sign In
                </button>
                <button
                  onClick={handleRegister}
                  className="px-6 py-2.5 bg-white text-[#028090] border-2 border-[#028090] hover:bg-[#028090] hover:text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-inter"
                >
                  Get Started
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="xl:hidden p-2 text-gray-600 hover:text-[#028090] hover:bg-gray-100 rounded-xl transition-all duration-200"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            )}
            {/* Tablet menu toggle (md–xl) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-gray-600 hover:text-[#028090] hover:bg-gray-100 rounded-xl transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* ===== Mobile header (< md) ===== */}
          <div className="md:hidden flex items-center space-x-2">
            {IsAuthenticated && (
              <>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-gray-600 hover:text-[#028090] hover:bg-gray-100 rounded-xl transition-all duration-200 relative"
                  aria-label="Notifications"
                  type="button"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                  )}
                </button>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-1 rounded-full hover:bg-gray-100 transition"
                    aria-label="User menu"
                    type="button"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#028090] to-[#026e7a] flex items-center justify-center">
                      {userData?.profile_pic_url ? (
                        <img
                          src={userData.profile_pic_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-[#028090] hover:bg-gray-100 rounded-xl transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>

        {/* ===== Mobile Menu Panel ===== */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              {navLinks.map(
                (item) =>
                  item.condition && (
                    <button
                      key={item.label}
                      onClick={() => {
                        handleNavigation(item.path, item.label);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-base font-medium rounded-2xl transition-all duration-200 font-inter ${
                        activeLink === item.label
                          ? "text-[#028090] bg-gray-50"
                          : "text-gray-700 hover:text-[#028090] hover:bg-gray-50"
                      }`}
                      type="button"
                    >
                      {item.label}
                    </button>
                  )
              )}

              {/* Explore (mobile accordion) */}
              <div className="mt-2">
                <button
                  onClick={() => setIsExploreMobileOpen((v) => !v)}
                  className={`w-full text-left px-4 py-3 text-base font-medium rounded-2xl transition-all duration-200 font-inter flex items-center justify-between ${
                    isExploreMobileOpen || onExploreRoute
                      ? "text-[#028090] bg-gray-50"
                      : "text-gray-700 hover:text-[#028090] hover:bg-gray-50"
                  }`}
                  type="button"
                >
                  <span>Explore</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExploreMobileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isExploreMobileOpen && (
                  <div className="pl-2 pr-2 pb-2">
                    {exploreItems.map((it) => (
                      <button
                        key={it.path}
                        onClick={() => {
                          go(it.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm rounded-xl text-gray-700 hover:text-[#028090] hover:bg-gray-50 transition-colors font-inter"
                        type="button"
                      >
                        {it.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {userData?.role_id === 2 && (
                <button
                  onClick={() => {
                    handleNavigation("/create-project", "ADD PROJECT");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-base font-medium rounded-2xl transition-all duration-200 font-inter flex items-center space-x-2 ${
                    activeLink === "ADD PROJECT"
                      ? "text-[#028090] bg-gray-50"
                      : "text-gray-700 hover:text-[#028090] hover:bg-gray-50"
                  }`}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add project</span>
                </button>
              )}

              {userData?.role_id === 3 && (
                <button
                  onClick={() => {
                    handleNavigation("/freelancer/tasks/new", "ADD TASK");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-base font-medium rounded-2xl transition-all duration-200 font-inter flex items-center space-x-2 ${
                    activeLink === "ADD TASK"
                      ? "text-[#028090] bg-gray-50"
                      : "text-gray-700 hover:text-[#028090] hover:bg-gray-50"
                  }`}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add task</span>
                </button>
              )}
            </div>

            <div className="pt-4 space-y-3 px-2 pb-4 border-t border-gray-100">
              {IsAuthenticated && userData ? (
                <>
                  <Link
                    to="/notifications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:text-[#028090] hover:bg-gray-50 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 font-inter"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:text-[#028090] hover:bg-gray-50 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 font-inter"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                  {/* Mobile quick: Dashboard & Logout (follow same behavior) */}
                  <Link
                    to={getDashboardPath(userData.role_id)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:text-[#028090] hover:bg-gray-50 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 font-inter"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 font-inter"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:text-[#028090] hover:bg-gray-50 rounded-2xl font-medium transition-all duration-200 font-inter"
                    type="button"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      handleRegister();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-white text-[#028090] border-2 border-[#028090] hover:bg-[#028090] hover:text-white font-medium rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-200 font-inter"
                    type="button"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}