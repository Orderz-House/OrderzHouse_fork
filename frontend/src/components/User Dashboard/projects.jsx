import React, { useState, useEffect } from 'react';
import { MoreVertical, Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';

const ProjectsTable = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeFilter, setActiveFilter] = useState('fixed');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 10;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/projects/mine', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
      } else {
        setError(data.message || 'Failed to fetch projects');
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
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
      bidding: { color: 'bg-purple-100 text-purple-800', icon: DollarSign, label: 'Bidding' },
      pending_payment: { color: 'bg-orange-100 text-orange-800', icon: DollarSign, label: 'Pending Payment' },
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

  const getCompletionColor = (completionStatus) => {
    switch (completionStatus) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'not_started':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };

  const getCompletionPercentage = (completionStatus) => {
    switch (completionStatus) {
      case 'completed':
        return 100;
      case 'in_progress':
        return 50;
      case 'not_started':
        return 0;
      default:
        return 0;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleDropdown = (projectId) => {
    setOpenDropdown(openDropdown === projectId ? null : projectId);
  };

  const filteredProjects = projects.filter(p => p.project_type === activeFilter);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const getColumnsForType = (type) => {
    const sharedColumns = ['project', 'category', 'status', 'freelancer', 'completion', 'requested', 'skills', 'created'];
    
    if (type === 'hourly') {
      return [...sharedColumns.slice(0, 2), 'hourly_rate', 'prepaid_hours', 'total_hours', 'remaining_time', ...sharedColumns.slice(2)];
    } else if (type === 'bidding') {
      return [...sharedColumns.slice(0, 2), 'budget_range', 'amount_to_pay', 'duration_days', 'remaining_time', ...sharedColumns.slice(2)];
    } else if (type === 'fixed') {
      return [...sharedColumns.slice(0, 2), 'budget', 'duration_days', 'remaining_time', ...sharedColumns.slice(2)];
    }
    return sharedColumns;
  };

  const renderColumnHeader = (column) => {
    const headers = {
      project: 'Project',
      category: 'Category',
      budget: 'Budget',
      budget_range: 'Budget Range',
      amount_to_pay: 'Amount to Pay',
      hourly_rate: 'Hourly Rate',
      prepaid_hours: 'Prepaid Hours',
      total_hours: 'Total Hours',
      duration_days: 'Duration',
      remaining_time: 'Time Remaining',
      status: 'Status',
      freelancer: 'Completed',
      completion: 'Completion',
      requested: 'Requested At',
      skills: 'Preferred Skills',
      created: 'Created',
    };
    return headers[column] || column;
  };

  const renderCellContent = (project, column) => {
    switch (column) {
      case 'project':
        return (
          <div className="flex items-start max-w-md">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#78c6a3] flex items-center justify-center text-white font-bold">
              {project.title.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 flex-1">
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {project.title}
              </div>
              <div className="text-xs text-gray-600 leading-relaxed mb-2">
                {project.description}
              </div>
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {project.project_type}
              </span>
            </div>
          </div>
        );
      
      case 'category':
        return (
          <div className="text-sm text-gray-700">
            {project.category_name || `Category #${project.category_id}`}
          </div>
        );
      
      case 'budget':
        return (
          <div className="text-sm text-gray-900 font-medium">
            {formatCurrency(project.budget)}
          </div>
        );
      
      case 'budget_range':
        return (
          <div className="text-sm text-gray-900 font-medium">
            {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}
          </div>
        );
      
      case 'amount_to_pay':
        return (
          <div className="text-sm text-gray-900 font-medium">
            {formatCurrency(project.amount_to_pay)}
          </div>
        );
      
      case 'hourly_rate':
        return (
          <div className="text-sm text-gray-900 font-medium">
            {formatCurrency(project.hourly_rate)}/hr
          </div>
        );
      
      case 'prepaid_hours':
        return (
          <div className="text-sm text-gray-700">
            <Clock className="w-4 h-4 inline mr-1 text-[#78c6a3]" />
            {project.prepaid_hours || 0} hrs
          </div>
        );
      
      case 'total_hours':
        return (
          <div className="text-sm text-gray-700">
            <Clock className="w-4 h-4 inline mr-1 text-[#78c6a3]" />
            {project.total_hours || 0} hrs
          </div>
        );
      
      case 'duration_days':
        return (
          <div className="text-sm text-gray-700">
            <Calendar className="w-4 h-4 inline mr-1 text-[#78c6a3]" />
            {project.duration_days || 0} days
          </div>
        );
      
      case 'remaining_time':
        const remainingDays = project.remaining_days;
        const remainingHours = project.remaining_hours;
        
        let timeColor = 'text-gray-700';
        let bgColor = 'bg-gray-50';
        let iconColor = 'text-gray-500';
        
        if (remainingDays !== undefined && remainingDays !== null) {
          if (remainingDays <= 0) {
            timeColor = 'text-red-700';
            bgColor = 'bg-red-50';
            iconColor = 'text-red-500';
          } else if (remainingDays <= 3) {
            timeColor = 'text-orange-700';
            bgColor = 'bg-orange-50';
            iconColor = 'text-orange-500';
          } else if (remainingDays <= 7) {
            timeColor = 'text-yellow-700';
            bgColor = 'bg-yellow-50';
            iconColor = 'text-yellow-500';
          } else {
            timeColor = 'text-green-700';
            bgColor = 'bg-green-50';
            iconColor = 'text-green-500';
          }
        }
        
        if (remainingHours !== undefined && remainingHours !== null) {
          if (remainingHours <= 0) {
            timeColor = 'text-red-700';
            bgColor = 'bg-red-50';
            iconColor = 'text-red-500';
          } else if (remainingHours <= 24) {
            timeColor = 'text-orange-700';
            bgColor = 'bg-orange-50';
            iconColor = 'text-orange-500';
          } else if (remainingHours <= 72) {
            timeColor = 'text-yellow-700';
            bgColor = 'bg-yellow-50';
            iconColor = 'text-yellow-500';
          } else {
            timeColor = 'text-green-700';
            bgColor = 'bg-green-50';
            iconColor = 'text-green-500';
          }
        }
        
        return (
          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${bgColor} ${timeColor}`}>
            <Clock className={`w-4 h-4 mr-1.5 ${iconColor}`} />
            {remainingDays !== undefined && remainingDays !== null ? (
              remainingDays <= 0 ? (
                <span>Overdue</span>
              ) : (
                <span>{Math.floor(remainingDays)} {Math.floor(remainingDays) === 1 ? 'day' : 'days'}</span>
              )
            ) : remainingHours !== undefined && remainingHours !== null ? (
              remainingHours <= 0 ? (
                <span>Overdue</span>
              ) : (
                <span>{Math.floor(remainingHours)} {Math.floor(remainingHours) === 1 ? 'hour' : 'hours'}</span>
              )
            ) : (
              <span className="text-gray-400">N/A</span>
            )}
          </div>
        );
      
      case 'status':
        return getStatusBadge(project.status);
      
      case 'freelancer':
        return (
          <div className="text-sm text-gray-700">
            {project.completed_by_freelancer ? (
              <span className="text-green-600 font-medium">✓ Yes</span>
            ) : (
              <span className="text-gray-400">No</span>
            )}
          </div>
        );
      
      case 'completion':
        return (
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-700 mr-2">
              {getCompletionPercentage(project.completion_status)}%
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
              <div
                className={`h-2 rounded-full transition-all ${getCompletionColor(project.completion_status)}`}
                style={{ width: `${getCompletionPercentage(project.completion_status)}%` }}
              ></div>
            </div>
          </div>
        );
      
      case 'requested':
        return (
          <div className="text-sm text-gray-700">
            {formatDate(project.completion_requested_at)}
          </div>
        );
      
      case 'skills':
        return (
          <div className="text-xs text-gray-600">
            {project.preferred_skills && project.preferred_skills.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {project.preferred_skills.slice(0, 2).map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[#78c6a3] text-white rounded">
                    {skill}
                  </span>
                ))}
                {project.preferred_skills.length > 2 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    +{project.preferred_skills.length - 2}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-400">None</span>
            )}
          </div>
        );
      
      case 'created':
        return (
          <div className="text-sm text-gray-700">
            {formatDate(project.created_at)}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#78c6a3] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Projects</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchProjects}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
        <p className="text-gray-600 mb-4">You haven't created any projects. Start by creating your first project!</p>
        <button className="px-6 py-2 bg-[#78c6a3] text-white rounded-lg hover:bg-[#66b392] transition-colors">
          Create Project
        </button>
      </div>
    );
  }

  const columns = getColumnsForType(activeFilter);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-[#78c6a3]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">My Projects</h2>
            <p className="text-white text-opacity-80 text-sm mt-1">
              {filteredProjects.length} {activeFilter} projects
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('fixed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'fixed'
                  ? 'bg-white text-[#78c6a3]'
                  : 'bg-[#66b392] text-white hover:bg-[#52a080]'
              }`}
            >
              Fixed
            </button>
            <button
              onClick={() => setActiveFilter('hourly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'hourly'
                  ? 'bg-white text-[#78c6a3]'
                  : 'bg-[#66b392] text-white hover:bg-[#52a080]'
              }`}
            >
              Hourly
            </button>
            <button
              onClick={() => setActiveFilter('bidding')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'bidding'
                  ? 'bg-white text-[#78c6a3]'
                  : 'bg-[#66b392] text-white hover:bg-[#52a080]'
              }`}
            >
              Bidding
            </button>
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
            {currentProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4">
                    {renderCellContent(project, column)}
                  </td>
                ))}
                <td className="px-6 py-4 text-right relative">
                  <button
                    onClick={() => toggleDropdown(project.id)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {openDropdown === project.id && (
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
                          Edit Project
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Mark Complete
                        </button>
                        <div className="border-t border-gray-200"></div>
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                          Delete Project
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#78c6a3] text-white hover:bg-[#66b392]'
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
                      ? 'bg-[#78c6a3] text-white'
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
                  : 'bg-[#78c6a3] text-white hover:bg-[#66b392]'
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

export default ProjectsTable;