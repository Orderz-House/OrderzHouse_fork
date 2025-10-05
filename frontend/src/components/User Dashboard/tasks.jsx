import React, { useState, useEffect } from 'react';
import { MoreVertical, Calendar, DollarSign, CheckCircle, XCircle, AlertCircle, Clock, FileText } from 'lucide-react';

const TaskRequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 8;

  useEffect(() => {
    fetchTaskRequests();
  }, []);

  const fetchTaskRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/tasks/requests/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setRequests(data.requests || []);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch task requests');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted' },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'In Progress' },
      completed: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JOD',
      currencyDisplay: 'code'
    }).format(amount).replace('JOD', 'JD');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleDropdown = (requestId) => {
    setOpenDropdown(openDropdown === requestId ? null : requestId);
  };

  const totalPages = Math.ceil(requests.length / requestsPerPage);
  const startIndex = (currentPage - 1) * requestsPerPage;
  const endIndex = startIndex + requestsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  const columns = ['task', 'freelancer', 'price', 'duration', 'category', 'message', 'attachments', 'status', 'requested_at'];

  const renderColumnHeader = (column) => {
    const headers = {
      task: 'Task',
      freelancer: 'Freelancer',
      price: 'Price',
      duration: 'Duration',
      category: 'Category',
      message: 'Message',
      attachments: 'Attachments',
      status: 'Status',
      requested_at: 'Requested At',
    };
    return headers[column] || column;
  };

  const renderCellContent = (request, column) => {
    switch (column) {
      case 'task':
        return (
          <div className="flex items-start max-w-md">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#028090] flex items-center justify-center text-white font-bold">
              {request.title?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div className="ml-3 flex-1">
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {request.title || 'Untitled Task'}
              </div>
              <div className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">
                {request.description || 'No description available'}
              </div>
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                Request #{request.id}
              </span>
            </div>
          </div>
        );
      
      case 'freelancer':
        const hasValidAvatar = request.freelancer_avatar && request.freelancer_avatar.trim() !== '';
        return (
          <div className="flex items-center">
            {hasValidAvatar ? (
              <img
                src={request.freelancer_avatar}
                alt={request.freelancer_name || 'Freelancer'}
                className="w-8 h-8 rounded-full mr-2 object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="avatar-fallback w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0"
              style={{ display: hasValidAvatar ? 'none' : 'flex' }}
            >
              {request.freelancer_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {request.freelancer_name || 'Unknown'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                @{request.freelancer_username || 'unknown'}
              </div>
            </div>
          </div>
        );
      
      case 'price':
        return (
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-[#028090]" />
            <span className="text-sm text-gray-900 font-medium">
              {formatCurrency(request.price)}
            </span>
          </div>
        );
      
      case 'duration':
        const hasDays = request.duration_days > 0;
        const hasHours = request.duration_hours > 0;
        
        return (
          <div className="text-sm text-gray-700">
            {hasDays && (
              <div className="flex items-center mb-1">
                <Calendar className="w-4 h-4 mr-1 text-[#028090]" />
                <span>{request.duration_days} {request.duration_days === 1 ? 'day' : 'days'}</span>
              </div>
            )}
            {hasHours && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-[#028090]" />
                <span>{request.duration_hours} {request.duration_hours === 1 ? 'hour' : 'hours'}</span>
              </div>
            )}
            {!hasDays && !hasHours && (
              <span className="text-gray-400">N/A</span>
            )}
          </div>
        );
      
      case 'category':
        return (
          <div className="text-sm text-gray-700">
            {request.category_name ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {request.category_name}
              </span>
            ) : (
              <span className="text-gray-400">N/A</span>
            )}
          </div>
        );
      
      case 'message':
        return (
          <div className="text-sm text-gray-700 max-w-xs">
            {request.message ? (
              <p className="line-clamp-2" title={request.message}>
                {request.message}
              </p>
            ) : (
              <span className="text-gray-400">No message</span>
            )}
          </div>
        );
      
      case 'attachments':
        return (
          <div className="text-sm text-gray-700">
            {request.attachments && request.attachments.length > 0 ? (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-[#028090]" />
                <span className="text-xs font-medium text-[#028090]">
                  {request.attachments.length} {request.attachments.length === 1 ? 'file' : 'files'}
                </span>
              </div>
            ) : (
              <span className="text-gray-400 text-xs">No files</span>
            )}
          </div>
        );
      
      case 'status':
        return getStatusBadge(request.request_status);
      
      case 'requested_at':
        return (
          <div className="text-sm text-gray-700">
            {formatDate(request.requested_at)}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028090] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Task Requests</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchTaskRequests}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Task Requests Yet</h3>
        <p className="text-gray-600 mb-4">You haven't requested any tasks yet.</p>
        <button className="px-6 py-2 bg-[#028090] text-white rounded-lg hover:bg-[#016d7a] transition-colors">
          Browse Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-[#028090]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">My Task Requests</h2>
            <p className="text-white text-opacity-80 text-sm mt-1">
              {requests.length} total {requests.length === 1 ? 'request' : 'requests'}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                >
                  {renderColumnHeader(column)}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4">
                    {renderCellContent(request, column)}
                  </td>
                ))}
                <td className="px-6 py-4 text-right relative">
                  <button
                    onClick={() => toggleDropdown(request.id)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {openDropdown === request.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenDropdown(null)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                          View Details
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          View Task
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Message Freelancer
                        </button>
                        <div className="border-t border-gray-200"></div>
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                          Cancel Request
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, requests.length)} of {requests.length} requests
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#028090] text-white hover:bg-[#016d7a]'
              }`}
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#028090] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#028090] text-white hover:bg-[#016d7a]'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskRequestsTable;