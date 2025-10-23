import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  FolderKanban,
  CheckSquare,
  CreditCard,
  Bell,
  User,
  LogOut,
  Menu,
  Home,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({
  activePage,
  setActivePage,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  navigation = [],
  bottomNavigation = [],
  onLogout,
}) => {
  /* ==============================
   * Local state
   * ============================== */
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  /* ==============================
   * Global (Redux) & Router
   * ============================== */
  const { userData } = useSelector((state) => state.auth);
  const location = useLocation();

  /* ==============================
   * Refs
   * ============================== */
  const mainListRef = useRef(null);

  useEffect(() => {
  }, [location.pathname, isSidebarCollapsed]);

  /* ==============================
   * User helpers
   * ============================== */
  const getUserDisplayName = () => {
    if (userData?.full_name) return userData.full_name;
    if (userData?.username) return userData.username;
    return "User Dashboard";
  };

  const getUserRole = () => {
    const roleId = userData?.role_id;
    if (roleId === 1) return "Admin";
    if (roleId === 2) return "Client";
    if (roleId === 3) return "Freelancer";
    return "User";
  };

  const getUserAvatar = () => userData?.profile_picture || null;
  const getUserInitial = () => (getUserDisplayName().charAt(0) || "U").toUpperCase();

  const avatarUrl = getUserAvatar();
  const hasValidAvatar = avatarUrl && avatarUrl.trim() !== "";

  /* ==============================
   * Default icon map
   * ============================== */
  const defaultIcons = {
    projects: FolderKanban,
    tasks: CheckSquare,
    payments: CreditCard,
    notifications: Bell,
    profile: User,
    logout: LogOut,
    overview: Home,
  };

  /* ==============================
   * Active item detector
   * ============================== */
  const isItemActive = (item) => {
    if (item?.path) {
      const curr = location.pathname || "/";
      return curr === item.path || curr.startsWith(item.path + "/");
    }
    return activePage === item?.id;
  };

  /* ==============================
   * Link-or-Button wrapper
   * ============================== */
  const Clickable = ({ item, children, onClick, className, "data-active": dataActive }) => {
    if (item?.path) {
      return (
        <Link to={item.path} onClick={onClick} className={className} data-active={dataActive}>
          {children}
        </Link>
      );
    }
    return (
      <button onClick={onClick} className={className} data-active={dataActive}>
        {children}
      </button>
    );
  };

  const mobileNav = useMemo(() => navigation.slice(0, 4), [navigation]);

  return (
    <>
      {/* ===================== Desktop Sidebar ===================== */}
      <aside
        className={`hidden lg:block bg-[#028090] border-r border-[#015c6a] transition-all duration-300 ease-in-out
        ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} 
        w-64 z-40 h-screen top-0 left-0`}
      >
        <div className="flex flex-col h-[90vh]">
          {/* ---------- Profile section ---------- */}
          <div className="pt-6 px-6 pb-3 relative flex-shrink-0">
            <div
              className={`flex flex-col items-center text-center transition-all duration-300 ${
                isSidebarCollapsed ? "lg:px-0" : ""
              }`}
            >
              {isSidebarCollapsed && (
                <div className="mb-2">
                  <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="hidden lg:flex w-8 h-8 rounded-md items-center justify-center text-white hover:bg-[#015c6a] transition-colors shadow-sm"
                    aria-label="Expand sidebar"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Avatar or fallback initial */}
              {hasValidAvatar ? (
                <img
                  src={avatarUrl}
                  alt={getUserDisplayName()}
                  className="w-16 h-16 rounded-full mb-3 object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    const fallback =
                      e.target.parentElement.querySelector(".avatar-fallback");
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="avatar-fallback w-16 h-16 rounded-full bg-gradient-to-br from-white to-[#e0f2fe] mb-3 flex items-center justify-center text-[#028090] font-bold text-xl"
                style={{ display: hasValidAvatar ? "none" : "flex" }}
              >
                {getUserInitial()}
              </div>

              {!isSidebarCollapsed && (
                <>
                  <h3 className="text-sm font-semibold text-white">{getUserDisplayName()}</h3>
                  <p className="text-xs text-[#e0f2fe]">{getUserRole()}</p>
                </>
              )}
            </div>

            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="hidden lg:flex absolute top-4 right-4 w-8 h-8 rounded-md items-center justify-center text-white hover:bg-[#015c6a] transition-colors shadow-sm"
                aria-label="Collapse sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* ---------- Divider ---------- */}
          <div className="px-6 mb-2 flex-shrink-0">
            <div className="border-t border-[#015c6a]" />
          </div>

          {/* ---------- Navigation (scrollable) ---------- */}
          <div ref={mainListRef} className="sidebar-scroll flex-1 overflow-y-auto px-4 pb-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon || defaultIcons[item.id] || User;
                const active = isItemActive(item);
                const collapsed = isSidebarCollapsed;

                const buttonClasses = [
                  "w-full flex items-center rounded-lg transition-colors",
                  collapsed ? "justify-center px-0 py-1.5" : "space-x-3 px-3 py-2.5",
                  !collapsed && (active ? "bg-[#016d7a]" : "hover:bg-[#015c6a]"),
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <Clickable
                    key={item.id}
                    item={item}
                    onClick={() => setActivePage?.(item.id)}
                    className={buttonClasses}
                    data-active={active ? "true" : "false"}
                  >
                    <>
                      <span
                        className={[
                          "grid place-items-center",
                          collapsed ? "w-10 h-10 rounded-md" : "w-5 h-5",
                          collapsed
                            ? active
                              ? "bg-[#016d7a] text-white"
                              : "hover:bg-[#015c6a] text-[#e0f2fe]"
                            : active
                            ? "text-white"
                            : "text-[#e0f2fe]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <Icon className="w-5 h-5" />
                      </span>

                      {!collapsed && (
                        <span className={`text-sm font-medium ${active ? "text-white" : "text-[#e0f2fe]"}`}>
                          {item.name}
                        </span>
                      )}
                    </>
                  </Clickable>
                );
              })}
            </nav>
          </div>

          {/* ---------- Bottom actions ---------- */}
          <div className="px-4 py-4 border-t border-[#015c6a] space-y-1 flex-shrink-0">
            {bottomNavigation.map((item) => {
              const Icon = item.icon || defaultIcons[item.id] || User;
              const active = isItemActive(item);
              const isLogout = item.id === "logout";
              const collapsed = isSidebarCollapsed;

              const buttonClasses = [
                "w-full flex items-center rounded-lg transition-colors",
                collapsed ? "justify-center px-0 py-1.5" : "space-x-3 px-3 py-2.5",
                !collapsed && (active ? "bg-[#016d7a]" : "hover:bg-[#015c6a]"),
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <Clickable
                  key={item.id}
                  item={item}
                  onClick={() => {
                    if (isLogout) onLogout?.();
                    else setActivePage?.(item.id);
                  }}
                  className={buttonClasses}
                  data-active={active ? "true" : "false"}
                >
                  <>
                    <span
                      className={[
                        "grid place-items-center",
                        collapsed ? "w-10 h-10 rounded-md" : "w-5 h-5",
                        collapsed
                          ? active
                            ? "bg-[#016d7a] text-white"
                            : "hover:bg-[#015c6a] text-[#e0f2fe]"
                          : active
                          ? "text-white"
                          : "text-[#e0f2fe]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <Icon className="w-5 h-5" />
                    </span>

                    {!collapsed && (
                      <span className={`text-sm font-medium ${active ? "text-white" : "text-[#e0f2fe]"}`}>
                        {item.name}
                      </span>
                    )}
                  </>
                </Clickable>
              );
            })}
          </div>
        </div>

        <style>{`
          .sidebar-scroll { scrollbar-width: thin; scrollbar-color: #015e6d transparent; }
          .sidebar-scroll::-webkit-scrollbar { width: 8px; background: transparent; }
          .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
          .sidebar-scroll::-webkit-scrollbar-thumb { background-color: #015e6d; border-radius: 8px; border: 2px solid transparent; }
          .sidebar-scroll:hover::-webkit-scrollbar-thumb { background-color: #015564; }
        `}</style>
      </aside>

      {/* ===================== Mobile Bottom Tab Bar ===================== */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-screen-sm">
          <div className="relative">
            {/* Bar background */}
            <div className="h-16 bg-white/95 backdrop-blur border-t border-slate-200 shadow-sm rounded-t-2xl"></div>

            <div className="absolute inset-0 flex items-center justify-between px-6">
              {/* Left pair */}
              <div className="flex items-center gap-6">
                {mobileNav.slice(0, 2).map((item) => {
                  const Icon = item.icon || defaultIcons[item.id] || User;
                  const active = isItemActive(item);
                  return (
                    <Clickable
                      key={item.id}
                      item={item}
                      onClick={() => {
                        setActivePage?.(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center justify-center"
                    >
                      <>
                        <Icon className={`w-6 h-6 ${active ? "text-[#028090]" : "text-slate-600"}`} />
                        <span className={`text-[11px] mt-1 ${active ? "text-[#028090]" : "text-slate-600"}`}>
                          {item.name?.split(" ")[0] ?? item.name}
                        </span>
                      </>
                    </Clickable>
                  );
                })}
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 -top-7 w-18 h-18">
                <span className="absolute inset-0 rounded-full bg-slate-400/20 shadow-[0_4px_20px_rgba(0,0,0,0.06)] pointer-events-none" />
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#028090] text-white shadow-lg ring-4 ring-white/60 flex items-center justify-center active:scale-95 transition"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>

              {/* Right pair */}
              <div className="flex items-center gap-6">
                {mobileNav.slice(2, 4).map((item) => {
                  const Icon = item.icon || defaultIcons[item.id] || User;
                  const active = isItemActive(item);
                  return (
                    <Clickable
                      key={item.id}
                      item={item}
                      onClick={() => {
                        setActivePage?.(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center justify-center"
                    >
                      <>
                        <Icon className={`w-6 h-6 ${active ? "text-[#028090]" : "text-slate-600"}`} />
                        <span className={`text-[11px] mt-1 ${active ? "text-[#028090]" : "text-slate-600"}`}>
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

      {/* ===================== Mobile Command Sheet ===================== */}
      <div
        className={`
          lg:hidden fixed inset-0 z-[60]
          transition-opacity duration-300
          ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Backdrop */}
        <button
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu backdrop"
        />
        {/* Bottom sheet */}
        <div
          className={`
            absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto
            bg-white rounded-t-3xl shadow-xl p-4 pt-4
            pb-[max(16px,env(safe-area-inset-bottom))]
            transform transition-transform duration-300
            ${isMobileMenuOpen ? "translate-y-0" : "translate-y-full"}
          `}
        >
          {/* Close (X) */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 active:scale-95 transition"
              aria-label="Close menu"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu grid */}
          <div className="grid grid-cols-4 gap-3">
            {navigation.map((item) => {
              const Icon = item.icon || defaultIcons[item.id] || User;
              const active = isItemActive(item);
              return (
                <Clickable
                  key={item.id}
                  item={item}
                  onClick={() => {
                    setActivePage?.(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl py-3 ${
                    active ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                >
                  <>
                    <Icon className={`w-6 h-6 ${active ? "text-[#028090]" : "text-slate-700"}`} />
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
                    else setActivePage?.(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl py-3 ${
                    active ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                >
                  <>
                    <Icon className={`w-6 h-6 ${active ? "text-[#028090]" : "text-slate-700"}`} />
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
    </>
  );
};

export default Sidebar;
