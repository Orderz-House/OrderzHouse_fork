import { useEffect, useState } from "react";
import {
  ArrowLeft, DollarSign, Calendar, FileText, CheckCircle, Users, Upload, X, File, Plus, CreditCard, Clock, User,
} from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toastError, toastSuccess } from "../../services/toastService";
import { setCreating, addProject, setCurrentProject } from "../../slice/projectSlice";
import { useNavigate, Link } from "react-router-dom";

export default function CreateProject() {
  const API_BASE = "http://localhost:5000";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, roleId } = useSelector((s) => s.auth);
  const creating = useSelector((s) => s.project.creating);

  const [currentStep, setCurrentStep] = useState('initial');
  const [form, setForm] = useState({
    category_id: "", title: "", description: "", project_type: "fixed", budget: "",
    budget_min: "", budget_max: "", hourly_rate: "", duration_type: "days",
    duration_days: 30, duration_hours: "", preferred_skills: [], assignment_type: "solo",
  });

  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [selectedFreelancers, setSelectedFreelancers] = useState([]);
  const [relatedFreelancers, setRelatedFreelancers] = useState([]);
  const [createdProjectId, setCreatedProjectId] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);

  const steps = [
    { id: 1, title: "Project Details", icon: FileText },
    { id: 2, title: "Skills & Files", icon: Upload },
    { id: 3, title: "Select Freelancers", icon: Users },
    { id: 4, title: "Payment & Activation", icon: CreditCard },
  ];

  // Authorization check
  useEffect(() => {
    if (roleId && Number(roleId) !== 1 && Number(roleId) !== 2) {
      toastError("Only clients can create projects");
      navigate("/");
    }
  }, [roleId, navigate]);

  // Load categories
  useEffect(() => {
    axios.get(`${API_BASE}/projects/public/categories`)
      .then((res) => setCategories(res.data.categories || []))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    const requiredFields = ['category_id', 'title', 'description'];
    if (!requiredFields.every(field => form[field]?.toString().trim())) return false;

    if (form.project_type === "fixed" && (!form.budget || form.budget <= 0)) return false;
    if (form.project_type === "bidding" && (!form.budget_min || !form.budget_max || form.budget_min <= 0 || form.budget_max <= 0 || parseFloat(form.budget_max) <= parseFloat(form.budget_min))) return false;
    if (form.project_type === "hourly" && (!form.hourly_rate || form.hourly_rate <= 0)) return false;
    
    if (form.project_type !== "hourly") {
      const duration = form.duration_type === "days" ? form.duration_days : form.duration_hours;
      if (!duration || duration <= 0) return false;
    }
    return true;
  };

  const calculatePaymentAmount = () => {
    const amounts = {
      fixed: () => parseFloat(form.budget) || 0,
      hourly: () => (parseFloat(form.hourly_rate) || 0) * 3,
      bidding: () => parseFloat(form.budget_max) || 0,
    };
    return amounts[form.project_type]();
  };

  const handleFileSelect = (e, isPayment = false) => {
    const files = Array.from(e.target.files);
    if (isPayment) {
      const file = files[0];
      if (file?.size > 5 * 1024 * 1024) return toastError("File size must be less than 5MB");
      if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
        return toastError("Please upload only JPG, PNG, or PDF files");
      }
      setPaymentFile(file);
    } else {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  const addSkill = () => {
    if (skillInput.trim() && !form.preferred_skills.includes(skillInput.trim())) {
      setForm(prev => ({ ...prev, preferred_skills: [...prev.preferred_skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setForm(prev => ({ ...prev, preferred_skills: prev.preferred_skills.filter(skill => skill !== skillToRemove) }));
  };

  const uploadFilesToProject = async (projectId) => {
    if (!selectedFiles.length) return;
    setUploading(true);
    
    try {
      await Promise.all(selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axios.post(`${API_BASE}/uploads/upload/${projectId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        }).catch(() => toastError(`Failed to upload ${file.name}`));
      }));
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
      const response = await axios.get(`${API_BASE}/projects/categories/${categoryId}/related-freelancers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRelatedFreelancers(response.data.freelancers || []);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      setRelatedFreelancers([]);
    }
  };

  const uploadPaymentProof = async () => {
    if (!paymentFile) return toastError("Please select a payment proof file"), false;

    setUploadingPayment(true);
    const formData = new FormData();
    formData.append('proof', paymentFile);
    formData.append('projectId', createdProjectId);
    formData.append('amount', calculatePaymentAmount());

    try {
      await axios.post(`${API_BASE}/payments/record-offline`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      toastSuccess("Payment proof uploaded successfully! We'll review it within 24 hours.");
      return true;
    } catch (error) {
      toastError(error.response?.data?.message || "Failed to upload payment proof");
      return false;
    } finally {
      setUploadingPayment(false);
    }
  };

  const handleNextStep = async () => {
    const stepHandlers = {
      1: async () => {
        if (!validateStep1()) return toastError("Please fill in all required fields before proceeding");

        dispatch(setCreating(true));
        try {
          const payload = { ...form };
          if (form.project_type === "fixed") {
            payload.budget_min = payload.budget_max = payload.hourly_rate = null;
          } else if (form.project_type === "bidding") {
            payload.budget = payload.hourly_rate = null;
          } else if (form.project_type === "hourly") {
            payload.budget = payload.budget_min = payload.budget_max = payload.duration_days = payload.duration_hours = null;
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
          toastError("Failed to save project details");
        } finally {
          dispatch(setCreating(false));
        }
      },
      2: async () => {
        if (selectedFiles.length > 0) await uploadFilesToProject(createdProjectId);
        await fetchRelatedFreelancers(form.category_id);
        setCurrentStep(3);
      },
      3: async () => {
        if (selectedFreelancers.length > 0) {
          try {
            await axios.post(`${API_BASE}/projects/${createdProjectId}/notify-freelancers`,
              { freelancer_ids: selectedFreelancers },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toastSuccess("Notifications sent to selected freelancers");
          } catch (error) {
            console.error("Error sending notifications:", error);
          }
        }
        setCurrentStep(4);
      },
      4: async () => {
        if (form.project_type === "bidding") {
          toastSuccess("Bidding project created successfully! It's now live for freelancers to bid.");
          navigate("/dashoard/projects");
        } else {
          const uploadSuccess = await uploadPaymentProof();
          if (uploadSuccess) {
            toastSuccess("Project created successfully! Payment is being reviewed.");
            navigate("/dashoard/projects");
          }
        }
      }
    };

    await stepHandlers[currentStep]();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const toggleFreelancerSelection = (freelancerId) => {
    if (selectedFreelancers.includes(freelancerId)) {
      setSelectedFreelancers(prev => prev.filter(id => id !== freelancerId));
    } else if (form.assignment_type === "solo" && selectedFreelancers.length === 0) {
      setSelectedFreelancers([freelancerId]);
    } else if (form.assignment_type === "team") {
      setSelectedFreelancers(prev => [...prev, freelancerId]);
    }
  };

  const proceedToForm = () => {
    if (form.project_type && form.assignment_type) {
      setCurrentStep(1);
    }
  };

  const renderProjectTypeField = () => {
    if (form.project_type === "fixed") {
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Project Budget</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input name="budget" type="number" value={form.budget} onChange={handleChange} placeholder="1000"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
          </div>
        </div>
      );
    }

    if (form.project_type === "bidding") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["budget_min", "budget_max"].map((field, idx) => (
            <div key={field} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {idx === 0 ? "Minimum" : "Maximum"} Budget
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input name={field} type="number" value={form[field]} onChange={handleChange}
                  placeholder={idx === 0 ? "500" : "1500"}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (form.project_type === "hourly") {
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input name="hourly_rate" type="number" value={form.hourly_rate} onChange={handleChange} placeholder="30"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
            <span className="absolute right-3 top-3 text-gray-500 text-sm">/hour</span>
          </div>
        </div>
      );
    }
  };

  if (currentStep === 'initial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
        <div className="w-full">
          <Link onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium transition-colors ml-4 md:ml-8">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </Link>

          <div className="text-center mb-12 px-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Create New Project</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Let's start by understanding what type of project you want to create
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl mx-4 md:mx-8 lg:mx-16 xl:mx-32 p-6 md:p-8 lg:p-12">
            <div className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                Choose Project Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {[
                  { 
                    type: "fixed", 
                    title: "Fixed Price", 
                    desc: "Set a specific budget for the entire project",
                    icon: DollarSign,
                    color: "emerald"
                  },
                  { 
                    type: "bidding", 
                    title: "Bidding Project", 
                    desc: "Let freelancers compete with their proposals",
                    icon: CreditCard,
                    color: "blue"
                  },
                  { 
                    type: "hourly", 
                    title: "Hourly Rate", 
                    desc: "Pay based on time worked",
                    icon: Clock,
                    color: "purple"
                  }
                ].map(({ type, title, desc, icon: Icon, color }) => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, project_type: type }))}
                    className={`p-4 md:p-6 border-2 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                      form.project_type === type 
                        ? `border-${color}-500 bg-${color}-50 shadow-lg` 
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg mb-3 md:mb-4 ${
                      form.project_type === type 
                        ? `bg-${color}-500 text-white` 
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Choose Assignment Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[
                  { 
                    type: "solo", 
                    title: "Solo Project", 
                    desc: "Perfect for tasks requiring focused individual expertise",
                    icon: User,
                    color: "indigo"
                  },
                  { 
                    type: "team", 
                    title: "Team Project", 
                    desc: "Ideal for complex projects requiring multiple specialists",
                    icon: Users,
                    color: "rose"
                  }
                ].map(({ type, title, desc, icon: Icon, color }) => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, assignment_type: type }))}
                    className={`p-4 md:p-6 border-2 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                      form.assignment_type === type 
                        ? `border-${color}-500 bg-${color}-50 shadow-lg` 
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg mb-3 md:mb-4 ${
                      form.assignment_type === type 
                        ? `bg-${color}-500 text-white` 
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={proceedToForm}
                disabled={!form.project_type || !form.assignment_type}
                className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 transform ${
                  form.project_type && form.assignment_type
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue to Project Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    const stepContent = {
      1: () => (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Project Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required>
              <option value="">Choose a category for your project</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Project Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Give your project a compelling title..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
          </div>

          {renderProjectTypeField()}

          {form.project_type !== "hourly" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Project Duration</label>
              <div className="flex gap-3 mb-3">
                {["days", "hours"].map(type => (
                  <button key={type} type="button"
                    onClick={() => setForm(prev => ({ ...prev, duration_type: type }))}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                      form.duration_type === type ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}>
                    {type}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  name={form.duration_type === "days" ? "duration_days" : "duration_hours"}
                  type="number"
                  value={form.duration_type === "days" ? form.duration_days : form.duration_hours}
                  onChange={handleChange}
                  placeholder={form.duration_type === "days" ? "30" : "240"}
                  className="w-full pl-10 pr-16 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
                <span className="absolute right-3 top-3 text-gray-500 text-sm">{form.duration_type}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Project Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Describe your project in detail. Include objectives, requirements, deliverables, and any specific instructions..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              rows={5} required />
          </div>
        </div>
      ),

      2: () => (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Preferred Skills <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <div className="flex gap-2 mb-4">
              <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill (e.g., React, Design, Writing)"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
              <button type="button" onClick={addSkill}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.preferred_skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.preferred_skills.map((skill, index) => (
                  <span key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Project Files <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-gray-50">
              <input type="file" multiple onChange={handleFileSelect} className="hidden" id="file-upload"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-1">Upload project files</p>
                <p className="text-sm text-gray-500">Images, documents, or any reference materials</p>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 mt-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <div className="flex items-center">
                      <File className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <span className="text-gray-700 text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),

      3: () => (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Notify Freelancers</h3>
            <p className="text-gray-600 mb-4">
              We found {relatedFreelancers.length} freelancers in your category. You can select{" "}
              {form.assignment_type === "solo" ? "1 freelancer" : "multiple freelancers"} to notify them about your project.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Your project will automatically be visible to all freelancers in your chosen category once activated. 
                This step is optional and only allows you to send direct notifications to specific freelancers.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {relatedFreelancers.slice(0, 5).map((freelancer) => (
              <div key={freelancer.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedFreelancers.includes(freelancer.id) ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
                onClick={() => toggleFreelancerSelection(freelancer.id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {freelancer.first_name} {freelancer.last_name}
                    </h4>
                    <p className="text-gray-600 text-sm">{freelancer.title || 'Freelancer'}</p>
                    <p className="text-xs text-gray-500">Rating: {freelancer.rating || 'New'}</p>
                  </div>
                  {selectedFreelancers.includes(freelancer.id) && <CheckCircle className="w-5 h-5 text-blue-500" />}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Selected: {selectedFreelancers.length}
              {form.assignment_type === "solo" ? "/1 freelancer" : " freelancers"}
            </p>
          </div>
        </div>
      ),

      4: () => {
        const paymentAmount = calculatePaymentAmount();
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {form.project_type === "bidding" ? "Project Summary & Completion" : "Project Summary & Payment"}
              </h3>
              <p className="text-gray-600">
                {form.project_type === "bidding" 
                  ? "Review your project details - your project will go live for bidding immediately"
                  : "Review your project details and complete the payment to activate"
                }
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Project Summary
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-blue-700 font-medium text-sm">Title:</span>
                    <p className="text-gray-800 font-semibold">{form.title}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium text-sm">Category:</span>
                    <p className="text-gray-800">{categories.find(c => c.id == form.category_id)?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium text-sm">Assignment Type:</span>
                    <p className="text-gray-800 capitalize">{form.assignment_type} Project</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-blue-700 font-medium text-sm">Project Type:</span>
                    <p className="text-gray-800 capitalize">{form.project_type} Price</p>
                  </div>
                  {form.project_type !== "hourly" && (
                    <div>
                      <span className="text-blue-700 font-medium text-sm">Duration:</span>
                      <p className="text-gray-800">
                        {form.duration_type === "days" ? form.duration_days : form.duration_hours} {form.duration_type}
                      </p>
                    </div>
                  )}
                  {form.preferred_skills.length > 0 && (
                    <div>
                      <span className="text-blue-700 font-medium text-sm">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {form.preferred_skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-200 text-blue-800 rounded-md text-xs">{skill}</span>
                        ))}
                        {form.preferred_skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs">
                            +{form.preferred_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                {form.project_type === "bidding" ? "Bidding Information" : "Payment Calculation"}
              </h4>
              
              <div className="space-y-4">
                {form.project_type === "fixed" && (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">Fixed Project Price</span>
                      <span className="text-xl font-bold text-green-700">${form.budget}</span>
                    </div>
                    <p className="text-gray-600 text-sm">This is a fixed-price project. You'll pay the full amount upfront for the completed work.</p>
                  </div>
                )}

                {form.project_type === "hourly" && (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Hourly Rate</span>
                        <span className="font-semibold text-gray-800">${form.hourly_rate}/hour</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Minimum Hours Required</span>
                        <span className="font-semibold text-gray-800">3 hours</span>
                      </div>
                      <div className="border-t border-green-200 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-green-700">Initial Payment</span>
                          <span className="text-xl font-bold text-green-700">${paymentAmount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      <strong>Note:</strong> This covers the minimum 3 hours of work. If additional hours are needed 
                      or if fewer hours are required, the payment will be adjusted before project completion.
                    </div>
                  </div>
                )}

                {form.project_type === "bidding" && (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Budget Range</span>
                        <span className="font-semibold text-gray-800">${form.budget_min} - ${form.budget_max}</span>
                      </div>
                      <div className="border-t border-green-200 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-green-700">Payment Method</span>
                          <span className="font-bold text-blue-700">Pay After Selection</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                      <strong>Note:</strong> No upfront payment required. Your project price will be calculated 
                      when you choose and accept a freelancer's bid. Payment will be processed after you select 
                      the winning proposal.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {form.project_type !== "bidding" && (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Payment Confirmation
                </h4>
                
                <div className="mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Payment Instructions:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
                      <li>Transfer <strong className="text-green-600">${paymentAmount}</strong> to our designated account</li>
                      <li>Take a screenshot or photo of the payment confirmation</li>
                      <li>Upload the proof using the form below</li>
                      <li>Our team will verify your payment within 24 hours</li>
                    </ol>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-gray-50">
                  <input type="file" onChange={(e) => handleFileSelect(e, true)} className="hidden" id="payment-upload"
                    accept=".jpg,.jpeg,.png,.pdf" />
                  <label htmlFor="payment-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-1">
                      {paymentFile ? paymentFile.name : "Upload payment screenshot or receipt"}
                    </p>
                    <p className="text-sm text-gray-500">JPG, PNG, PDF up to 5MB</p>
                  </label>
                  {paymentFile && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <p className="text-sm text-green-700">
                          {paymentFile.name} selected ({formatFileSize(paymentFile.size)})
                        </p>
                      </div>
                      <button type="button" onClick={() => setPaymentFile(null)}
                        className="mt-2 text-xs text-red-600 hover:text-red-800 underline">
                        Remove file
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <Clock className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">What Happens Next?</h4>
                  {form.project_type === "bidding" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-semibold text-yellow-800 text-sm">Immediate:</h5>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            Project goes live for bidding immediately
                          </li>
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            Freelancers can start submitting proposals
                          </li>
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            Selected freelancers receive notifications
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-semibold text-yellow-800 text-sm">When You Select a Bid:</h5>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            Final project price is determined
                          </li>
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            Payment will be requested at that time
                          </li>
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            Work begins after payment confirmation
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-semibold text-yellow-800 text-sm">Immediate:</h5>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            Project created but not visible to freelancers
                          </li>
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            Payment verification begins
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-semibold text-yellow-800 text-sm">After Payment Approval:</h5>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            Project becomes visible to all freelancers
                          </li>
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            Selected freelancers receive notifications
                          </li>
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            Start receiving proposals and bids
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }
    };

    return stepContent[currentStep]();
  };

  const isDisabled = creating || uploading || uploadingPayment || 
    (currentStep === 1 && !validateStep1()) || 
    (currentStep === 4 && form.project_type !== "bidding" && !paymentFile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="px-4 md:px-8 lg:px-16 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <button onClick={() => currentStep === 1 ? setCurrentStep('initial') : navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 md:mb-6 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> 
            {currentStep === 1 ? 'Back to Project Setup' : 'Back to Dashboard'}
          </button>

          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Create Your Project</h1>
            <p className="text-gray-600">
              {form.project_type && form.assignment_type && 
                `${form.project_type.charAt(0).toUpperCase() + form.project_type.slice(1)} ${form.assignment_type} Project`
              }
            </p>
          </div>
        </div>

        <div className="mb-8 md:mb-12">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 ${
                      currentStep >= step.id ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : "bg-white border-2 border-gray-300 text-gray-400"
                    }`}>
                    <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-semibold ${currentStep >= step.id ? "text-blue-600" : "text-gray-500"}`}>
                      Step {step.id}
                    </p>
                    <p className={`text-xs md:text-sm font-medium ${currentStep >= step.id ? "text-blue-600" : "text-gray-500"}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block mx-4 lg:mx-6 h-1 w-12 lg:w-16 rounded transition-colors ${
                    currentStep > step.id ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 mx-auto max-w-none">
          <div className="mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              {steps.find(s => s.id === currentStep)?.title}
            </h2>
            <div className="w-12 md:w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded"></div>
          </div>

          {renderStepContent()}

          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 md:mt-12 pt-6 border-t border-gray-200 gap-4">
            {currentStep > 1 && (
              <button onClick={() => setCurrentStep(prev => prev - 1)}
                className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium text-sm md:text-base">
                <ArrowLeft className="w-4 h-4 mr-2 inline" />
                Previous Step
              </button>
            )}
            
            <button onClick={handleNextStep} disabled={isDisabled}
              className={`cssbuttons-io-button ${isDisabled ? "disabled" : ""}`}
              style={{
                background: isDisabled ? '#9CA3AF' : '#a370f0',
                cursor: isDisabled ? 'not-allowed' : 'pointer'
              }}>
              {creating || uploading || uploadingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {creating ? "Creating..." : uploading ? "Uploading..." : "Uploading..."}
                </>
              ) : (
                currentStep === 4 
                  ? form.project_type === "bidding" ? "Complete & Go Live" : "Submit Payment & Complete" 
                  : "Continue"
              )}
              <div className="icon">
                {creating || uploading || uploadingPayment ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                ) : currentStep < 4 ? (
                  <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor"></path>
                  </svg>
                ) : (
                  <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"></path>
                  </svg>
                )}
              </div>
              
              <style jsx>{`
                .cssbuttons-io-button {
                  color: white;
                  font-family: inherit;
                  padding: 0.35em;
                  padding-left: 1.2em;
                  font-size: 14px;
                  font-weight: 500;
                  border-radius: 0.9em;
                  border: none;
                  letter-spacing: 0.05em;
                  display: flex;
                  align-items: center;
                  box-shadow: inset 0 0 1.6em -0.6em #714da6;
                  overflow: hidden;
                  position: relative;
                  height: 2.8em;
                  padding-right: 3.3em;
                  width: auto;
                  min-width: 160px;
                }

                @media (min-width: 768px) {
                  .cssbuttons-io-button {
                    font-size: 16px;
                    min-width: 180px;
                  }
                }
                
                .cssbuttons-io-button.disabled {
                  box-shadow: inset 0 0 1.6em -0.6em #6B7280;
                  pointer-events: none;
                }
                
                .cssbuttons-io-button .icon {
                  background: white;
                  margin-left: 1em;
                  position: absolute;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 2.2em;
                  width: 2.2em;
                  border-radius: 0.7em;
                  box-shadow: 0.1em 0.1em 0.6em 0.2em #7b52b9;
                  right: 0.3em;
                  transition: all 0.3s;
                }
                
                .cssbuttons-io-button:not(.disabled):hover .icon {
                  width: calc(100% - 0.6em);
                }
                
                .cssbuttons-io-button .icon svg {
                  width: 1.1em;
                  transition: transform 0.3s;
                  color: #7b52b9;
                }
                
                .cssbuttons-io-button:not(.disabled):hover .icon svg {
                  transform: translateX(0.1em);
                }
                
                .cssbuttons-io-button:not(.disabled):active .icon {
                  transform: scale(0.95);
                }
              `}</style>
            </button>
          </div>
        </div>

        <div className="mt-4 md:mt-6 text-center">
          <p className="text-gray-500 text-sm">Step {currentStep} of {steps.length}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-md mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}