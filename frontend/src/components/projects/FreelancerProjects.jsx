import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Filter,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  Star,
  Eye,
  Send,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  FileText
} from "lucide-react";

const FreelancerProjects = () => {
  const { token, userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    minBudget: "",
    maxBudget: "",
    duration: "",
    location: ""
  });
  const [offerData, setOfferData] = useState({
    bid_amount: "",
    delivery_time: "",
    proposal: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:5000/projects/offers/available",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log("response offer =>", response);
        
        setProjects(response.data.projects || []);
        setFilteredProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        alert("Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token]);

  // Filter projects based on search and filters
  useEffect(() => {
    let result = projects;

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) /*||*/
        /*
         project.skills.some(skill => 
           skill.toLowerCase().includes(searchTerm.toLowerCase())
         )*/
      );
    }

    // Apply budget filter
    if (filters.minBudget) {
      result = result.filter(project => 
        project.budget_min >= parseInt(filters.minBudget)
      );
    }
    if (filters.maxBudget) {
      result = result.filter(project => 
        project.budget_max <= parseInt(filters.maxBudget)
      );
    }

    // Apply duration filter
    if (filters.duration) {
      result = result.filter(project => 
        project.duration === filters.duration
      );
    }

    // Apply location filter
    if (filters.location) {
      result = result.filter(project =>
        project.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredProjects(result);
  }, [searchTerm, filters, projects]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      minBudget: "",
      maxBudget: "",
      duration: "",
      location: ""
    });
    setSearchTerm("");
  };

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setIsSubmitting(true);
      await axios.post(
        `http://localhost:5000/projects/${selectedProject.id}/offers`,
        {
          bid_amount: parseFloat(offerData.bid_amount),
          delivery_time: offerData.delivery_time,
          proposal: offerData.proposal
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert("Offer submitted successfully!");
      setSelectedProject(null);
      setOfferData({
        bid_amount: "",
        delivery_time: "",
        proposal: ""
      });
    } catch (error) {
      console.error("Error submitting offer:", error);
      alert("Failed to submit offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Projects
          </button>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.title}</h1>
            <p className="text-gray-600 mb-6">{selectedProject.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Budget Range</span>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ${selectedProject.budget_min} - ${selectedProject.budget_max}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Duration</span>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">{selectedProject.duration}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">Location</span>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">{selectedProject.location}</p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-amber-600 mr-2" />
                  <span className="text-sm font-medium text-amber-800">Posted</span>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {new Date(selectedProject.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProject.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div> */}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Information</h3>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedProject.first_name} {selectedProject.last_name}
                  </p>
                  <p className="text-sm text-gray-600">Client</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Submit Your Offer</h2>
            
            <form onSubmit={handleSubmitOffer}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="bid_amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Bid Amount ($)
                  </label>
                  <input
                    type="number"
                    id="bid_amount"
                    min={selectedProject.budget_min}
                    max={selectedProject.budget_max}
                    value={offerData.bid_amount}
                    onChange={(e) => setOfferData({...offerData, bid_amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be between ${selectedProject.budget_min} and ${selectedProject.budget_max}
                  </p>
                </div>

                <div>
                  <label htmlFor="delivery_time" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Time
                  </label>
                  <input
                    type="text"
                    id="delivery_time"
                    value={offerData.delivery_time}
                    onChange={(e) => setOfferData({...offerData, delivery_time: e.target.value})}
                    placeholder="e.g., 2 weeks, 1 month"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="proposal" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Proposal
                </label>
                <textarea
                  id="proposal"
                  rows={6}
                  value={offerData.proposal}
                  onChange={(e) => setOfferData({...offerData, proposal: e.target.value})}
                  placeholder="Explain why you're the best fit for this project, your approach, and any relevant experience..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                Submit Offer
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Projects</h1>
          <p className="text-gray-600">Find projects that match your skills and expertise</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects by title, description, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget ($)</label>
                  <input
                    type="number"
                    value={filters.minBudget}
                    onChange={(e) => handleFilterChange("minBudget", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget ($)</label>
                  <input
                    type="number"
                    value={filters.maxBudget}
                    onChange={(e) => handleFilterChange("maxBudget", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <select
                    value={filters.duration}
                    onChange={(e) => handleFilterChange("duration", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Any duration</option>
                    <option value="Less than 1 week">Less than 1 week</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="2-4 weeks">2-4 weeks</option>
                    <option value="1-2 months">1-2 months</option>
                    <option value="More than 2 months">More than 2 months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                    placeholder="City or country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset all filters
              </button>
            </div>
          )}

          <p className="text-sm text-gray-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {projects.length === 0 
                ? "There are no available projects at the moment." 
                : "Try adjusting your search or filters to find more projects."}
            </p>
            {projects.length > 0 && (
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                  
                  <div className="flex items-center mb-4">
                    <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      ${project.budget_min} - ${project.budget_max}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">{project.duration}</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {project.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      Posted {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {project.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                          +{project.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div> */}
                  
                  <button
                    onClick={() => viewProjectDetails(project)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details & Apply
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

export default FreelancerProjects;