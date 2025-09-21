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
  Building
} from "lucide-react";

const FreelancerProjects = () => {
  const { token, userData } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    pending: 0,
    totalEarnings: 0
  });
  
  const navigate = useNavigate();

  // Fetch freelancer's projects with client details
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5000/projects/freelancer/projects/${userData.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (response.data && response.data.success && response.data.projects) {
          const projectsData = response.data.projects;
          
          setProjects(projectsData);
          setFilteredProjects(projectsData);
          
          // Calculate stats based on assignment_status
          const active = projectsData.filter(p => 
            p.assignment_status === 'in_progress' || 
            p.assignment_status === 'active' || 
            p.assignment_status === 'pending_review'
          ).length;
          
          const completed = projectsData.filter(p => 
            p.assignment_status === 'completed'
          ).length;
          
          const pending = projectsData.filter(p => 
            p.assignment_status === 'pending' || 
            p.assignment_status === 'pending_start'
          ).length;
          
          const totalEarnings = projectsData
            .filter(p => p.assignment_status === 'completed')
            .reduce((sum, project) => sum + (parseInt(project.budget) || 0), 0);
            
          setStats({ active, completed, pending, totalEarnings });
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && userData.id) {
      fetchProjects();
    }
  }, [token, userData.id]);

  // Filter and sort projects
  useEffect(() => {
    let result = [...projects];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (`${project.first_name} ${project.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        result = result.filter(project => 
          project.assignment_status === 'in_progress' || 
          project.assignment_status === 'active' || 
          project.assignment_status === 'pending_review'
        );
      } else if (statusFilter === "completed") {
        result = result.filter(project => project.assignment_status === 'completed');
      } else if (statusFilter === "pending") {
        result = result.filter(project => 
          project.assignment_status === 'pending' || 
          project.assignment_status === 'pending_start'
        );
      } else {
        result = result.filter(project => project.assignment_status === statusFilter);
      }
    }

    // Apply location filter
    if (locationFilter !== "all") {
      if (locationFilter === "remote") {
        result = result.filter(project => !project.location || project.location.toLowerCase() === "remote");
      } else {
        result = result.filter(project => project.location && project.location !== "remote");
      }
    }

    // Apply budget filter
    if (budgetFilter !== "all") {
      result = result.filter(project => {
        const budget = parseInt(project.budget) || 0;
        switch (budgetFilter) {
          case "under500": return budget < 500;
          case "500to2000": return budget >= 500 && budget <= 2000;
          case "2000to5000": return budget > 2000 && budget <= 5000;
          case "over5000": return budget > 5000;
          default: return true;
        }
      });
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      result = result.filter(project => {
        const createdDate = new Date(project.created_at);
        const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case "today": return diffDays === 0;
          case "week": return diffDays <= 7;
          case "month": return diffDays <= 30;
          case "quarter": return diffDays <= 90;
          default: return true;
        }
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "budget":
          aVal = parseInt(a.budget) || 0;
          bVal = parseInt(b.budget) || 0;
          break;
        case "duration_days":
          aVal = parseInt(a.duration_days) || 0;
          bVal = parseInt(b.duration_days) || 0;
          break;
        case "created_at":
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
          break;
        case "client":
          aVal = `${a.first_name} ${a.last_name}`.toLowerCase();
          bVal = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        default:
          aVal = a[sortField];
          bVal = b[sortField];
      }
      
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredProjects(result);
  }, [searchTerm, statusFilter, locationFilter, budgetFilter, dateFilter, sortField, sortDirection, projects]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { 
        color: "bg-green-50 text-green-700 border border-green-200", 
        text: "Active",
        icon: <PlayCircle className="w-3 h-3" />
      },
      in_progress: { 
        color: "bg-blue-50 text-blue-700 border border-blue-200", 
        text: "In Progress",
        icon: <PlayCircle className="w-3 h-3" />
      },
      pending_review: { 
        color: "bg-purple-50 text-purple-700 border border-purple-200", 
        text: "Pending Review",
        icon: <AlertTriangle className="w-3 h-3" />
      },
      completed: { 
        color: "bg-emerald-50 text-emerald-700 border border-emerald-200", 
        text: "Completed",
        icon: <CheckCircle2 className="w-3 h-3" />
      },
      pending: { 
        color: "bg-yellow-50 text-yellow-700 border border-yellow-200", 
        text: "Pending",
        icon: <Clock className="w-3 h-3" />
      },
      pending_start: { 
        color: "bg-orange-50 text-orange-700 border border-orange-200", 
        text: "Pending Start",
        icon: <PauseCircle className="w-3 h-3" />
      },
      quit: { 
        color: "bg-gray-50 text-gray-700 border border-gray-200", 
        text: "Withdrawn",
        icon: <LogOut className="w-3 h-3" />
      },
      kicked: { 
        color: "bg-red-50 text-red-700 border border-red-200", 
        text: "Removed",
        icon: <XCircle className="w-3 h-3" />
      },
      banned: { 
        color: "bg-red-50 text-red-700 border border-red-200", 
        text: "Banned",
        icon: <Ban className="w-3 h-3" />
      }
    };
    
    const config = statusConfig[status] || { 
      color: "bg-gray-50 text-gray-700 border border-gray-200", 
      text: status || "Unknown",
      icon: <Info className="w-3 h-3" />
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBudget = (budget) => {
    const amount = parseInt(budget) || 0;
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount}`;
  };

  const formatDuration = (days) => {
    const duration = parseInt(days) || 0;
    if (duration === 0) return "N/A";
    if (duration === 1) return "1 day";
    if (duration < 7) return `${duration} days`;
    if (duration < 30) return `${Math.round(duration / 7)} weeks`;
    return `${Math.round(duration / 30)} months`;
  };

  const canManageProject = (project) => {
    return project && project.assignment_status === 'active';
  };

  const handleProjectClick = (project) => {
    if (canManageProject(project)) {
      navigate(`/freelancer/project/${project.id}`);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortableHeader = ({ field, children }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md">
                <PlayCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-md">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Earnings</p>
                <p className="text-xl font-bold text-gray-900">${stats.totalEarnings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects or clients..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
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

            {/* Location Filter */}
            <div>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            {/* Budget Filter */}
            <div>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
              >
                <option value="all">All Budgets</option>
                <option value="under500">Under $500</option>
                <option value="500to2000">$500 - $2,000</option>
                <option value="2000to5000">$2,000 - $5,000</option>
                <option value="over5000">Over $5,000</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">Last 3 Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Projects Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" || locationFilter !== "all" || budgetFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your filters" 
                  : "You don't have any projects yet. Start bidding on projects to get work!"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link
                  to="/projects"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Projects
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <SortableHeader field="title">Project</SortableHeader>
                    <SortableHeader field="client">Client</SortableHeader>
                    <SortableHeader field="budget">Budget</SortableHeader>
                    <SortableHeader field="duration_days">Duration</SortableHeader>
                    <SortableHeader field="created_at">Created</SortableHeader>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {project.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {project.description || "No description provided"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">#{project.id}</span>
                            {project.category_id && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                                <Tag className="w-3 h-3" />
                                Cat {project.category_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {project.first_name && project.last_name ? 
                                `${project.first_name} ${project.last_name}` : 
                                'Unknown Client'
                              }
                            </p>
                            <p className="text-xs text-gray-500">
                              {project.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatBudget(project.budget)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {formatDuration(project.duration_days)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {formatDate(project.created_at)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        {getStatusBadge(project.assignment_status || project.status)}
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                          {project.location || "Remote"}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        {canManageProject(project) ? (
                          <button
                            onClick={() => handleProjectClick(project)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          >
                            <Eye className="w-3 h-3" />
                            Work
                          </button>
                        ) : (
                          <div className="text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                              <XCircle className="w-3 h-3" />
                              Restricted
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Enhanced Table Footer */}
        {filteredProjects.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <p>
                Showing <span className="font-medium text-gray-900">{filteredProjects.length}</span> of{' '}
                <span className="font-medium text-gray-900">{projects.length}</span> projects
              </p>
              {(searchTerm || statusFilter !== "all" || locationFilter !== "all" || budgetFilter !== "all" || dateFilter !== "all") && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setLocationFilter("all");
                    setBudgetFilter("all");
                    setDateFilter("all");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerProjects;