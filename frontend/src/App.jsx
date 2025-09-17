import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "animate.css";
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


function App() {
  const location = useLocation();
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);
  const hideNavbarRoutes = ["/account/suspended"];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    const socket = initSocket(token, userId);
    return () => {
      disconnectSocket();
    };
  }, [token, userId]);

  return (
    <>
    {!shouldHideNavbar && <Navbar />}
      <Routes>

        <Route path="/news" element={<NewsListPage />} />
        <Route path="/news/admin" element={<AdminPendingNewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />

        
        <Route path="account/suspended" element={<AccountSuspended />} />

        <Route path="/test" element={<Counter />} />
        <Route path="/" element={<OrderzHousePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/about" element={<ModernAboutPage />} />
        <Route path="/ask-more" element={<Ask />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-verification" element={<AdminVerificationPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfileView/></ProtectedRoute>}/>

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
          path="/freelancer/dashboard"
          element={
            <ProtectedRoute>
              <FreelancerDashboard />
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

        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rate"
          element={
            <ProtectedRoute>
              <TopRatedFreelancers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashoard/projects"
          element={
            <ProtectedRoute>
              <ProjectsDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/"
          element={
            <ProtectedRoute>
              <ProjectsAvalible />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancers"
          element={
            <ProtectedRoute>
              <AllFreeLance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer/profile/:id"
          element={
            <ProtectedRoute>
              <FreeLanceDetail />
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/freelancer/project/:projectId"
          element={
            <ProtectedRoute>
              <FreelancerManageProject />
            </ProtectedRoute>
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
    </>
  );
}

export default App;
