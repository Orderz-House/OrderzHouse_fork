import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  DollarSign,
  RefreshCw,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Download,
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  LayoutGrid,
  BarChart3,
  Settings,
  User,
  LogOut,
  Loader
} from "lucide-react";

import FreelancerProjects from "./FreelancerProjects";
import FreelancerTasks from "./FreelancerTasks";
import EditProfile from "../profile/EditProfile";
import ProfileView from "../profile/ProfileView";

const Dashboard = () => {
  const { userData, token } = useSelector((state) => state.auth);

  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    withdrawRequested: 0,
    pendingIncome: 0,
    availableInAccount: 0,
    completedProjects: 0,
    ongoingProjects: 0,
    cancelledProjects: 0,
    activeProjects: 0,
    quitProjects: 0,
    kickedProjects: 0,
    bannedProjects: 0
  });

  const [earningHistory, setEarningHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [error, setError] = useState(null);

  // =========================
  // Backend Fetch Functions
  // =========================
  const fetchEarningsSummary = async () => {
    if (!token || !userData?.id) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/earnings/freelancer/${userData.id}/summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const summary = res.data.summary;
        setDashboardData((prev) => ({
          ...prev,
          totalIncome: summary.totalIncome || 0,
          pendingIncome: summary.pendingIncome || 0,
          availableInAccount: summary.availableInAccount || 0,
          withdrawRequested: summary.withdrawRequested || 0
        }));
      }
    } catch (err) {
      console.error("Error fetching earnings summary:", err);
      setError("Failed to load earnings data");
    }
  };

  const fetchEarningsHistory = async () => {
    if (!token || !userData?.id) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/earnings/freelancer/${userData.id}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setEarningHistory(res.data.earningsHistory || []);
      }
    } catch (err) {
      console.error("Error fetching earnings history:", err);
    }
  };

  const fetchProjectCounts = async () => {
    if (!token || !userData?.id) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/projects/freelancer/${userData.id}/counts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const counts = res.data.counts;
        setDashboardData((prev) => ({
          ...prev,
          ongoingProjects: counts.active || 0,
          completedProjects: counts.completed || 0,
          cancelledProjects:
            (counts.kicked || 0) + (counts.banned || 0) + (counts.quit || 0),
          activeProjects: counts.active || 0,
          quitProjects: counts.quit || 0,
          kickedProjects: counts.kicked || 0,
          bannedProjects: counts.banned || 0
        }));
      }
    } catch (err) {
      console.error("Error fetching project counts:", err);
      setError("Failed to load project statistics");
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchEarningsSummary(),
        fetchEarningsHistory(),
        fetchProjectCounts()
      ]);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, userData?.id]);

  // =========================
  // Actions
  // =========================
  const handleRefresh = () => {
    setIsLoading(true);
    fetchDashboardData();
  };

  const handleWithdraw = () => {
    alert("Withdrawal system will be implemented in a future update");
  };

  // =========================
  // Section Navigation
  // =========================
  const renderActiveSection = () => {
    switch (activeSection) {
      case "projects":
        return <FreelancerProjects />;
      case "tasks":
        return <FreelancerTasks />;
      case "Settings":
        return <EditProfile />;
      case "profile":
        return <ProfileView />;
      case "dashboard":
      default:
        return renderDashboardView();
    }
  };

  // =========================
  // Dashboard View
  // =========================
  const renderDashboardView = () => (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Earnings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard
              title="Pending income"
              value={dashboardData.pendingIncome}
              icon={<Clock className="w-6 h-6 text-blue-600" />}
              subtitle="Funds held in escrow"
              action="Refresh"
              actionIcon={<RefreshCw className="w-4 h-4 ml-1" />}
              onAction={handleRefresh}
              loading={isLoading}
            />
            <StatCard
              title="Available in account"
              value={dashboardData.availableInAccount}
              icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
              subtitle="Wallet balance"
              action="Withdraw (Coming Soon)"
              actionIcon={<ArrowUpRight className="w-4 h-4 ml-1" />}
              onAction={handleWithdraw}
              loading={isLoading}
            />
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <CountCard
              title="Active projects"
              count={dashboardData.activeProjects}
              icon={<Clock className="w-6 h-6 text-green-600" />}
              action="View"
              onAction={() => setActiveSection("projects")}
              loading={isLoading}
            />
            <CountCard
              title="Completed projects"
              count={dashboardData.completedProjects}
              icon={<CheckCircle className="w-6 h-6 text-blue-600" />}
              action="View"
              onAction={() => setActiveSection("projects")}
              loading={isLoading}
            />
            <CountCard
              title="Quit projects"
              count={dashboardData.quitProjects}
              icon={<XCircle className="w-6 h-6 text-yellow-600" />}
              action="View"
              onAction={() => setActiveSection("projects")}
              loading={isLoading}
            />
            <CountCard
              title="Kicked projects"
              count={dashboardData.kickedProjects}
              icon={<XCircle className="w-6 h-6 text-orange-600" />}
              action="View"
              onAction={() => setActiveSection("projects")}
              loading={isLoading}
            />
            <CountCard
              title="Banned projects"
              count={dashboardData.bannedProjects}
              icon={<XCircle className="w-6 h-6 text-red-600" />}
              action="View"
              onAction={() => setActiveSection("projects")}
              loading={isLoading}
            />
          </div>

          {/* Earnings History Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Earning History
              </h2>
              <button
                onClick={() => alert("Export functionality coming soon")}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Download className="w-4 h-4 mr-1" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Project</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {earningHistory.length > 0 ? (
                    earningHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="py-3 text-sm">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-sm font-medium">
                          {item.project}
                        </td>
                        <td className="py-3 text-sm text-right">
                          ${item.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-8 text-center">
                        <div className="flex flex-col items-center text-gray-500">
                          <AlertCircle className="w-12 h-12 mb-2" />
                          <p>No earning history found</p>
                          <p className="text-sm mt-1">
                            Complete some projects to see your earnings here
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );

  // =========================
  // Reusable Cards
  // =========================
  const StatCard = ({ title, value, icon, subtitle, action, actionIcon, onAction, loading }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <Loader className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h3>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </>
          )}
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>
      </div>
      {action && (
        <button
          onClick={onAction}
          disabled={loading}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {action} {actionIcon}
        </button>
      )}
    </div>
  );

  const CountCard = ({ title, count, icon, action, onAction, loading }) => (
    <div
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md cursor-pointer"
      onClick={onAction}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <Loader className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{count}</h3>
          )}
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>
      </div>
      {action && (
        <button className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
          {action} <ArrowUpRight className="w-4 h-4 ml-1" />
        </button>
      )}
    </div>
  );

  // =========================
  // Render
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Freelancer Hub</h1>
          <p className="text-sm text-gray-600 mt-1">Professional Dashboard</p>
        </div>

        <div className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              activeSection === "dashboard"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button
            onClick={() => setActiveSection("projects")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              activeSection === "projects"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Briefcase className="w-5 h-5 mr-3" /> Projects
          </button>
          <button
            onClick={() => setActiveSection("tasks")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              activeSection === "tasks"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <LayoutGrid className="w-5 h-5 mr-3" /> Tasks
          </button>
          <button
            onClick={() => setActiveSection("profile")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              activeSection === "profile"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <User className="w-5 h-5 mr-3" /> Profile
          </button>
          <button
            onClick={() => setActiveSection("Settings")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium ${
              activeSection === "Settings"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-5 h-5 mr-3" /> Settings
          </button>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {activeSection}
          </h1>
          <p className="text-sm text-gray-600">
            {activeSection === "dashboard"
              ? `Welcome back, ${userData?.first_name || "Freelancer"}!`
              : `Manage your ${activeSection}`}
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">{renderActiveSection()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
