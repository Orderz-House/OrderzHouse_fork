import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

export default function AdminTaskApproval() {
  const { token } = useSelector(state => state.auth);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        setLoading(true);
        setPendingTasks([
          { id: 1, title: "Sample Task", description: "Sample desc", price: 100, freelancer_name: "F Name" }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPending();
  }, [token]);

  const handleApproval = async (taskId, action) => {
    try {
      await axios.patch("/tasks/admin/approve", { taskId, action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingTasks(pendingTasks.filter(t => t.id !== taskId));
      alert(`Task ${action}d successfully.`);
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Task Approvals</h1>
      {pendingTasks.length === 0 ? (
        <p>No pending tasks.</p>
      ) : (
        <div>
          {pendingTasks.map(task => (
            <div key={task.id} className="border p-4 rounded mb-3">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>By: {task.freelancer_name}</p>
              <p>Price: ${task.price}</p>
              <div className="flex space-x-2 mt-2">
                <button onClick={() => handleApproval(task.id, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                <button onClick={() => handleApproval(task.id, 'reject')} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}