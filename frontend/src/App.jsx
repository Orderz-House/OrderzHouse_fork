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
import CreateProject from "./components/createProject/CreateProject";
import ProjectDetails from "./components/projects/ProjectDetails";

import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { initSocket, disconnectSocket } from "./services/socketService";
import TopRatedFreelancers from "./components/topRated/TopRate";
import FreelancerDashboard from "./components/dashboard/Dashboard";
import Dashboard from "./components/dashboard/Dashboard";

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
      {" "}
      <Navbar />
      <Routes>
        <Route path="/test" element={<Counter />} />
        <Route path="/" element={<OrderzHousePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/about" element={<ModernAboutPage />} />
        <Route path="/ask-more" element={<Ask />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/rate" element={<TopRatedFreelancers />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
     <EnhancedFooter />
    </>
  );
}
 
export default App;