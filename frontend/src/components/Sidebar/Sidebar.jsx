// Sidebar.jsx
import React from "react";
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
  Settings,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({
  activePage,
  setActivePage,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
  navigation = [],
  bottomNavigation = [],
  onLogout,
  showDesktopSidebar = true,
}) => {
  const safeSetActivePage = setActivePage ?? (() => {});
  const safeSetIsMobileMenuOpen = setIsMobileMenuOpen ?? (() => {});

  const userData = useSelector((state) => state.auth?.userData);
  const location = useLocation();
  const pathname = location?.pathname || "/";

  const getUserDisplayName = () => {
    if (userData?.full_name) return userData.full_name;
    if (userData?.username) return userData.username;
    return "User";
  };

  const getUserRole = () => {
    const roleId = userData?.role_id;
    if (roleId === 1) return "Admin";
    if (roleId === 2) return "Client";
    if (roleId === 3) return "Freelancer";
    if (roleId === 5) return "Partner";
    return "Member";
  };

  const getUserAvatar = () => userData?.profile_picture || null;
  const getUserInitial = () =>
    (getUserDisplayName().charAt(0) || "U").toUpperCase();

  const avatarUrl = getUserAvatar();
  const hasValidAvatar = Boolean(avatarUrl && avatarUrl.trim() !== "");

  const defaultIcons = {
    projects: FolderKanban,
    payments: CreditCard,
    notifications: Bell,
    profile: User,
    logout: LogOut,
    overview: Home,
    dashboard: Home,
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
      item?.onClick?.(event);
      onClick?.(event);
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

  const mobileNav = navigation.slice(0, 4);

  return (
    <>
      {/* ===================== Desktop Sidebar ===================== */}
      <aside
        className={`
          hidden lg:flex lg:flex-col lg:h-screen lg:sticky lg:top-0
          bg-white border-r border-slate-200 shadow-sm relative z-40
          overflow-hidden transform transition-all duration-300 ease-in-out
          ${showDesktopSidebar ? "lg:w-64 translate-x-0" : "lg:w-0 -translate-x-full"}
        `}
      >
        {/* Accent line */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-1
          bg-gradient-to-b from-[#C2410C] via-[#A6360A] to-[#7A2807]"
        />

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {hasValidAvatar ? (
                <img
                  src={avatarUrl}
                  alt={getUserDisplayName()}
                  className="w-9 h-9 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#FAD9CC] text-[#C2410C] flex items-center justify-center text-sm font-semibold">
                  {getUserInitial()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {getUserRole()}
                </p>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="sidebar-scroll flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon || defaultIcons[item.id] || User;
              const active = isItemActive(item);

              const baseClasses =
                "w-full flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors";
              const stateClasses = active
                ? "bg-[#FCE7E0] text-[#C2410C]"
                : "text-slate-600 hover:bg-slate-50";

              return (
                <Clickable
                  key={item.id}
                  item={item}
                  onClick={() => safeSetActivePage(item.id)}
                  className={`${baseClasses} ${stateClasses}`}
                  data-active={active ? "true" : "false"}
                >
                  <>
                    <Icon
                      className={`w-5 h-5 ${
                        active ? "text-[#C2410C]" : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </>
                </Clickable>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          {bottomNavigation.length > 0 && (
            <div className="px-2 pb-4 pt-3 border-t border-slate-100 space-y-1">
              {bottomNavigation.map((item) => {
                const Icon = item.icon || defaultIcons[item.id] || User;
                const active = isItemActive(item);
                const isLogout = item.id === "logout";

                const baseClasses =
                  "w-full flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors";

                const stateClasses = isLogout
                  ? active
                    ? "bg-red-50 text-red-600"
                    : "text-red-600 hover:bg-red-50"
                  : active
                  ? "bg-[#FCE7E0] text-[#C2410C]"
                  : "text-slate-600 hover:bg-slate-50";

                const iconColor = isLogout
                  ? "text-red-500"
                  : active
                  ? "text-[#C2410C]"
                  : "text-slate-400";

                return (
                  <Clickable
                    key={item.id}
                    item={item}
                    onClick={() => {
                      if (isLogout) {
                        onLogout?.();
                      } else {
                        safeSetActivePage(item.id);
                      }
                    }}
                    className={`${baseClasses} ${stateClasses}`}
                    data-active={active ? "true" : "false"}
                  >
                    <>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                      <span className="truncate">{item.name}</span>
                    </>
                  </Clickable>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ===================== styles ===================== */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #FCE7E0;
          border-radius: 999px;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
