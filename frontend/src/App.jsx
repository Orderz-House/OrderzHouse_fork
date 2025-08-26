import { Routes, Route } from "react-router-dom";
import "./App.css";
import Counter from "./counter/Counter";

function App() {
  return (
    <Routes>
      <Route path="/test" element={<Counter />} />
      <Route
        path="/"
        element={
          <h1 className="text-3xl font-bold underline">Hello world!</h1>
        }
      />
    </Routes>
  );
}

export default App;
