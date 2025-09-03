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
  ArrowRight,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Info,
  Ban,
  LogOut,
  Shield
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
  
  const navigate = useNavigate();

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
          console.log(response);
          
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
      }
    }
    
    setFilteredProjects(result);
  }, [searchTerm, statusFilter, projects]);

  const getStatusBadge = (completionStatus) => {
    const statusConfig = {
      active: { 
        color: "bg-blue-100 text-blue-800 border border-blue-200", 
        text: "Active",
        icon: <PlayCircle className="w-4 h-4 mr-1" />
      },
      in_progress: { 
        color: "bg-blue-100 text-blue-800 border border-blue-200", 
        text: "In Progress",
        icon: <PlayCircle className="w-4 h-4 mr-1" />
      },
      pending_review: { 
        color: "bg-purple-100 text-purple-800 border border-purple-200", 
        text: "Pending Review",
        icon: <AlertTriangle className="w-4 h-4 mr-1" />
      },
      completed: { 
        color: "bg-green-100 text-green-800 border border-green-200", 
        text: "Completed",
        icon: <CheckCircle2 className="w-4 h-4 mr-1" />
      },
      pending: { 
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200", 
        text: "Pending",
        icon: <PauseCircle className="w-4 h-4 mr-1" />
      },
      pending_start: { 
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200", 
        text: "Pending Start",
        icon: <PauseCircle className="w-4 h-4 mr-1" />
      },
      overdue: { 
        color: "bg-red-100 text-red-800 border border-red-200", 
        text: "Overdue",
        icon: <AlertTriangle className="w-4 h-4 mr-1" />
      }
    };
    
    const config = statusConfig[completionStatus] || { 
      color: "bg-gray-100 text-gray-800 border border-gray-200", 
      text: completionStatus,
      icon: <AlertTriangle className="w-4 h-4 mr-1" />
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const getAssignmentStatusBadge = (assignmentStatus) => {
    const statusConfig = {
      active: { 
        color: "bg-green-100 text-green-800 border border-green-200", 
        text: "Active",
        icon: <PlayCircle className="w-4 h-4 mr-1" />,
        tooltip: "You are actively working on this project"
      },
      quit: { 
        color: "bg-gray-100 text-gray-800 border border-gray-200", 
        text: "Withdrawn",
        icon: <LogOut className="w-4 h-4 mr-1" />,
        tooltip: "You've withdrawn from this project"
      },
      kicked: { 
        color: "bg-orange-100 text-orange-800 border border-orange-200", 
        text: "Removed by Client",
        icon: <XCircle className="w-4 h-4 mr-1" />,
        tooltip: "The client removed you from this project"
      },
      banned: { 
        color: "bg-red-100 text-red-800 border border-red-200", 
        text: "Banned",
        icon: <Ban className="w-4 h-4 mr-1" />,
        tooltip: "You've been banned from this project by admin"
      },
      completed: { 
        color: "bg-purple-100 text-purple-800 border border-purple-200", 
        text: "Completed",
        icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
        tooltip: "This project has been completed"
      }
    };
    
    const config = statusConfig[assignmentStatus] || { 
      color: "bg-gray-100 text-gray-800 border border-gray-200", 
      text: assignmentStatus || "Not assigned",
      icon: <Info className="w-4 h-4 mr-1" />,
      tooltip: "Assignment status unknown"
    };
    
    return (
      <div className="relative group">
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${config.color}`}>
          {config.icon}
          {config.text}
        </span>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded-md p-2 z-10">
          {config.tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-gray-800 border-t-gray-800"></div>
        </div>
      </div>
    );
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return "No deadline";
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <span className="text-red-600 font-medium">Overdue by {-diffDays} days</span>;
    if (diffDays === 0) return <span className="text-orange-600 font-medium">Due today</span>;
    if (diffDays === 1) return <span className="text-orange-600 font-medium">Due tomorrow</span>;
    if (diffDays <= 7) return <span className="text-orange-500">Due in {diffDays} days</span>;
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

  const canManageProject = (project) => {
    // Only allow access if project assignment status is active
    return project && 
           project.assignment_status === 'active';
  };

  const handleProjectClick = (project) => {
    if (canManageProject(project)) {
      navigate(`/freelancer/project/${project.id}`);
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects by title or description..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-2">
                <Filter className="w-5 h-5 text-gray-600 mr-2" />
                <select 
                  className="bg-transparent border-none focus:ring-0 text-gray-700"
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
              <div 
                key={project.id} 
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow duration-200 ${
                  canManageProject(project) 
                    ? "cursor-pointer hover:shadow-md hover:border-blue-200" 
                    : "opacity-80"
                }`}
                onClick={() => handleProjectClick(project)}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                            {getStatusBadge(project.assignment_status || project.status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {project.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">Budget:</span>
                          <span className="ml-1">{getBudgetRange(project)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          <Clock className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">Duration:</span>
                          <span className="ml-1">{project.duration || "Not specified"}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">Deadline:</span>
                          <span className="ml-1">{getDaysRemaining(project.deadline)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                      {canManageProject(project) ? (
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          Work on Project
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      ) : (
                        <div className="flex flex-col items-center text-sm text-yellow-700 bg-yellow-50 rounded-md px-3 py-2">
                          <div className="flex items-center">
                            <XCircle className="w-4 h-4 mr-1" />
                            <span>Access unavailable</span>
                          </div>
                          <span className="text-xs mt-1">
                            {project?.assignment_status === 'quit' && 'You withdrew from this project'}
                            {project?.assignment_status === 'kicked' && 'Client removed you from this project'}
                            {project?.assignment_status === 'banned' && 'Admin banned you from this project'}
                            {project?.assignment_status === 'completed' && 'Project has been completed'}
                            {!project?.assignment_status && 'Not assigned to this project'}
                            {console.log(project)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-600">
                    <div className="flex items-center mb-2 md:mb-0">
                      <span className="font-medium">Client ID: </span>
                      <span className="ml-1">{project.user_id}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Location: </span>
                      <span className="ml-1">{project.location || "Remote"}</span>
                    </div>
                    <div className="flex items-center mt-2 md:mt-0">
                      <span className="font-medium">Assignment: </span>
                      <span className="ml-2">
                        {getAssignmentStatusBadge(project?.assignment_status)}
                      </span>
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