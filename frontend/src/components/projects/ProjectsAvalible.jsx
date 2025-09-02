import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Search,
  Filter,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Eye,
  Send,
  ArrowLeft,
  User,
  FileText,
  Sparkles,
  Award,
  Bookmark,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

const ProjectsAvalible = () => {
  const { token } = useSelector((state) => state.auth);
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
    location: "",
    sortBy: "newest",
  });
  const [offerData, setOfferData] = useState({
    bid_amount: "",
    delivery_time: "",
    proposal: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedProjects, setSavedProjects] = useState(new Set());

  // Fetch available projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:5000/projects/offers/available",
          {
            headers: { Authorization: `Bearer ${token}` },
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

  // Filter and sort projects based on search and filters
  useEffect(() => {
    let result = [...projects];

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply budget filter
    if (filters.minBudget) {
      result = result.filter(
        (project) => project.budget_min >= parseInt(filters.minBudget)
      );
    }
    if (filters.maxBudget) {
      result = result.filter(
        (project) => project.budget_max <= parseInt(filters.maxBudget)
      );
    }

    // Apply duration filter
    if (filters.duration) {
      result = result.filter(
        (project) => project.duration === filters.duration
      );
    }

    // Apply location filter
    if (filters.location) {
      result = result.filter((project) =>
        project.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "budget_high":
        result.sort((a, b) => b.budget_max - a.budget_max);
        break;
      case "budget_low":
        result.sort((a, b) => a.budget_min - b.budget_min);
        break;
      default:
        break;
    }

    setFilteredProjects(result);
  }, [searchTerm, filters, projects]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      minBudget: "",
      maxBudget: "",
      duration: "",
      location: "",
      sortBy: "newest",
    });
    setSearchTerm("");
  };

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
  };

  const toggleSaveProject = (projectId) => {
    const newSaved = new Set(savedProjects);
    if (newSaved.has(projectId)) {
      newSaved.delete(projectId);
    } else {
      newSaved.add(projectId);
    }
    setSavedProjects(newSaved);
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
          proposal: offerData.proposal,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Offer submitted successfully!");
      setSelectedProject(null);
      setOfferData({
        bid_amount: "",
        delivery_time: "",
        proposal: "",
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Finding the best projects for you...</p>
        </div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Projects
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedProject.title}
              </h1>
              <button
                onClick={() => toggleSaveProject(selectedProject.id)}
                className={`p-2 rounded-full ${
                  savedProjects.has(selectedProject.id)
                    ? "text-yellow-500 bg-yellow-50"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Bookmark
                  className="w-6 h-6"
                  fill={
                    savedProjects.has(selectedProject.id)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>

            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              {selectedProject.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center mb-3">
                  <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                  <span className="text-md font-semibold text-blue-800">
                    Budget Range
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  ${selectedProject.budget_min} - ${selectedProject.budget_max}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                <div className="flex items-center mb-3">
                  <Calendar className="w-6 h-6 text-green-600 mr-2" />
                  <span className="text-md font-semibold text-green-800">
                    Duration
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {selectedProject.duration}
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                <div className="flex items-center mb-3">
                  <MapPin className="w-6 h-6 text-purple-600 mr-2" />
                  <span className="text-md font-semibold text-purple-800">
                    Location
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {selectedProject.location}
                </p>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                <div className="flex items-center mb-3">
                  <Clock className="w-6 h-6 text-amber-600 mr-2" />
                  <span className="text-md font-semibold text-amber-800">
                    Posted
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {new Date(selectedProject.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Client Information
              </h3>
              <div className="flex items-center bg-gray-50 p-4 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-4 text-white font-semibold">
                  {selectedProject.first_name?.charAt(0)}
                  {selectedProject.last_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedProject.first_name} {selectedProject.last_name}
                  </p>
                  <p className="text-sm text-gray-600">Verified Client</p>
                </div>
                <div className="ml-auto flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Active
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Send className="w-6 h-6 mr-2 text-blue-600" />
              Submit Your Offer
            </h2>
            <p className="text-gray-600 mb-8">
              Make a compelling proposal to win this project
            </p>

            <form onSubmit={handleSubmitOffer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="bid_amount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Bid Amount ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="bid_amount"
                      min={selectedProject.budget_min}
                      max={selectedProject.budget_max}
                      value={offerData.bid_amount}
                      onChange={(e) =>
                        setOfferData({
                          ...offerData,
                          bid_amount: e.target.value,
                        })
                      }
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Must be between ${selectedProject.budget_min} and $
                    {selectedProject.budget_max}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="delivery_time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Estimated Delivery Time
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="delivery_time"
                      value={offerData.delivery_time}
                      onChange={(e) =>
                        setOfferData({
                          ...offerData,
                          delivery_time: e.target.value,
                        })
                      }
                      placeholder="e.g., 2 weeks, 1 month"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="proposal"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Proposal
                </label>
                <textarea
                  id="proposal"
                  rows={6}
                  value={offerData.proposal}
                  onChange={(e) =>
                    setOfferData({ ...offerData, proposal: e.target.value })
                  }
                  placeholder="Explain why you're the best fit for this project, your approach, and any relevant experience..."
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tip: Be specific about how you'll approach this project and
                  highlight relevant experience.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Offer
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center">
            <Sparkles className="w-9 h-9 mr-3 text-blue-600" />
            Find Your Next Project
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover projects that match your skills and grow your freelance
            career
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="budget_high">Budget: High to Low</option>
                <option value="budget_low">Budget: Low to High</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-gray-50 p-5 rounded-xl mb-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">
                Filter Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Budget ($)
                  </label>
                  <input
                    type="number"
                    value={filters.minBudget}
                    onChange={(e) =>
                      handleFilterChange("minBudget", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Min"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Budget ($)
                  </label>
                  <input
                    type="number"
                    value={filters.maxBudget}
                    onChange={(e) =>
                      handleFilterChange("maxBudget", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Max"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={filters.duration}
                    onChange={(e) =>
                      handleFilterChange("duration", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any duration</option>
                    <option value="Less than 1 week">Less than 1 week</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="2-4 weeks">2-4 weeks</option>
                    <option value="1-2 months">1-2 months</option>
                    <option value="More than 2 months">
                      More than 2 months
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    placeholder="City or country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full py-2 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredProjects.length}</span>{" "}
              of <span className="font-semibold">{projects.length}</span>{" "}
              projects
            </p>
            {filteredProjects.length > 0 && (
              <div className="flex items-center text-sm text-blue-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                {filteredProjects.length} opportunities waiting
              </div>
            )}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-medium text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {projects.length === 0
                ? "There are no available projects at the moment. Check back later for new opportunities."
                : "Try adjusting your search or filters to find more projects."}
            </p>
            {projects.length > 0 && (
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-100"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                      {project.title}
                    </h3>
                    <button
                      onClick={() => toggleSaveProject(project.id)}
                      className={`p-1 rounded-full ${
                        savedProjects.has(project.id)
                          ? "text-yellow-500"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Bookmark
                        className="w-5 h-5"
                        fill={
                          savedProjects.has(project.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mb-5 line-clamp-3 h-16">
                    {project.description}
                  </p>

                  <div className="flex items-center mb-4 text-sm">
                    <div className="flex items-center text-blue-600 font-medium">
                      <DollarSign className="w-4 h-4 mr-1" />$
                      {project.budget_min} - ${project.budget_max}
                    </div>
                    <span className="mx-2 text-gray-300">•</span>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {project.duration}
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {project.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      Posted {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => viewProjectDetails(project)}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
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

export default ProjectsAvalible;
