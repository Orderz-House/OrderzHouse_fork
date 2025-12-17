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
  showDesktopSidebar = true, // 👈 مهم
}) => {
  // نحمي من undefined عشان ما يصير كراش لو ما انرسل لنا setActivePage مثلاً
  const safeSetActivePage = setActivePage ?? (() => {});
  const safeSetIsMobileMenuOpen = setIsMobileMenuOpen ?? (() => {});

  // Redux
  const userData = useSelector((state) => state.auth?.userData);
  const location = useLocation();
  const pathname = location?.pathname || "/";

  // Helpers
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

  // Default icons
  const defaultIcons = {
    projects: FolderKanban,
    // tasks: CheckSquare,
    payments: CreditCard,
    notifications: Bell,
    profile: User,
    logout: LogOut,
    overview: Home,
    dashboard: Home,
    settings: Settings,
  };

  // Active checker
  const isItemActive = (item) => {
    if (item?.path) {
      return pathname === item.path || pathname.startsWith(item.path + "/");
    }
    return activePage === item?.id;
  };

  // Wrapper for Link / button
  const Clickable = ({
    item,
    children,
    onClick,
    className,
    "data-active": dataActive,
  }) => {
    const handleClick = (event) => {
      if (typeof item?.onClick === "function") {
        item.onClick(event);
      }
      if (typeof onClick === "function") {
        onClick(event);
      }
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
  {/* خط ملون على اليسار (بنفس لونك) */}
  <span
    aria-hidden="true"
    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#028090] via-[#02707a] to-[#015c6a]"
  />

  <div className="flex flex-col h-full">
    {/* Header / Logo + User */}
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
          <div className="w-9 h-9 rounded-full bg-[#ccf0f4] text-[#028090] flex items-center justify-center text-sm font-semibold">
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
          ? "bg-[#e0f7f9] text-[#028090]"
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
                  active ? "text-[#028090]" : "text-slate-400"
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
            ? "bg-[#e0f7f9] text-[#028090]"
            : "text-slate-600 hover:bg-slate-50";

          const iconColor = isLogout
            ? "text-red-500"
            : active
            ? "text-[#028090]"
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


      {/* ===================== Mobile Bottom Tab Bar ===================== */}
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
                          className={`w-6 h-6 ${
                            active ? "text-[#028090]" : "text-slate-600"
                          }`}
                        />
                        <span
                          className={`text-[11px] mt-1 ${
                            active ? "text-[#028090]" : "text-slate-600"
                          }`}
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
                  onClick={() => safeSetIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#028090] text-white shadow-lg ring-4 ring-white/60 flex items-center justify-center active:scale-95 transition"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
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
                          className={`w-6 h-6 ${
                            active ? "text-[#028090]" : "text-slate-600"
                          }`}
                        />
                        <span
                          className={`text-[11px] mt-1 ${
                            active ? "text-[#028090]" : "text-slate-600"
                          }`}
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

      {/* ===================== Mobile Command Sheet ===================== */}
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
                  className={`flex flex-col items-center justify-center rounded-xl py-3 ${
                    active ? "bg-[#e0f7f9]" : "hover:bg-slate-50"
                  }`}
                >
                  <>
                    <Icon
                      className={`w-6 h-6 ${
                        active ? "text-[#028090]" : "text-slate-700"
                      }`}
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
                    if (isLogout) {
                      onLogout?.();
                    } else {
                      safeSetActivePage(item.id);
                    }
                    safeSetIsMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl py-3 ${
                    active ? "bg-[#e0f7f9]" : "hover:bg-slate-50"
                  }`}
                >
                  <>
                    <Icon
                      className={`w-6 h-6 ${
                        isLogout
                          ? "text-red-500"
                          : active
                          ? "text-[#028090]"
                          : "text-slate-700"
                      }`}
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

            <style>{`
        .sidebar-scroll {
          scrollbar-width: thin;                 /* Firefox */
          scrollbar-color: #c9c9c9 transparent;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;                            /* العرض */
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #e0f7f9;             /* اللون */
          border-radius: 999px;                  /* حواف دائرية */
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #e0f7f9;
        }
      `}</style>

    </>
  );
};

export default Sidebar;
