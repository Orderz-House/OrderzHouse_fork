import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Star,
  Mail,
  Briefcase,
  MapPin,
  Calendar,
  User,
  Award,
  FileText,
  ExternalLink,
  Globe,
  Phone,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function FreelancerPage() {
  const { token } = useSelector((s) => s.auth);
  const { id } = useParams();

  // Unified state to hold freelancer and portfolio together
  const [data, setData] = useState({
    freelancer: null,
    portfolio: [],
    loading: true,
    error: "",
  });

  const [rating, setRating] = useState(0);
  const [submitMessage, setSubmitMessage] = useState("");
  const [activeTab, setActiveTab] = useState("portfolio");

  useEffect(() => {
    async function fetchData() {
      try {
        setData((prev) => ({ ...prev, loading: true }));

        // Fetch freelancer data
        const userRes = await axios.get(
          `http://localhost:5000/users/freelancers/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch portfolio with improved error handling
        let portfolioData = [];
        try {
          const portfolioRes = await axios.get(
            `http://localhost:5000/users/freelances/${id}/port`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          portfolioData = portfolioRes.data.portfolios || [];
        } catch (portfolioErr) {
          // Handle 404 specifically - it just means no portfolio items exist yet
          if (portfolioErr.response && portfolioErr.response.status === 404) {
            portfolioData = [];
          } else {
            console.error("Failed to load portfolio:", portfolioErr);
            // Continue without portfolio data but don't treat as fatal error
          }
        }

        setData({
          freelancer: userRes.data.freelancer || null,
          portfolio: portfolioData,
          loading: false,
          error: "",
        });
      } catch (err) {
        console.error(err);
        setData({
          freelancer: null,
          portfolio: [],
          loading: false,
          error: "Failed to load freelancer data",
        });
      }
    }

    fetchData();
  }, [id, token]);

  const { freelancer, portfolio, loading, error } = data;

  // Submit a rating for the freelancer
  const submitRating = async () => {
    try {
      if (rating < 1 || rating > 5) {
        setSubmitMessage("Please select a rating between 1 and 5");
        return;
      }
      await axios.post(
        "http://localhost:5000/users/rate",
        {
          userId: id,
          rating,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmitMessage("Rating submitted successfully!");

      // Refresh freelancer data to show updated rating
      const userRes = await axios.get(
        `http://localhost:5000/users/freelancers/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData((prev) => ({ ...prev, freelancer: userRes.data.freelancer }));
    } catch (err) {
      console.error(err);
      setSubmitMessage(
        err.response?.data?.message ||
          "You can only rate freelancers you have worked with."
      );
    }
  };

  // Loading state
  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading freelancer profile...</p>
        </div>
      </div>
    );

  // Error state
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  // Freelancer not found
  if (!freelancer)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-2xl mb-4">👤</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Freelancer Not Found
          </h2>
          <p className="text-gray-600">
            The requested freelancer could not be found.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {freelancer.profile_pic_url ? (
                  <img
                    src={freelancer.profile_pic_url}
                    alt={`${freelancer.first_name} ${freelancer.last_name}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16" />
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {freelancer.first_name} {freelancer.last_name}
              </h1>

              <div className="flex items-center text-lg text-gray-600 mb-4">
                <span className="font-medium">@{freelancer.username}</span>
                {freelancer.category && (
                  <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {freelancer.category}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="font-semibold text-gray-800">
                    {freelancer.rating || "0.0"}
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({freelancer.rating_count || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Bio */}
              {freelancer.bio && (
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">{freelancer.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{freelancer.email}</span>
                </div>

                {freelancer.phone_number && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{freelancer.phone_number}</span>
                  </div>
                )}

                {freelancer.country && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{freelancer.country}</span>
                  </div>
                )}

                {freelancer.created_at && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>
                      Member since{" "}
                      {new Date(freelancer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Online Status */}
              <div className="flex items-center mb-4">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    freelancer.is_online
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      freelancer.is_online ? "bg-green-500" : "bg-gray-500"
                    }`}
                  ></div>
                  {freelancer.is_online ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "portfolio"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FileText className="w-5 h-5 inline-block mr-2" />
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab("rate")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "rate"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Award className="w-5 h-5 inline-block mr-2" />
                Rate Freelancer
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "portfolio" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Portfolio
                </h2>
                {portfolio.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      No portfolio items yet
                    </h3>
                    <p className="text-gray-400">
                      This freelancer hasn't added any projects to their portfolio.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200"
                      >
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {item.description}
                        </p>
                        
                        {item.skills && item.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {item.hourly_rate && (
                          <div className="text-sm text-gray-700 mb-3">
                            <span className="font-medium">Rate: </span>
                            ${item.hourly_rate}/hr
                          </div>
                        )}
                        
                        {item.work_url && (
                          <a
                            href={item.work_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "rate" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Rate this Freelancer
                </h2>
                <div className="max-w-md">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select your rating
                    </label>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-2xl focus:outline-none"
                        >
                          {star <= rating ? (
                            <Star className="w-8 h-8 text-yellow-400 fill-current" />
                          ) : (
                            <Star className="w-8 h-8 text-gray-300" />
                          )}
                        </button>
                      ))}
                    </div>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Choose a rating</option>
                      <option value={1}>1 ⭐ (Poor)</option>
                      <option value={2}>2 ⭐ (Fair)</option>
                      <option value={3}>3 ⭐ (Good)</option>
                      <option value={4}>4 ⭐ (Very Good)</option>
                      <option value={5}>5 ⭐ (Excellent)</option>
                    </select>
                  </div>

                  <button
                    onClick={submitRating}
                    disabled={rating === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Rating
                  </button>

                  {submitMessage && (
                    <div
                      className={`mt-4 p-3 rounded-md ${
                        submitMessage.includes("Failed") || submitMessage.includes("can only rate")
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {submitMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {freelancer.rating_count || 0}
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {portfolio.length}
              </div>
              <div className="text-sm text-gray-600">Portfolio Items</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {freelancer.violation_count || 0}
              </div>
              <div className="text-sm text-gray-600">Violations</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {new Date(freelancer.created_at).getFullYear()}
              </div>
              <div className="text-sm text-gray-600">Member Since</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}