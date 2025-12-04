import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Bell,
  MessageSquare,
  User,
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

const API_BASE = import.meta.env.VITE_APP_API_URL;

// ستايل واحد لكل روابط الهيدر (HOME / TASKS / EXPLORE)
const TOP_LINK_BASE =
  "px-5 py-3 text-sm md:text-base font-medium tracking-wide transition-colors duration-150";

export default function EnhancedNavbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const exploreRef = useRef(null);

  const dispatch = useDispatch();
  // استخدم سيليكتر ثابت عشان نتجنّب تحذير redux عن إرجاع مراجع جديدة كل مرة
  const { token, userData } = useSelector((state) => state.auth);
  const IsAuthenticated = !!token;

  const navigate = useNavigate();
  const location = useLocation();

  // Active link
  useEffect(() => {
    const p = (location.pathname || "").toLowerCase();
    if (p === "/") setActiveLink("HOME");
    else if (p.startsWith("/about")) setActiveLink("ABOUT US");
    else if (p.startsWith("/blogs")) setActiveLink("BLOGS");
    else if (p.startsWith("/contact")) setActiveLink("CONTACT");
    else if (p.startsWith("/plans")) setActiveLink("PLANS");
    else if (p.startsWith("/tasks")) setActiveLink("TASKS");
    else if (
      p.startsWith("/projects") ||
      p.startsWith("/projectspage") ||
      p.startsWith("/dashboard/projects")
    ) {
      setActiveLink("PROJECTS");
    } else if (p.startsWith("/create-project")) setActiveLink("ADD PROJECT");
    else if (p.startsWith("/tasks/create")) setActiveLink("ADD TASK");
    else setActiveLink(null);
  }, [location.pathname]);

  // Notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_BASE}/notifications`, {
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
      const { data } = await axios.get(`${API_BASE}/notifications/count`, {
        headers: { authorization: `Bearer ${token}` },
        params: { unreadOnly: true },
      });
      if (data.success) setUnreadCount(data.count);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/notifications/${id}/read`,
        {},
        { headers: { authorization: `Bearer ${token}` } }
      );
      setNotifications((list) =>
        list.map((n) => (n.id === id ? { ...n, read_status: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${API_BASE}/notifications/read-all`,
        {},
        { headers: { authorization: `Bearer ${token}` } }
      );
      setNotifications((list) => list.map((n) => ({ ...n, read_status: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    Cookies.remove("userData");
    dispatch(setLogout());
    navigate("/");
    window.location.reload();
  };

  const handleNavigation = (path, label) => {
    setActiveLink(label);
    navigate(path);
    setIsExploreOpen(false);
    setIsMobileMenuOpen(false); // إغلاق منيو الجوال بعد التنقل
  };

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API_BASE}/users/getUserdata`, {
        headers: { authorization: `Bearer ${token}` },
      })
      .then((res) => {
        dispatch(setUserData(res.data.user));
        fetchNotifications();
        fetchUnreadCount();
      })
      .catch(() => handleLogout());
  }, [dispatch, token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setIsUserMenuOpen(false);
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      )
        setIsNotificationsOpen(false);
      if (exploreRef.current && !exploreRef.current.contains(e.target))
        setIsExploreOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDashboardPath = (roleId) => {
    switch (roleId) {
      case 1:
        return "/admin";
      case 2:
        return "/client";
      case 3:
        return "/freelancer";
      case 4:
        return "/apm";
      default:
        return "/login";
    }
  };

  const navLinks = [
    { label: "HOME", path: "/", condition: true },
    {
      label: "PROJECTS",
      path: "/projectsPage",
      condition: userData && (userData.role_id === 1 || userData.role_id === 2 || userData.role_id === 3),
    },
    { label: "TASKS", path: "/tasks", condition: true },
  ];

  const exploreItems = [
    { label: "ABOUT US", path: "/about" },
    { label: "BLOGS", path: "/blogs" },
    { label: "CONTACT", path: "/contact" },
    { label: "PLANS", path: "/plans" },
  ];

  // لو أنت في ABOUT / BLOGS / ... يخلي زر EXPLORE شكله active
  const isExploreActive = exploreItems.some(
    (item) => item.label === activeLink
  );

  return (
    <nav className="relative top-0 left-0 right-0 z-[9999] bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* نفس الارتفاع القديم h-23 */}
        <div className="flex justify-between items-center h-23">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation("/", "HOME")}
              className="flex items-center"
            >
              <img src={logo} alt="Logo" className="h-16 my-2 w-auto" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map(
              (item) =>
                item.condition && (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item.path, item.label)}
                    className={`${TOP_LINK_BASE} ${
                      activeLink === item.label
                        ? "text-[#028090]"
                        : "text-gray-700 hover:text-[#028090]"
                    }`}
                  >
                    {item.label}
                  </button>
                )
            )}

            {/* EXPLORE بنفس ستايل اللينكات + active لما يكون داخل أحد صفحات explore */}
            <div className="relative" ref={exploreRef}>
              <button
                onClick={() => setIsExploreOpen((v) => !v)}
                className={`${TOP_LINK_BASE} ${
                  isExploreActive
                    ? "text-[#028090]"
                    : "text-gray-700 hover:text-[#028090]"
                }`}
              >
                EXPLORE
                <ChevronDown
                  className={`ml-1 h-4 w-4 inline ${
                    isExploreOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isExploreOpen && (
                <div className="absolute mt-2 w-48 bg-white shadow-lg rounded-xl">
                  {exploreItems.map((it) => (
                    <button
                      key={it.label}
                      onClick={() => handleNavigation(it.path, it.label)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-[#028090] hover:bg-gray-50"
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <CategoryMegaMenu
              activeLink={activeLink}
              onSetActiveLink={setActiveLink}
            />
          </div>

          {/* زر منيو الجوال + التابلت (يظهر فقط أقل من lg) */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-md text-gray-700 hover:text-[#028090] focus:outline-none"
              aria-label="Open main menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Right Section (ديسكتوب فقط) */}
          <div className="hidden lg:flex items-center space-x-4">
            {userData?.role_id === 2 && (
              <Link
                to="/create-project"
                className="inline-flex items-center gap-2 px-5 py-2 text-sm md:text-base font-medium border-2 border-[#028090] text-[#028090] rounded-full hover:bg-[#028090] hover:text-white transition-colors duration-150"
              >
                <Plus className="h-4 w-4" /> Add project
              </Link>
            )}

            {userData?.role_id === 3 && (
              <Link
                to="/tasks/create"
                className="inline-flex items-center gap-2 px-5 py-2 text-sm md:text-base font-medium border-2 border-[#028090] text-[#028090] rounded-full hover:bg-[#028090] hover:text-white transition-colors duration-150"
              >
                <Plus className="h-4 w-4" /> Add task
              </Link>
            )}

            {IsAuthenticated && (
              <>
                <button
                  onClick={() => navigate("/chat")}
                  className="p-2 text-gray-600 hover:text-[#028090] transition-colors duration-150"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>

                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      if (!isNotificationsOpen) fetchNotifications();
                    }}
                    className="p-2 text-gray-600 hover:text-[#028090] relative transition-colors duration-150"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border overflow-hidden z-50">
                      <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-[#028090]"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-4 cursor-pointer ${
                                !n.read_status ? "bg-blue-50" : ""
                              } hover:bg-gray-50`}
                              onClick={() => markAsRead(n.id)}
                            >
                              <p className="text-sm text-gray-900">
                                {n.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(
                                  n.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-500 text-sm">
                            No notifications yet
                          </div>
                        )}
                      </div>
                      <div className="p-4 border-t text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-sm text-[#028090]"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* User Menu */}
            {IsAuthenticated && userData ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-[#028090] transition-colors duration-150"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#028090] flex items-center justify-center">
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
                    className={`h-4 w-4 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border overflow-hidden z-50">
                    <div className="p-4 border-b">
                      <p className="font-medium text-gray-900">
                        {userData.first_name} {userData.last_name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {userData.email}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        to={getDashboardPath(userData.role_id)}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4 mr-2 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2.5 text-sm md:text-base font-medium text-gray-700 hover:text-[#028090] transition-colors duration-150"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-6 py-2.5 text-sm md:text-base font-medium border-2 border-[#028090] text-[#028090] hover:bg-[#028090] hover:text-white rounded-2xl transition-colors duration-150"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* منيو الجوال / التابلت (Drawer) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black bg-opacity-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 max-w-full bg-white shadow-xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header داخل المنيو */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-[#028090]"
                aria-label="Close menu"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            {/* بيانات المستخدم في الموبايل */}
            {IsAuthenticated && userData && (
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#028090] flex items-center justify-center">
                  {userData.profile_pic_url ? (
                    <img
                      src={userData.profile_pic_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {userData.first_name} {userData.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Main Links */}
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                  Main
                </p>
                <div className="flex flex-col">
                  {navLinks.map(
                    (item) =>
                      item.condition && (
                        <button
                          key={item.label}
                          onClick={() =>
                            handleNavigation(item.path, item.label)
                          }
                          className={`w-full text-left py-2 text-base ${
                            activeLink === item.label
                              ? "text-[#028090]"
                              : "text-gray-800 hover:text-[#028090]"
                          }`}
                        >
                          {item.label}
                        </button>
                      )
                  )}
                </div>
              </div>

              {/* Explore Links */}
              <div className="pt-4 border-t">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                  Explore
                </p>
                <div className="flex flex-col">
                  {exploreItems.map((it) => (
                    <button
                      key={it.label}
                      onClick={() => handleNavigation(it.path, it.label)}
                      className={`w-full text-left py-2 text-base ${
                        activeLink === it.label
                          ? "text-[#028090]"
                          : "text-gray-800 hover:text-[#028090]"
                      }`}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Project / Task */}
              {(userData?.role_id === 2 || userData?.role_id === 3) && (
                <div className="pt-4 border-t space-y-2">
                  {userData?.role_id === 2 && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate("/create-project");
                      }}
                      className="flex items-center text-base text-[#028090]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add project
                    </button>
                  )}
                  {userData?.role_id === 3 && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate("/tasks/create");
                      }}
                      className="flex items-center text-base text-[#028090]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add task
                    </button>
                  )}
                </div>
              )}

              {/* Chat + Notifications */}
              {IsAuthenticated && (
                <div className="pt-4 border-t space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/chat");
                    }}
                    className="flex items-center text-base text-gray-800 hover:text-[#028090]"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/notifications");
                    }}
                    className="flex items-center text-base text-gray-800 hover:text-[#028090]"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs h-5 min-w-[1.25rem] px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Dashboard + Sign Out */}
              {IsAuthenticated && userData && (
                <div className="pt-4 border-t space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate(getDashboardPath(userData.role_id));
                    }}
                    className="flex items-center text-base text-gray-800 hover:text-[#028090]"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center text-base text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}

              {/* Guest (غير مسجل) */}
              {!IsAuthenticated && (
                <div className="pt-4 border-t space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full text-left py-2 text-base text-gray-800 hover:text-[#028090]"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/register");
                    }}
                    className="w-full text-left py-2 text-base text-[#028090] font-semibold"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}