import { Routes, Route } from "react-router-dom";
import "./App.css";
import Counter from "./counter/Counter";
import Navbar from "./components/navbar/Nav";
import EnhancedFooter from "./components/footer/Footer";
import PrivacyPolicyPage from "./components/policy/Policy";
import ModernAboutPage from "./components/about/About";
import OrderzHousePage from "./components/main/Main";
import Ask from "./components/ask/Ask";
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
import Dashboard from "./components/dashboard/Dashboard";
import { AllFreeLance } from "./components/allFreelance/AllFreeLance";
import FreeLanceDetail from "./components/freelanceDetails/FreeLanceDetail";
import ManageProject from "./components/manageProject/ManageProject";
import ProjectsDashboard from "./components/projects/ProjectsDashboard";
import CourseDetail from "./components/courseDetilas/CourseDetails";
import CoursesManagement from "./components/coursesManagement/CoursesManagement";
import NewsPage from "./components/news/NewsPage";
import NewsDetails from "./components/news/NewDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FreelancerProjects from "./components/projects/FreelancerProjects";
import AdminVerificationPage from "./components/verifiyForAdmin/VerifiedFreeLance";

function App() {
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);

  useEffect(() => {
    const socket = initSocket(token, userId);
    return () => {
      disconnectSocket();
    };
  }, [token, userId]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetails />} />
        <Route path="/test" element={<Counter />} />
        <Route path="/" element={<OrderzHousePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/about" element={<ModernAboutPage />} />
        <Route path="/ask-more" element={<Ask />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-verification" element={<AdminVerificationPage />} />

        {/* ✅ VerifyProfile يظل مفتوح */}
        <Route path="/verify-profile" element={<VerifyProfile />} />

        {/* ✅ صفحات محمية */}
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-project"
          element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-project/:projectId"
          element={
            <ProtectedRoute>
              <ManageProject />
            </ProtectedRoute>
          }
        />

        {/* ✅ صفحات عامة */}
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/rate" element={<TopRatedFreelancers />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/offer/available"
          element={<FreelancerProjects />}
        />

        <Route path="/freelancers" element={<AllFreeLance />} />
        <Route path="/freelancer/:id" element={<FreeLanceDetail />} />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
      <EnhancedFooter />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
