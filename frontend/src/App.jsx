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
import Login from "./components/Login";
import Register from "./components/Register";
import EditProfile from "./components/profile/EditProfile";
function App() {
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
        <Route path="/profile" element={<EditProfile/>}/>
      </Routes>
      <EnhancedFooter />
    </>
  );
}

export default App;
