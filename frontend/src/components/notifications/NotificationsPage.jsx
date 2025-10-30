import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Bell,
  CheckCircle,
  CheckCircle2,
  Filter,
  Search,
  Trash2,
  Clock,
  AlertCircle,
  Info,
  Mail,
  Star,
  Calendar,
  ArrowLeft
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { token } = useSelector((state) => ({
    token: state.auth.token,
  }));

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "https://backend.thi8ah.com";

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) {
      setError("Please login to view notifications");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/notifications`, {
        headers: { authorization: `Bearer ${token}` },
        params: { limit: 100, offset: 0, unreadOnly: false },
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setFilteredNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
        headers: { authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_status: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE}/notifications/read-all`, {}, {
        headers: { authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Delete single notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_BASE}/notifications/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSelectedNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Delete selected
  const deleteSelectedNotifications = async () => {
    try {
      await Promise.all(
        Array.from(selectedNotifications).map((id) =>
          axios.delete(`${API_BASE}/notifications/${id}`, {
            headers: { authorization: `Bearer ${token}` },
          })
        )
      );
      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.has(n.id))
      );
      setSelectedNotifications(new Set());
      setSelectAll(false);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Error deleting notifications:", err);
    }
  };

  // Filters
  useEffect(() => {
    let filtered = notifications;
    if (filter === "unread") filtered = filtered.filter((n) => !n.read_status);
    if (filter === "read") filtered = filtered.filter((n) => n.read_status);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.message?.toLowerCase().includes(query) ||
          n.type?.toLowerCase().includes(query)
      );
    }
    setFilteredNotifications(filtered);
  }, [notifications, filter, searchQuery]);

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const toggleSelection = (id) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
    }
    setSelectAll(!selectAll);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message_received":
        return <Mail className="h-5 w-5 text-[#028090]" />;
      case "project_created":
        return <CheckCircle2 className="h-5 w-5 text-[#05668D]" />;
      case "review_submitted":
        return <Star className="h-5 w-5 text-[#FBBF24]" />;
      case "work_submitted":
        return <CheckCircle2 className="h-5 w-5 text-[#02C39A]" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.abs(now - date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0)
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (days === 1)
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your notifications</p>
          <Link
            to="/login"
            className="px-6 py-3 bg-[#028090] text-white font-medium rounded-xl hover:bg-[#05668D] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-[#05668D]" />
            </button>
            <h1 className="text-2xl font-bold text-[#05668D] flex items-center gap-2">
              Notifications
              {notifications.some((n) => !n.read_status) && (
                <span className="w-2 h-2 bg-[#028090] rounded-full animate-pulse"></span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {selectedNotifications.size > 0 && (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete selected"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-600">
                  {selectedNotifications.size} selected
                </span>
              </>
            )}
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-[#028090] text-white font-medium rounded-xl hover:bg-[#05668D] transition"
            >
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#028090] focus:border-transparent"
              >
                <option value="all">All notifications</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
            <div className="hidden sm:block text-sm text-gray-600">
              {filteredNotifications.length} of {notifications.length} total
            </div>
          </div>

          <div className="relative sm:max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#028090] focus:border-transparent"
            />
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028090] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-[#028090] text-white rounded-xl hover:bg-[#05668D] transition"
              >
                Try Again
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filter !== "all" ? "No matching notifications" : "No notifications yet"}
              </h3>
              <p className="text-gray-600">
                {searchQuery || filter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You'll see important updates here when they arrive"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              <div className="px-6 py-3 bg-gray-50 flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-[#028090] border-gray-300 focus:ring-[#028090]"
                />
                <span className="ml-3 text-sm text-gray-600">Select all</span>
              </div>

              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-6 transition-colors ${!n.read_status ? "bg-[#E0F7FA]" : "hover:bg-gray-50"}`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(n.id)}
                      onChange={() => toggleSelection(n.id)}
                      className="h-4 w-4 text-[#028090] border-gray-300 focus:ring-[#028090] mt-1"
                    />

                    <div className="flex-shrink-0">{getNotificationIcon(n.type)}</div>

                    <div className="flex-1">
                      <p className="text-gray-700">{n.message}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatDate(n.created_at)}</span>
                        {n.type && (
                          <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {n.type}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {!n.read_status && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="p-1 text-[#028090] hover:text-[#05668D] transition"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Notifications</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedNotifications.size} selected notification(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelectedNotifications}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}