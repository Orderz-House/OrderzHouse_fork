import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import ClientTaskRequest from "./ClientTaskRequest";

export default function TasksPool() {
  const { token, userData } = useSelector(state => state.auth);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/category").then(res => {
      setCategories(res.data.categories || []);
    });
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const url = filter ? `/api/tasks/pool?category=${filter}` : "/api/tasks/pool";
        const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(url, cfg);
        setTasks(res.data.tasks || []);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filter, token]);

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
      <h1 className="text-2xl font-bold mb-6">Available Tasks</h1>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium">Filter by Category</label>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-64"
        >
          <option value="">All Categories</option>
          {categories
            .filter(c => c.level === 2) // show only sub-subcategories
            .map(c => (
              <option key={c.id} value={c.id}>
                {getCategoryPath(c.id)}
              </option>
            ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No tasks found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <div key={task.id} className="border rounded-xl p-5 shadow-sm">
              <span className="text-xs text-blue-600 font-semibold">{task.category_name}</span>
              <h3 className="font-bold mt-1">{task.title}</h3>
              <p className="text-gray-600 text-sm my-2">{task.description}</p>
              <p className="font-bold text-green-600">${task.price}</p>
              {/* Only show request button if not freelancer or not owner */}
              {userData?.role !== 3 && task.freelancer_id !== userData?.id && (
                <div className="mt-4">
                  <ClientTaskRequest taskId={task.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}