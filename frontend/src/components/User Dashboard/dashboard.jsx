import React, { useState } from 'react';
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
import ProjectsTable from './projects';
import FinancialTable from './payments'

export default function Dashboard() {
  const [activePage, setActivePage] = useState('projects');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navigation = [
    { name: 'My Projects', icon: FolderKanban, id: 'projects' },
    { name: 'Requested Tasks', icon: CheckSquare, id: 'tasks' },
    { name: 'Payment History', icon: CreditCard, id: 'payments' },
  ];

  const bottomNavigation = [
    { name: 'Notifications', icon: Bell, id: 'notifications' },
    { name: 'Profile', icon: User, id: 'profile' },
    { name: 'Log Out', icon: LogOut, id: 'logout' },
  ];

  const renderContent = () => {
    if (activePage === 'projects') {
      return <ProjectsTable />;
    }
    if (activePage === 'payments') {
      return <FinancialTable />;
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-3 flex items-center justify-center text-white font-bold text-xl">
                U
              </div>
              {!isSidebarCollapsed && (
                <>
                  <h3 className="text-sm font-semibold text-gray-900">User Dashboard</h3>
                  <p className="text-xs text-gray-500">Freelancer</p>
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
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    activePage === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${isSidebarCollapsed ? 'lg:justify-center' : ''}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-1">
            {bottomNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    activePage === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${isSidebarCollapsed ? 'lg:justify-center' : ''}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
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