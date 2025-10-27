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

  const { token, userData } = useSelector((state) => ({
    token: state.auth.token,
    userData: state.auth.userData
  }));

  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000";

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
        headers: {
          authorization: `Bearer ${token}`,
        },
        params: {
          limit: 100,
          offset: 0,
          unreadOnly: false
        }
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

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_BASE}/notifications/${notificationId}/read`, {}, {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });

      // Update local state
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read_status: true } : notif
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE}/notifications/read-all`, {}, {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });

      // Update local state
      setNotifications(notifications.map(notif => ({ ...notif, read_status: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${API_BASE}/notifications/${notificationId}`, {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });

      // Update local state
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      setSelectedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Delete selected notifications
  const deleteSelectedNotifications = async () => {
    try {
      const deletePromises = Array.from(selectedNotifications).map(id =>
        axios.delete(`${API_BASE}/notifications/${id}`, {
          headers: {
            authorization: `Bearer ${token}`,
          }
        })
      );

      await Promise.all(deletePromises);

      // Update local state
      setNotifications(notifications.filter(notif => !selectedNotifications.has(notif.id)));
      setSelectedNotifications(new Set());
      setSelectAll(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  // Toggle selection of a notification
  const toggleSelection = (notificationId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications(new Set());
    } else {
      const allIds = new Set(filteredNotifications.map(notif => notif.id));
      setSelectedNotifications(allIds);
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    let filtered = notifications;

    if (filter === "unread") {
      filtered = filtered.filter(notif => !notif.read_status);
    } else if (filter === "read") {
      filtered = filtered.filter(notif => notif.read_status);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notif =>
        notif.message?.toLowerCase().includes(query) ||
        notif.type?.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, searchQuery]);

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message_received':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'project_created':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'review_submitted':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'work_completion_requested':
        return <CheckCircle2 className="h-5 w-5 text-purple-500" />;
      case 'offer_submitted':
        return <Info className="h-5 w-5 text-indigo-500" />;
      case 'work_submitted':
        return <CheckCircle2 className="h-5 w-5 text-teal-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
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
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">Manage your alerts and updates</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedNotifications.size > 0 && (
                <>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-xl hover:bg-blue-200 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All notifications</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
              
              <div className="hidden sm:block text-sm text-gray-600">
                {filteredNotifications.length} of {notifications.length} notifications
              </div>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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
                  : "You'll see important updates here when they arrive"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Select All Header */}
              <div className="px-6 py-3 bg-gray-50 flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-600">Select all</span>
              </div>

              {/* Notifications */}
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read_status ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-1"
                    />
                    
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-3 ml-4">
                          {!notification.read_status && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatDate(notification.created_at)}</span>
                        {notification.type && (
                          <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {notification.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {filteredNotifications.length > 0 && !loading && (
          <div className="mt-6 text-center">
            <button
              onClick={fetchNotifications}
              className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Delete Notifications
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedNotifications.size} selected notification(s)?
              This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelectedNotifications}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
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