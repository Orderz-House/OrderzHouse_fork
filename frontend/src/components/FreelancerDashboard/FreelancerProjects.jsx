import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Clock,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  Briefcase,
  Star,
  MessageSquare,
  Bell,
  User
} from "lucide-react";

const FreelancerProjects = () => {
  const { token, userData } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    pending: 0,
    totalEarnings: 0
  });

  // Fetch freelancer's projects
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
          
          // Calculate stats based on completion_status
          const active = projectsData.filter(p => 
            p.completion_status === 'in_progress' || 
            p.completion_status === 'active' || 
            p.completion_status === 'pending_review'
          ).length;
          
          const completed = projectsData.filter(p => 
            p.completion_status === 'completed'
          ).length;
          
          const pending = projectsData.filter(p => 
            p.completion_status === 'pending' || 
            p.completion_status === 'pending_start'
          ).length;
          
          const totalEarnings = projectsData
            .filter(p => p.completion_status === 'completed')
            .reduce((sum, project) => sum + (parseInt(project.budget_max) || 0), 0);
            
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

  // Filter projects based on search and status
  useEffect(() => {
    let result = projects;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        result = result.filter(project => 
          project.completion_status === 'in_progress' || 
          project.completion_status === 'active' || 
          project.completion_status === 'pending_review'
        );
      } else if (statusFilter === "completed") {
        result = result.filter(project => project.completion_status === 'completed');
      } else if (statusFilter === "pending") {
        result = result.filter(project => 
          project.completion_status === 'pending' || 
          project.completion_status === 'pending_start'
        );
      }
    }
    
    setFilteredProjects(result);
  }, [searchTerm, statusFilter, projects]);

  const getStatusBadge = (completionStatus) => {
    const statusConfig = {
      active: { color: "bg-blue-100 text-blue-800", text: "Active" },
      in_progress: { color: "bg-blue-100 text-blue-800", text: "In Progress" },
      pending_review: { color: "bg-purple-100 text-purple-800", text: "Pending Review" },
      completed: { color: "bg-green-100 text-green-800", text: "Completed" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      pending_start: { color: "bg-yellow-100 text-yellow-800", text: "Pending Start" },
      overdue: { color: "bg-red-100 text-red-800", text: "Overdue" }
    };
    
    const config = statusConfig[completionStatus] || { color: "bg-gray-100 text-gray-800", text: completionStatus };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return "No deadline";
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  const getBudgetRange = (project) => {
    if (project.budget_min && project.budget_max) {
      return `$${project.budget_min} - $${project.budget_max}`;
    } else if (project.budget_min) {
      return `From $${project.budget_min}`;
    } else if (project.budget_max) {
      return `Up to $${project.budget_max}`;
    }
    return "Not specified";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-full">
              <User className="w-8 h-8" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold">Welcome back, {userData.name || 'Freelancer'}!</h2>
              <p className="text-blue-100 mt-1">You have {stats.active} active projects and earned ${stats.totalEarnings.toLocaleString()} so far.</p>
            </div>
          </div>
        </div>
         */}
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Active Projects</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Completed</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-600">Total Earnings</h3>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects by title or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-gray-400 mr-2" />
                <select 
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Projects</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "You don't have any projects yet. Start bidding on projects to get work!"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link
                  to="/projects"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Browse Projects
                </Link>
              )}
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {project.description || "No description provided"}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {getStatusBadge(project.completion_status || project.status)}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>{getBudgetRange(project)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{project.duration || "Duration not specified"}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{getDaysRemaining(project.deadline)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                      <Link
                        to={`/manage-project/${project.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        Manage Project
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium">Client ID: </span>
                      <span className="ml-1">{project.user_id}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Location: </span>
                      <span className="ml-1">{project.location || "Remote"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerProjects;