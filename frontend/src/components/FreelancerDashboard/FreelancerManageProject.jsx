import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Paperclip,
  CheckCircle,
  AlertCircle,
  XCircle,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ChatProject from "../manageProject/ChatProject";
import FileProject from "../manageProject/FileProject";
import CompletionProject from "../manageProject/CompletionProject";

const FreelancerManageProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { token, userData } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("chat");
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isQuitting, setIsQuitting] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5000/projects/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (response.data && response.data.project) {
          setProject(response.data.project);
        }
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

  const handleMarkCompleted = async () => {
    try {
      setIsCompleting(true);
      // API call to mark project as completed
      await axios.post(
        `http://localhost:5000/projects/${projectId}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      alert("Project marked as completed successfully!");
      // Refresh project data
      const response = await axios.get(
        `http://localhost:5000/projects/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProject(response.data.project.rows[0]);
    } catch (error) {
      console.error("Error completing project:", error);
      alert("Failed to mark project as completed");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleQuitProject = async () => {
    try {
      setIsQuitting(true);
      // API call to quit project
      await axios.post(
        `http://localhost:5000/projects/${projectId}/quit`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      alert("You have successfully withdrawn from the project.");
      setShowQuitDialog(false);
      navigate(-1); // Redirect to projects list
    } catch (error) {
      console.error("Error quitting project:", error);
      alert("Failed to withdraw from project");
    } finally {
      setIsQuitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link
            to="/freelancer/projects"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to My Projects
          </Link>
        </div>
      </div>
    );
  }

  // Check if project is already completed
  const isCompleted = project.status === "completed";
  // Check if freelancer has already quit
  const hasQuit = project.assignments && 
                  project.assignments.some(a => a.freelancer_id === userData.id && a.status === "quit");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Project ID: {project.id} | Client ID: {project.user_id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isCompleted
                    ? "bg-green-100 text-green-800"
                    : hasQuit
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {isCompleted ? "Completed" : hasQuit ? "Withdrawn" : "Active"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab("chat")}
                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center whitespace-nowrap ${
                  activeTab === "chat"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center whitespace-nowrap ${
                  activeTab === "files"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Files
              </button>
              <button
                onClick={() => setActiveTab("completion")}
                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center whitespace-nowrap ${
                  activeTab === "completion"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Completion
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Chat Tab */}
            {activeTab === "chat" && <ChatProject project={project}/>}

            {/* Files Tab */}
            {activeTab === "files" && <FileProject project={project}/>}

            {/* Completion Tab */}
            {activeTab === "completion" && <CompletionProject project={project}/>}
          </div>
        </div>
      </div>


    </div>
  );
};

export default FreelancerManageProject;