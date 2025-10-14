import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./index.css";
import "animate.css";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import ProjectDetails from "./components/projects/ProjectDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import { initSocket, disconnectSocket } from "./services/socketService";
import TopRatedFreelancers from "./components/topRated/TopRate";
import FreelancerDashboard from "./components/FreelancerDashboard/FreelancerDashboard.jsx";
import FreelancerTasks from "./components/tasks/FreelancerTasks.jsx";
import { AllFreeLance } from "./components/allFreelance/AllFreeLance";
import FreeLanceDetail from "./components/freelanceDetails/FreeLanceDetail";
import ManageProject from "./components/manageProject/ManageProject";
import ProjectsDashboard from "./components/projects/ProjectsDashboard";
import CourseDetail from "./components/coursesManagement/CourseDetail.jsx";
import AdminVerificationPage from "./components/verifiyForAdmin/VerifiedFreeLance"; 
import ProjectsAvalible from "./components/projects/ProjectsAvalible";
import NotificationsPage from "./components/profile/NotificationsPage";
import FreelancerManageProject from "./components/freelancerDashboard/FreelancerManageProject";
import AccountSuspended from "./components/AccountSuspended/AccountSuspended";
import ProfileView from "./components/profile/ProfileView";
import Plans from "./components/plans/plans";
import Dashboard from "./components/User Dashboard/dashboard";
import ProjectsPage from "./components/Catigories/ProjectsPage";
import AdminAppointments from "./components/Appointments/AdminAppointments";
import FreelancerAppointments from "./components/Appointments/FreelancerAppointments";
import CreateProject from "./components/createProject/CreateProject";
import AdminCourseAccessControl from "./components/coursesManagement/AdminAccessControl.jsx";
import AdminCourseManagement from "./components/coursesManagement/AdminCourseManagement";
import MyRestrictedCourses from "./components/coursesManagement/MyRestrictedCourses";
import AccessDenied from "./components/coursesManagement/AccessDenied";
import Terms from "./components/Terms/Terms.jsx";
import Blogs from "./components/blogs/Blogs.jsx"
import BlogPost from "./components/blogs/BlogPost.jsx"
import AdminRouter from "./adminDash/routes/index";
import TasksPool from "./components/tasks/TasksPool";
import FreelancerTasks from "./components/tasks/FreelancerTasks";
import AdminTaskApproval from "./components/tasks/AdminTaskApproval";

const RoleBasedAppointments = ({ userData }) => {
  if (userData?.role_id === 1) {
    return <AdminAppointments />;
  } else if (userData?.role_id === 3) {
    return <FreelancerAppointments />;
  } else {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Appointments are only available for admins and freelancers.
          </p>
        </div>
      </div>
    );
  }
};

function App() {
  const location = useLocation();
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);
  const userData = useSelector((state) => state.auth.userData);

  const hideNavbarRoutes = ["/account/suspended"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    if (token && userId) { 
      console.log("🔌 Initializing socket in App useEffect...");
      initSocket(token, userId);
    }

    // Cleanup function
    return () => {
      console.log("Disconnecting socket in App useEffect cleanup...");
      disconnectSocket();
    };
  }, [token, userId]); 

  // Role-based appointments component
  const RoleBasedAppointments = () => {
    if (userData?.role_id === 1) return <AdminAppointments />;
    if (userData?.role_id === 3) return <FreelancerAppointments />;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Appointments are only available for admins and freelancers.</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {/* --- Blogs --- */}
        <Route path="/blogs" element={<Blogs />} />

        {/* --- Account Suspended --- */}
        <Route path="/account/suspended" element={<AccountSuspended />} />

        {/* --- Public Pages --- */}
        <Route path="/test" element={<Counter />} />
        <Route path="/" element={<OrderzHousePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/about" element={<ModernAboutPage />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-verification" element={<AdminVerificationPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfileView/></ProtectedRoute>}/>Terms
        <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
        <Route path="/verify-profile" element={<VerifyProfile />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/blogs" element={<Blogs/>}/>
        <Route path="/blogs/:id" element={<BlogPost />} />

        {/* --- Protected Pages --- */}
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/freelancer/dashboard" element={<ProtectedRoute><FreelancerDashboard /></ProtectedRoute>} />
        <Route path="/manage-project/:projectId" element={<ProtectedRoute><ManageProject /></ProtectedRoute>} />
        <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        <Route path="/rate" element={<ProtectedRoute><TopRatedFreelancers /></ProtectedRoute>} />
        <Route path="/dashboard/projects" element={<ProtectedRoute><ProjectsDashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><ProjectsAvalible /></ProtectedRoute>} />
        <Route path="/freelancer/profile/:id" element={<ProtectedRoute><FreeLanceDetail /></ProtectedRoute>} />
        <Route path="/freelancer/tasks" element={<ProtectedRoute><FreelancerTasks /></ProtectedRoute>} />

        {/* --- Course Management Routes --- */}
        <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/my-courses" element={<ProtectedRoute><MyRestrictedCourses /></ProtectedRoute>} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={[1]}><AdminCourseManagement /></ProtectedRoute>} />
        <Route path="/admin/course-access" element={<ProtectedRoute allowedRoles={[1]}><AdminCourseAccessControl /></ProtectedRoute>} />


        {/* Course Management */}
        <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/my-courses" element={<ProtectedRoute><MyRestrictedCourses /></ProtectedRoute>} />

        {/* Notifications and Projects */}
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/freelancer/project/:projectId" element={<ProtectedRoute><FreelancerManageProject /></ProtectedRoute>} />
        <Route path="/client/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/projectsPage" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />

        {/* --- Appointments --- */}
        <Route path="/appointments" element={<ProtectedRoute><RoleBasedAppointments userData={userData} /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute><AdminAppointments /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute><FreelancerAppointments /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <AdminRouter />
            </ProtectedRoute>
          }
        />


        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">404 - Page Not Found</h2>
            <p className="text-gray-600 mb-4">The page you are looking for does not exist.</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        } />

      </Routes>

      {!shouldHideNavbar && <EnhancedFooter />}
      <ToastContainer position="top-right" autoClose={5000} draggable pauseOnHover />
    </>
  );
}

export default App;
