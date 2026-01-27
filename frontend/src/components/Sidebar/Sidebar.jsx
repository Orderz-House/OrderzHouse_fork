import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  BookOpen,
  ClipboardList,
  Users,
  FolderKanban,
  CheckSquare,
  CreditCard,
  Bell,
  User,
  LogOut,
  Menu,
  Home,
  X,
  Settings,
  FolderPlus,
  ListPlus,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

/**
 * Desktop: تصميم مشابه للصورة (Logo + أقسام: OVERVIEW / FRIENDS / SETTINGS)
 * Mobile: نفس التصميم الحالي لكن تغيير الألوان فقط
 */
const Sidebar = ({
  activePage,
  setActivePage,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
  navigation = [],
  bottomNavigation = [],
  onLogout,
  showDesktopSidebar = true,

  // Role based mobile behavior
  role = "admin",
  onCreateProject,
  onCreateTask,

  // Optional (Desktop only)
  appName = "Coursue",
  friends = [], // [{ id, name, subtitle, avatarUrl }]
  onFriendClick,
}) => {
  // Avoid undefined crashes
  const safeSetActivePage = setActivePage ?? (() => {});
  const safeSetIsMobileMenuOpen = setIsMobileMenuOpen ?? (() => {});

  const isAdmin = role === "admin";
  const isFreelancer = role === "freelancer";

  const findItemById = (id) =>
    [...navigation, ...bottomNavigation].find((it) => it?.id === id);

  // Bottom bar items (client/freelancer): Overview, Projects, Payments, Profile
  const mobileNav = (() => {
    if (!isAdmin) {
      const desired = ["overview", "projects", "payments", "profile"];
      const picked = desired.map(findItemById).filter(Boolean);
      if (picked.length === 4) return picked;
    }
    return navigation.slice(0, 4);
  })();

  const FabIcon = isAdmin ? Menu : isFreelancer ? ListPlus : FolderPlus;
  const fabAriaLabel = isAdmin
    ? "Open menu"
    : isFreelancer
    ? "Create task"
    : "Create project";

  const handleFabClick = () => {
    if (isAdmin) {
      safeSetIsMobileMenuOpen(!isMobileMenuOpen);
      return;
    }
    if (isFreelancer) {
      if (typeof onCreateTask === "function") onCreateTask();
      return;
    }
    if (typeof onCreateProject === "function") onCreateProject();
  };

  // Brand colors (غيرها مرة واحدة هنا)
  const BRAND = {
    primary: "#6D5FFD", // بنفسجي مثل الصورة
    primarySoft: "#F2F1FF",
    primaryRing: "#E6E2FF",
    danger: "#F97316", // لون Logout بالصورة (برتقالي/أحمر)
  };

  // API base URL with fallback
  const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

  const location = useLocation();
  const pathname = location?.pathname || "/";

  // ===== User profile (same endpoint used in Nav.jsx) =====
  const { token, userData } = useSelector((s) => s.auth || {});
  const [profile, setProfile] = useState(userData || null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (userData) setProfile(userData);
  }, [userData]);

  useEffect(() => {
    if (!token) return;
    if (profile?.email) return;
    if (!API_BASE) {
      console.error("API_BASE is not configured. Please set VITE_APP_API_URL environment variable.");
      return;
    }

    setProfileLoading(true);
    axios
      .get(`${API_BASE}/users/getUserdata`, {
        headers: { authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const u =
          res?.data?.user ||
          res?.data?.data?.user ||
          res?.data?.data ||
          res?.data?.result ||
          null;
        if (u) setProfile(u);
      })
      .catch((error) => {
        // Silently fail - don't crash the UI
        console.warn("Error fetching user profile in Sidebar:", error);
        // Don't set profile to avoid infinite retries
      })
      .finally(() => setProfileLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, profile?.email]);

  const displayName = useMemo(() => {
    const name =
      profile?.username ||
      profile?.user_name ||
      profile?.name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      "";
    return name || appName || "User";
  }, [profile, appName]);

  const avatarChar = useMemo(() => {
    const c = (displayName || "U").trim().charAt(0);
    return (c || "U").toUpperCase();
  }, [displayName]);


  // Default icons (يدعم IDs قديمة + IDs جديدة مثل الصورة)
  const defaultIcons = {
    // new-like ids
    dashboard: LayoutDashboard,
    inbox: Inbox,
    lesson: BookOpen,
    task: ClipboardList,
    group: Users,

    // legacy ids (backwards compatible)
    projects: FolderKanban,
    tasks: CheckSquare,
    payments: CreditCard,
    notifications: Bell,
    profile: User,
    logout: LogOut,
    overview: Home,
    settings: Settings,
  };

  const isItemActive = (item) => {
    if (item?.path) {
      return pathname === item.path || pathname.startsWith(item.path + "/");
    }
    return activePage === item?.id;
  };

  const Clickable = ({
    item,
    children,
    onClick,
    className,
    "data-active": dataActive,
  }) => {
    const handleClick = (event) => {
      if (typeof item?.onClick === "function") item.onClick(event);
      if (typeof onClick === "function") onClick(event);
    };

    if (item?.path) {
      return (
        <Link
          to={item.path}
          onClick={handleClick}
          className={className}
          data-active={dataActive}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={handleClick}
        className={className}
        data-active={dataActive}
      >
        {children}
      </button>
    );
  };

  return (
    <>
      {/* ===================== Desktop Sidebar (NEW DESIGN) ===================== */}
      <aside
        className={`
          hidden lg:block lg:h-screen lg:sticky lg:top-0
          transition-all duration-300 ease-in-out
          ${showDesktopSidebar ? "lg:w-72" : "lg:w-0 overflow-hidden"}
        `}
      >
        <div className="h-full">
          <div className="h-full bg-white  border border-slate-100 shadow-sm px-5 py-6 flex flex-col">
            
{/* User */} 
            <div className="mb-6">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-3">
                <div
                  className="relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: BRAND.primary }}
                  aria-hidden="true"
                >
                  <span className="text-white font-extrabold text-lg uppercase">
                    {avatarChar}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {displayName}
                    </div>
                    {profileLoading && (
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        Loading…
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {profile?.email || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* OVERVIEW */}
            <div className="text-[10px] tracking-widest font-semibold text-slate-400 mb-2">
              OVERVIEW
            </div>

            <nav className="flex flex-col gap-1">
              {navigation.map((item) => {
                const Icon = item.icon || defaultIcons[item.id] || User;
                const active = isItemActive(item);

                return (
                  <Clickable
                    key={item.id}
                    item={item}
                    onClick={() => safeSetActivePage(item.id)}
                    data-active={active ? "true" : "false"}
                    className={`
                      flex items-center gap-3 rounded-xl px-3 py-2.5
                      transition-colors
                      ${active ? "bg-slate-50" : "hover:bg-slate-50"}
                    `}
                  >
                    <>
                      <Icon
                        className="w-5 h-5"
                        style={{ color: active ? BRAND.primary : "#111827" }}
                      />
                      <span
                        className={`text-sm ${
                          active
                            ? "font-semibold text-slate-900"
                            : "font-medium text-slate-800"
                        }`}
                      >
                        {item.name}
                      </span>
                    </>
                  </Clickable>
                );
              })}
            </nav>

            {/* FRIENDS */}
            {friends?.length > 0 && (
              <div className="mt-7">
                <div className="text-[10px] tracking-widest font-semibold text-slate-400 mb-3">
                  FRIENDS
                </div>

                <div className="flex flex-col gap-3">
                  {friends.map((f) => (
                    <button
                      key={f.id ?? f.name}
                      type="button"
                      onClick={() => onFriendClick?.(f)}
                      className="flex items-center gap-3 text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ background: BRAND.primarySoft }}
                      >
                        {f.avatarUrl ? (
                          <img
                            src={f.avatarUrl}
                            alt={f.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className="text-sm font-semibold"
                            style={{ color: BRAND.primary }}
                          >
                            {(f.name?.charAt(0) || "U").toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {f.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {f.subtitle ?? ""}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Push bottom */}
            <div className="flex-1" />

            {/* SETTINGS */}
            <div className="mt-8">
              <div className="text-[10px] tracking-widest font-semibold text-slate-400 mb-3">
                SETTINGS
              </div>

              <div className="flex flex-col gap-2">
                {bottomNavigation.map((item) => {
                  const Icon = item.icon || defaultIcons[item.id] || User;
                  const active = isItemActive(item);
                  const isLogout = item.id === "logout";

                  return (
                    <Clickable
                      key={item.id}
                      item={item}
                      onClick={() => {
                        if (isLogout) onLogout?.();
                        else safeSetActivePage(item.id);
                      }}
                      data-active={active ? "true" : "false"}
                      className={`
                        flex items-center gap-3 rounded-xl px-3 py-2.5
                        transition-colors
                        ${active ? "bg-slate-50" : "hover:bg-slate-50"}
                      `}
                    >
                      <>
                        <Icon
                          className="w-5 h-5"
                          style={{
                            color: isLogout
                              ? BRAND.danger
                              : active
                              ? BRAND.primary
                              : "#111827",
                          }}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isLogout
                              ? "text-orange-500"
                              : active
                              ? "text-slate-900"
                              : "text-slate-800"
                          }`}
                        >
                          {item.name}
                        </span>
                      </>
                    </Clickable>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ===================== Mobile Bottom Tab Bar (SAME LAYOUT, NEW COLORS) ===================== */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-screen-sm">
          <div className="relative">
            {/* Bar */}
            <div className="h-16 bg-white/95 backdrop-blur border-t border-slate-200 shadow-sm rounded-t-2xl"></div>

            {/* Tabs */}
            <div className="absolute inset-0 flex items-center justify-between px-6">
              {/* Left */}
              <div className="flex items-center gap-6">
                {mobileNav.slice(0, 2).map((item) => {
                  const Icon = item.icon || defaultIcons[item.id] || User;
                  const active = isItemActive(item);
                  return (
                    <Clickable
                      key={item.id}
                      item={item}
                      onClick={() => {
                        safeSetActivePage(item.id);
                        safeSetIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center justify-center"
                    >
                      <>
                        <Icon
                          className="w-6 h-6"
                          style={{ color: active ? BRAND.primary : "#475569" }}
                        />
                        <span
                          className="text-[11px] mt-1"
                          style={{ color: active ? BRAND.primary : "#475569" }}
                        >
                          {item.name?.split(" ")[0] ?? item.name}
                        </span>
                      </>
                    </Clickable>
                  );
                })}
              </div>

              {/* Fab */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-20 h-20 z-10">
                <span className="absolute inset-1 rounded-full bg-slate-400/20 shadow-[0_4px_20px_rgba(0,0,0,0.06)] pointer-events-none" />
                <button
                  onClick={handleFabClick}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full text-white shadow-lg ring-4 ring-white/60 flex items-center justify-center active:scale-95 transition"
                  style={{ background: BRAND.primary }}
                  aria-label={fabAriaLabel}
                >
                  <FabIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Right */}
              <div className="flex items-center gap-6">
                {mobileNav.slice(2, 4).map((item) => {
                  const Icon = item.icon || defaultIcons[item.id] || User;
                  const active = isItemActive(item);
                  return (
                    <Clickable
                      key={item.id}
                      item={item}
                      onClick={() => {
                        safeSetActivePage(item.id);
                        safeSetIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center justify-center"
                    >
                      <>
                        <Icon
                          className="w-6 h-6"
                          style={{ color: active ? BRAND.primary : "#475569" }}
                        />
                        <span
                          className="text-[11px] mt-1"
                          style={{ color: active ? BRAND.primary : "#475569" }}
                        >
                          {item.name?.split(" ")[0] ?? item.name}
                        </span>
                      </>
                    </Clickable>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== Mobile Command Sheet (SAME LAYOUT, NEW COLORS) ===================== */}
      {isAdmin && (
      <div
        className={`
          lg:hidden fixed inset-0 z-[60]
          transition-opacity duration-300
          ${
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      >
        {/* Backdrop */}
        <button
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => safeSetIsMobileMenuOpen(false)}
          aria-label="Close menu backdrop"
        />

        {/* Panel */}
        <div
          className={`
            absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto
            bg-white rounded-t-3xl shadow-xl p-4 pt-4
            pb-[max(16px,env(safe-area-inset-bottom))]
            transform transition-transform duration-300
            ${isMobileMenuOpen ? "translate-y-0" : "translate-y-full"}
          `}
        >
          {/* Close */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => safeSetIsMobileMenuOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 active:scale-95 transition"
              aria-label="Close menu"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid main */}
          <div className="grid grid-cols-4 gap-3">
            {navigation.map((item) => {
              const Icon = item.icon || defaultIcons[item.id] || User;
              const active = isItemActive(item);
              return (
                <Clickable
                  key={item.id}
                  item={item}
                  onClick={() => {
                    safeSetActivePage(item.id);
                    safeSetIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center rounded-xl py-3"
                  style={{
                    background: active ? BRAND.primarySoft : "transparent",
                  }}
                >
                  <>
                    <Icon
                      className="w-6 h-6"
                      style={{ color: active ? BRAND.primary : "#334155" }}
                    />
                    <span className="text-[11px] mt-1 text-slate-700 text-center line-clamp-1">
                      {item.name}
                    </span>
                  </>
                </Clickable>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mt-4 pt-3 border-t border-slate-200" />

          {/* Bottom grid */}
          <div className="grid grid-cols-4 gap-3 mt-2">
            {bottomNavigation.map((item) => {
              const Icon = item.icon || defaultIcons[item.id] || User;
              const active = isItemActive(item);
              const isLogout = item.id === "logout";

              return (
                <Clickable
                  key={item.id}
                  item={item}
                  onClick={() => {
                    if (isLogout) onLogout?.();
                    else safeSetActivePage(item.id);
                    safeSetIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center rounded-xl py-3"
                  style={{
                    background: active ? BRAND.primarySoft : "transparent",
                  }}
                >
                  <>
                    <Icon
                      className="w-6 h-6"
                      style={{
                        color: isLogout
                          ? BRAND.danger
                          : active
                          ? BRAND.primary
                          : "#334155",
                      }}
                    />
                    <span className="text-[11px] mt-1 text-slate-700 text-center line-clamp-1">
                      {item.name}
                    </span>
                  </>
                </Clickable>
              );
            })}
          </div>
        </div>
      </div>
      )}

      <style>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: ${BRAND.primaryRing} transparent;
        }
        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: ${BRAND.primaryRing};
          border-radius: 999px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: ${BRAND.primaryRing};
        }
      `}</style>
    </>
  );
};

export default Sidebar;
