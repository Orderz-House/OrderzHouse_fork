import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Users, Edit3, CheckCircle, XCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function AdminProjectDetails() {
  const { token, userData } = useSelector((state) => state.auth);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [freelancersLoading, setFreelancersLoading] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [newFreelancerId, setNewFreelancerId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if user has role_id = 4
  useEffect(() => {
    if (userData?.role_id !== 4) {
      navigate("/admin/dashboard");
    }
  }, [userData, navigate]);

  // Fetch project details
  useEffect(() => {
    if (!token || !projectId || userData?.role_id !== 4) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.success) {
          setProject(response.data.project);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [token, projectId, userData]);

  // Fetch freelancers for reassignment
  const fetchFreelancers = async () => {
    if (!token || userData?.role_id !== 4) return;

    try {
      setFreelancersLoading(true);
      const response = await axios.get(`${API_BASE}/projects/admin/freelancers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setFreelancers(response.data.freelancers);
      }
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      setError("Failed to load freelancers");
    } finally {
      setFreelancersLoading(false);
    }
  };

  const handleReassign = async () => {
    if (!newFreelancerId) {
      setError("Please select a freelancer");
      return;
    }

    try {
      setReassigning(true);
      setError("");
      setSuccess("");

      const response = await axios.put(
        `${API_BASE}/projects/admin/projects/${projectId}/reassign`,
        { freelancerId: newFreelancerId },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (response.data.success) {
        setSuccess("Freelancer reassigned successfully");
        // Refresh project details
        const projectResponse = await axios.get(`${API_BASE}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (projectResponse.data.success) {
          setProject(projectResponse.data.project);
        }
        
        // Reset form
        setNewFreelancerId("");
      } else {
        throw new Error(response.data.message || "Failed to reassign freelancer");
      }
    } catch (err) {
      console.error("Error reassigning freelancer:", err);
      setError(err.message || "Failed to reassign freelancer");
    } finally {
      setReassigning(false);
    }
  };

  if (userData?.role_id !== 4) {
    return <div>Access denied. Only Admin Viewers can access this page.</div>;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading project details...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Project not found
        </div>
      </div>
    );
  }

  const isAdminProject = project.category_id === 999;
  const isGovernmentOrCV = isAdminProject && 
    (project.admin_category === 'Government Project' || project.admin_category === 'CV/Resume Project');
  
  // Fallback for projects created before admin_category column was added
  const projectAdminCategory = project.admin_category || 
    (project.title.includes('Government') ? 'Government Project' : 
     project.title.includes('CV') || project.title.includes('Resume') ? 'CV/Resume Project' : 
     'Other');

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin-role-4/dashboard")}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Project Details</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{project.title}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {isAdminProject ? "Admin Project" : "Regular Project"}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    {project.project_type}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Client</h3>
                <p className="mt-1 text-sm text-gray-900">{project.client_name || "N/A"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {project.budget ? `$${project.budget}` : 
                   project.hourly_rate ? `$${project.hourly_rate}/hour` : 
                   `$${project.budget_min} - $${project.budget_max}`}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {project.duration_days ? `${project.duration_days} days` : 
                   project.duration_hours ? `${project.duration_hours} hours` : 
                   "Not specified"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Freelancer Assignment */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Freelancer Assignment</h3>
            
            {project.assigned_freelancer_id ? (
              <div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {project.freelancer_name || "Freelancer"}
                    </p>
                    <p className="text-sm text-gray-500">Assigned</p>
                  </div>
                </div>
                
                {/* Reassign option for admin projects */}
                {isAdminProject && (
                  <div className="mt-4">
                    <button
                      onClick={fetchFreelancers}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Reassign Freelancer
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No freelancer assigned</p>
                {isAdminProject && (
                  <button
                    onClick={fetchFreelancers}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Assign Freelancer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Reassign Form (shown when reassigning) */}
          {freelancersLoading || freelancers.length > 0 ? (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {project.assigned_freelancer_id ? "Reassign Freelancer" : "Assign Freelancer"}
              </h3>
              
              {freelancersLoading ? (
                <div className="text-gray-500">Loading freelancers...</div>
              ) : (
                <div className="space-y-4">
                  <select
                    value={newFreelancerId}
                    onChange={(e) => setNewFreelancerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a freelancer</option>
                    {freelancers.map((freelancer) => (
                      <option key={freelancer.id} value={freelancer.id}>
                        {freelancer.username} ({freelancer.first_name} {freelancer.last_name})
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleReassign}
                      disabled={reassigning || !newFreelancerId}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {reassigning ? "Assigning..." : "Assign"}
                    </button>
                    <button
                      onClick={() => {
                        setFreelancers([]);
                        setNewFreelancerId("");
                      }}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Project Category Info */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Category</h3>
            
            {isAdminProject ? (
              <div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Admin Project</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This is an admin-created project with special handling.
                </p>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <XCircle className="h-5 w-5 mr-2" />
                <span>Regular Project</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}