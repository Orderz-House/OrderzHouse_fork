import { Routes, Route } from "react-router-dom";
import "./App.css";
import Counter from "./counter/Counter";
import Navbar from "./navbar/Nav";
import EnhancedFooter from "./footer/Footer";

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
      </Routes>
      <EnhancedFooter />
    </>
  );
}

export default App;
