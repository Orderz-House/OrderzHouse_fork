import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  CheckCircle,
  XCircle,
  User,
  Mail,
  MapPin,
  UserCheck,
  Clock,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Award,
  Briefcase,
  Calendar,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

export const AdminVerificationPage = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const { token } = useSelector((s) => s.auth);

  const fetchPendingFreelancers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        "http://localhost:5000/users/freelancers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const freelancersData = Array.isArray(response.data.freelancers)
        ? response.data.freelancers
        : Array.isArray(response.data)
        ? response.data
        : [];

      // Filter only unverified freelancers
      const pending = freelancersData.filter((f) => f.is_verified === false);
      setFreelancers(pending);
      setFilteredFreelancers(pending);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch freelancers. Check your connection or permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingFreelancers();
  }, []);

  useEffect(() => {
    let filtered = freelancers.filter(
      (freelancer) =>
        freelancer.first_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        freelancer.last_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        freelancer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((freelancer) =>
        statusFilter === "pending"
          ? !freelancer.is_verified
          : freelancer.is_verified
      );
    }

    setFilteredFreelancers(filtered);
  }, [searchTerm, freelancers, statusFilter]);

  const handleVerify = async (id) => {
    if (!window.confirm("Are you sure you want to approve this freelancer?"))
      return;

    try {
      setActionLoading(id);
      await axios.patch(
        `http://localhost:5000/users/admin/freelancers/${id}/verify`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Freelancer verified successfully!");
      fetchPendingFreelancers();
    } catch (err) {
      console.error("Verify error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to verify freelancer. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this freelancer?"))
      return;

    try {
      setActionLoading(id);
      await axios.patch(
        `http://localhost:5000/users/admin/freelancers/${id}/reject`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Freelancer rejected successfully!");
      fetchPendingFreelancers();
    } catch (err) {
      console.error("Reject error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to reject freelancer. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const viewFreelancerDetails = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setShowDetailModal(true);
  };

  const downloadDocument = (documentUrl, documentName) => {
    const link = document.createElement("a");
    link.href = documentUrl;
    link.setAttribute("download", documentName || "document");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Freelancer Verifications
            </h1>
            <p className="text-gray-600 mt-2">
              Review and manage freelancer verification requests
            </p>
          </div>
          <div className="flex items-center space-x-2 text-blue-600">
            <Clock className="w-6 h-6" />
            <span className="font-semibold">
              {freelancers.length} Pending Verification
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search freelancers by name, email, skills, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        </div>

        {/* Freelancers List */}
        {filteredFreelancers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== "all"
                ? "No matching freelancers found"
                : "No pending verifications"}
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter terms"
                : "All freelancer verification requests have been processed"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFreelancers.map((freelancer) => (
              <div
                key={freelancer.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {freelancer.first_name} {freelancer.last_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          @{freelancer.username}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            <span className="truncate max-w-xs">
                              {freelancer.email}
                            </span>
                          </div>
                          {freelancer.country && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{freelancer.country}</span>
                            </div>
                          )}
                          {freelancer.years_experience && (
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1" />
                              <span>
                                {freelancer.years_experience} years experience
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          freelancer.is_verified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {freelancer.is_verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Skills Section */}
                  {freelancer.skills && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {freelancer.skills
                          .split(",")
                          .slice(0, 5)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        {freelancer.skills.split(",").length > 5 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            +{freelancer.skills.split(",").length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expandable Section */}
                  <div className="mt-4">
                    <button
                      onClick={() => toggleExpand(freelancer.id)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {expandedItems[freelancer.id] ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Show less details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Show more details
                        </>
                      )}
                    </button>

                    {expandedItems[freelancer.id] && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Bio */}
                          {freelancer.bio && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                About
                              </h4>
                              <p className="text-sm text-gray-600">
                                {freelancer.bio}
                              </p>
                            </div>
                          )}

                          {/* Education */}
                          {freelancer.education && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Education
                              </h4>
                              <p className="text-sm text-gray-600">
                                {freelancer.education}
                              </p>
                            </div>
                          )}

                          {/* Certifications */}
                          {freelancer.certifications && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Certifications
                              </h4>
                              <p className="text-sm text-gray-600">
                                {freelancer.certifications}
                              </p>
                            </div>
                          )}

                          {/* Documents */}
                          {(freelancer.resume_url ||
                            freelancer.portfolio_url) && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Documents
                              </h4>
                              <div className="space-y-2">
                                {freelancer.resume_url && (
                                  <button
                                    onClick={() =>
                                      downloadDocument(
                                        freelancer.resume_url,
                                        `${freelancer.username}_resume`
                                      )
                                    }
                                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download Resume
                                  </button>
                                )}
                                {freelancer.portfolio_url && (
                                  <button
                                    onClick={() =>
                                      window.open(
                                        freelancer.portfolio_url,
                                        "_blank"
                                      )
                                    }
                                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    View Portfolio
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => viewFreelancerDetails(freelancer)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    {!freelancer.is_verified && (
                      <>
                        <button
                          onClick={() => handleVerify(freelancer.id)}
                          disabled={actionLoading === freelancer.id}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {actionLoading === freelancer.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(freelancer.id)}
                          disabled={actionLoading === freelancer.id}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {actionLoading === freelancer.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Freelancer Detail Modal */}
        {showDetailModal && selectedFreelancer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Freelancer Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <p className="text-gray-900">
                        {selectedFreelancer.first_name}{" "}
                        {selectedFreelancer.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <p className="text-gray-900">
                        @{selectedFreelancer.username}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {selectedFreelancer.email}
                      </p>
                    </div>
                    {selectedFreelancer.country && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Country
                        </label>
                        <p className="text-gray-900">
                          {selectedFreelancer.country}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Professional Information
                  </h3>
                  <div className="space-y-3">
                    {selectedFreelancer.years_experience && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Experience
                        </label>
                        <p className="text-gray-900">
                          {selectedFreelancer.years_experience} years
                        </p>
                      </div>
                    )}
                    {selectedFreelancer.education && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Education
                        </label>
                        <p className="text-gray-900">
                          {selectedFreelancer.education}
                        </p>
                      </div>
                    )}
                    {selectedFreelancer.certifications && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Certifications
                        </label>
                        <p className="text-gray-900">
                          {selectedFreelancer.certifications}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {selectedFreelancer.skills && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFreelancer.skills
                        .split(",")
                        .map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedFreelancer.bio && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      About
                    </h3>
                    <p className="text-gray-700">{selectedFreelancer.bio}</p>
                  </div>
                )}

                {/* Documents */}
                {(selectedFreelancer.resume_url ||
                  selectedFreelancer.portfolio_url) && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Documents
                    </h3>
                    <div className="space-y-2">
                      {selectedFreelancer.resume_url && (
                        <button
                          onClick={() =>
                            downloadDocument(
                              selectedFreelancer.resume_url,
                              `${selectedFreelancer.username}_resume`
                            )
                          }
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download Resume
                        </button>
                      )}
                      {selectedFreelancer.portfolio_url && (
                        <button
                          onClick={() =>
                            window.open(
                              selectedFreelancer.portfolio_url,
                              "_blank"
                            )
                          }
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" />
                          View Portfolio
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
                {!selectedFreelancer.is_verified && (
                  <>
                    <button
                      onClick={() => {
                        handleVerify(selectedFreelancer.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedFreelancer.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerificationPage;
