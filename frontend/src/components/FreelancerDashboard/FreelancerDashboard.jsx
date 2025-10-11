import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  LayoutGrid,
  BarChart3,
  Settings,
  User,
  LogOut,
  Loader,
  CreditCard,
  Calendar,
  BookOpen
} from "lucide-react";

import {
  FiHome,
  FiUser,
  FiUsers,
  FiBookOpen,
  FiTag,
  FiCalendar,
  FiShield,
  FiBriefcase,
  FiFileText,
  FiCreditCard,
  FiLayers,
  FiBarChart2,
} from "react-icons/fi";

import FreelancerProjects from "./FreelancerProjects";
import FreelancerTasks from "./FreelancerTasks";
import EditProfile from "../profile/EditProfile";
import ProfileView from "../profile/ProfileView";
import Payments from "./Payments";
import MyCourses from "../coursesManagement/MyRestrictedCourses.jsx";
import Appointments from "../Appointments/FreelancerAppointments";

import Sidebar from "../../adminDash/layout/Sidebar.jsx";

const freelancerSide = [
  {
    title: "GENERAL",
    items: [{ to: "/admin", label: "Overview", icon: FiHome, exact: true }],
  },
  {
    title: "USERS",
    items: [
      { to: "/admin/people/clients", label: "Clients", icon: FiUser },
      { to: "/admin/people/freelancers", label: "Freelancers", icon: FiUsers },
    ],
  },
  {
    title: "LEARNING",
    items: [
      { to: "/admin/learning/courses", label: "Courses", icon: FiBookOpen },
      { to: "/admin/learning/categories", label: "Categories", icon: FiTag },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        to: "/admin/operation/appointments",
        label: "Appointments",
        icon: FiCalendar,
      },
      {
        to: "/admin/operation/verifications",
        label: "Verifications",
        icon: FiShield,
      },
      { to: "/admin/operation/projects", label: "Projects", icon: FiBriefcase },
    ],
  },
  {
    title: "COMMUNITY",
    items: [{ to: "/admin/news", label: "News", icon: FiFileText }],
  },
  {
    title: "FINANCE",
    items: [
      { to: "/admin/finance/payments", label: "Payments", icon: FiCreditCard },
      { to: "/admin/finance/plans", label: "Plans", icon: FiLayers },
    ],
  },
  {
    title: "INSIGHTS",
    items: [{ to: "/admin/analytics", label: "Analytics", icon: FiBarChart2 }],
  },
];

const Dashboard = () => {
  const { userData, token } = useSelector((state) => state.auth);

  const [dashboardData, setDashboardData] = useState({
    completedProjects: 0,
    ongoingProjects: 0,
    activeProjects: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [error, setError] = useState(null);

  const fetchProjectCounts = async () => {
    if (!token) {
      setError("Authentication token missing");
      setIsLoading(false);
      return;
    }

    if (!userData?.id) {
      setError("User data not available");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/projects/freelancer/${userData.id}/counts`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      if (res.data && res.data.success) {
        const counts = res.data.counts || {};
        setDashboardData({
          ongoingProjects: counts.active || 0,
          completedProjects: counts.completed || 0,
          activeProjects: counts.active || 0
        });
        setError(null);
      } else {
        setError("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error fetching project counts:", err);
      let errorMessage = "Failed to load project statistics";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout - Server is not responding";
      } else if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
      } else if (err.request) {
        errorMessage = "Network error - Cannot connect to server. Make sure backend is running on port 5000.";
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchProjectCounts();
    } catch (err) {
      console.error("Error in fetchDashboardData:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && userData?.id) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
      setError("Please log in to access dashboard");
    }
  }, [token, userData?.id]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const CountCard = ({ title, count, icon, action, onAction, loading, isActionCard = false }) => (
    <div
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
      onClick={onAction}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <Loader className="h-5 w-5 animate-spin text-gray-400 mt-1" />
          ) : (
            !isActionCard && <h3 className="text-2xl font-bold text-gray-900 mt-1">{count}</h3>
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

  const renderActiveSection = () => {
    switch (activeSection) {
      case "projects":
        return <FreelancerProjects />;
      case "appointments":
        return <Appointments />;
      case "myCourses":
        return <MyCourses />;
      case "tasks":
        return <FreelancerTasks />;
      case "payments":
        return <Payments />;
      case "settings":
        return <EditProfile />;
      case "profile":
        return <ProfileView />;
      case "dashboard":
      default:
        return renderDashboardView();
    }
  };

  const renderDashboardView = () => (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <div className="flex-1">
            <p className="text-red-700">{error}</p>
            {error.includes("Cannot connect to server") && (
              <p className="text-sm text-red-600 mt-1">
                Make sure your backend server is running on http://localhost:5000
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="ml-4 text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
          >
            {isLoading ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Welcome Message */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Welcome back, {userData?.first_name || userData?.name || "Freelancer"}!
            </h2>
            <p className="text-gray-600">
              Here's an overview of your projects and activities.
            </p>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CountCard
              title="Active projects"
              count={dashboardData.activeProjects}
              icon={<Clock className="w-6 h-6 text-green-600" />}
              action="View Projects"
              onAction={() => setActiveSection("projects")}
              loading={isLoading}
            />
            <CountCard
              title="Completed projects"
              count={dashboardData.completedProjects}
              icon={<CheckCircle className="w-6 h-6 text-blue-600" />}
              action="View Projects"
              onAction={() => setActiveSection("projects")}
              loading={isLoading}
            />
            <CountCard
              title="Manage Payments"
              count=""
              icon={<CreditCard className="w-6 h-6 text-purple-600" />}
              action="View Payments"
              onAction={() => setActiveSection("payments")}
              loading={isLoading}
              isActionCard={true}
            />
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
            <Sidebar sections={freelancerSide} />
      

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {activeSection === "myCourses" ? "My Courses" : activeSection}
          </h1>
          <p className="text-sm text-gray-600">
            {activeSection === "dashboard"
              ? `Welcome back, ${userData?.first_name || userData?.name || "Freelancer"}!`
              : `Manage your ${activeSection === "myCourses" ? "courses" : activeSection}`}
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">{renderActiveSection()}</div>
      </div>
    </div>
  );
};

export default Dashboard;