// src/components/tasks/FreelancerTasks.jsx
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Plus, Edit, Trash, Check, X, Inbox, MessageSquare, Loader, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = "/api/tasks";

export default function FreelancerTasks() {
  const { token } = useSelector(state => state.auth);
  const [myTasks, setMyTasks] = useState([]);
  const [taskPool, setTaskPool] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", price: "", category_id: 1, duration_days: 1, attachments: [] });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const topRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const [my, pool, reqs] = await Promise.all([
        axios.get(`${API}/my-tasks`, cfg),
        axios.get(`${API}/pool`, cfg), // This now shows only 'active' tasks
        axios.get(`${API}/requests`, cfg)
      ]);
      setMyTasks(my.data.tasks || []);
      setTaskPool(pool.data.tasks || []); // This now shows only 'active' tasks
      setRequests(reqs.data.requests || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const saveTask = async () => {
    if (!form.title || !form.description || !form.price) {
      return showToast("Fill all fields", "error");
    }
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const url = editingTask ? `${API}/${editingTask.id}` : API;
      const method = editingTask ? "put" : "post";
      const res = await axios[method](url, form, cfg);
      if (editingTask) {
        setMyTasks(myTasks.map(t => t.id === editingTask.id ? res.data.task : t));
        showToast("Task updated");
      } else {
        setMyTasks([res.data.task, ...myTasks]); // New task has status 'pending_approval'
        showToast("Task created! Awaiting admin approval.");
      }
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed", "error");
    }
  };

  const deleteTask = async (id) => {
    if (!confirm("Delete task?")) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMyTasks(myTasks.filter(t => t.id !== id));
      showToast("Task deleted");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const updateRequest = async (id, status) => {
    try {
      await axios.patch(`${API}/requests/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.filter(r => r.id !== id));
      showToast(status === "accepted" ? "Accepted!" : "Declined");
    } catch (err) {
      showToast("Action failed", "error");
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", price: "", category_id: 1, duration_days: 1, attachments: [] });
    setEditingTask(null);
    setShowForm(false);
  };

  const TaskCard = ({ task, editable }) => (
    <motion.div layout className="p-4 border rounded-xl shadow bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold">{task.title}</h3>
          <p className="text-sm text-gray-600 my-2">{task.description}</p>
          <p className="font-bold text-green-600">${task.price}</p>
          <div className="flex items-center text-xs mt-1">
            {task.status === 'pending_approval' && <span className="flex items-center text-yellow-600"><Clock size={12} className="mr-1" /> Pending Approval</span>}
            {task.status === 'active' && <span className="text-green-600">Active</span>}
            {task.status === 'rejected' && <span className="text-red-600">Rejected</span>}
          </div>
        </div>
        {editable && (
          <div className="flex flex-col space-y-1">
            <button onClick={() => { setEditingTask(task); setForm(task); setShowForm(true); topRef.current?.scrollIntoView(); }}>
              <Edit size={16} className="text-gray-500 hover:text-blue-600" />
            </button>
            <button onClick={() => deleteTask(task.id)}>
              <Trash size={16} className="text-gray-500 hover:text-red-600" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  const RequestCard = ({ req }) => (
    <motion.div layout className="p-4 border rounded-xl shadow bg-white">
      <div className="flex items-center mb-2">
        <img src={req.client_avatar || "https://via.placeholder.com/40"} alt={req.client_name} className="w-10 h-10 rounded-full mr-3" />
        <div>
          <p className="font-semibold">{req.client_name}</p>
          <p className="text-sm text-gray-500">Requested: {req.task_title}</p>
        </div>
      </div>
      {req.message && (
        <div className="bg-blue-50 p-2 rounded mb-3">
          <p className="text-sm flex items-center"><MessageSquare size={14} className="mr-1"/> {req.message}</p>
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <button onClick={() => updateRequest(req.id, "rejected")} className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm">Decline</button>
        <button onClick={() => updateRequest(req.id, "accepted")} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Accept</button>
      </div>
    </motion.div>
  );

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin w-8 h-8" /></div>;

  return (
    <div className="p-6" ref={topRef}>
      {/* Toast */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded text-white ${toast.type === "error" ? "bg-red-600" : "bg-gray-800"}`}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Form */}
      {showForm && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="mb-8 p-5 bg-white border rounded-xl shadow">
          <h3 className="font-bold mb-3">{editingTask ? "Edit Task" : "New Task"}</h3>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full p-2 mb-3 border rounded" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full p-2 mb-3 border rounded" />
          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price" className="w-full p-2 mb-3 border rounded" />
          <input type="number" value={form.duration_days} onChange={e => setForm({ ...form, duration_days: e.target.value })} placeholder="Duration (days)" className="w-full p-2 mb-4 border rounded" />
          <div className="flex justify-end space-x-2">
            <button onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button onClick={saveTask} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          </div>
        </motion.div>
      )}

      {/* Requests */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Inbox className="mr-2" /> Requests ({requests.length})
        </h2>
        {requests.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(r => <RequestCard key={r.id} req={r} />)}
          </div>
        ) : (
          <p className="text-gray-500">No pending requests</p>
        )}
      </section>

      {/* My Tasks */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Tasks</h2>
          {!showForm && (
            <button onClick={() => { setShowForm(true); topRef.current?.scrollIntoView(); }} className="p-2 bg-blue-600 text-white rounded-full">
              <Plus size={20} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTasks.map(t => <TaskCard key={t.id} task={t} editable={true} />)}
        </div>
      </section>

      {/* Task Pool (Shows active tasks, including yours if active) */}
      <section>
        <h2 className="text-xl font-bold mb-4">Task Pool (Active)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taskPool.map(t => <TaskCard key={t.id} task={t} editable={false} />)}
        </div>
      </section>
    </div>
  );
}