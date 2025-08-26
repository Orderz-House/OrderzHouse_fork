import { Routes, Route } from "react-router-dom";
import "./App.css";
import Counter from "./counter/Counter";
import Navbar from "./navbar/Nav";
import EnhancedFooter from "./footer/Footer";
import PrivacyPolicyPage from "./policy/Policy";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/test" element={<Counter />} />
        <Route
          path="/"
          element={
            <h1 className="text-3xl font-bold underline">Hello world!</h1>
          }
        />
        <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                 

        <Route path="/privacy" element={<PrivacyPolicyPage />} />
      </Routes>
      <EnhancedFooter />
    </>
  );
}

export default App;
