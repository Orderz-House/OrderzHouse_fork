import { Routes, Route } from "react-router-dom";
import "./App.css";
import Counter from "./counter/Counter";
import Navbar from "./components/navbar/Nav";
import EnhancedFooter from "./components/footer/Footer";
import PrivacyPolicyPage from "./components/policy/Policy";
import ModernAboutPage from "./components/about/About";
import OrderzHousePage from "./components/main/Main";
import Ask from "./components/ask/Ask";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/test" element={<Counter />} />
        <Route path="/" element={<OrderzHousePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/about" element={<ModernAboutPage />} />
        <Route path="/ask-more" element={<Ask />} />
      </Routes>
      <EnhancedFooter />
    </>
  );
}

export default App;
