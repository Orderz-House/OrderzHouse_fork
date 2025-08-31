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

} from "lucide-react";
import { useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getSocket } from "../../services/socketService";

const ManageProject = () => {
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

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        await axios.get(
          `http://localhost:5000/projects/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        ).then((projectRes) => {
          setProject(projectRes.data.project.rows[0]);
          setAssignments(projectRes.data.project.rows[0].assignments || []);
        }).catch((err) => {
          console.log("Manage Project ===>", err.message);
        });
        
        // Fetch offers (mock data for demonstration)
        const mockOffers = [
          {
            id: 1,
            freelancer: {
              id: 101,
              name: "John Doe",
              avatar: null,
              rating: 4.8,
              completed_projects: 24
            },
            proposal: "I have extensive experience in React and Node.js development...",
            bid_amount: 1200,
            delivery_time: "2 weeks",
            submitted_at: "2023-10-15T14:30:00Z",
            status: "pending"
          },
          {
            id: 2,
            freelancer: {
              id: 102,
              name: "Sarah Wilson",
              avatar: null,
              rating: 4.9,
              completed_projects: 32
            },
            proposal: "As a full-stack developer with 5+ years of experience...",
            bid_amount: 1500,
            delivery_time: "3 weeks",
            submitted_at: "2023-10-14T10:15:00Z",
            status: "pending"
          }
        ];
        setOffers(mockOffers);

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

  useEffect(() => {
    if (!socket || !projectId) return;

    const joinRoom = () => {
      socket.emit("join_room", { project_id: projectId });
    };

    const handleRoomJoined = (data) => {
      console.log("Successfully joined room:", data);
    };

    const handleJoinError = (data) => {
      console.error("Failed to join room:", data.error);
    };

    if (socket.connected) {
      setTimeout(joinRoom, 50);
    }

    socket.on("connect", joinRoom);

    const handleMessage = (data) => setMessages((prev) => [...prev, data]);
    const handleBlocked = (data) => alert(data.error);
    const handleError = (data) => console.error(data.error);

    socket.on("room_joined", handleRoomJoined);
    socket.on("join_error", handleJoinError);
    socket.on("message", handleMessage);
    socket.on("message_blocked", handleBlocked);
    socket.on("message_error", handleError);

    return () => {
      if (socket.connected) {
        socket.emit("leave_room", { project_id: projectId });
      }
      
      socket.off("connect", joinRoom);
      socket.off("room_joined", handleRoomJoined);
      socket.off("join_error", handleJoinError);
      socket.off("message", handleMessage);
      socket.off("message_blocked", handleBlocked);
      socket.off("message_error", handleError);
    };
  }, [socket, projectId]);

  useEffect(() => {
    if (!projectId || !token) return;

    const fetchMessages = async () => {
      try {
        await axios.get(
          `http://localhost:5000/chats/project/${projectId}/messages/`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).then((result) => {
          setMessages(result.data.messages.rows);
        }).catch((err) => {
          console.log(err);
        });
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [projectId, token]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectId);
    formData.append("sender_id", userData.id);
    formData.append("sender_type", userData.role_id === 1 || userData.role_id === 2 ? "client" : "freelancer");

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `http://localhost:5000/projects/${projectId}/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      setFiles([...files, res.data.file]);
      alert("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setIsSubmitting(false);
      setSelectedFile(null);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    setIsSubmitting(true);
    socket.emit("message", { text: newMessage, image_url: null });
    setNewMessage("");
    setIsSubmitting(false);
  };

  const handleAcceptOffer = (offerId) => {
    setOffers(offers.map(offer => 
      offer.id === offerId ? { ...offer, status: "accepted" } : offer
    ));
    alert("Offer accepted! Freelancer has been added to your team.");
  };

  const handleRejectOffer = (offerId) => {
    setOffers(offers.map(offer => 
      offer.id === offerId ? { ...offer, status: "rejected" } : offer
    ));
    alert("Offer rejected.");
  };

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Link to="/projects" className="text-blue-600 hover:text-blue-800 font-medium">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-sm text-gray-600">Project ID: {project.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : project.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status?.replace('_', ' ') || 'active'}
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
                Files ({files.length})
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
                Chat ({messages.length})
              </button>
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
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Project Details</h2>
                  <p className="text-gray-600">{project.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Budget</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ${project.budget_min} - ${project.budget_max}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">Duration</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">{project.duration}</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-800">Location</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">{project.location}</p>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-amber-600 mr-2" />
                      <span className="text-sm font-medium text-amber-800">Created</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Project Status</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        project.status === 'completed' 
                          ? 'bg-green-500' 
                          : project.status === 'in_progress'
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {project.status?.replace('_', ' ') || 'active'}
                      </span>
                    </div>
                    {project.is_deleted && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Deleted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === "files" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Project Files</h2>
                  <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isSubmitting}
                    />
                  </label>
                </div>

                {files.length === 0 ? (
                  <div className="text-center py-12">
                    <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No files uploaded yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload files to share with {userData.role_id === 1 || userData.role_id === 2 ? 'freelancers' : 'the client'}.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            File Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uploaded By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {files.map((file) => (
                          <tr key={file.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Paperclip className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">{file.file_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {file.sender_type === 'client' ? 'Client' : 'Freelancer'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(file.uploaded_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                <Download className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="flex flex-col h-150">
                <div ref={containerRef} className="flex-1 overflow-y-auto mb-4 space-y-4 p-2 max-h-96">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No messages yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Start a conversation about this project.
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === userData.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === userData.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === userData.id
                              ? 'text-blue-200'
                              : 'text-gray-500'
                          }`}>
                            {new Date(message.time_sent).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={isSubmitting || !newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === "teams" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Project Team</h2>
                  <span className="text-sm text-gray-600">
                    {assignments.filter(a => a.status === 'active').length} active members
                  </span>
                </div>

                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No team members yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {userData.role_id === 1 || userData.role_id === 2 
                        ? "Accept offers from freelancers to build your team." 
                        : "You haven't been assigned to this project yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assignments.map((assignment) => (
                      <div key={assignment.freelancer_id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {assignment.user.first_name} {assignment.user.last_name}
                              </h3>
                              <p className="text-sm text-gray-500">Freelancer</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            assignment.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.status}
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
                          <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Message
                          </button>
                          <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                            <User className="w-4 h-4 inline mr-1" />
                            Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Offers Tab */}
            {activeTab === "offers" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Freelancer Offers</h2>
                  <span className="text-sm text-gray-600">
                    {offers.filter(o => o.status === 'pending').length} pending offers
                  </span>
                </div>

                {offers.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No offers received yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Freelancers will submit offers for your project here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{offer.freelancer.name}</h3>
                              <div className="flex items-center mt-1">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                <span className="text-sm text-gray-600 mr-3">{offer.freelancer.rating}</span>
                                <Briefcase className="w-4 h-4 text-blue-500 mr-1" />
                                <span className="text-sm text-gray-600">{offer.freelancer.completed_projects} projects</span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            offer.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : offer.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {offer.status}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">{offer.proposal}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-blue-800">Bid Amount</div>
                            <div className="text-lg font-bold">${offer.bid_amount}</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-green-800">Delivery Time</div>
                            <div className="text-lg font-bold">{offer.delivery_time}</div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-4">
                          Submitted on {new Date(offer.submitted_at).toLocaleDateString()}
                        </div>
                        
                        {offer.status === 'pending' && (
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => handleAcceptOffer(offer.id)}
                              className="flex-1 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Accept Offer
                            </button>
                            <button 
                              onClick={() => handleRejectOffer(offer.id)}
                              className="flex-1 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject Offer
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProject;