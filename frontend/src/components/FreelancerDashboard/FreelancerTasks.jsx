import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Plus, Edit, Trash } from "lucide-react";

export default function FreelancerTasks() {
  const { token, userData } = useSelector((state) => state.auth);
  const freelancerId = userData?.id;
  const [myTasks, setMyTasks] = useState([]);
  const [taskPool, setTaskPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", price: "" });
  const [message, setMessage] = useState("");

  // Fetch tasks
  useEffect(() => {
    if (!token || !freelancerId) return;

    async function fetchTasks() {
      try {
        setLoading(true);
        const myRes = await axios.get(
          `http://localhost:5000/tasks/freelancer/${freelancerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  // Save Task
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
        setMessage("✅ Task updated successfully!");
      } else {
        const res = await axios.post(
          `http://localhost:5000/tasks`,
          { ...taskForm, freelancerId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMyTasks([...myTasks, res.data.task]);
        setMessage("✅ Task created successfully!");
      }

      setTaskForm({ title: "", description: "", price: "" });
      setShowForm(false);
    } catch (err) {
      console.error("❌ Failed to save task:", err);
      setMessage("❌ Could not save task");
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyTasks(myTasks.filter((t) => t.id !== taskId));
      setMessage("🗑️ Task deleted successfully!");
    } catch (err) {
      console.error("❌ Failed to delete task:", err);
      setMessage("❌ Could not delete task");
    }
  };
  {myTasks.map((task) => (
  <div
    key={task.id}
    className="bg-gradient-to-r from-blue-200 to-green-200 shadow-lg p-6 rounded-2xl mb-4"
  >
    <div className="flex items-center gap-3 mb-3">
      {task.freelancer_avatar ? (
        <img
          src={task.freelancer_avatar}
          alt={task.freelancer_name}
          className="w-10 h-10 rounded-full border-2 border-white"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300" />
      )}
      <span className="font-semibold text-lg">{task.freelancer_name}</span>
    </div>

    <h3 className="text-xl font-bold">{task.title}</h3>
    <p className="text-gray-700">{task.description}</p>
    <p className="mt-2 text-sm text-gray-600">💰 {task.price} USD</p>
  </div>
))}

  return (
    <div className="p-6">
      {message && (
        <div className="mb-4 p-3 rounded-lg text-white bg-green-500 shadow-lg">
          {message}
        </div>
      )}

      {/* My Tasks */}
      <h2 className="text-2xl font-bold text-blue-700 mb-4">My Tasks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {myTasks.map((task) => (
          <div
            key={task.id}
            className="p-5 bg-gradient-to-br from-blue-400 to-green-400 rounded-2xl shadow-lg relative"
          >
            {/* Freelancer info */}
            <div className="flex items-center mb-3">
              <img
                src={task.freelancer_avatar || "/default-avatar.png"}
                alt={task.freelancer_name}
                className="w-10 h-10 rounded-full mr-3 border-2 border-white"
              />
              <span className="font-semibold text-white">
                {task.freelancer_name}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">{task.title}</h3>
            <p className="text-white/90 mb-2">{task.description}</p>
            <p className="font-semibold text-white">💲 {task.price}</p>

            <div className="flex justify-end mt-3 space-x-3">
              <button
                className="text-white hover:text-yellow-300"
                onClick={() => {
                  setEditingTask(task);
                  setTaskForm(task);
                  setShowForm(true);
                }}
              >
                <Edit />
              </button>
              <button
                className="text-white hover:text-red-300"
                onClick={() => handleDeleteTask(task.id)}
              >
                <Trash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Other Freelancers’ Tasks */}
      <h2 className="text-2xl font-bold text-green-700 mt-10 mb-4">Other Tasks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {taskPool.map((task) => (
          <div
            key={task.id}
            className="p-5 bg-gradient-to-br from-green-400 to-blue-400 rounded-2xl shadow-lg"
          >
            <div className="flex items-center mb-3">
              <img
                src={task.freelancer_avatar || "/default-avatar.png"}
                alt={task.freelancer_name}
                className="w-10 h-10 rounded-full mr-3 border-2 border-white"
              />
              <span className="font-semibold text-white">
                {task.freelancer_name}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">{task.title}</h3>
            <p className="text-white/90 mb-2">{task.description}</p>
            <p className="font-semibold text-white">💲 {task.price}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-bold mb-3">
            {editingTask ? "Edit Task" : "Add Task"}
          </h3>
          <input
            className="w-full border p-2 mb-2 rounded"
            placeholder="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <textarea
            className="w-full border p-2 mb-2 rounded"
            placeholder="Description"
            value={taskForm.description}
            onChange={(e) =>
              setTaskForm({ ...taskForm, description: e.target.value })
            }
          />
          <input
            className="w-full border p-2 mb-2 rounded"
            placeholder="Price"
            value={taskForm.price}
            onChange={(e) => setTaskForm({ ...taskForm, price: e.target.value })}
          />
          <button
            onClick={handleSaveTask}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600"
        >
          <Plus />
        </button>
      )}
    </div>
  );
}
