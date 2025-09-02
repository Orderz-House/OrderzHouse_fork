import { useState, useEffect } from "react";
import {
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  Users,
  FileText,
  Target,
  BarChart3,
  Eye,
  Edit3,
  Shield,
  Globe,
  Building,
  Code,
  PaintBucket,
  Camera,
  PenTool
} from "lucide-react";

function OverviewProject({ project }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (project) {
      setIsLoading(false);
    }
  }, [project]);

  // Category icons mapping
  const categoryIcons = {
    design: <PaintBucket className="w-5 h-5" />,
    development: <Code className="w-5 h-5" />,
    marketing: <BarChart3 className="w-5 h-5" />,
    writing: <PenTool className="w-5 h-5" />,
    photography: <Camera className="w-5 h-5" />,
    default: <Target className="w-5 h-5" />
  };

  // Status configuration
  const statusConfig = {
    active: { color: "bg-green-500", text: "text-green-700", label: "Active" },
    in_progress: { color: "bg-blue-500", text: "text-blue-700", label: "In Progress" },
    completed: { color: "bg-purple-500", text: "text-purple-700", label: "Completed" },
    pending: { color: "bg-yellow-500", text: "text-yellow-700", label: "Pending" },
    cancelled: { color: "bg-red-500", text: "text-red-700", label: "Cancelled" }
  };

  const status = project.status || "active";
  const statusInfo = statusConfig[status] || statusConfig.active;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The project you're looking for doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {categoryIcons[project.category?.toLowerCase()] || categoryIcons.default}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
              {project.description}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border">
              <div className={`w-3 h-3 rounded-full ${statusInfo.color} mr-2`}></div>
              <span className={`text-sm font-medium ${statusInfo.text}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Budget Range</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${project.budget_min?.toLocaleString()} - ${project.budget_max?.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total project budget</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Duration</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{project.duration}</p>
          <p className="text-sm text-gray-500 mt-1">Expected timeline</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Location</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{project.location || "Remote"}</p>
          <p className="text-sm text-gray-500 mt-1">Project location</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-amber-100 rounded-lg mr-3">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Created</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {new Date(project.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="text-sm text-gray-500 mt-1">Project start date</p>
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Requirements */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            Project Requirements
          </h3>
          <div className="space-y-3">
            {project.requirements ? (
              <p className="text-gray-600 leading-relaxed">{project.requirements}</p>
            ) : (
              <p className="text-gray-400 italic">No specific requirements provided.</p>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 text-green-600 mr-2" />
            Additional Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Visibility</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {project.is_public ? "Public" : "Private"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Category</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">
                {project.category || "General"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Project Type</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {project.project_type || "Fixed Price"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills & Tags */}
      {(project.skills_required || project.tags) && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-orange-600 mr-2" />
            Skills & Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.skills_required?.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
            {project.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">Offers Received</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-600">Team Members</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">85%</div>
            <div className="text-sm text-gray-600">Completion</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">24</div>
            <div className="text-sm text-gray-600">Messages</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewProject;