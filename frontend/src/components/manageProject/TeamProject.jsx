import { useState, useEffect } from "react";
import {
  User,
  Users,
  Star,
  Briefcase,
  LogOut,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  MessageSquare
} from "lucide-react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";

function TeamProject() {
  const { projectId } = useParams();
  const { token, userData } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingMembers, setProcessingMembers] = useState(new Set());
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'inactive'

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const projectData = response.data.project.rows[0];
        setAssignments(projectData.assignments || []);
      } catch (error) {
        console.error("Error fetching project data:", error);
        alert("Failed to load project data");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId && token) {
      fetchProjectData();
    }
  }, [projectId, token]);

  const handleMemberFire = async (freelancerId, status) => {
    // Add to processing set to show loading state
    setProcessingMembers(prev => new Set(prev).add(freelancerId));
    
    try {
      // Optimistically update the UI
      const updatedAssignments = assignments.map(assignment => 
        assignment.freelancer.id === freelancerId 
          ? { ...assignment, status } 
          : assignment
      );
      setAssignments(updatedAssignments);
      
      // Make API call
      await axios.put(
        `http://localhost:5000/projects/assigned/${projectId}`, 
        { freelancer_id: freelancerId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error updating member status:", error);
      // Revert on error - refetch data
      const response = await axios.get(`http://localhost:5000/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(response.data.project.rows[0].assignments || []);
    } finally {
      // Remove from processing set
      setProcessingMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(freelancerId);
        return newSet;
      });
    }
  };

  const activeMembers = assignments.filter(a => a.status === "active");
  const inactiveMembers = assignments.filter(a => a.status !== "active");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Project Team
        </h2>
        <div className="flex items-center space-x-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {assignments.length} total members
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
            <UserCheck className="w-4 h-4 mr-1" />
            {activeMembers.length} active
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Active Members
            <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs">
              {activeMembers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'inactive'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserX className="w-4 h-4 mr-2" />
            Former Members
            <span className="ml-2 bg-gray-100 text-gray-800 py-0.5 px-2 rounded-full text-xs">
              {inactiveMembers.length}
            </span>
          </button>
        </nav>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No team members yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {userData.role_id === 1 || userData.role_id === 2
              ? "Accept offers from freelancers to build your team."
              : "You haven't been assigned to this project yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Members Section */}
          {activeTab === 'active' && (
            <div>
              {activeMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeMembers.map((assignment) => {
                    const isProcessing = processingMembers.has(assignment.freelancer.id);
                    return (
                      <div
                        key={assignment.freelancer.id}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 relative overflow-hidden"
                      >
                        {isProcessing && (
                          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {assignment.freelancer.first_name} {assignment.freelancer.last_name}
                              </h3>
                              <p className="text-sm text-gray-500">Freelancer</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span>{assignment.freelancer.rating || "No rating"}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Briefcase className="w-4 h-4 text-blue-500 mr-1" />
                            <span>{assignment.freelancer.completed_projects || 0} projects</span>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="truncate">{assignment.freelancer.email}</span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleMemberFire(assignment.freelancer.id, "kicked")}
                            disabled={isProcessing}
                          >
                            <LogOut className="w-4 h-4 mr-1" />
                            Remove from Project
                          </button>
                          <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  <UserX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No active team members</h3>
                  <p className="text-gray-500">
                    All team members are currently inactive.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Inactive Members Section */}
          {activeTab === 'inactive' && (
            <div>
              {inactiveMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inactiveMembers.map((assignment) => (
                    <div
                      key={assignment.freelancer.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-6 opacity-80"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {assignment.freelancer.first_name} {assignment.freelancer.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">Freelancer</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center">
                          <XCircle className="w-3 h-3 mr-1" />
                          {assignment.status === "kicked" ? "Removed" : "Inactive"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span>{assignment.freelancer.rating || "No rating"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 text-blue-500 mr-1" />
                          <span>{assignment.freelancer.completed_projects || 0} projects</span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="truncate">{assignment.freelancer.email}</span>
                      </div>

                      {assignment.status === "kicked" && (
                        <div className="text-xs text-gray-500 italic">
                          Removed from project
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No former team members</h3>
                  <p className="text-gray-500">
                    All team members are currently active.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TeamProject;