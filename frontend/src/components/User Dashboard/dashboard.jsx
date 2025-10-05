import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckSquare,
  CreditCard,
  Bell,
  User,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setLogout } from '../../slice/auth/authSlice';
import ProjectsTable from './projects';
import FinancialTable from './payments';
import TaskRequestsTable from './tasks';
import NotificationsComponent from './notifications';
import EditProfile from './editProfile';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('projects');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const { userData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const getUserDisplayName = () => {
    if (userData?.full_name) return userData.full_name;
    if (userData?.username) return userData.username;
    return 'User Dashboard';
  };

  const getUserRole = () => {
    const roleId = userData?.role_id;
    if (roleId === 1) return 'Admin';
    if (roleId === 2) return 'Client';
    if (roleId === 3) return 'Freelancer';
    return 'User';
  };

  const getUserAvatar = () => {
    return userData?.profile_picture || null;
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    dispatch(setLogout());
    window.location.href = '/login';
  };

  const navigation = [
    { name: 'My Projects', icon: FolderKanban, id: 'projects' },
    { name: 'Requested Tasks', icon: CheckSquare, id: 'tasks' },
    { name: 'Payment History', icon: CreditCard, id: 'payments' },
  ];

  const bottomNavigation = [
    { name: 'Notifications', icon: Bell, id: 'notifications' },
    { name: 'Profile', icon: User, id: 'profile' },
    { name: 'Log Out', icon: LogOut, id: 'logout', onClick: handleLogout },
  ];

  const renderContent = () => {
    if (activePage === 'projects') {
      return <ProjectsTable />;
    }
    if (activePage === 'payments') {
      return <FinancialTable />;
    }
    if (activePage === 'tasks') {
      return <TaskRequestsTable />;
    }
    if (activePage === 'notifications') {
      return <NotificationsComponent />;
    }
      if (activePage === 'profile') {
    return <EditProfile />;
  }
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {navigation.find((item) => item.id === activePage)?.name ||
            bottomNavigation.find((item) => item.id === activePage)?.name}
        </h2>
        <p className="text-gray-600">Component coming soon...</p>
      </div>
    );
  };

  const avatarUrl = getUserAvatar();
  const hasValidAvatar = avatarUrl && avatarUrl.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out fixed lg:static
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} 
          w-64 min-h-screen z-50 lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div className="pt-16 px-6 pb-6 relative">
            <div
              className={`flex flex-col items-center text-center transition-all duration-300 ${
                isSidebarCollapsed ? 'lg:px-0' : ''
              }`}
            >
              {hasValidAvatar ? (
                <img
                  src={avatarUrl}
                  alt={getUserDisplayName()}
                  className="w-16 h-16 rounded-full mb-3 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="avatar-fallback w-16 h-16 rounded-full bg-gradient-to-br from-[#028090] to-[#016d7a] mb-3 flex items-center justify-center text-white font-bold text-xl"
                style={{ display: hasValidAvatar ? 'none' : 'flex' }}
              >
                {getUserInitial()}
              </div>
              {!isSidebarCollapsed && (
                <>
                  <h3 className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</h3>
                  <p className="text-xs text-gray-500">{getUserRole()}</p>
                </>
              )}
            </div>

            {/* Collapse Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-sm"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Separator Line */}
          <div className="px-6 mb-4">
            <div className="border-t border-gray-200"></div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? '' : 'hover:bg-gray-100'
                  } ${isSidebarCollapsed ? 'lg:justify-center' : ''}`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-[#028090]' : 'text-gray-700'
                  }`} />
                  {!isSidebarCollapsed && (
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-[#028090]' : 'text-gray-700'
                    }`}>{item.name}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-1">
            {bottomNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      setActivePage(item.id);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? 'bg-[#028090] bg-opacity-10' : 'hover:bg-gray-100'
                  } ${isSidebarCollapsed ? 'lg:justify-center' : ''}`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-[#028090]' : 'text-gray-700'
                  }`} />
                  {!isSidebarCollapsed && (
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-[#028090]' : 'text-gray-700'
                    }`}>{item.name}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <div className="w-10"></div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}