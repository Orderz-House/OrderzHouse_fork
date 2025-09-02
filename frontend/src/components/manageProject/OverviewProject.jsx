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

function OverviewProject({project}) {
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    if (project) {
      setIsLoading(false);
    }
  }, [project]);


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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The project you're looking for doesn't exist.
          </p>
          <Link
            to="/projects"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }
  
  return (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Project Details
                  </h2>
                  <p className="text-gray-600">{project.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">
                        Budget
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ${project.budget_min} - ${project.budget_max}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        Duration
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {project.duration}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-800">
                        Location
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {project.location}
                    </p>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-amber-600 mr-2" />
                      <span className="text-sm font-medium text-amber-800">
                        Created
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    Project Status
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          project.status === "completed"
                            ? "bg-green-500"
                            : project.status === "in_progress"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {project.status?.replace("_", " ") || "active"}
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
  )
}

export default OverviewProject
