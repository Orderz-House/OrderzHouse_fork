import { useEffect, useState } from "react";
import {
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  Users,
  Upload,
  X,
  File,
  Plus,
  CreditCard,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toastError, toastSuccess } from "../../services/toastService";
import {
  setCreating,
  addProject,
  setCurrentProject,
} from "../../slice/projectSlice";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const API_BASE = "http://localhost:5000";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((s) => s.auth.token);
  const creating = useSelector((s) => s.project.creating);
  const roleId = useSelector((s) => s.auth.roleId);

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    category_id: "",
    title: "",
    description: "",
    project_type: "",
    budget: "",
    budget_min: "",
    budget_max: "",
    hourly_rate: "",
    duration_type: "days",
    duration_days: 30,
    duration_hours: "",
    preferred_skills: [],
    assignment_type: "",
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
    { id: 1, title: "Project Type & Assignment", icon: FileText },
    { id: 2, title: "Project Details", icon: Upload },
    { id: 3, title: "Select Freelancers", icon: Users },
    { id: 4, title: "Payment & Activation", icon: CreditCard },
  ];

  useEffect(() => {
    if (roleId && Number(roleId) !== 1 && Number(roleId) !== 2) {
      toastError("Only clients can create projects");
      navigate("/");
    }
  }, [roleId, navigate]);

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
      return parseFloat(form.budget_max) > parseFloat(form.budget_min);
    }
    return true;
  };

  const validateStep0 = () => form.project_type && form.assignment_type;

  const validateStep1 = () => {
    const requiredFields = ['category_id', 'title', 'description'];
    
    if (!requiredFields.every(field => form[field]?.toString().trim())) return false;

    if (form.project_type === "fixed" && (!form.budget || form.budget <= 0)) return false;
    
    if (form.project_type === "bidding" && 
        (!form.budget_min || !form.budget_max || form.budget_min <= 0 || form.budget_max <= 0)) return false;
    
    if (form.project_type === "hourly" && (!form.hourly_rate || form.hourly_rate <= 0)) return false;
    
    if (form.project_type !== "hourly") {
      if (form.duration_type === "days" && (!form.duration_days || form.duration_days <= 0)) return false;
      if (form.duration_type === "hours" && (!form.duration_hours || form.duration_hours <= 0)) return false;
    }

    return true;
  };

  const calculatePaymentAmount = () => {
    if (form.project_type === "fixed") return parseFloat(form.budget) || 0;
    if (form.project_type === "hourly") return (parseFloat(form.hourly_rate) || 0) * 3;
    if (form.project_type === "bidding") return parseFloat(form.budget_max) || 0;
    return 0;
  };

  const handleFileSelect = (e) => {
    setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaymentFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toastError("File size must be less than 5MB");
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toastError("Please upload only JPG, PNG, or PDF files");
      return;
    }
    
    setPaymentFile(file);
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

    setUploadingPayment(true);
    const formData = new FormData();
    formData.append('proof', paymentFile);
    formData.append('amount', calculatePaymentAmount());

    try {
      await axios.post(
        `${API_BASE}/payments/offline/record/${createdProjectId}`,
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
    if (currentStep === 0) {
      if (!validateStep0()) {
        toastError("Please select project type and assignment type");
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
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

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-8">
          <div>
            <label className="block text-lg font-medium text-gray-800 mb-4">Project Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: "fixed", icon: DollarSign, title: "Fixed Price", desc: "Set a fixed budget for the entire project" },
                { type: "bidding", icon: FileText, title: "Bidding", desc: "Let freelancers bid on your project" },
                { type: "hourly", icon: Clock, title: "Hourly Rate", desc: "Pay by the hour for flexible work" }
              ].map(({ type, icon: Icon, title, desc }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, project_type: type }))}
                  className={`p-6 border-2 rounded-xl text-center transition-all duration-200 ${
                    form.project_type === type
                      ? "border-[#00A896] bg-teal-50 text-[#00A896] shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-3" />
                  <span className="font-semibold text-xl block mb-2">{title}</span>
                  <p className="text-sm text-gray-600">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-800 mb-4">Assignment Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { type: "solo", icon: User, title: "Solo Project", desc: "Perfect for tasks requiring focused individual expertise" },
                { type: "team", icon: Users, title: "Team Project", desc: "Ideal for complex projects requiring multiple specialists" }
              ].map(({ type, icon: Icon, title, desc }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, assignment_type: type }))}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                    form.assignment_type === type
                      ? "border-[#00A896] bg-teal-50 text-[#00A896] shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <Icon className="w-6 h-6 mr-3" />
                    <span className="font-semibold text-xl">{title}</span>
                  </div>
                  <p className="text-gray-600">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

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
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-[#00A896] focus:border-[#00A896] transition-colors"
                required
              >
                <option value="">Choose a category for your project</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-[#00A896] focus:border-[#00A896] transition-colors text-lg"
                required
              />
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
                    className="w-full pl-12 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-[#00A896] focus:border-[#00A896] transition-colors text-lg"
                    required
                  />
                </div>
              </div>
            )}

            {form.project_type === "bidding" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['budget_min', 'budget_max'].map((field) => (
                  <div key={field}>
                    <label className="block text-lg font-medium text-gray-800 mb-4">
                      {field === 'budget_min' ? 'Minimum' : 'Maximum'} Budget
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input
                        name={field}
                        type="number"
                        value={form[field]}
                        onChange={handleChange}
                        placeholder={field === 'budget_min' ? '500' : '1500'}
                        className="w-full pl-12 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-[#00A896] focus:border-[#00A896] transition-colors"
                        required
                      />
                    </div>
                  </div>
                ))}
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
                    className="w-full pl-12 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-[#00A896] focus:border-[#00A896] transition-colors"
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
                    {['days', 'hours'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, duration_type: type }))}
                        className={`px-6 py-3 rounded-xl font-medium transition-colors capitalize ${
                          form.duration_type === type
                            ? "bg-[#00A896] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input
                      name={`duration_${form.duration_type}`}
                      type="number"
                      value={form.duration_type === "days" ? form.duration_days : form.duration_hours}
                      onChange={handleChange}
                      placeholder={form.duration_type === "days" ? "30" : "240"}
                      className="w-full pl-12 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-[#00A896] focus:border-[#00A896] transition-colors"
                      required
                    />
                    <span className="absolute right-4 top-4 text-gray-500">{form.duration_type}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">Project Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your project in detail. Include objectives, requirements, deliverables, and any specific instructions..."
                className="w-full p-6 text-gray-900 bg-white focus:ring-2 focus:ring-[#00A896] border-2 border-gray-200 rounded-xl resize-none transition-colors text-lg"
                rows={6}
                required
              />
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
                  className="flex-1 border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:ring-2 focus:ring-[#00A896] focus:border-[#00A896] transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-6 py-4 bg-[#00A896] text-white rounded-xl hover:bg-[#02C39A] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {form.preferred_skills.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {form.preferred_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-teal-100 text-teal-800 font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-teal-600 hover:text-teal-800"
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
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#00A896] transition-colors bg-gray-50">
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
                  <p className="text-sm text-gray-500">Images, documents, or any reference materials</p>
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
                          <span className="text-sm text-gray-500 ml-3">({formatFileSize(file.size)})</span>
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
              
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-teal-700">
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
                      ? "border-[#00A896] bg-teal-50 shadow-md" 
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
                      <CheckCircle className="w-6 h-6 text-[#00A896]" />
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
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {form.project_type === "bidding" ? "Project Summary & Completion" : "Project Summary & Payment"}
              </h3>
              <p className="text-gray-600 text-lg">
                {form.project_type === "bidding" 
                  ? "Review your project details - your project will go live for bidding immediately"
                  : "Review your project details and complete the payment to activate"
                }
              </p>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-8">
              <h4 className="text-2xl font-semibold text-teal-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3" />
                Project Summary
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-teal-700 font-medium">Title:</span>
                    <p className="text-gray-800 font-semibold">{form.title}</p>
                  </div>
                  <div>
                    <span className="text-teal-700 font-medium">Category:</span>
                    <p className="text-gray-800">
                      {categories.find(c => c.id == form.category_id)?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-teal-700 font-medium">Assignment Type:</span>
                    <p className="text-gray-800 capitalize">{form.assignment_type} Project</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-teal-700 font-medium">Project Type:</span>
                    <p className="text-gray-800 capitalize">{form.project_type} Price</p>
                  </div>
                  {form.project_type !== "hourly" && (
                    <div>
                      <span className="text-teal-700 font-medium">Duration:</span>
                      <p className="text-gray-800">
                        {form.duration_type === "days" ? form.duration_days : form.duration_hours} {form.duration_type}
                      </p>
                    </div>
                  )}
                  {form.preferred_skills.length > 0 && (
                    <div>
                      <span className="text-teal-700 font-medium">Skills:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.preferred_skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-teal-200 text-teal-800 rounded-md text-sm">
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
                {form.project_type === "bidding" ? "Bidding Information" : "Payment Calculation"}
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
                          <span className="text-lg font-bold text-green-700">Payment Method</span>
                          <span className="text-xl font-bold text-teal-700">Pay After Selection</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <p className="text-sm text-teal-800">
                        <strong>Note:</strong> No upfront payment required. Your project price will be calculated 
                        when you choose and accept a freelancer's bid. Payment will be processed after you select 
                        the winning proposal.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {form.project_type !== "bidding" && (
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

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#00A896] transition-colors bg-gray-50">
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
                    <p className="text-sm text-gray-500">JPG, PNG, PDF up to 5MB</p>
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
            )}

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8">
              <div className="flex items-start">
                <Clock className="w-8 h-8 text-yellow-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-semibold text-yellow-800 mb-3">What Happens Next?</h4>
                  {form.project_type === "bidding" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h5 className="font-semibold text-yellow-800">Immediate:</h5>
                        <ul className="text-sm text-yellow-700 space-y-2">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Project goes live for bidding immediately
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Freelancers can start submitting proposals
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Selected freelancers receive notifications
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h5 className="font-semibold text-yellow-800">When You Select a Bid:</h5>
                        <ul className="text-sm text-yellow-700 space-y-2">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Final project price is determined
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Payment will be requested at that time
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Work begins after payment confirmation
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isDisabled = creating || uploading || uploadingPayment || 
    (currentStep === 0 && !validateStep0()) ||
    (currentStep === 1 && !validateStep1()) || 
    (currentStep === 4 && form.project_type !== "bidding" && !paymentFile);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Merriweather, serif" }}>
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Create Your Project</h1>
        </div>

        <div className="flex items-stretch gap-6" style={{ minHeight: "700px" }}>
          {/* Guidelines Card - Left */}
          <div className="flex-shrink-0 h-full" style={{ width: "300px", minWidth: "260px" }}>
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-2xl p-6 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-teal-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Project Guidelines</h3>
              </div>
              <div className="space-y-4 text-sm text-gray-700">
                {[
                  { title: "Be Clear & Specific", desc: "Provide detailed descriptions of your project requirements, deliverables, and expectations." },
                  { title: "Set Realistic Budgets", desc: "Research market rates and set fair budgets that attract quality freelancers." },
                  { title: "Define Milestones", desc: "Break larger projects into smaller milestones for better tracking and payments." },
                  { title: "Communication is Key", desc: "Respond promptly to questions and provide feedback to freelancers regularly." },
                  { title: "Upload References", desc: "Include examples, mockups, or reference files to clarify your vision." },
                  { title: "Professional Tone", desc: "Maintain a professional and respectful tone in all project communications." },
                  { title: "Realistic Deadlines", desc: "Set achievable timelines that give freelancers adequate time to deliver quality work." }
                ].map(({ title, desc }, idx) => (
                  <div key={idx}>
                    <h4 className="font-semibold text-teal-900 mb-2">{title}</h4>
                    <p>{desc}</p>
                  </div>
                ))}
                <div className="pt-4 border-t border-teal-200">
                  <p className="text-xs text-teal-700">
                    <strong>Tip:</strong> Projects with detailed descriptions receive 3x more quality proposals!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Create Project Section - Center */}
          <div className="flex-1 h-full flex flex-col min-w-0 max-w-3xl mx-auto" style={{ minWidth: 0 }}>
            {currentStep > 0 && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {steps[currentStep - 1]?.title}
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-[#00A896] to-[#02C39A] rounded"></div>
              </div>
            )}

            {renderStepContent()}

            <div className="flex flex-col sm:flex-row justify-between items-center mt-16 pt-8 border-t border-gray-200 gap-4">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium text-lg"
                >
                  Previous Step
                </button>
              )}
              <button
                onClick={handleNextStep}
                disabled={isDisabled}
                className="cssbuttons-io-button"
                style={{
                  background: isDisabled ? '#9CA3AF' : '#00A896',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.6 : 1
                }}
              >
                {creating || uploading || uploadingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {creating ? "Creating..." : uploading ? "Uploading..." : "Uploading..."}
                  </>
                ) : (
                  <>
                    {currentStep === 4 
                      ? form.project_type === "bidding" 
                        ? "Complete & Go Live" 
                        : "Submit Payment & Complete" 
                      : "Continue"
                    }
                  </>
                )}
                <div className="icon">
                  {creating || uploading || uploadingPayment ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
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
                    padding: 0.35em 1.2em;
                    font-size: 17px;
                    font-weight: 500;
                    border-radius: 0.9em;
                    border: none;
                    letter-spacing: 0.05em;
                    display: flex;
                    align-items: center;
                    box-shadow: inset 0 0 1.6em -0.6em #008577;
                    overflow: hidden;
                    position: relative;
                    height: 2.8em;
                    padding-right: 3.3em;
                    width: auto;
                    min-width: 200px;
                    transition: all 0.3s;
                  }
                  .cssbuttons-io-button:disabled {
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
                    box-shadow: 0.1em 0.1em 0.6em 0.2em #02C39A;
                    right: 0.3em;
                    transition: all 0.3s;
                  }
                  .cssbuttons-io-button:not(:disabled):hover .icon {
                    width: calc(100% - 0.6em);
                  }
                  .cssbuttons-io-button .icon svg {
                    width: 1.1em;
                    transition: transform 0.3s;
                    color: #00A896;
                  }
                  .cssbuttons-io-button:not(:disabled):hover .icon svg {
                    transform: translateX(0.1em);
                  }
                  .cssbuttons-io-button:not(:disabled):active .icon {
                    transform: scale(0.95);
                  }
                `}</style>
              </button>
            </div>

            {currentStep > 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-500">Step {currentStep} of {steps.length}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-md mx-auto">
                  <div 
                    className="bg-gradient-to-r from-[#00A896] to-[#02C39A] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline - Right */}
          <div className="flex-shrink-0 h-full" style={{ width: "220px", minWidth: "180px" }}>
            <div className="h-full flex flex-col justify-start">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="relative">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                          currentStep >= step.id
                            ? "bg-gradient-to-r from-[#00A896] to-[#02C39A] text-white shadow-lg"
                            : "bg-white border-2 border-gray-300 text-gray-400"
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${
                          currentStep >= step.id ? "text-[#00A896]" : "text-gray-500"
                        }`}>
                          Step {step.id}
                        </p>
                        <p className={`text-sm font-medium ${
                          currentStep >= step.id ? "text-[#00A896]" : "text-gray-500"
                        }`}>
                          {step.title}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`absolute left-6 top-12 w-0.5 h-12 transition-colors ${
                        currentStep > step.id ? "bg-gradient-to-b from-[#00A896] to-[#02C39A]" : "bg-gray-200"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}