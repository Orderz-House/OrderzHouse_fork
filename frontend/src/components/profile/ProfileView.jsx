import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Star,
  Clock,
  DollarSign,
  Calendar,
  MessageSquare,
  Award,
  FileText,
  Users,
  CheckCircle,
  MapPin,
  ExternalLink,
  Shield,
  Heart,
  ThumbsUp,
  Eye
} from "lucide-react";

const ProfileView = () => {
  
  const { token, userData: currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const  userId = currentUser.id;
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [portfolio,setPortfolio] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5000/users/getUserdata`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const responsePortfolio = await axios.get(`http://localhost:5000/users/freelancers/${currentUser.id}/portfolio`,
            {
            headers: { Authorization: `Bearer ${token}` },
            }
         )


        console.log(response);
        
        if (response.data && response.data.user) {
          setProfileData(response.data.user);
          setIsOwnProfile(currentUser?.id === response.data.user.id);
          setPortfolio(responsePortfolio.data.portfolios)
        }
        
        //if(responsePortfolio)
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && token) {
      fetchProfileData();
    }
  }, [userId, token, currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The user profile you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isFreelancer = profileData.role_id === 3; // Assuming 3 is freelancer role
  const isClient = profileData.role_id === 2; // Assuming 2 is client role

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Bio Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
        <p className="text-gray-700">
          {profileData.bio || `${profileData.first_name} hasn't added a bio yet.`}
        </p>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profileData.rating || "0.0"}</p>
            <p className="text-sm text-gray-600">Rating</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profileData.completed_projects || 0}</p>
            <p className="text-sm text-gray-600">Projects</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <ThumbsUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profileData.reviews_count || 0}</p>
            <p className="text-sm text-gray-600">Reviews</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profileData.response_time || "N/A"}</p>
            <p className="text-sm text-gray-600">Avg. Response</p>
          </div>
        </div>
      </div>

      {/* Skills Section (for freelancers) */}
      {isFreelancer && profileData.skills && profileData.skills.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <span>Completed a project</span>
            </div>
            <span className="text-sm text-gray-500">2 days ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-3" />
              <span>Received a 5-star review</span>
            </div>
            <span className="text-sm text-gray-500">1 week ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Portfolio</h3>
      {portfolio && portfolio.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <span className="text-xs text-blue-600 font-medium">{item.category}</span>
              </div>
            </div>
          ))}
        </div>  
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No portfolio items yet.</p>
        </div>
      )}
    </div>
  );

  const renderReviews = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Reviews</h3>
      {profileData.reviews && profileData.reviews.length > 0 ? (
        <div className="space-y-6">
          {profileData.reviews.map((review, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.reviewer_name}</h4>
                    <p className="text-sm text-gray-500">{review.project_title}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
              <p className="text-sm text-gray-500 mt-2">{formatDate(review.date)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No reviews yet.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
            {/* Profile Image */}
            <div className="flex-shrink-0 mb-6 md:mb-0">
              <div className="w-32 h-32 bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
                {profileData.profile_pic_url ? (
                  <img
                    src={profileData.profile_pic_url}
                    alt={profileData.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profileData.first_name} {profileData.last_name}
                  </h1>
                  <p className="text-gray-600 mb-2">@{profileData.username}</p>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{profileData.country || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        Joined {formatDate(profileData.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {isFreelancer ? 'Freelancer' : 'Client'}
                    </span>
                    {profileData.is_verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                    {profileData.is_online && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Online
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mb-6 md:mb-0">
                  {!isOwnProfile && (
                    <>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        Follow
                      </button>
                    </>
                  )}
                  {isOwnProfile && (
                    <Link
                      to="/edit-profile"
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(profileData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">{profileData.rating || "0.0"}</span>
                <span className="text-gray-600 ml-2">
                  ({profileData.reviews_count || 0} reviews)
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{profileData.completed_projects || 0}</p>
                  <p className="text-sm text-gray-600">Projects</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{profileData.response_rate || "100%"}</p>
                  <p className="text-sm text-gray-600">Response Rate</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{profileData.on_time_delivery || "100%"}</p>
                  <p className="text-sm text-gray-600">On Time</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{profileData.repeat_clients || 0}</p>
                  <p className="text-sm text-gray-600">Repeat Clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <Eye className="w-4 h-4 mr-2" />
                Overview
              </button>
              {isFreelancer && (
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center whitespace-nowrap ${
                    activeTab === "portfolio"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Portfolio
                </button>
              )}
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center whitespace-nowrap ${
                  activeTab === "reviews"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Star className="w-4 h-4 mr-2" />
                Reviews ({profileData.reviews_count || 0})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && renderOverview()}
            {activeTab === "portfolio" && renderPortfolio()}
            {activeTab === "reviews" && renderReviews()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;