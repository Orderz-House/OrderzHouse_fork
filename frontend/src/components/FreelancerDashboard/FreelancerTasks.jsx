import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Plus, Edit, Trash, X } from "lucide-react";

export default function FreelancerTasks() {
  const { token, userData } = useSelector((state) => state.auth);
  const freelancerId = userData?.id;

  const [myTasks, setMyTasks] = useState([]);
  const [taskPool, setTaskPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", price: "" });

  // Ref for scrolling to the top
  const pageTopRef = useRef(null);

  // --- Data Fetching ---
  useEffect(() => {
    if (!token || !freelancerId) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch both sets of tasks concurrently for better performance
        const [myTasksRes, taskPoolRes] = await Promise.all([
          axios.get(`http://localhost:5000/tasks/freelancer/${freelancerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          } ),
          axios.get(`http://localhost:5000/tasks/pool/${freelancerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          } ),
        ]);

        setMyTasks(myTasksRes.data.tasks || []);
        setTaskPool(taskPoolRes.data.tasks || []);

      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Could not load tasks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token, freelancerId]);

  // --- Form and Task Management ---

  const handleShowForm = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({ title: task.title, description: task.description, price: task.price });
    } else {
      setEditingTask(null);
      setTaskForm({ title: "", description: "", price: "" });
    }
    setShowForm(true);
    // Scroll to the top where the form is
    pageTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
    setTaskForm({ title: "", description: "", price: "" });
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.description || !taskForm.price) {
      return alert("Please fill out all fields.");
    }

    const url = editingTask
      ? `http://localhost:5000/tasks/${editingTask.id}`
      : `http://localhost:5000/tasks`;
    
    const method = editingTask ? 'put' : 'post';

    try {
      const response = await axios[method](url, { ...taskForm, freelancerId }, {
        headers: { Authorization: `Bearer ${token}` },
      } );

      if (editingTask) {
        setMyTasks(myTasks.map((t) => (t.id === editingTask.id ? response.data.task : t)));
        setMessage("Task updated successfully!");
      } else {
        setMyTasks([response.data.task, ...myTasks]);
        setMessage("Task created successfully!");
      }

      handleCancel(); // Hide form and reset state
    } catch (err) {
      console.error("Failed to save task:", err);
      setError("Could not save the task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      } );
      setMyTasks(myTasks.filter((t) => t.id !== taskId));
      setMessage("Task deleted successfully!");
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Could not delete the task.");
    }
  };

  // --- Render ---

  // Display a loading spinner while fetching data
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen" ref={pageTopRef}>
      {/* Notifications */}
      {message && <div className="mb-4 p-3 rounded-lg text-white bg-green-500 shadow-lg">{message}</div>}
      {error && <div className="mb-4 p-3 rounded-lg text-white bg-red-500 shadow-lg">{error}</div>}

      {/* Add/Edit Task Form */}
      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {editingTask ? "Edit Task" : "Create a New Task"}
          </h3>
          <form onSubmit={handleSaveTask}>
            <div className="space-y-4">
              <input
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Task Title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
              <textarea
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the service you are offering..."
                rows="4"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
              <input
                type="number"
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Price (USD)"
                value={taskForm.price}
                onChange={(e) => setTaskForm({ ...taskForm, price: e.target.value })}
              />
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                {editingTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Tasks Section */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Tasks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {myTasks.map((task) => (
          <div key={task.id} className="p-5 bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col">
            <div className="flex items-center mb-4">
              <img
                src={task.freelancer_avatar || 'https://via.placeholder.com/150'}
                alt={task.freelancer_name}
                className="w-10 h-10 rounded-full mr-3 border-2 border-gray-200"
              />
              <span className="font-semibold text-gray-800">{task.freelancer_name}</span>
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
              <p className="text-gray-600 my-2">{task.description}</p>
              <p className="font-semibold text-lg text-green-600">${task.price}</p>
            </div>
            <div className="flex justify-end mt-4 space-x-3">
              <button onClick={( ) => handleShowForm(task)} className="p-2 text-gray-500 hover:text-blue-600"><Edit size={20} /></button>
              <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash size={20} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Other Freelancers’ Tasks Section */}
      <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-4">Task Pool</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {taskPool.map((task) => (
          <div key={task.id} className="p-5 bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="flex items-center mb-4">
              <img
                src={task.freelancer_avatar || 'https://via.placeholder.com/150'}
                alt={task.freelancer_name}
                className="w-10 h-10 rounded-full mr-3 border-2 border-gray-200"
              />
              <span className="font-semibold text-gray-800">{task.freelancer_name}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
            <p className="text-gray-600 my-2">{task.description}</p>
            <p className="font-semibold text-lg text-green-600">${task.price}</p>
          </div>
         ))}
      </div>

      {/* Floating Action Button to Add Task */}
      {!showForm && (
        <div className="group fixed bottom-6 right-6">
          <button
            onClick={() => handleShowForm()}
            className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform transform hover:scale-110"
            aria-label="Create New Task"
          >
            <Plus />
          </button>
          <div className="absolute bottom-1/2 right-full mr-4 mb--2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Create New Task
          </div>
        </div>
      )}
    </div>
  );
}
