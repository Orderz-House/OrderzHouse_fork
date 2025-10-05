import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  DollarSign, RefreshCw, TrendingUp, CheckCircle, Clock, XCircle,
  Download, AlertCircle, ArrowUpRight, Briefcase, LayoutGrid,
  BarChart3, Settings, User, LogOut, Loader
} from "lucide-react";

// Import child components for different sections
import FreelancerProjects from "./FreelancerProjects";
import FreelancerTasks from "./FreelancerTasks";
import EditProfile from "../profile/EditProfile";
import ProfileView from "../profile/ProfileView";

// =========================
// Reusable UI Components
// =========================

const StatCard = ({ title, value, icon, subtitle, action, onAction, loading }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {loading ? (
          <div className="h-8 w-32 mt-1 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            ${(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h3>
        )}
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 bg-blue-100 rounded-lg">{icon}</div>
    </div>
    {action && (
      <button
        onClick={onAction}
        disabled={loading}
        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
      >
        {action} <ArrowUpRight className="w-4 h-4 ml-1" />
      </button>
    )}
  </div>
);

const CountCard = ({ title, count, icon, onAction, loading }) => (
  <div
    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
    onClick={onAction}
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {loading ? (
          <div className="h-8 w-16 mt-1 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{count}</h3>
        )}
      </div>
      <div className="p-3 bg-blue-100 rounded-lg">{icon}</div>
    </div>
    <span className="flex items-center text-sm font-medium text-blue-600">
      View <ArrowUpRight className="w-4 h-4 ml-1" />
    </span>
  </div>
);

const Sidebar = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 /> },
    { id: "projects", label: "Projects", icon: <Briefcase /> },
    { id: "tasks", label: "Tasks", icon: <LayoutGrid /> },
    { id: "profile", label: "Profile", icon: <User /> },
    { id: "settings", label: "Settings", icon: <Settings /> },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-col h-screen sticky top-0 hidden lg:flex">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Freelancer Hub</h1>
      </div>
      <div className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.id
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="w-5 h-5 mr-3">{item.icon}</div> {item.label}
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
          <LogOut className="w-5 h-5 mr-3" /> Logout
        </button>
      </div>
    </div>
  );
};

const Header = ({ activeSection, username }) => (
  <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
    <h1 className="text-2xl font-bold text-gray-900 capitalize">
      {activeSection}
    </h1>
    <p className="text-sm text-gray-600">
      {activeSection === "dashboard"
        ? `Welcome back, ${username}!`
        : `Manage your ${activeSection}`}
    </p>
  </div>
);

// =========================
// Main Dashboard Component
// =========================
const Dashboard = () => {
  const { userData, token } = useSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState("dashboard");

  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0, withdrawRequested: 0, pendingIncome: 0, availableInAccount: 0,
    activeProjects: 0, completedProjects: 0, quitProjects: 0, kickedProjects: 0, bannedProjects: 0,
  });
  const [earningHistory, setEarningHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    if (!token || !userData?.id) return;
    setIsLoading(true);
    setError(null);

    try {
      const [earningsSummaryRes, earningsHistoryRes, projectCountsRes] = await Promise.all([
        axios.get(`http://localhost:5000/earnings/freelancer/${userData.id}/summary`, { headers: { Authorization: `Bearer ${token}` } } ),
        axios.get(`http://localhost:5000/earnings/freelancer/${userData.id}/history`, { headers: { Authorization: `Bearer ${token}` } } ),
        axios.get(`http://localhost:5000/projects/freelancer/${userData.id}/counts`, { headers: { Authorization: `Bearer ${token}` } } ),
      ]);

      const summary = earningsSummaryRes.data.summary || {};
      const counts = projectCountsRes.data.counts || {};

      setDashboardData({
        totalIncome: summary.totalIncome || 0,
        pendingIncome: summary.pendingIncome || 0,
        availableInAccount: summary.availableInAccount || 0,
        withdrawRequested: summary.withdrawRequested || 0,
        activeProjects: counts.active || 0,
        completedProjects: counts.completed || 0,
        quitProjects: counts.quit || 0,
        kickedProjects: counts.kicked || 0,
        bannedProjects: counts.banned || 0,
      });
      setEarningHistory(earningsHistoryRes.data.earningsHistory || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("An error occurred while loading your dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token, userData?.id]);

  useEffect(() => {
    if (activeSection === "dashboard") {
      loadDashboardData();
    }
  }, [activeSection, loadDashboardData]);

  const renderDashboardView = () => (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <button onClick={loadDashboardData} className="flex items-center text-sm text-red-600 hover:text-red-800 font-semibold">
            <RefreshCw className="w-4 h-4 mr-1" /> Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard title="Pending income" value={dashboardData.pendingIncome} icon={<Clock className="w-6 h-6 text-blue-600" />} subtitle="Funds held in escrow" loading={isLoading} />
        <StatCard title="Available in account" value={dashboardData.availableInAccount} icon={<TrendingUp className="w-6 h-6 text-green-600" />} subtitle="Wallet balance" action="Withdraw" onAction={() => alert("Coming soon!")} loading={isLoading} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <CountCard title="Active" count={dashboardData.activeProjects} icon={<Clock className="w-6 h-6 text-green-600" />} onAction={() => setActiveSection("projects")} loading={isLoading} />
        <CountCard title="Completed" count={dashboardData.completedProjects} icon={<CheckCircle className="w-6 h-6 text-blue-600" />} onAction={() => setActiveSection("projects")} loading={isLoading} />
        <CountCard title="Quit" count={dashboardData.quitProjects} icon={<XCircle className="w-6 h-6 text-yellow-600" />} onAction={() => setActiveSection("projects")} loading={isLoading} />
        <CountCard title="Kicked" count={dashboardData.kickedProjects} icon={<XCircle className="w-6 h-6 text-orange-600" />} onAction={() => setActiveSection("projects")} loading={isLoading} />
        <CountCard title="Banned" count={dashboardData.bannedProjects} icon={<XCircle className="w-6 h-6 text-red-600" />} onAction={() => setActiveSection("projects")} loading={isLoading} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Earning History</h2>
          <button onClick={() => alert("Export coming soon")} className="flex items-center text-sm text-blue-600 hover:text-blue-800"><Download className="w-4 h-4 mr-1" /> Export</button>
        </div>
        {isLoading ? (
          <div className="space-y-2"><div className="h-8 bg-gray-200 rounded animate-pulse"></div><div className="h-8 bg-gray-200 rounded animate-pulse"></div><div className="h-8 bg-gray-200 rounded animate-pulse"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-left text-sm text-gray-500 border-b border-gray-200"><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Project</th><th className="pb-3 font-medium text-right">Amount</th></tr></thead>
              <tbody>
                {earningHistory.length > 0 ? earningHistory.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"><td className="py-3 text-sm">{new Date(item.date).toLocaleDateString()}</td><td className="py-3 text-sm font-medium">{item.project}</td><td className="py-3 text-sm text-right font-semibold">${(item.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr>
                )) : (
                  <tr><td colSpan="3" className="py-8 text-center"><div className="flex flex-col items-center text-gray-500"><AlertCircle className="w-12 h-12 mb-2" /><p>No earning history found</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "projects": return <FreelancerProjects />;
      case "tasks": return <FreelancerTasks />;
      case "settings": return <EditProfile />;
      case "profile": return <ProfileView />;
      case "dashboard": default: return renderDashboardView();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 overflow-auto">
        <Header activeSection={activeSection} username={userData?.first_name || "Freelancer"} />
        <div className="max-w-7xl mx-auto px-6 py-8">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
