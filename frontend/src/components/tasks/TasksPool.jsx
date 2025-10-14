// src/components/tasks/TasksPool.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import ClientTaskRequest from "./ClientTaskRequest";

export default function TasksPool() {
  const { token } = useSelector(state => state.auth);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/tasks/categories").then(res => {
      setCategories(res.data.categories || []);
    });
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const url = selectedCategory 
          ? `/api/tasks/pool?category=${selectedCategory}` 
          : "/api/tasks/pool";
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(url, config);
        setTasks(res.data.tasks || []);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [selectedCategory, token]);

  const getCategoryPath = (id) => {
    const map = new Map(categories.map(c => [c.id, c]));
    let cat = map.get(id);
    const path = [];
    while (cat) {
      path.unshift(cat.name);
      cat = cat.parent_id ? map.get(cat.parent_id) : null;
    }
    return path.join(" > ");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Tasks</h1>

      <div className="mb-6">
        <label className="block mb-2">Filter by Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          {categories
            .filter(cat => cat.level === 2)
            .map(cat => (
              <option key={cat.id} value={cat.id}>
                {getCategoryPath(cat.id)}
              </option>
            ))}
        </select>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <div key={task.id} className="border p-4 rounded shadow">
              <span className="text-sm text-blue-600">{task.category_name}</span>
              <h3 className="font-bold">{task.title}</h3>
              <p className="text-gray-600 text-sm my-2">{task.description}</p>
              <p className="font-bold text-green-600">${task.price}</p>
              <ClientTaskRequest taskId={task.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}