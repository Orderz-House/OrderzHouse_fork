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
} from "lucide-react";

export const AdminVerificationPage = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
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
    const filtered = freelancers.filter(
      (freelancer) =>
        freelancer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFreelancers(filtered);
  }, [searchTerm, freelancers]);

  const handleVerify = async (id) => {
    if (!window.confirm("Are you sure you want to approve this freelancer?"))
      return;

    try {
      setActionLoading(id);
      await axios.patch(
        `http://localhost:5000/users/freelancers/${id}/verify`,
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
        `http://localhost:5000/users/freelancers/${id}/reject`,
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
                placeholder="Search freelancers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Filter className="w-5 h-5 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Freelancers List */}
        {filteredFreelancers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No matching freelancers found" : "No pending verifications"}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search terms"
                : "All freelancer verification requests have been processed"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFreelancers.map((freelancer) => (
              <div
                key={freelancer.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {freelancer.first_name} {freelancer.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">@{freelancer.username}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-sm truncate">{freelancer.email}</span>
                  </div>
                  {freelancer.country && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{freelancer.country}</span>
                    </div>
                  )}
                  {freelancer.skills && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {freelancer.skills.split(',').slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                      {freelancer.skills.split(',').length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{freelancer.skills.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerificationPage;