import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Send, AlertCircle } from "lucide-react";

export default function ClientTaskRequest({ taskId }) {
  const { token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return <button className="w-full py-2 bg-gray-200 text-gray-500 rounded text-sm" disabled>Log in to request</button>;
  }

  const handleRequest = async () => {
    const msg = prompt("Message to freelancer (optional):");
    if (msg === null) return;

    setLoading(true);
    setError("");
    try {
      await axios.post(
        `/api/tasks/request/${taskId}`,
        { message: msg.trim() || null, attachments: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Request sent successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Request failed";
      setError(msg);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleRequest}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded text-sm font-medium ${
          loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Sending..." : "Request Task"} <Send size={16} />
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 flex items-center">
          <AlertCircle size={14} className="mr-1" /> {error}
        </p>
      )}
    </div>
  );
}