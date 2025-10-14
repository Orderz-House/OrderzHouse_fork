import React, { useState } from "react";
import {
  FolderKanban,
  CheckSquare,
  CreditCard,
  Bell,
  User,
  LogOut,
  Menu,
} from "lucide-react";
import { useSelector } from "react-redux";

const Sidebar = ({
  activePage,
  setActivePage,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  navigation = [],
  bottomNavigation = [],
  onLogout,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { userData } = useSelector((state) => state.auth);

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

  const getUserAvatar = () => {
    return userData?.profile_picture || null;
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const avatarUrl = getUserAvatar();
  const hasValidAvatar = avatarUrl && avatarUrl.trim() !== "";

  const defaultIcons = {
    projects: FolderKanban,
    tasks: CheckSquare,
    payments: CreditCard,
    notifications: Bell,
    profile: User,
    logout: LogOut,
  };

  return (
    <aside
      className={`bg-[#028090] border-r border-[#015c6a] transform transition-all duration-300 ease-in-out fixed lg:static
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} 
        w-64 z-50 lg:translate-x-0
        h-screen lg:h-auto
        top-0 left-0
        ${isMobileMenuOpen ? "pt-16" : ""}`}
      style={{
        height: isMobileMenuOpen ? "100vh" : "auto",
        maxHeight: isMobileMenuOpen ? "100vh" : "none",
        overflowY: isMobileMenuOpen ? "hidden" : "visible",
      }}
    >
      <div className="flex flex-col h-[92vh]">
        {/* Profile Section */}
        <div className="pt-16 px-6 pb-6 relative flex-shrink-0">
          <div
            className={`flex flex-col items-center text-center transition-all duration-300 ${
              isSidebarCollapsed ? "lg:px-0" : ""
            }`}
          >
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
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <>
                <h3 className="text-sm font-semibold text-white">
                  {getUserDisplayName()}
                </h3>
                <p className="text-xs text-[#e0f2fe]">{getUserRole()}</p>
              </>
            )}
          </div>

          {/* (Menu) */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`hidden lg:flex absolute top-4 w-8 h-8 rounded-md items-center justify-center text-white hover:text-white hover:bg-[#015c6a] transition-colors shadow-sm
              ${isSidebarCollapsed ? "left-1/2 -translate-x-1/2" : "right-4"}
            `}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Separator Line */}
        <div className="px-6 mb-2 flex-shrink-0">
          <div className="border-t border-[#015c6a]"></div>
        </div>

        {/* ✅ Scrollable Navigation*/}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#016d7a] scrollbar-track-transparent px-4 pb-2">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon || defaultIcons[item.id] || User;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? "bg-[#016d7a]" : "hover:bg-[#015c6a]"
                  } ${
                    isSidebarCollapsed && !isMobileMenuOpen
                      ? "lg:justify-center"
                      : ""
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-white" : "text-[#e0f2fe]"
                    }`}
                  />
                  {(!isSidebarCollapsed || isMobileMenuOpen) && (
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "text-white" : "text-[#e0f2fe]"
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-4 py-4 border-t border-[#015c6a] space-y-1 flex-shrink-0">
          {bottomNavigation.map((item) => {
            const Icon = item.icon || defaultIcons[item.id] || User;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "logout") {
                    onLogout?.();
                  } else {
                    setActivePage(item.id);
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? "bg-[#016d7a]" : "hover:bg-[#015c6a]"
                } ${
                  isSidebarCollapsed && !isMobileMenuOpen
                    ? "lg:justify-center"
                    : ""
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? "text-white" : "text-[#e0f2fe]"
                  }`}
                />
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-white" : "text-[#e0f2fe]"
                    }`}
                  >
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
