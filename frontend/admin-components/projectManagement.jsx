import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Eye, Users, DollarSign, Clock, FileText, 
  AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

const AdminProjectsDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalBudget: 0
  });

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/projects/admin/all-projects');
      const projectList = data.projects || [];
      setProjects(projectList);
      setFilteredProjects(projectList);
      calculateStats(projectList);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/projects/admin/stats');
      const statsData = data.stats || {};
      setStats(prev => ({
        ...prev,
        available: parseInt(statsData.available_projects || 0),
        inProgress: parseInt(statsData.in_progress_projects || 0),
        completed: parseInt(statsData.completed_projects || 0),
        cancelled: parseInt(statsData.cancelled_projects || 0)
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculateStats = (projectList) => {
    const calculated = {
      total: projectList.length,
      totalBudget: projectList.reduce((sum, p) => sum + (p.budget_max || 0), 0)
    };
    setStats(prev => ({ ...prev, ...calculated }));
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    setFilteredProjects(filtered);
  };

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, selectedStatus, projects]);

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/projects/admin/project/${projectId}/status`, { status: newStatus });
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  // Project card
  const ProjectCard = ({ project }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              ${project.budget_min} - ${project.budget_max}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {project.assignments?.length || 0} assigned
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            project.status === 'available' ? 'bg-green-100 text-green-800' :
            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            project.status === 'completed' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {project.status}
          </span>
          <button 
            onClick={() => setSelectedProject(project)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Eye className="w-4 h-4" /> View Details
          </button>
        </div>
      </div>
    </div>
  );

  // Project details modal
  const ProjectDetails = ({ project }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{project.title}</h2>
          <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex gap-4 mb-6 border-b">
            {['overview', 'assignments', 'offers', 'payments', 'files'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 capitalize ${
                  activeTab === tab 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Project Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select 
                      value={project.status}
                      onChange={(e) => handleUpdateProjectStatus(project.id, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget Range</label>
                    <p className="mt-1 text-sm text-gray-900">${project.budget_min} - ${project.budget_max}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-900">{project.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects Management</h1>
        <p className="text-gray-600">Manage all platform projects, assignments, and payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Projects" value={stats.total} icon={FileText} color="text-blue-600" />
        <StatsCard title="Available" value={stats.available} icon={CheckCircle} color="text-green-600" />
        <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} color="text-yellow-600" />
        <StatsCard title="Completed" value={stats.completed} icon={CheckCircle} color="text-green-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Filter className="w-4 h-4" /> More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {selectedProject && <ProjectDetails project={selectedProject} />}
    </div>
  );
};

export default AdminProjectsDashboard;
