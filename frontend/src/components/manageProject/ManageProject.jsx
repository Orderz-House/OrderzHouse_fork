import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Paperclip,
  Users,
  CheckCircle,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import OverviewProject from "./OverviewProject";
import FileProject from "./FileProject";
import ChatProject from "./ChatProject";
import TeamProject from "./TeamProject";
import OffersProject from "./OffersProject";
import CompletionProject from "./CompletionProject";

const ManageProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { token , userData} = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        await axios
          .get(`http://localhost:5000/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((projectRes) => {
            setProject(projectRes.data.project.rows[0]);
            setAssignments(projectRes.data.project.rows[0].assignments || []);
            setOffers(projectRes.data.project.rows[0].offers);
          })
          .catch((err) => {
            console.log("Manage Project ===>", err.message);
          });
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The project you're looking for doesn't exist.
          </p>
          <Link
            to="/projects"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }
  const isProjectOwner = userData.id === project.user_id;
  // Check if current user is a freelancer assigned to this project
  const isAssignedFreelancer = assignments.some(
    assignment => assignment.freelancer_id === userData.id && assignment.status === "active"
  );
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
                  Project ID: {project.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : project.status === "in_progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {project.status?.replace("_", " ") || "active"}
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
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Overview
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
              {isProjectOwner && (
                <button
                  onClick={() => setActiveTab("teams")}
                  className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center whitespace-nowrap ${
                    activeTab === "teams"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Teams ({assignments.length})
                </button>
              )}

              {/* Only show Offers tab to project owner */}
              {isProjectOwner && (
                <button
                  onClick={() => setActiveTab("offers")}
                  className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center whitespace-nowrap ${
                    activeTab === "offers"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Offers ({offers.length})
                </button>
              )}

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
            {/* Overview Tab */}
            {activeTab === "overview" && <OverviewProject project={project} />}

            {/* Files Tab */}
            {activeTab === "files" && <FileProject project={project} />}

            {/* Chat Tab */}
            {activeTab === "chat" && <ChatProject project={project} />}

            {/* Teams Tab */}
            {activeTab === "teams" && <TeamProject project={project} />}

            {/* Offers Tab */}
            {activeTab === "offers" && (
              <OffersProject project={project} offers={offers} />
            )}

            {activeTab === "completion" && (
              <CompletionProject project={project} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProject;
