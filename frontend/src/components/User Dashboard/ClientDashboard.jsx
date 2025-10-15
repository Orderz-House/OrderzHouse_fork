import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setLogout } from '../../slice/auth/authSlice';
import Sidebar from '../Sidebar/Sidebar.jsx';
import ProjectsTable from './projects';
import FinancialTable from './payments';
import TaskRequestsTable from './tasks';
import NotificationsComponent from './notifications';
import EditProfile from './editProfile';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('projects');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(setLogout());
    window.location.href = '/login';
  };

  const navigation = [
    { name: 'My Projects', id: 'projects' },
    { name: 'Requested Tasks', id: 'tasks' },
    { name: 'Payment History', id: 'payments' },
  ];

  const bottomNavigation = [
    { name: 'Notifications', id: 'notifications' },
    { name: 'Profile', id: 'profile' },
    { name: 'Log Out', id: 'logout' },
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navigation={navigation}
        bottomNavigation={bottomNavigation}
        onLogout={handleLogout}
      />

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