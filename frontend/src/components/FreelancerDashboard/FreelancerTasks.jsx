import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Plus, Edit, Trash, Check, X, Inbox, MessageSquare, Loader, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FreelancerTasks() {
  const { token, userData } = useSelector((state) => state.auth);
  const freelancerId = userData?.id;

  const [myTasks, setMyTasks] = useState([]);
  const [taskPool, setTaskPool] = useState([]);
  const [taskRequests, setTaskRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", price: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const pageTopRef = useRef(null);

  useEffect(() => {
    if (!token || !freelancerId) {
      setLoading(false);
      return;
    }

    async function fetchAllData() {
      try {
        setLoading(true);
        setError(null);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [myRes, poolRes, requestsRes] = await Promise.all([
          axios.get(`/api/tasks/freelancer/${freelancerId}`, config),
          axios.get(`/api/tasks/pool/${freelancerId}`, config),
          axios.get(`/api/tasks/requests`, config)
        ]);

        setMyTasks(myRes.data.tasks || []);
        setTaskPool(poolRes.data.tasks || []);
        setTaskRequests(requestsRes.data.requests || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        const errorMsg = err.response?.data?.message || "Could not connect to the server.";
        setError(`Failed to load page data: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [token, freelancerId]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.put(`/api/tasks/requests/${requestId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskRequests(prev => prev.filter(req => req.id !== requestId));
      showMessage("✅ Request accepted successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Could not accept request.";
      showMessage(`❌ ${errorMsg}`, "error");
    }
  };

  const handleDeclineRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to decline this request?")) return;
    try {
      await axios.put(`/api/tasks/requests/${requestId}/decline`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskRequests(prev => prev.filter(req => req.id !== requestId));
      showMessage("🗑️ Request declined.");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Could not decline request.";
      showMessage(`❌ ${errorMsg}`, "error");
    }
  };

  const handleSaveTask = async () => {
    if (!taskForm.title || !taskForm.description || !taskForm.price) {
      return showMessage("⚠️ Please fill all fields.", "error");
    }
    const url = editingTask ? `/api/tasks/${editingTask.id}` : `/api/tasks`;
    const method = editingTask ? 'put' : 'post';
    try {
      const res = await axios[method](url, taskForm, { headers: { Authorization: `Bearer ${token}` } });
      if (editingTask) {
        setMyTasks(myTasks.map((t) => (t.id === editingTask.id ? res.data.task : t)));
        showMessage("✅ Task updated successfully!");
      } else {
        setMyTasks([res.data.task, ...myTasks]);
        showMessage("🎉 Task created successfully!");
      }
      setTaskForm({ title: "", description: "", price: "" });
      setEditingTask(null);
      setShowForm(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Could not save task.";
      showMessage(`❌ ${errorMsg}`, "error");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
      setMyTasks(myTasks.filter((t) => t.id !== taskId));
      showMessage("🗑️ Task deleted successfully!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Could not delete task.";
      showMessage(`❌ ${errorMessage}`, "error");
    }
  };

  const TaskCard = ({ task, editable }) => (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} whileHover={{ scale: 1.03 }} className="p-5 rounded-2xl shadow-lg bg-white border border-gray-200 flex flex-col">
      <div className="flex items-center mb-3"><img src={task.freelancer_avatar || 'https://via.placeholder.com/150'} alt={task.freelancer_name} className="w-10 h-10 rounded-full mr-3" /><span className="font-semibold">{task.freelancer_name}</span></div>
      <div className="flex-grow"><h3 className="text-lg font-bold">{task.title}</h3><p className="text-gray-600 my-2 text-sm">{task.description}</p><p className="font-semibold text-lg text-green-600">${task.price}</p></div>
      {editable && <div className="flex justify-end mt-4 space-x-2"><button className="p-2 text-gray-500 hover:text-blue-600" onClick={( ) => { setEditingTask(task); setTaskForm(task); setShowForm(true); pageTopRef.current?.scrollIntoView({ behavior: "smooth" }); }}><Edit size={20} /></button><button className="p-2 text-gray-500 hover:text-red-600" onClick={() => handleDeleteTask(task.id)}><Trash size={20} /></button></div>}
    </motion.div>
  );

  const RequestCard = ({ request }) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="p-5 rounded-2xl shadow-lg bg-white border border-gray-200 flex flex-col">
      <div className="flex items-center mb-3"><img src={request.client_avatar || 'https://via.placeholder.com/150'} alt={request.client_name} className="w-10 h-10 rounded-full mr-3" /><div><p className="font-semibold">{request.client_name}</p><p className="text-xs text-gray-500">Client ID: {request.client_id}</p></div></div>
      <div className="flex-grow my-2 p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Requested your task:</p><p className="font-semibold">{request.task_title}</p><p className="font-bold text-green-600">${request.task_price}</p></div>
      {request.message && <div className="flex-grow my-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"><p className="text-sm text-gray-500 flex items-center"><MessageSquare size={14} className="mr-2"/> Client's Message:</p><p className="text-gray-700 italic">"{request.message}"</p></div>}
      <div className="flex justify-end mt-4 space-x-3"><button onClick={( ) => handleDeclineRequest(request.id)} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 flex items-center"><X size={16} className="mr-1"/> Decline</button><button onClick={() => handleAcceptRequest(request.id)} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center"><Check size={16} className="mr-1"/> Accept</button></div>
    </motion.div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="w-12 h-12 text-blue-600 animate-spin" /></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen"><div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h3 className="text-lg font-semibold text-red-800">An Error Occurred</h3><p className="text-red-700 mt-2">{error}</p><button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Try Again</button></div></div>;
  }

  return (
    <div className="p-6" ref={pageTopRef}>
      {message.text && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 p-4 rounded-lg text-white shadow-lg font-medium ${message.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}>{message.text}</motion.div>}
      
      {showForm && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 bg-white p-6 rounded-2xl shadow-xl border"><h3 className="text-xl font-bold mb-4">{editingTask ? "✏️ Edit Task" : "➕ Add New Task"}</h3><div className="space-y-4"><input className="w-full border p-2 rounded-lg" placeholder="Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /><textarea className="w-full border p-2 rounded-lg" placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} /><input type="number" className="w-full border p-2 rounded-lg" placeholder="Price (USD)" value={taskForm.price} onChange={(e) => setTaskForm({ ...taskForm, price: e.target.value })} /></div><div className="flex justify-end space-x-3 mt-6"><button onClick={() => { setShowForm(false); setEditingTask(null); }} className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button><button onClick={handleSaveTask} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">Save</button></div></motion.div>}
      
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center"><Inbox className="mr-3 text-blue-600"/> Task Requests{taskRequests.length > 0 && <span className="ml-3 bg-red-500 text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full">{taskRequests.length}</span>}</h2>
        <AnimatePresence>{taskRequests.length > 0 ? <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{taskRequests.map((req) => <RequestCard key={req.id} request={req} />)}</motion.div> : <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed"><Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">You have no pending task requests.</p></div>}</AnimatePresence>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-4">My Tasks</h2>
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">{myTasks.map((task) => <TaskCard key={task.id} task={task} editable={true} />)}</motion.div>
      
      <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-4">Task Pool</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">{taskPool.map((task) => <TaskCard key={task.id} task={task} editable={false} />)}</div>
      
      {!showForm && <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowForm(true); pageTopRef.current?.scrollIntoView({ behavior: "smooth" }); }} className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg"><Plus /></motion.button>}
    </div>
  );
}
