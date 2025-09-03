import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Menu,
  X,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Globe,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  LayoutDashboard,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "../../slice/auth/authSlice";
import axios from "axios";
import { setUserData } from "../../slice/auth/authSlice";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { disconnectSocket } from "../../services/socketService";

export default function EnhancedNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("HOME");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [IsAuthenticated, setIsAuthenticated] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef(null);
  const servicesRef = useRef(null);
  const contactRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const dispatch = useDispatch();
  const { token, userData } = useSelector((state) => {
    return {
      token: state.auth.token,
      userData: state.auth.userData,
    };
  });
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:5000/notifications", {
        headers: {
          authorization: `Bearer ${token}`,
        },
        params: {
          limit: 10,
          unreadOnly: false,
        },
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        "http://localhost:5000/notifications/count",
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
          params: {
            unreadOnly: true,
          },
        }
      );

      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setNotifications(
        notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/notifications/read-all",
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setNotifications(
        notifications.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Handle user logout
  const handleLogout = () => {
    disconnectSocket();
    Cookies.remove("userData");
    dispatch(setLogout());
    window.location.reload();
    navigate("/");
  };

  const handleNavigation = (path, label) => {
    setActiveLink(label);
    navigate(path);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  useEffect(() => {
    if (!token) return;

    axios
      .get(`http://localhost:5000/users/getUserdata`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const user = { ...res.data.user, is_online: true };
        dispatch(setUserData(user));
        setIsAuthenticated(true);

        // Fetch notifications after authentication
        fetchNotifications();
        fetchUnreadCount();
      })
      .catch((err) => {
        console.error("Failed to fetch user data:", err.message);
        setIsAuthenticated(false);
      });
  }, [dispatch, token]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }
      if (contactRef.current && !contactRef.current.contains(event.target)) {
        setIsContactOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // NAVBAR LINKS
  const navLinks = [
    { label: "HOME", path: "/" },
    { label: "ABOUT US", path: "/about" },
    { label: "NEWS", path: "/news" },
    { label: "CONTACT", path: "/contact" },
  ];

  // Rest of your existing code...

  return (
    <nav
      className={`top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50"
          : "bg-white shadow-sm border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation("/", "HOME")}
              className="flex-shrink-0 flex items-center group cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mr-3 transform group-hover:scale-105 transition-transform duration-200 shadow-lg">
                <div className="w-5 h-5 bg-white rounded-sm opacity-90"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                ORDERZ HOUSE
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path, item.label)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeLink === item.label
                      ? "text-teal-600 bg-teal-50"
                      : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Admin Verification link for role_id 1 */}
              {userData?.role_id === 1 && (
                <>
                  {" "}
                  <button
                    onClick={() =>
                      handleNavigation("/admin-verification", "VERIFICATION")
                    }
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeLink === "VERIFICATION"
                        ? "text-teal-600 bg-teal-50"
                        : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                    }`}
                  >
                    VERIFICATION
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation("/news/admin", "news pendind");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-base font-medium rounded-xl text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-all duration-200"
                  >
                    NEWS PENDING
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search services, blogs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  {searchQuery && (
                    <div className="mt-3 text-sm text-gray-500">
                      Search results for "{searchQuery}" would appear here...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications - Only show when authenticated */}
            {IsAuthenticated && (
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    fetchNotifications(); // Refresh notifications when opening
                  }}
                  className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  aria-label="Notifications"
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
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !notification.is_read ? "bg-blue-50" : ""
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title || "Notification"}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {new Date(
                                      notification.created_at
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-sm">
                            No notifications yet
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-100 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Menu or Auth Buttons */}
            {IsAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
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
                      <p className="font-medium text-gray-900">
                        {userData.first_name} {userData.last_name}
                      </p>
                      <p className="text-sm text-gray-500 break-words mt-1">
                        {userData.email}
                      </p>
                    </div>
                    <div className="py-2">
                      {userData.role_id === 3 ? (
                        <Link
                          to="/freelancer/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-all duration-200"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/dashoard/projects"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-all duration-200"
                          >
                            <Briefcase className="h-4 w-4" />
                            <span>My Projects</span>
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-all duration-200"
                          >
                            <User  className="h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </>
                      )}
                      <Link
                        to="/notifications"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-all duration-200"
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
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* CTA Buttons */
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium transition-all duration-200 hover:bg-gray-50 rounded-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={handleRegister}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            {IsAuthenticated && (
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  fetchNotifications();
                }}
                className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-all duration-200 md:hidden"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Notifications */}
        {isNotificationsOpen && IsAuthenticated && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        !notification.is_read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title || "Notification"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(
                              notification.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 text-center">
              <Link
                to="/notifications"
                onClick={() => setIsNotificationsOpen(false)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                View all notifications
              </Link>
            </div>
          </div>
        )}

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 bg-white/95 backdrop-blur-md">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path, item.label)}
                  className={`w-full text-left px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                    activeLink === item.label
                      ? "text-teal-600 bg-teal-50"
                      : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* VERIFICATION button for role_id === 1 */}
              {userData?.role_id === 1 && (
                <>
                  {" "}
                  <button
                    onClick={() => {
                      handleNavigation("/admin-verification", "VERIFICATION");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-base font-medium rounded-xl text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-all duration-200"
                  >
                    VERIFICATION
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation("/news/admin", "news pendind");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-base font-medium rounded-xl text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-all duration-200"
                  >
                    NEWS PENDING
                  </button>
                </>
              )}
            </div>
            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {IsAuthenticated ? (
                <>
                  <div className="px-4 py-2">
                    <p className="font-medium text-gray-900">
                      {userData.first_name} {userData.last_name}
                    </p>
                    <p className="text-sm text-gray-500 break-words">
                      {userData.email}
                    </p>
                  </div>
                  <Link
                    to="/notifications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      console.log("Navigate to profile");
                    }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
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
                    className="w-full px-4 py-3 text-left text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-xl font-medium transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      handleRegister();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Register
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
