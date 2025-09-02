import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Paperclip,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Download,
  Upload,
  Send,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  X,
  User,
  Briefcase,
  Star,
  Mail,
  Phone,
  Award,
  LogOut,
  Info,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getSocket } from "../../services/socketService";
import OverviewProject from "./OverviewProject";
import FileProject from "./FileProject";
import ChatProject from "./ChatProject";

function TeamProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { token, userData } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [offers, setOffers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const socket = getSocket();
  const containerRef = useRef(null);
  const [showCompletionModal ,setShowCompletionModal] = useState(false);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [completionHistory, setCompletionHistory] = useState([]);
  const [isReleasingPayment, setIsReleasingPayment] = useState(false);


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
  


    const handleMemberFire = (freelancer_id, status)=>{
    console.log(freelancer_id, status);
   
    
    axios.put(`http://localhost:5000/projects/assigned/${projectId}`, 
      {freelancer_id, status},
      {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
  
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Project Team
        </h2>
        <span className="text-sm text-gray-600">
          {assignments.filter((a) => a.status === "active").length}{" "}
          active members
        </span>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No team members yet</p>
          <p className="text-sm text-gray-500 mt-2">
            {userData.role_id === 1 || userData.role_id === 2
              ? "Accept offers from freelancers to build your team."
              : "You haven't been assigned to this project yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Members Section */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Active Team Members
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments
                .filter((assignment) => assignment.status === "active")
                .map((assignment) => (
                  <div
                    key={assignment.freelancer_id}
                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {assignment.freelancer.first_name} {assignment.freelancer.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">Freelancer</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>4.8 rating</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 text-blue-500 mr-1" />
                        <span>24 projects</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors w-full"
                        onClick={() => handleMemberFire(assignment.freelancer.id, "kicked")}
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Remove from Project
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Fired Members Section - Only show if there are fired members */}
          {assignments.some((a) => a.status === "kicked") && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Former Team Members
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments
                  .filter((assignment) => assignment.status === "kicked")
                  .map((assignment) => (
                    <div
                      key={assignment.freelancer.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-5 opacity-70"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {assignment.freelancer.first_name}{" "}
                              {assignment.freelancer.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">Freelancer</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Removed
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span>4.8 rating</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 text-blue-500 mr-1" />
                          <span>24 projects</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TeamProject
