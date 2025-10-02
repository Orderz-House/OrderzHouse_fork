import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Plus, ClipboardList, Eye, Edit, Trash } from "lucide-react";

export default function FreelancerTasks() {
  const { token, userData } = useSelector((state) => state.auth);
  const freelancerId = userData?.id;   // ✅ always use logged-in freelancer
  const [myTasks, setMyTasks] = useState([]);
  const [taskPool, setTaskPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", price: "" });

  // Fetch tasks
  useEffect(() => {
    if (!token || !freelancerId) {
      console.warn("No freelancer ID or token available");
      return;
    }

    async function fetchTasks() {
      try {
        setLoading(true);

        // My tasks
        const myRes = await axios.get(
          `http://localhost:5000/tasks/freelancer/${freelancerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Task pool
        const poolRes = await axios.get(
          `http://localhost:5000/tasks/pool/${freelancerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMyTasks(myRes.data.tasks || []);
        setTaskPool(poolRes.data.tasks || []);
      } catch (err) {
        console.error("❌ Failed to fetch tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [token, freelancerId]);

  // Add / Update Task
  const handleSaveTask = async () => {
    if (!taskForm.title || !taskForm.description) return alert("Fill all fields");

    try {
      if (editingTask) {
        const res = await axios.put(
          `http://localhost:5000/tasks/${editingTask.id}`,
          { ...taskForm, freelancerId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMyTasks(myTasks.map((t) => (t.id === editingTask.id ? res.data.task : t)));
        setEditingTask(null);
      } else {
        const res = await axios.post(
          `http://localhost:5000/tasks`,
          { ...taskForm, freelancerId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMyTasks([...myTasks, res.data.task]);
      }

      setTaskForm({ title: "", description: "", price: "" });
      setShowForm(false);
    } catch (err) {
      console.error("❌ Failed to save task:", err);
      alert("Could not save task");
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { freelancerId }, // backend check
      });
      setMyTasks(myTasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("❌ Failed to delete task:", err);
      alert("Could not delete task");
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading tasks...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Freelancer Tasks</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingTask(null);
            setTaskForm({ title: "", description: "", price: "" });
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <input
            type="text"
            placeholder="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
          <textarea
            placeholder="Task Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Price ($)"
            value={taskForm.price}
            onChange={(e) => setTaskForm({ ...taskForm, price: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleSaveTask}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {editingTask ? "Update Task" : "Save Task"}
          </button>
        </div>
      )}

      {/* My Tasks */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ClipboardList className="w-5 h-5 mr-2" /> My Tasks
        </h2>
        {myTasks.length === 0 ? (
          <p className="text-gray-500">You haven’t added any tasks yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTasks.map((task) => (
              <div key={task.id} className="p-4 bg-white rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                <p className="text-gray-600 mb-2">{task.description}</p>
                <p className="text-blue-600 font-semibold">${task.price}</p>

                <div className="flex space-x-3 mt-3">
                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setTaskForm({
                        title: task.title,
                        description: task.description,
                        price: task.price,
                      });
                      setShowForm(true);
                    }}
                    className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash className="w-4 h-4 mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Pool */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" /> Task Pool (Read Only)
        </h2>
        {taskPool.length === 0 ? (
          <p className="text-gray-500">No tasks from other freelancers.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taskPool.map((task) => (
              <div key={task.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                <p className="text-gray-600 mb-2">{task.description}</p>
                <p className="text-green-600 font-semibold">${task.price}</p>
                <p className="text-xs text-gray-500">
                  By Freelancer #{task.freelancer_id}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
