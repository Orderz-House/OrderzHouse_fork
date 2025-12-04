import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./index.css";
import "animate.css";
import "./components/loadingScreen/axiosLoading.js";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/navbar/Nav";
import EnhancedFooter from "./components/footer/Footer";
import PrivacyPolicyPage from "./components/policy/Policy";
import ModernAboutPage from "./components/about/About";
import OrderzHousePage from "./components/main/Main";
import ContactUsPage from "./components/contact/Contact";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { initSocket, disconnectSocket } from "./services/socketService";
import CourseDetail from "./components/coursesManagement/CourseDetail.jsx";
import NotificationsPage from "./components/notifications/NotificationsPage";
import AccountSuspended from "./components/AccountSuspended/AccountSuspended";
import Plans from "./components/plans/Plans.jsx";
import ProjectsPage from "./components/Catigories/ProjectsPage";
import AdminAppointments from "./components/Appointments/AdminAppointments";
import FreelancerAppointments from "./components/Appointments/FreelancerAppointments";
import AdminCourseAccessControl from "./components/coursesManagement/AdminAccessControl.jsx";
import AdminCourseManagement from "./components/coursesManagement/AdminCourseManagement";
import MyRestrictedCourses from "./components/coursesManagement/MyRestrictedCourses";
import AccessDenied from "./components/coursesManagement/AccessDenied";
import Terms from "./components/Terms/Terms.jsx";
import Blogs from "./components/blogs/Blogs.jsx";
import BlogPost from "./components/blogs/BlogPost.jsx";
import AdminRouter from "./adminDash/routes/index";
import ProjectDetails from "./components/Catigories/ProjectDetails.jsx";

import CreateProjectPage from "./components/CreateProjects/CreateProjectPage";
import CreateTaskPage from "./components/CreateProjects/CreateTaskPage";

import GlobalLoadingProvider from "./components/loadingScreen/GlobalLoadingProvider.jsx";
import ChatPage from "./components/Chat/ChatPage";

const RoleBasedAppointments = ({ userData }) => {
  if (userData?.role_id === 1) {
    return <AdminAppointments />;
  } else if (userData?.role_id === 3) {
    return <FreelancerAppointments />;
  } else {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
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

    return () => {
      console.log("Disconnecting socket in App useEffect cleanup...");
      disconnectSocket();
    };
  }, [token, userId]);

  return (
    <>
      <GlobalLoadingProvider>
        {!shouldHideNavbar && <Navbar />}

        <Routes
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          {/* --- Blogs --- */}
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogPost />} />

          {/* --- Account Suspended --- */}
          <Route path="/account/suspended" element={<AccountSuspended />} />

          {/* --- Public Pages --- */}
          <Route path="/" element={<OrderzHousePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/about" element={<ModernAboutPage />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/terms" element={<Terms />} />

          {/* --- Protected Pages --- */}

          <Route
            path="/create-project"
            element={
              <ProtectedRoute>
                <CreateProjectPage />
              </ProtectedRoute>
            }
          />

          {/* --- Tasks --- */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <ProjectsPage mode="tasks" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks/create"
            element={
              <ProtectedRoute>
                <CreateTaskPage /> {/* 👈 صفحة إنشاء التاسك */}
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks/:id"
            element={
              <ProtectedRoute>
                <ProjectDetails mode="tasks" />
              </ProtectedRoute>
            }
          />

          {/* --- Course Management --- */}
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute>
                <MyRestrictedCourses />
              </ProtectedRoute>
            }
          />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <AdminCourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/course-access"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <AdminCourseAccessControl />
              </ProtectedRoute>
            }
          />

          {/* --- Notifications & Projects --- */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projectsPage"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />

          {/* --- Appointments --- */}
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <RoleBasedAppointments userData={userData} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute>
                <AdminAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <FreelancerAppointments />
              </ProtectedRoute>
            }
          />

          {/* --- Chat --- */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:chatType/:chatId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* --- Admin / Client / Freelancer --- */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <AdminRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/*"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <AdminRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/*"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <AdminRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            }
          />

          {/* --- 404 Fallback --- */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  404 - Page Not Found
                </h2>
                <p className="text-gray-600 mb-4">
                  The page you are looking for does not exist.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            }
          />
        </Routes>

        {!shouldHideNavbar && <EnhancedFooter />}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          draggable
          pauseOnHover
        />
        <Toaster position="bottom-right" />
      </GlobalLoadingProvider>
    </>
  );
}

export default App;
