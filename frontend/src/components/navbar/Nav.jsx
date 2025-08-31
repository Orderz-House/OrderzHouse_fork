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
  LayoutDashboard 
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
  const searchRef = useRef(null);
  const servicesRef = useRef(null);
  const contactRef = useRef(null);
  const userMenuRef = useRef(null);
  const dispatch = useDispatch();
  const { token, userData } = useSelector((state) => {
    return {
      token: state.auth.token,
      userData: state.auth.userData,
    };
  });
  const navigate = useNavigate();
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
      })
      .catch((err) => {
        console.error("Failed to fetch user data:", err.message);
        setIsAuthenticated(false);
      });
  }, [dispatch, token]);

  // NAVBAR LINKS
  const navLinks = [
    { label: "HOME", path: "/" },
    { label: "ABOUT US", path: "/about" },
    { label: "BLOGS", path: "/blogs" },
  ];
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const services = [
    {
      name: "Programming",
      desc: "Software Developer, Data Analyst, Network Engineer",
      icon: "💻",
    },
    {
      name: "Photographer",
      desc: "Photography is the art of capturing moments, emotions, and stories through the lens to create lasting visual impressions.",
      icon: "📷",
    },
    {
      name: "Admin + Project Management",
      desc: "Administrative Assistant, Project Manager, and Process Analyst",
      icon: "📊",
    },
    {
      name: "Music & Audio",
      desc: "Sound Engineer, Music Producer, Audio Editor",
      icon: "🎵",
    },
    {
      name: "Graphic Design",
      desc: "Graphic design is the art of visual communication that combines images, typography, and creativity to deliver impactful messages.",
      icon: "🎨",
    },
    {
      name: "Remote Work",
      desc: "Customer Service Representative, Financial Analyst",
      icon: "🏠",
    },
    {
      name: "Content Creator",
      desc: "A content writer creates clear, engaging, and informative text tailored to attract and inform a specific audience.",
      icon: "✏️",
    },
  ];

  const contactInfo = [
    {
      name: "Call Us",
      desc: "00971543210343",
      icon: Phone,
      link: "tel:00971543210343",
    },
    {
      name: "Email Us",
      desc: "houseorderz@gmail.com",
      icon: Mail,
      link: "mailto:houseorderz@gmail.com",
    },
    {
      name: "Visit Us",
      desc: "Albasem complex, Amman, Jordan floor 4 room 405",
      icon: MapPin,
      link: "https://www.google.com/maps/place/Albasem+complex/@31.9978945,35.8692204,17z/data=!3m1!4b1!4m6!3m5!1s0x151ca1c4e5bc3da5:0xbaee8769e23ba42d!8m2!3d31.9978945!4d35.8717953!16s%2Fg%2F11gyysglb3?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D",
    },
    {
      name: "whatsapp",
      desc: "Chat with us on WhatsApp",
      icon: Globe,
      link: "https://wa.me/971543210343",
    },
  ];

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

              {/* Services Mega Menu */}
              <div className="relative" ref={servicesRef}>
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center transition-all duration-200 ${
                    isServicesOpen
                      ? "text-teal-600 bg-teal-50"
                      : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  SERVICES
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                      isServicesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isServicesOpen && (
                  <div className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 border border-gray-100 overflow-hidden transform opacity-100 scale-100 transition-all duration-200">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Our Services
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {services.map((service, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              console.log(`Navigate to ${service.name} service`)
                            }
                            className="p-3 rounded-xl hover:bg-gradient-to-br hover:from-teal-50 hover:to-blue-50 transition-all duration-200 group text-left"
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-2xl flex-shrink-0">
                                {service.icon}
                              </span>
                              <div>
                                <h4 className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                                  {service.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {service.desc}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Dropdown */}
              <div className="relative" ref={contactRef}>
                <button
                  onClick={() => setIsContactOpen(!isContactOpen)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center transition-all duration-200 ${
                    isContactOpen
                      ? "text-teal-600 bg-teal-50"
                      : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  CONTACT
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                      isContactOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isContactOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Get in Touch
                      </h3>
                      <div className="space-y-3">
                        {contactInfo.map((contact, index) => (
                          <a
                            key={index}
                            href={contact.link}
                            target={
                              contact.link.startsWith("http")
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              contact.link.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 transition-all duration-200 group"
                          >
                            <contact.icon className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                                {contact.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {contact.desc}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
              <button
                className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
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
                          to="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-all duration-200"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      ) : <Link
                          to="/projects"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-all duration-200"
                        >
                          <Briefcase className="h-4 w-4" />
                          <span>Projects</span>
                        </Link>}
                      

                      <Link to="/edit-profile"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-all duration-200"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Profile Settings</span>
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

              {/* Mobile Services */}
              <div className="pt-2">
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
                >
                  SERVICES
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isServicesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isServicesOpen && (
                  <div className="mt-2 ml-4 space-y-2">
                    {services.map((service, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          console.log(`Navigate to ${service.name} service`);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                      >
                        {service.icon} {service.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Contact */}
              <div className="pt-2">
                <button
                  onClick={() => setIsContactOpen(!isContactOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
                >
                  CONTACT
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isContactOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isContactOpen && (
                  <div className="mt-2 ml-4 space-y-2">
                    {contactInfo.map((contact, index) => (
                      <a
                        key={index}
                        href={contact.link}
                        target={
                          contact.link.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          contact.link.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                      >
                        <contact.icon className="h-4 w-4" />
                        <span>{contact.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="font-medium text-gray-900">
                        {userData.first_name} {userData.last_name}
                      </p>
                      <p className="text-sm text-gray-500 break-words">
                        {userData.email}
                      </p>
                    </div>
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
          </div>
        )}
      </div>
      {/* Demo Controls */}
      {/* 
v className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-40">
        <p className="text-sm font-medium text-gray-700 mb-2">Demo Controls:</p>
        <button
          onClick={() => setIsAuthenticated(!isAuthenticated)}
          className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
            IsAuthenticated
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {IsAuthenticated ? "Logout Demo User" : "Login Demo User"}
        </button>
      </div> */}
    </nav>
  );
}
