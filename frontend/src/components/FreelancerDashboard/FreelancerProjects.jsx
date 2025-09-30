import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Search,
  Filter,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Info,
  Ban,
  LogOut,
  Eye,
  User,
  MapPin,
  Briefcase,
  SortAsc,
  SortDesc,
  ChevronDown,
  Tag,
  Hash,
  Trophy,
  MoreHorizontal,
  RefreshCw,
  TrendingUp,
  Calendar as CalendarIcon,
  Timer,
  AlertCircle
} from "lucide-react";

const FreelancerProjects = () => {
  const { token, userData } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Stats
  const [projectStats, setProjectStats] = useState({
    active: 0,
    completed: 0,
    pending: 0,
    quit: 0,
    kicked: 0,
    banned: 0
  });
  
  const navigate = useNavigate();

  // Fetch freelancer's projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!token || !userData?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(
          `http://localhost:5000/projects/freelancer/projects/${userData.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (response.data?.success && response.data?.projects) {
          setProjects(response.data.projects);
          setFilteredProjects(response.data.projects);
          
          // Calculate stats from the fetched projects
          const stats = {
            active: 0,
            completed: 0,
            pending: 0,
            quit: 0,
            kicked: 0,
            banned: 0
          };
          
          response.data.projects.forEach(project => {
            const status = project.assignment_status;
            if (Object.prototype.hasOwnProperty.call(stats, status)) {
              stats[status]++;
            }
          });
          
          setProjectStats(stats);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError(error.response?.data?.message || "Failed to fetch projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [token, userData?.id]);

  // Filter and sort projects
  useEffect(() => {
    let result = [...projects];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(project => 
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${project.client_first_name || ''} ${project.client_last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(project => project.assignment_status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case "title":
          aVal = a.title?.toLowerCase() || '';
          bVal = b.title?.toLowerCase() || '';
          break;
        case "budget":
          aVal = parseInt(a.budget) || 0;
          bVal = parseInt(b.budget) || 0;
          break;
        case "duration":
          aVal = parseInt(a.duration_days) || 0;
          bVal = parseInt(b.duration_days) || 0;
          break;
        case "assigned_at":
          aVal = a.assigned_at ? new Date(a.assigned_at) : new Date(0);
          bVal = b.assigned_at ? new Date(b.assigned_at) : new Date(0);
          break;
        case "client":
          aVal = (a.client_name || `${a.client_first_name || ''} ${a.client_last_name || ''}`).toLowerCase();
          bVal = (b.client_name || `${b.client_first_name || ''} ${b.client_last_name || ''}`).toLowerCase();
          break;
        case "deadline":
          aVal = a.deadline_date ? new Date(a.deadline_date) : new Date(0);
          bVal = b.deadline_date ? new Date(b.deadline_date) : new Date(0);
          break;
        case "remaining_days":
          aVal = a.remaining_days !== null ? a.remaining_days : Infinity;
          bVal = b.remaining_days !== null ? b.remaining_days : Infinity;
          break;
        default:
          aVal = a[sortField] || '';
          bVal = b[sortField] || '';
      }
      
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredProjects(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortField, sortDirection, projects]);

  // Status badge configuration
  const getStatusConfig = (status) => {
    const configs = {
      active: { 
        color: "bg-green-50 text-green-700 border-green-200", 
        text: "Active",
        icon: <PlayCircle className="w-3 h-3" />
      },
      completed: { 
        color: "bg-emerald-50 text-emerald-700 border-emerald-200", 
        text: "Completed",
        icon: <CheckCircle2 className="w-3 h-3" />
      },
      pending: { 
        color: "bg-yellow-50 text-yellow-700 border-yellow-200", 
        text: "Pending",
        icon: <Clock className="w-3 h-3" />
      },
      quit: { 
        color: "bg-gray-50 text-gray-700 border-gray-200", 
        text: "Withdrawn",
        icon: <LogOut className="w-3 h-3" />
      },
      kicked: { 
        color: "bg-red-50 text-red-700 border-red-200", 
        text: "Removed",
        icon: <XCircle className="w-3 h-3" />
      },
      banned: { 
        color: "bg-red-50 text-red-700 border-red-200", 
        text: "Banned",
        icon: <Ban className="w-3 h-3" />
      }
    };
    
    return configs[status] || { 
      color: "bg-gray-50 text-gray-700 border-gray-200", 
      text: status || "Unknown",
      icon: <Info className="w-3 h-3" />
    };
  };

  const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  // Remaining days badge component
  const RemainingDaysBadge = ({ project }) => {
    if (project.remaining_days === null || project.assignment_status !== 'active') {
      return null;
    }

    const { remaining_days } = project;
    let badgeClass, icon;

    if (remaining_days > 3) {
      badgeClass = "bg-green-50 text-green-700 border-green-200";
      icon = <Timer className="w-3 h-3" />;
    } else if (remaining_days > 0) {
      badgeClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
      icon = <AlertTriangle className="w-3 h-3" />;
    } else if (remaining_days === 0) {
      badgeClass = "bg-orange-50 text-orange-700 border-orange-200";
      icon = <AlertCircle className="w-3 h-3" />;
    } else {
      badgeClass = "bg-red-50 text-red-700 border-red-200";
      icon = <AlertCircle className="w-3 h-3" />;
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}>
        {icon}
        {project.status_note}
      </span>
    );
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const formatBudget = (budget) => {
    const amount = parseInt(budget) || 0;
    
    const formatAmount = (amount) => 
      amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount.toString();
    
    return `$${formatAmount(amount)}`;
  };

  const formatDuration = (days) => {
    const duration = parseInt(days) || 0;
    if (duration === 0) return "N/A";
    if (duration === 1) return "1 day";
    if (duration < 7) return `${duration} days`;
    if (duration < 30) return `${Math.round(duration / 7)} weeks`;
    return `${Math.round(duration / 30)} months`;
  };

  // Event handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleProjectClick = (project) => {
    if (project.assignment_status === 'active') {
      navigate(`/freelancer/project/${project.id}`);
    }
  };

  const handleQuitProject = async (projectId) => {
    if (!confirm('Are you sure you want to quit this project?')) return;
    
    try {
      const response = await axios.post(
        `http://localhost:5000/projects/${projectId}/quit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Refresh projects
        const updatedProjects = projects.map(p => 
          p.id === projectId 
            ? { ...p, assignment_status: 'quit' }
            : p
        );
        setProjects(updatedProjects);
      }
    } catch (error) {
      console.error('Error quitting project:', error);
      alert('Failed to quit project. Please try again.');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const SortableHeader = ({ field, children, className = "" }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === "asc" ? 
            <SortAsc className="w-3 h-3" /> : 
            <SortDesc className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Projects</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <Search className="w-4 h-4" />
                Browse Projects
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-green-600">
                  {projectStats.active || 0}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-md">
                <PlayCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {projectStats.completed || 0}
                </p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {projects.length > 0 
                    ? Math.round((projectStats.completed / projects.length) * 100)
                    : 0}%
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-md">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.length}
                </p>
              </div>
              <div className="p-2 bg-gray-100 rounded-md">
                <Trophy className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects, clients, or descriptions..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="quit">Withdrawn</option>
                <option value="kicked">Removed</option>
              </select>
            </div>
            
            {/* Items per page */}
            <div className="w-full sm:w-32">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
          
          {/* Clear filters */}
          {(searchTerm || statusFilter !== "all") && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" 
                  ? "No projects match your filters" 
                  : "No projects found"
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria" 
                  : "Start bidding on projects to build your portfolio!"}
              </p>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Search className="w-4 h-4" />
                Browse Available Projects
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        #
                      </th>
                      <SortableHeader field="title">
                        <FileText className="w-3 h-3" />
                        Project
                      </SortableHeader>
                      <SortableHeader field="client">
                        <User className="w-3 h-3" />
                        Client
                      </SortableHeader>
                      <SortableHeader field="budget">
                        <DollarSign className="w-3 h-3" />
                        Budget
                      </SortableHeader>
                      <SortableHeader field="duration">
                        <Clock className="w-3 h-3" />
                        Duration
                      </SortableHeader>
                      <SortableHeader field="deadline">
                        <CalendarIcon className="w-3 h-3" />
                        Deadline
                      </SortableHeader>
                      <SortableHeader field="remaining_days">
                        <Timer className="w-3 h-3" />
                        Time Left
                      </SortableHeader>
                      <SortableHeader field="assigned_at">
                        <CalendarIcon className="w-3 h-3" />
                        Assigned to Me
                      </SortableHeader>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentProjects.map((project, index) => (
                      <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {startIndex + index + 1}
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="max-w-xs">
                            <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                              {project.title}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {project.description || "No description provided"}
                            </p>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {/* Avatar / Initial */}
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 text-white text-sm font-semibold">
                              {project.client_first_name 
                                ? project.client_first_name.charAt(0).toUpperCase() 
                                : 'U'}
                            </div>
                            
                            {/* Client Info */}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {project.client_name || 
                                 `${project.client_first_name || ''} ${project.client_last_name || ''}`.trim() || 
                                 'Unknown Client'}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                @{project.client_username || 'no-username'}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {project.client_email || 'no-email'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatBudget(project.budget)}
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDuration(project.duration_days)}
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(project.deadline_date)}
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            {project.remaining_days !== null ? (
                              <span className={`font-medium ${
                                project.remaining_days > 3 ? 'text-green-600' :
                                project.remaining_days > 0 ? 'text-yellow-600' :
                                project.remaining_days === 0 ? 'text-orange-600' :
                                'text-red-600'
                              }`}>
                                {project.remaining_days > 0 ? `${project.remaining_days} days` :
                                 project.remaining_days === 0 ? 'Due today' :
                                 `${Math.abs(project.remaining_days)} days overdue`}
                              </span>
                            ) : (
                              <span className="text-gray-500">Not started</span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(project.assigned_at)}
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <StatusBadge status={project.assignment_status} />
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {project.assignment_status === 'active' ? (
                              <>
                                <button
                                  onClick={() => handleProjectClick(project)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  Work
                                </button>
                                <div className="relative group">
                                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    <div className="py-1">
                                      <button
                                        onClick={() => handleProjectClick(project)}
                                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                                      >
                                        View Project
                                      </button>
                                      <button
                                        onClick={() => handleQuitProject(project.id)}
                                        className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                                      >
                                        Quit Project
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-gray-500">
                                No actions available
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(endIndex, filteredProjects.length)}</span> of{' '}
                        <span className="font-medium">{filteredProjects.length}</span> results
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="h-5 w-5 rotate-90" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                : 'text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="h-5 w-5 -rotate-90" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerProjects;