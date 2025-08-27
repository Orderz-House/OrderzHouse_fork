import { Routes, Route } from "react-router-dom";
import "./App.css";
import Counter from "./counter/Counter";
import Navbar from "./navbar/Nav";
import EnhancedFooter from "./footer/Footer";
import PrivacyPolicyPage from "./policy/Policy";

function App() {
  
  return (
    <>
      {" "}
      <Navbar />
      <Routes>
        <Route path="/test" element={<Counter />} />
        <Route
          path="/"
          element={
            <h1 className="text-3xl font-bold underline">Hello world!</h1>
          }
        />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/about" element={<ModernAboutPage />} />
        <Route path="/ask-more" element={<Ask />} />
        <Route path="/contact" element={<ContactUsPage />} />
      </Routes>
      <EnhancedFooter />
    </>
  );
}

export default App;
