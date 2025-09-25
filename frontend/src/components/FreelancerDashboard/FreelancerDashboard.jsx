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
  Filter,
  Search,
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  LayoutGrid,
  BarChart3,
  Settings,
  User,
  LogOut,
  Bell,
  Loader
} from "lucide-react";

// Import the components that will be rendered based on selection
import FreelancerProjects from "./FreelancerProjects";
import FreelancerTasks from "./FreelancerTasks";
import EditProfile from "../profile/EditProfile";
import FreelancerPage from "../freelanceDetails/FreeLanceDetail";
import ProfileView from "../profile/ProfileView";

const Dashboard = () => {
  const { userData, token } = useSelector((state) => state.auth);
  
  // State for dashboard data
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
  
  // Fetch earnings summary
  const fetchEarningsSummary = async () => {
    if (!token || !userData?.id) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/earnings/freelancer/${userData.id}/summary`, {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });
      
      if (response.data.success) {
        const summary = response.data.summary;
        setDashboardData(prev => ({
          ...prev,
          totalIncome: summary.totalIncome || 0,
          pendingIncome: summary.pendingIncome || 0,
          availableInAccount: summary.availableInAccount || 0,
          withdrawRequested: summary.withdrawRequested || 0
        }));
      }
    } catch (error) {
      console.error("Error fetching earnings summary:", error);
      setError("Failed to load earnings data");
    }
  };

  // Fetch earnings history
  const fetchEarningsHistory = async () => {
    if (!token || !userData?.id) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/earnings/freelancer/${userData.id}/history`, {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });
      
      if (response.data.success) {
        setEarningHistory(response.data.earningsHistory || []);
      }
    } catch (error) {
      console.error("Error fetching earnings history:", error);
      // Don't set error here as it's secondary data
    }
  };
  
  // Fetch project counts based on status
  const fetchProjectCounts = async () => {
    if (!token || !userData?.id) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/projects/freelancer/${userData.id}/counts`, {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });
      
      if (response.data.success) {
        const counts = response.data.counts;
        setDashboardData(prev => ({
          ...prev,
          ongoingProjects: counts.active || 0,
          completedProjects: counts.completed || 0,
          cancelledProjects: (counts.kicked || 0) + (counts.banned || 0) + (counts.quit || 0),
          activeProjects: counts.active || 0,
          quitProjects: counts.quit || 0,
          kickedProjects: counts.kicked || 0,
          bannedProjects: counts.banned || 0
        }));
      }
    } catch (error) {
      console.error("Error fetching project counts:", error);
      setError("Failed to load project statistics");
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      await Promise.all([
        fetchEarningsSummary(),
        fetchEarningsHistory(),
        fetchProjectCounts()
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle refresh action
  const handleRefresh = () => {
    setIsLoading(true);
    fetchDashboardData();
  };
  
  // Handle withdraw action (placeholder since no withdrawal system exists)
  const handleWithdraw = () => {
    alert("Withdrawal system will be implemented in a future update");
  };
  
  // Navigation functions
  const navigateToProjects = () => {
    setActiveSection("projects");
  };
  
  const navigateToTasks = () => {
    setActiveSection("tasks");
  };
  
  const navigateToDashboard = () => {
    setActiveSection("dashboard");
  };

  const navigateToProfileSetting = () => {
    setActiveSection("Settings");
  }

  const navigateToProfile = () => {
    setActiveSection("profile");
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [token, userData?.id]);

  // Stats cards component
  const StatCard = ({ title, value, icon, subtitle, action, actionIcon, onAction, loading }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="h-8 flex items-center">
              <Loader className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ${typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2 }) : value}
              </h3>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </>
          )}
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
      </div>
      {action && (
        <button 
          onClick={onAction}
          disabled={loading}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors duration-200"
        >
          {action} {actionIcon}
        </button>
      )}
    </div>
  );
  
  // Count card component
  const CountCard = ({ title, count, icon, action, onAction, clickable = true, loading }) => (
    <div 
      className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${clickable ? 'cursor-pointer hover:border-blue-300' : ''} ${loading ? 'opacity-70' : ''}`}
      onClick={clickable && !loading ? onAction : undefined}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="h-8 flex items-center">
              <Loader className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{count}</h3>
          )}
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
      </div>
      {action && (
        <button 
          onClick={onAction}
          disabled={loading}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors duration-200"
        >
          {action} <ArrowUpRight className="w-4 h-4 ml-1" />
        </button>
      )}
    </div>
  );

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-32">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-32">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render the appropriate section based on activeSection state
  const renderActiveSection = () => {
    switch(activeSection) {
      case "projects":
        return <FreelancerProjects />;
      case "tasks":
        return <FreelancerTasks />;
      case "Settings": 
        return <EditProfile/>;
      case "profile":
        return <ProfileView/>;
      case "dashboard":
      default:
        return (
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
              <SkeletonLoader />
            ) : (
              <>
                {/* Stats Grid - Only showing 2 cards now */}
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
                
                {/* Detailed Project Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <CountCard
                    title="Active projects"
                    count={dashboardData.activeProjects}
                    icon={<Clock className="w-6 h-6 text-green-600" />}
                    action="View"
                    onAction={navigateToProjects}
                    loading={isLoading}
                  />
                  
                  <CountCard
                    title="Completed projects"
                    count={dashboardData.completedProjects}
                    icon={<CheckCircle className="w-6 h-6 text-blue-600" />}
                    action="View"
                    onAction={navigateToProjects}
                    loading={isLoading}
                  />
                  
                  <CountCard
                    title="Quit projects"
                    count={dashboardData.quitProjects}
                    icon={<XCircle className="w-6 h-6 text-yellow-600" />}
                    action="View"
                    onAction={navigateToProjects}
                    loading={isLoading}
                  />
                  
                  <CountCard
                    title="Kicked projects"
                    count={dashboardData.kickedProjects}
                    icon={<XCircle className="w-6 h-6 text-orange-600" />}
                    action="View"
                    onAction={navigateToProjects}
                    loading={isLoading}
                  />
                  
                  <CountCard
                    title="Banned projects"
                    count={dashboardData.bannedProjects}
                    icon={<XCircle className="w-6 h-6 text-red-600" />}
                    action="View"
                    onAction={navigateToProjects}
                    loading={isLoading}
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Earning History */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Earning History</h2>
                        <button 
                          onClick={() => alert("Export functionality coming soon")}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
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
                                <tr key={item.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                                  <td className="py-3 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                                  <td className="py-3 text-sm font-medium">{item.project}</td>
                                  <td className="py-3 text-sm text-right">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="3" className="py-8 text-center">
                                  <div className="flex flex-col items-center text-gray-500">
                                    <AlertCircle className="w-12 h-12 mb-2" />
                                    <p>No earning history found</p>
                                    <p className="text-sm mt-1">Complete some projects to see your earnings here</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Info Message about missing features */}
                <div className="mt-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800 mb-1">Payment System Status</h3>
                        <p className="text-sm text-blue-700">
                          The withdrawal system and payout methods are not yet implemented. 
                          Currently showing earnings from the escrow and payments system.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Freelancer Hub</h1>
          <p className="text-sm text-gray-600 mt-1">Professional Dashboard</p>
        </div>
        
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            <button
              onClick={navigateToDashboard}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeSection === "dashboard" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Dashboard
            </button>
            
            <button
              onClick={navigateToProjects}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeSection === "projects" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Briefcase className="w-5 h-5 mr-3" />
              Projects
            </button>
            
            <button
              onClick={navigateToTasks}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeSection === "tasks" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <LayoutGrid className="w-5 h-5 mr-3" />
              Tasks
            </button>
            

            
            <button 
              onClick={navigateToProfile}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeSection === "profile" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <User className="w-5 h-5 mr-3" />
              Profile
            </button>
            
            <button 
              onClick={navigateToProfileSetting}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeSection === "Settings" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeSection === "dashboard" ? "Dashboard" : activeSection}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {activeSection === "dashboard" 
                    ? `Welcome back, ${userData?.first_name || 'Freelancer'}!` 
                    : `View and manage your ${activeSection}`
                  }
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {activeSection === "dashboard" && (
                  <button 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;