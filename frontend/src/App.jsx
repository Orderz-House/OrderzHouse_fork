import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./index.css";
import "animate.css";
import Counter from "./counter/Counter";
import Navbar from "./components/navbar/Nav";
import EnhancedFooter from "./components/footer/Footer";
import PrivacyPolicyPage from "./components/policy/Policy";
import ModernAboutPage from "./components/about/About";
import OrderzHousePage from "./components/main/Main";
import ContactUsPage from "./components/contact/Contact";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import EditProfile from "./components/profile/EditProfile";
import VerifyProfile from "./components/profile/VerifyProfile";
import CreateProject from "./components/createProject/CreateProject";
import ProjectDetails from "./components/projects/ProjectDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { initSocket, disconnectSocket } from "./services/socketService";
import TopRatedFreelancers from "./components/topRated/TopRate";
import FreelancerDashboard from "./components/freelancerDashboard/FreelancerDashboard";
import { AllFreeLance } from "./components/allFreelance/AllFreeLance";
import FreeLanceDetail from "./components/freelanceDetails/FreeLanceDetail";
import ManageProject from "./components/manageProject/ManageProject";
import ProjectsDashboard from "./components/projects/ProjectsDashboard";
import CourseDetail from "./components/courseDetilas/CourseDetails";
import CoursesManagement from "./components/coursesManagement/CoursesManagement";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminVerificationPage from "./components/verifiyForAdmin/VerifiedFreeLance";
import ProjectsAvalible from "./components/projects/ProjectsAvalible";
import NotificationsPage from "./components/profile/NotificationsPage";
import NewsListPage from "./components/news/NewsPage";
import NewsDetailPage from "./components/news/NewDetail";
import AdminPendingNewsPage from "./components/news/AdminPendingNewsPage";
import FreelancerManageProject from "./components/freelancerDashboard/FreelancerManageProject";
import AccountSuspended from "./components/AccountSuspended/AccountSuspended";
import ProfileView from "./components/profile/ProfileView";
import Plans from "./components/plans/plans"; 
import Dashboard from "./components/User Dashboard/dashboard";
import ProjectsPage from "./components/Catigories/ProjectsPage";
import AdminAppointments from './components/Appointments/AdminAppointments';
import FreelancerAppointments from './components/Appointments/FreelancerAppointments';

import AdminLayout from "./test admin/layout/AdminLayout.jsx";
import CreateProject from "./components/createProject/CreateProject";

function App() {
  const location = useLocation();
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);
  const userData = useSelector((state) => state.auth.userData);
  const hideNavbarRoutes = ["/account/suspended"];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    initSocket(token, userId);
    return () => {
      disconnectSocket();
    };
  }, [token, userId]);

  // Role-based appointments component
  const RoleBasedAppointments = () => {
    if (userData?.role_id === 1) { // Admin
      return <AdminAppointments />;
    } else if (userData?.role_id === 3) { // Freelancer
      return <FreelancerAppointments />;
    } else {
      return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Appointments are only available for admins and freelancers.</p>
        </div>
      </div>;
    }
  };

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        {/* News Pages */}
        <Route path="/news" element={<NewsListPage />} />
        <Route path="/news/admin" element={<AdminPendingNewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />

        {/* Account Suspended */}
        <Route path="account/suspended" element={<AccountSuspended />} />

        {/* Test */}
        <Route path="/test" element={<Counter />} />

        {/* Public Pages */}
        <Route path="/" element={<OrderzHousePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/about" element={<ModernAboutPage />} />
        <Route path="/plans" element={<Plans />} /> 
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-verification" element={<AdminVerificationPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfileView/></ProtectedRoute>}/>
        <Route path="/verify-profile" element={<VerifyProfile />} />

        {/* Protected Pages */}
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/freelancer/dashboard" element={<ProtectedRoute><FreelancerDashboard /></ProtectedRoute>} />
        <Route path="/manage-project/:projectId" element={<ProtectedRoute><ManageProject /></ProtectedRoute>} />
        <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        <Route path="/rate" element={<ProtectedRoute><TopRatedFreelancers /></ProtectedRoute>} />
        <Route path="/dashboard/projects" element={<ProtectedRoute><ProjectsDashboard /></ProtectedRoute>} />
        <Route path="/projects/" element={<ProtectedRoute><ProjectsAvalible /></ProtectedRoute>} />
        <Route path="/freelancers" element={<ProtectedRoute><AllFreeLance /></ProtectedRoute>} />
        <Route path="/freelancer/profile/:id" element={<ProtectedRoute><FreeLanceDetail /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><CoursesManagement /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/freelancer/project/:projectId" element={<ProtectedRoute><FreelancerManageProject /></ProtectedRoute>} />
        <Route path="/client/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projectsPage" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        
        {/* Appointments Routes */}
        <Route path="/appointments" element={<ProtectedRoute><RoleBasedAppointments /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute><AdminAppointments /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute><FreelancerAppointments /></ProtectedRoute>} />
        
        <Route path="/AdminLayout" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
        {/* <Route path="/AdminLayout" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} /> */}

      </Routes>
      {!shouldHideNavbar && <EnhancedFooter />}
      
      <ToastContainer position="top-right" autoClose={5000} draggable pauseOnHover />
    </>
  );
}

export default App;