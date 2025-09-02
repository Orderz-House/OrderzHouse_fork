// AllFreeLance.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFreelancers,
  setSearchTerm,
  setSelectedCountry,
  clearError,
} from "../../slice/freeLance";
import {
  Star,
  MapPin,
  Briefcase,
  Calendar,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AllFreeLance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access the correct state structure - adjust this based on your actual Redux state
  const { freelancers, loading, error, searchTerm, selectedCountry } =
    useSelector((state) => state.freelance || {});

  useEffect(() => {
    dispatch(fetchAllFreelancers());
  }, [dispatch]);

  // Handle different possible structures of the freelancers data
  let safeFreelancers = [];

  if (Array.isArray(freelancers)) {
    // If freelancers is directly an array
    safeFreelancers = freelancers;
  } else if (freelancers && Array.isArray(freelancers.freelancers)) {
    // If freelancers is an object with a freelancers array property
    safeFreelancers = freelancers.freelancers;
  } else if (freelancers && Array.isArray(freelancers.data)) {
    // If freelancers is an object with a data array property
    safeFreelancers = freelancers.data;
  }

  // Filter freelancers based on search term and country
  const filteredFreelancers = safeFreelancers.filter((freelancer) => {
    // Add null checks for all properties
    const firstName = freelancer?.first_name || "";
    const lastName = freelancer?.last_name || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase().trim();
    const username = (freelancer?.username || "").toLowerCase();
    const email = (freelancer?.email || "").toLowerCase();
    const country = (freelancer?.country || "").toLowerCase();

    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      username.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase());

    const matchesCountry =
      selectedCountry === "all" || country === selectedCountry.toLowerCase();

    return matchesSearch && matchesCountry;
  });

  // Extract unique countries for filter with safety checks
  const countries = [
    "all",
    ...new Set(
      safeFreelancers
        .map((f) => f?.country)
        .filter((country) => country && typeof country === "string")
    ),
  ];

  const handleSearchChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleCountryChange = (e) => {
    dispatch(setSelectedCountry(e.target.value));
  };

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchAllFreelancers());
  };

  const handleViewProfile = (freelancerId) => {
    navigate(`/freelancer/profile/${freelancerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading all freelancers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Freelancers
          </h2>
          <p className="text-gray-600 mb-4">{error.message || String(error)}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            All Freelancers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our complete directory of all registered freelancers
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search freelancers by name, username, or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="w-full md:w-auto">
              <select
                value={selectedCountry}
                onChange={handleCountryChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country === "all" ? "All Countries" : country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredFreelancers.length} of {safeFreelancers.length}{" "}
            freelancers
          </p>
        </div>

        {/* Freelancers Grid */}
        {filteredFreelancers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {safeFreelancers.length === 0
                ? "No freelancers available"
                : "No freelancers found"}
            </h3>
            <p className="text-gray-600">
              {safeFreelancers.length === 0
                ? "There are currently no freelancers in the system."
                : "Try adjusting your search criteria"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFreelancers.map((freelancer) => {
              // Add safety checks for each freelancer property
              const firstName = freelancer?.first_name || "Unknown";
              const lastName = freelancer?.last_name || "";
              const username = freelancer?.username || "unknown";
              const email = freelancer?.email || "No email";
              const phone = freelancer?.phone_number;
              const country = freelancer?.country;
              const rating = freelancer?.rating || "0.0";
              const ratingCount = freelancer?.rating_count || 0;
              const isOnline = Boolean(freelancer?.is_online);
              const violationCount = freelancer?.violation_count || 0;
              const createdAt = freelancer?.created_at;
              const profilePic = freelancer?.profile_pic_url;
              const freelancerId = freelancer?.id;

              return (
                <div
                  key={freelancerId}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  {/* Profile Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt={firstName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {firstName} {lastName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">@{username}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{email}</span>
                    </div>

                    {phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>
                      {rating} ({ratingCount} reviews)
                    </span>
                  </div>

                  {/* Location */}
                  {country && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{country}</span>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        isOnline
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          isOnline ? "bg-green-500" : "bg-gray-500"
                        }`}
                      ></div>
                      {isOnline ? "Online" : "Offline"}
                    </div>

                    {violationCount > 0 && (
                      <div className="text-sm text-red-600">
                        Violations: {violationCount}
                      </div>
                    )}
                  </div>

                  {/* Member Since */}
                  {createdAt && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        Joined {new Date(createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    onClick={() => handleViewProfile(freelancerId)}
                  >
                    View Profile
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
