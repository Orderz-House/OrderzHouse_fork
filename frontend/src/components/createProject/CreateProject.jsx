import { useEffect, useState } from "react";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  Users,
  Upload,
  X,
  File,
  ArrowRight,
  Plus,
  CreditCard,
  Clock,
} from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toastError, toastSuccess } from "../../services/toastService";
import {
  setCreating,
  setError,
  addProject,
  setCurrentProject,
} from "../../slice/projectSlice";
import { useNavigate, Link } from "react-router-dom";

export default function CreateProject() {
  const API_BASE = "http://localhost:5000";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((s) => s.auth.token);
  const creating = useSelector((s) => s.project.creating);
  const roleId = useSelector((s) => s.auth.roleId);

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    category_id: "",
    title: "",
    description: "",
    project_type: "fixed",
    budget: "",
    budget_min: "",
    budget_max: "",
    hourly_rate: "",
    duration_days: 30,
    preferred_skills: [],
  });

  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [selectedFreelancers, setSelectedFreelancers] = useState([]);
  const [relatedFreelancers, setRelatedFreelancers] = useState([]);
  const [createdProjectId, setCreatedProjectId] = useState(null);

  const steps = [
    { id: 1, title: "Project Details", icon: FileText },
    { id: 2, title: "Skills & Files", icon: Upload },
    { id: 3, title: "Select Freelancers", icon: Users },
    { id: 4, title: "Payment & Activation", icon: CreditCard },
  ];

  // Only admins and clients can create projects
  useEffect(() => {
    if (roleId && Number(roleId) !== 1 && Number(roleId) !== 2) {
      toastError("Only clients can create projects");
      navigate("/");
    }
  }, [roleId, navigate]);

  // Load categories
  useEffect(() => {
    axios
      .get(`${API_BASE}/projects/public/categories`)
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateBudgetRange = () => {
    if (form.project_type === "bidding" && form.budget_min && form.budget_max) {
      const min = parseFloat(form.budget_min);
      const max = parseFloat(form.budget_max);
      return max > min;
    }
    return true;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.preferred_skills.includes(skillInput.trim())) {
      setForm(prev => ({
        ...prev,
        preferred_skills: [...prev.preferred_skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setForm(prev => ({
      ...prev,
      preferred_skills: prev.preferred_skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const uploadFilesToProject = async (projectId) => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const uploadPromises = selectedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(
          `${API_BASE}/uploads/upload/${projectId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('File upload error:', error);
        toastError(`Failed to upload ${file.name}`);
        return null;
      }
    });

    try {
      await Promise.all(uploadPromises);
      toastSuccess('Files uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

const fetchRelatedFreelancers = async (categoryId) => {
  if (!categoryId) return;

  try {
    const response = await axios.get(
      `${API_BASE}/projects/categories/${categoryId}/related-freelancers`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRelatedFreelancers(response.data.freelancers || []);
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    setRelatedFreelancers([]);
  }
};

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate budget range for bidding projects
      if (form.project_type === "bidding" && !validateBudgetRange()) {
        toastError("Maximum budget must be higher than minimum budget");
        return;
      }

      // Create project with basic details
      dispatch(setCreating(true));
      try {
        const payload = { ...form };

        if (form.project_type === "fixed") {
          payload.budget_min = null;
          payload.budget_max = null;
          payload.hourly_rate = null;
        } else if (form.project_type === "bidding") {
          payload.budget = null;
          payload.hourly_rate = null;
        } else if (form.project_type === "hourly") {
          payload.budget = null;
          payload.budget_min = null;
          payload.budget_max = null;
          payload.duration_days = null;
        }

        const res = await axios.post(`${API_BASE}/projects`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const project = res.data.project;
        setCreatedProjectId(project.id);
        dispatch(setCurrentProject(project));
        dispatch(addProject(project));
        toastSuccess("Project details saved!");
        setCurrentStep(2);
      } catch (err) {
        console.error(err);
        toastError("Failed to save project details");
      } finally {
        dispatch(setCreating(false));
      }
    } else if (currentStep === 2) {
      // Upload files and move to freelancer selection
      if (selectedFiles.length > 0) {
        await uploadFilesToProject(createdProjectId);
      }
await fetchRelatedFreelancers(form.category_id);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Send notifications to selected freelancers (if any)
      if (selectedFreelancers.length > 0) {
        try {
          // You'll need to implement this API endpoint
          await axios.post(
            `${API_BASE}/projects/${createdProjectId}/notify-freelancers`,
            { freelancer_ids: selectedFreelancers },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toastSuccess("Notifications sent to selected freelancers");
        } catch (error) {
          console.error("Error sending notifications:", error);
        }
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Final step - redirect to project
      toastSuccess("Project created successfully! Complete payment to activate.");
      navigate(`/projects/${createdProjectId}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tell us about your project</h2>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Project category</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Add your project title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter your project title"
                className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Project Type</label>
              <select
                name="project_type"
                value={form.project_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="fixed">Fixed</option>
                <option value="bidding">Bidding</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>

            {/* Conditional Budget / Rate */}
            {form.project_type === "fixed" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Budget</label>
                <input
                  name="budget"
                  type="number"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="e.g., 1000"
                  className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {form.project_type === "bidding" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Min Budget</label>
                  <input
                    name="budget_min"
                    type="number"
                    value={form.budget_min}
                    onChange={handleChange}
                    placeholder="e.g., 500"
                    className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Max Budget</label>
                  <input
                    name="budget_max"
                    type="number"
                    value={form.budget_max}
                    onChange={handleChange}
                    placeholder="e.g., 1500"
                    className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {form.project_type === "hourly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Hourly Rate</label>
                <input
                  name="hourly_rate"
                  type="number"
                  value={form.hourly_rate}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                  className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Duration (hide for hourly) */}
            {form.project_type !== "hourly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Project duration in days</label>
                <input
                  name="duration_days"
                  type="number"
                  value={form.duration_days}
                  onChange={handleChange}
                  placeholder="Enter duration in days (e.g., 30)"
                  className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Project description</label>
              <div className="border border-gray-300 rounded-lg">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your project in detail..."
                  className="w-full p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent border-0 rounded-lg resize-none"
                  rows={5}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add skills and files</h2>
            
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred skills (optional)
              </label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill"
                  className="flex-1 border border-gray-300 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.preferred_skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.preferred_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Add media / attachments (optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <File className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select freelancers (Optional)</h2>
            <p className="text-gray-600 mb-6">
              We found {relatedFreelancers.length} freelancers in your category. You can select 1-3 to notify them about your project.
            </p>
            
            <div className="space-y-4">
              {relatedFreelancers.slice(0, 5).map((freelancer) => (
                <div
                  key={freelancer.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedFreelancers.includes(freelancer.id) ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                  onClick={() => {
                    if (selectedFreelancers.includes(freelancer.id)) {
                      setSelectedFreelancers(prev => prev.filter(id => id !== freelancer.id));
                    } else if (selectedFreelancers.length < 3) {
                      setSelectedFreelancers(prev => [...prev, freelancer.id]);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{freelancer.first_name} {freelancer.last_name}</h3>
                      <p className="text-sm text-gray-600">{freelancer.title || 'Freelancer'}</p>
                      <p className="text-sm text-gray-500">Rating: {freelancer.rating || 'New'}</p>
                    </div>
                    {selectedFreelancers.includes(freelancer.id) && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-500">
              Selected: {selectedFreelancers.length}/3 freelancers
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment & Activation</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-yellow-800">Project Status: Pending Payment</h3>
              </div>
              <p className="text-yellow-700 mb-4">
                Your project has been created but is not yet visible to freelancers. 
                To activate your project and start receiving proposals, please complete the payment process.
              </p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Upload your payment confirmation</li>
                <li>• We will verify your payment within 24 hours</li>
                <li>• Your project will be activated once payment is confirmed</li>
                <li>• Freelancers will be able to view and bid on your project</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload payment confirmation
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  id="payment-upload"
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                <label htmlFor="payment-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Upload payment screenshot or receipt</p>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG, PDF up to 5MB
                  </p>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
              <p className="text-blue-700">
                After uploading your payment confirmation, our team will review it within 24 hours. 
                Once verified, your project will be automatically activated and freelancers will be notified.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-8 h-0.5 w-24 ${
                    currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            
            <button
              onClick={handleNextStep}
              disabled={creating || uploading}
              className="ml-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              {creating || uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {creating ? "Creating..." : "Uploading..."}
                </>
              ) : (
                <>
                  {currentStep === 4 ? "Complete" : "Next"}
                  {currentStep < 4 && <ArrowRight className="w-4 h-4 ml-2" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}