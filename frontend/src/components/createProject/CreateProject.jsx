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
  User,
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
    duration_type: "days",
    duration_days: 30,
    duration_hours: "",
    preferred_skills: [],
    assignment_type: "solo",
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

  const validateStep1 = () => {
    const requiredFields = ['category_id', 'title', 'description'];
    
    for (const field of requiredFields) {
      if (!form[field] || form[field].toString().trim() === '') {
        return false;
      }
    }

    if (form.project_type === "fixed" && (!form.budget || form.budget <= 0)) {
      return false;
    }
    
    if (form.project_type === "bidding" && 
        (!form.budget_min || !form.budget_max || form.budget_min <= 0 || form.budget_max <= 0)) {
      return false;
    }
    
    if (form.project_type === "hourly" && (!form.hourly_rate || form.hourly_rate <= 0)) {
      return false;
    }
    
    if (form.project_type !== "hourly") {
      if (form.duration_type === "days" && (!form.duration_days || form.duration_days <= 0)) {
        return false;
      }
      if (form.duration_type === "hours" && (!form.duration_hours || form.duration_hours <= 0)) {
        return false;
      }
    }

    return true;
  };

  const calculatePaymentAmount = () => {
    if (form.project_type === "fixed") {
      return parseFloat(form.budget) || 0;
    } else if (form.project_type === "hourly") {
      return (parseFloat(form.hourly_rate) || 0) * 3;
    } else if (form.project_type === "bidding") {
      return parseFloat(form.budget_max) || 0;
    }
    return 0;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaymentFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastError("File size must be less than 5MB");
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        toastError("Please upload only JPG, PNG, or PDF files");
        return;
      }
      
      setPaymentFile(file);
    }
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

  const uploadPaymentProof = async () => {
    if (!paymentFile) {
      toastError("Please select a payment proof file");
      return false;
    }

    const paymentAmount = calculatePaymentAmount();
    setUploadingPayment(true);
    const formData = new FormData();
    formData.append('proof', paymentFile);
    formData.append('projectId', createdProjectId);
    formData.append('amount', paymentAmount);

    try {
      const response = await axios.post(
        `${API_BASE}/payments/record-offline`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toastSuccess("Payment proof uploaded successfully! We'll review it within 24 hours.");
      return true;
    } catch (error) {
      console.error('Payment upload error:', error);
      toastError(error.response?.data?.message || "Failed to upload payment proof");
      return false;
    } finally {
      setUploadingPayment(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) {
        toastError("Please fill in all required fields before proceeding");
        return;
      }

      if (form.project_type === "bidding" && !validateBudgetRange()) {
        toastError("Maximum budget must be higher than minimum budget");
        return;
      }

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
          payload.duration_hours = null;
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
      if (selectedFiles.length > 0) {
        await uploadFilesToProject(createdProjectId);
      }
      await fetchRelatedFreelancers(form.category_id);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (selectedFreelancers.length > 0) {
        try {
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
      const uploadSuccess = await uploadPaymentProof();
      if (uploadSuccess) {
        toastSuccess("Project created successfully! Payment is being reviewed.");
        navigate(`/projects/${createdProjectId}`);
      }
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
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">Project Category</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Choose a category for your project</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">Project Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Give your project a compelling title..."
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">Assignment Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, assignment_type: "solo" }))}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                    form.assignment_type === "solo"
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <User className="w-6 h-6 mr-3" />
                    <span className="font-semibold text-xl">Solo Project</span>
                  </div>
                  <p className="text-gray-600">
                    Perfect for tasks requiring focused individual expertise
                  </p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, assignment_type: "team" }))}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                    form.assignment_type === "team"
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <Users className="w-6 h-6 mr-3" />
                    <span className="font-semibold text-xl">Team Project</span>
                  </div>
                  <p className="text-gray-600">
                    Ideal for complex projects requiring multiple specialists
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">Project Type</label>
              <select
                name="project_type"
                value={form.project_type}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="fixed">Fixed Price Project</option>
                <option value="bidding">Bidding Project</option>
                <option value="hourly">Hourly Rate Project</option>
              </select>
            </div>

            {form.project_type === "fixed" && (
              <div>
                <label className="block text-lg font-medium text-gray-800 mb-4">Project Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    name="budget"
                    type="number"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="1000"
                    className="w-full pl-12 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                    required
                  />
                </div>
              </div>
            )}

            {form.project_type === "bidding" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-800 mb-4">Minimum Budget</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input
                      name="budget_min"
                      type="number"
                      value={form.budget_min}
                      onChange={handleChange}
                      placeholder="500"
                      className="w-full pl-12 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-800 mb-4">Maximum Budget</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input
                      name="budget_max"
                      type="number"
                      value={form.budget_max}
                      onChange={handleChange}
                      placeholder="1500"
                      className="w-full pl-12 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {form.project_type === "hourly" && (
              <div>
                <label className="block text-lg font-medium text-gray-800 mb-4">Hourly Rate</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    name="hourly_rate"
                    type="number"
                    value={form.hourly_rate}
                    onChange={handleChange}
                    placeholder="30"
                    className="w-full pl-12 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                  <span className="absolute right-4 top-4 text-gray-500">/hour</span>
                </div>
              </div>
            )}

            {form.project_type !== "hourly" && (
              <div>
                <label className="block text-lg font-medium text-gray-800 mb-4">Project Duration</label>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, duration_type: "days" }))}
                      className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                        form.duration_type === "days"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, duration_type: "hours" }))}
                      className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                        form.duration_type === "hours"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Hours
                    </button>
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    {form.duration_type === "days" ? (
                      <input
                        name="duration_days"
                        type="number"
                        value={form.duration_days}
                        onChange={handleChange}
                        placeholder="30"
                        className="w-full pl-12 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    ) : (
                      <input
                        name="duration_hours"
                        type="number"
                        value={form.duration_hours}
                        onChange={handleChange}
                        placeholder="240"
                        className="w-full pl-12 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    )}
                    <span className="absolute right-4 top-4 text-gray-500">
                      {form.duration_type}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">Project Description</label>
              <div className="border-2 border-gray-200 rounded-xl">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your project in detail. Include objectives, requirements, deliverables, and any specific instructions..."
                  className="w-full p-6 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-0 rounded-xl resize-none transition-colors text-lg"
                  rows={6}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                Preferred Skills <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill (e.g., React, Design, Writing)"
                  className="flex-1 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {form.preferred_skills.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {form.preferred_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800 font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                Project Files <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Upload project files</p>
                  <p className="text-sm text-gray-500">
                    Images, documents, or any reference materials
                  </p>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl">
                      <div className="flex items-center">
                        <File className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <span className="text-gray-700 font-medium">{file.name}</span>
                          <span className="text-sm text-gray-500 ml-3">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <X className="w-5 h-5" />
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
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Notify Freelancers</h3>
              <p className="text-gray-600 mb-4">
                We found {relatedFreelancers.length} freelancers in your category. You can select{" "}
                {form.assignment_type === "solo" ? "1 freelancer" : "multiple freelancers"} to notify them about your project.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Your project will automatically be visible to all freelancers in your chosen category once activated. 
                  This step is optional and only allows you to send direct notifications to specific freelancers.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {relatedFreelancers.slice(0, 5).map((freelancer) => (
                <div
                  key={freelancer.id}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                    selectedFreelancers.includes(freelancer.id) 
                      ? "border-blue-500 bg-blue-50 shadow-md" 
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  onClick={() => {
                    if (selectedFreelancers.includes(freelancer.id)) {
                      setSelectedFreelancers(prev => prev.filter(id => id !== freelancer.id));
                    } else if (form.assignment_type === "solo" && selectedFreelancers.length === 0) {
                      setSelectedFreelancers([freelancer.id]);
                    } else if (form.assignment_type === "team") {
                      setSelectedFreelancers(prev => [...prev, freelancer.id]);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800">
                        {freelancer.first_name} {freelancer.last_name}
                      </h4>
                      <p className="text-gray-600 mb-1">{freelancer.title || 'Freelancer'}</p>
                      <p className="text-sm text-gray-500">Rating: {freelancer.rating || 'New'}</p>
                    </div>
                    {selectedFreelancers.includes(freelancer.id) && (
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600">
                Selected: {selectedFreelancers.length}
                {form.assignment_type === "solo" ? "/1 freelancer" : " freelancers"}
              </p>
            </div>
          </div>
        );

      case 4:
        const paymentAmount = calculatePaymentAmount();
        
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Project Summary & Payment</h3>
              <p className="text-gray-600 text-lg">Review your project details and complete the payment to activate</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
              <h4 className="text-2xl font-semibold text-blue-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3" />
                Project Summary
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-blue-700 font-medium">Title:</span>
                    <p className="text-gray-800 font-semibold">{form.title}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Category:</span>
                    <p className="text-gray-800">
                      {categories.find(c => c.id == form.category_id)?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Assignment Type:</span>
                    <p className="text-gray-800 capitalize">{form.assignment_type} Project</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-blue-700 font-medium">Project Type:</span>
                    <p className="text-gray-800 capitalize">{form.project_type} Price</p>
                  </div>
                  {form.project_type !== "hourly" && (
                    <div>
                      <span className="text-blue-700 font-medium">Duration:</span>
                      <p className="text-gray-800">
                        {form.duration_type === "days" ? form.duration_days : form.duration_hours} {form.duration_type}
                      </p>
                    </div>
                  )}
                  {form.preferred_skills.length > 0 && (
                    <div>
                      <span className="text-blue-700 font-medium">Skills:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.preferred_skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-200 text-blue-800 rounded-md text-sm">
                            {skill}
                          </span>
                        ))}
                        {form.preferred_skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-sm">
                            +{form.preferred_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
              <h4 className="text-2xl font-semibold text-green-900 mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-3" />
                Payment Calculation
              </h4>
              
              <div className="space-y-6">
                {form.project_type === "fixed" && (
                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium text-gray-700">Fixed Project Price</span>
                      <span className="text-2xl font-bold text-green-700">${form.budget}</span>
                    </div>
                    <p className="text-gray-600">
                      This is a fixed-price project. You'll pay the full amount upfront for the completed work.
                    </p>
                  </div>
                )}

                {form.project_type === "hourly" && (
                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-700">Hourly Rate</span>
                        <span className="text-xl font-semibold text-gray-800">${form.hourly_rate}/hour</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-700">Minimum Hours Required</span>
                        <span className="text-xl font-semibold text-gray-800">3 hours</span>
                      </div>
                      <div className="border-t border-green-200 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-700">Initial Payment</span>
                          <span className="text-2xl font-bold text-green-700">${paymentAmount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> This covers the minimum 3 hours of work. If additional hours are needed 
                        or if fewer hours are required, the payment will be adjusted before project completion.
                      </p>
                    </div>
                  </div>
                )}

                {form.project_type === "bidding" && (
                  <div className="bg-white rounded-xl p-6 border border-green-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-700">Budget Range</span>
                        <span className="text-xl font-semibold text-gray-800">
                          ${form.budget_min} - ${form.budget_max}
                        </span>
                      </div>
                      <div className="border-t border-green-200 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-700">Maximum Budget</span>
                          <span className="text-2xl font-bold text-green-700">${form.budget_max}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Freelancers will bid within your specified range. 
                        Final payment will be based on the accepted proposal.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <h4 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Upload className="w-6 h-6 mr-3" />
                Upload Payment Confirmation
              </h4>
              
              <div className="mb-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h5 className="font-semibold text-gray-800 mb-3">Payment Instructions:</h5>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Transfer <strong className="text-green-600">${paymentAmount}</strong> to our designated account</li>
                    <li>Take a screenshot or photo of the payment confirmation</li>
                    <li>Upload the proof using the form below</li>
                    <li>Our team will verify your payment within 24 hours</li>
                  </ol>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  onChange={handlePaymentFileSelect}
                  className="hidden"
                  id="payment-upload"
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                <label htmlFor="payment-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">
                    {paymentFile ? paymentFile.name : "Upload payment screenshot or receipt"}
                  </p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, PDF up to 5MB
                  </p>
                </label>
                {paymentFile && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <p className="text-sm text-green-700">
                        {paymentFile.name} selected ({formatFileSize(paymentFile.size)})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentFile(null)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Remove file
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8">
              <div className="flex items-start">
                <Clock className="w-8 h-8 text-yellow-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-semibold text-yellow-800 mb-3">What Happens Next?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h5 className="font-semibold text-yellow-800">Immediate:</h5>
                      <ul className="text-sm text-yellow-700 space-y-2">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Project created but not visible to freelancers
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Payment verification begins
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-semibold text-yellow-800">After Payment Approval:</h5>
                      <ul className="text-sm text-yellow-700 space-y-2">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Project becomes visible to all freelancers
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Selected freelancers receive notifications
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Start receiving proposals and bids
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50" style={{ fontFamily: "Merriweather, serif" }}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-12">
          <Link
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium text-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Create Your Project</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your ideas into reality by connecting with talented freelancers worldwide
            </p>
          </div>
        </div>

        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "bg-white border-2 border-gray-300 text-gray-400"
                    }`}
                  >
                    <step.icon className="w-7 h-7" />
                  </div>
                  <div className="mt-4 text-center">
                    <p className={`text-sm font-semibold ${
                      currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                    }`}>
                      Step {step.id}
                    </p>
                    <p className={`text-lg font-medium ${
                      currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block mx-8 h-1 w-24 rounded transition-colors ${
                    currentStep > step.id ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {steps.find(s => s.id === currentStep)?.title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded"></div>
          </div>

          {renderStepContent()}

          <div className="flex flex-col sm:flex-row justify-between items-center mt-16 pt-8 border-t border-gray-200 gap-4">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium text-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2 inline" />
                Previous Step
              </button>
            )}
            
            <button
              onClick={handleNextStep}
              disabled={creating || uploading || uploadingPayment || (currentStep === 1 && !validateStep1()) || (currentStep === 4 && !paymentFile)}
              className={`w-full sm:w-auto px-12 py-4 rounded-xl flex items-center justify-center font-semibold text-lg transition-all duration-200 ${
                creating || uploading || uploadingPayment || (currentStep === 1 && !validateStep1()) || (currentStep === 4 && !paymentFile)
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {creating || uploading || uploadingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  {creating ? "Creating Project..." : uploading ? "Uploading Files..." : "Uploading Payment..."}
                </>
              ) : (
                <>
                  {currentStep === 4 ? "Submit Payment & Complete" : "Continue"}
                  {currentStep < 4 && <ArrowRight className="w-5 h-5 ml-3" />}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Step {currentStep} of {steps.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-md mx-auto">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}