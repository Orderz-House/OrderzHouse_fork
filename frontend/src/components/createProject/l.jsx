// import { useEffect, useState } from "react";
// import {
//   DollarSign,
//   Calendar,
//   FileText,
//   CheckCircle,
//   Users,
//   Upload,
//   X,
//   File,
//   Plus,
//   CreditCard,
//   Clock,
//   User,
//   AlertCircle,
// } from "lucide-react";
// import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
// import { toastError, toastSuccess } from "../../services/toastService";
// import {
//   setCreating,
//   addProject,
//   setCurrentProject,
// } from "../../slice/projectSlice";
// import { useNavigate } from "react-router-dom";

// export default function CreateProject() {
//   const API_BASE = "http://localhost:5000";
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const token = useSelector((s) => s.auth.token);
//   const creating = useSelector((s) => s.project.creating);
//   const roleId = useSelector((s) => s.auth.roleId);

//   const [currentStep, setCurrentStep] = useState(0);
//   const [form, setForm] = useState({
//     category_id: "",
//     title: "",
//     description: "",
//     project_type: "",
//     budget: "",
//     budget_min: "",
//     budget_max: "",
//     hourly_rate: "",
//     duration_type: "days",
//     duration_days: 30,
//     duration_hours: "",
//     preferred_skills: [],
//     assignment_type: "",
//   });

//   const [categories, setCategories] = useState([]);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [skillInput, setSkillInput] = useState("");
//   const [selectedFreelancers, setSelectedFreelancers] = useState([]);
//   const [relatedFreelancers, setRelatedFreelancers] = useState([]);
//   const [createdProjectId, setCreatedProjectId] = useState(null);
//   const [paymentFile, setPaymentFile] = useState(null);
//   const [uploadingPayment, setUploadingPayment] = useState(false);

//   const steps = [
//     { id: 1, title: "Type & Assignment", icon: FileText },
//     { id: 2, title: "Project Details", icon: Upload },
//     { id: 3, title: "Select Freelancers", icon: Users },
//     { id: 4, title: "Payment", icon: CreditCard },
//   ];

//   useEffect(() => {
//     if (roleId && Number(roleId) !== 1 && Number(roleId) !== 2) {
//       toastError("Only clients can create projects");
//       navigate("/");
//     }
//   }, [roleId, navigate]);

//   useEffect(() => {
//     axios
//       .get(`${API_BASE}/category`)
//       .then((res) => setCategories(res.data.categories || []))
//       .catch((err) => console.error(err));
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateBudgetRange = () => {
//     if (form.project_type === "bidding" && form.budget_min && form.budget_max) {
//       return parseFloat(form.budget_max) > parseFloat(form.budget_min);
//     }
//     return true;
//   };

//   const validateStep0 = () => form.project_type && form.assignment_type;

//   const validateStep1 = () => {
//     const requiredFields = ['category_id', 'title', 'description'];
    
//     if (!requiredFields.every(field => form[field]?.toString().trim())) return false;

//     if (form.project_type === "fixed" && (!form.budget || form.budget <= 0)) return false;
    
//     if (form.project_type === "bidding" && 
//         (!form.budget_min || !form.budget_max || form.budget_min <= 0 || form.budget_max <= 0)) return false;
    
//     if (form.project_type === "hourly" && (!form.hourly_rate || form.hourly_rate <= 0)) return false;
    
//     if (form.project_type !== "hourly") {
//       if (form.duration_type === "days" && (!form.duration_days || form.duration_days <= 0)) return false;
//       if (form.duration_type === "hours" && (!form.duration_hours || form.duration_hours <= 0)) return false;
//     }

//     return true;
//   };

//   const calculatePaymentAmount = () => {
//     if (form.project_type === "fixed") return parseFloat(form.budget) || 0;
//     if (form.project_type === "hourly") return (parseFloat(form.hourly_rate) || 0) * 3;
//     if (form.project_type === "bidding") return parseFloat(form.budget_max) || 0;
//     return 0;
//   };

//   const handleFileSelect = (e) => {
//     setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
//   };

//   const removeFile = (index) => {
//     setSelectedFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const handlePaymentFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
    
//     if (file.size > 5 * 1024 * 1024) {
//       toastError("File size must be less than 5MB");
//       return;
//     }
    
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
//     if (!allowedTypes.includes(file.type)) {
//       toastError("Please upload only JPG, PNG, or PDF files");
//       return;
//     }
    
//     setPaymentFile(file);
//   };

//   const addSkill = () => {
//     if (skillInput.trim() && !form.preferred_skills.includes(skillInput.trim())) {
//       setForm(prev => ({
//         ...prev,
//         preferred_skills: [...prev.preferred_skills, skillInput.trim()]
//       }));
//       setSkillInput("");
//     }
//   };

//   const removeSkill = (skillToRemove) => {
//     setForm(prev => ({
//       ...prev,
//       preferred_skills: prev.preferred_skills.filter(skill => skill !== skillToRemove)
//     }));
//   };

//   const uploadFilesToProject = async (projectId) => {
//     if (selectedFiles.length === 0) return;

//     setUploading(true);
//     const uploadPromises = selectedFiles.map(async (file) => {
//       const formData = new FormData();
//       formData.append('file', file);

//       try {
//         const response = await axios.post(
//           `${API_BASE}/uploads/upload/${projectId}`,
//           formData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         return response.data;
//       } catch (error) {
//         console.error('File upload error:', error);
//         toastError(`Failed to upload ${file.name}`);
//         return null;
//       }
//     });

//     try {
//       await Promise.all(uploadPromises);
//       toastSuccess('Files uploaded successfully');
//     } catch (error) {
//       console.error('Upload error:', error);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const fetchRelatedFreelancers = async (categoryId) => {
//     if (!categoryId) return;

//     try {
//       const response = await axios.get(
//         `${API_BASE}/projects/categories/${categoryId}/related-freelancers`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setRelatedFreelancers(response.data.freelancers || []);
//     } catch (error) {
//       console.error('Error fetching freelancers:', error);
//       setRelatedFreelancers([]);
//     }
//   };

//   const uploadPaymentProof = async () => {
//     if (!paymentFile) {
//       toastError("Please select a payment proof file");
//       return false;
//     }

//     setUploadingPayment(true);
//     const formData = new FormData();
//     formData.append('proof', paymentFile);
//     formData.append('amount', calculatePaymentAmount());

//     try {
//       await axios.post(
//         `${API_BASE}/payments/offline/record/${createdProjectId}`,
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
      
//       toastSuccess("Payment proof uploaded successfully! We'll review it within 24 hours.");
//       return true;
//     } catch (error) {
//       console.error('Payment upload error:', error);
//       toastError(error.response?.data?.message || "Failed to upload payment proof");
//       return false;
//     } finally {
//       setUploadingPayment(false);
//     }
//   };

//   const handleNextStep = async () => {
//     if (currentStep === 0) {
//       if (!validateStep0()) {
//         toastError("Please select project type and assignment type");
//         return;
//       }
//       setCurrentStep(1);
//     } else if (currentStep === 1) {
//       if (!validateStep1()) {
//         toastError("Please fill in all required fields before proceeding");
//         return;
//       }

//       if (form.project_type === "bidding" && !validateBudgetRange()) {
//         toastError("Maximum budget must be higher than minimum budget");
//         return;
//       }

//       dispatch(setCreating(true));
//       try {
//         const payload = { ...form };

//         if (form.project_type === "fixed") {
//           payload.budget_min = null;
//           payload.budget_max = null;
//           payload.hourly_rate = null;
//         } else if (form.project_type === "bidding") {
//           payload.budget = null;
//           payload.hourly_rate = null;
//         } else if (form.project_type === "hourly") {
//           payload.budget = null;
//           payload.budget_min = null;
//           payload.budget_max = null;
//           payload.duration_days = null;
//           payload.duration_hours = null;
//         }

//         const res = await axios.post(`${API_BASE}/projects`, payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const project = res.data.project;
//         setCreatedProjectId(project.id);
//         dispatch(setCurrentProject(project));
//         dispatch(addProject(project));
//         toastSuccess("Project details saved!");
//         setCurrentStep(2);
//       } catch (err) {
//         console.error(err);
//         toastError("Failed to save project details");
//       } finally {
//         dispatch(setCreating(false));
//       }
//     } else if (currentStep === 2) {
//       if (selectedFiles.length > 0) {
//         await uploadFilesToProject(createdProjectId);
//       }
//       await fetchRelatedFreelancers(form.category_id);
//       setCurrentStep(3);
//     } else if (currentStep === 3) {
//       if (selectedFreelancers.length > 0) {
//         try {
//           await axios.post(
//             `${API_BASE}/projects/${createdProjectId}/notify-freelancers`,
//             { freelancer_ids: selectedFreelancers },
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
//           toastSuccess("Notifications sent to selected freelancers");
//         } catch (error) {
//           console.error("Error sending notifications:", error);
//         }
//       }
//       setCurrentStep(4);
//     } else if (currentStep === 4) {
//       if (form.project_type === "bidding") {
//         toastSuccess("Bidding project created successfully! It's now live for freelancers to bid.");
//         navigate("/dashoard/projects");
//       } else {
//         const uploadSuccess = await uploadPaymentProof();
//         if (uploadSuccess) {
//           toastSuccess("Project created successfully! Payment is being reviewed.");
//           navigate("/dashoard/projects");
//         }
//       }
//     }
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
//   };

//   const renderStepContent = () => {
//     if (currentStep === 0) {
//       return (
//         <div className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
//             <div className="grid grid-cols-3 gap-3">
//               {[
//                 { type: "fixed", icon: DollarSign, title: "Fixed Price" },
//                 { type: "bidding", icon: FileText, title: "Bidding" },
//                 { type: "hourly", icon: Clock, title: "Hourly" }
//               ].map(({ type, icon: Icon, title }) => (
//                 <button
//                   key={type}
//                   type="button"
//                   onClick={() => setForm(prev => ({ ...prev, project_type: type }))}
//                   className={`p-3 border rounded-lg text-center transition-all ${
//                     form.project_type === type
//                       ? "border-gray-900 bg-gray-50"
//                       : "border-gray-200 hover:border-gray-300"
//                   }`}
//                 >
//                   <Icon className="w-5 h-5 mx-auto mb-1" />
//                   <span className="text-sm font-medium">{title}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
//             <div className="grid grid-cols-2 gap-3">
//               {[
//                 { type: "solo", icon: User, title: "Solo" },
//                 { type: "team", icon: Users, title: "Team" }
//               ].map(({ type, icon: Icon, title }) => (
//                 <button
//                   key={type}
//                   type="button"
//                   onClick={() => setForm(prev => ({ ...prev, assignment_type: type }))}
//                   className={`p-3 border rounded-lg transition-all ${
//                     form.assignment_type === type
//                       ? "border-gray-900 bg-gray-50"
//                       : "border-gray-200 hover:border-gray-300"
//                   }`}
//                 >
//                   <div className="flex items-center justify-center">
//                     <Icon className="w-4 h-4 mr-2" />
//                     <span className="text-sm font-medium">{title}</span>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       );
//     }

//     switch (currentStep) {
//       case 1:
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//               <select
//                 name="category_id"
//                 value={form.category_id}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
//                 required
//               >
//                 <option value="">Select category</option>
//                 {categories.map((c) => (
//                   <option key={c.id} value={c.id}>{c.name}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
//               <input
//                 name="title"
//                 value={form.title}
//                 onChange={handleChange}
//                 placeholder="Project title"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
//                 required
//               />
//             </div>

//             {form.project_type === "fixed" && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
//                 <input
//                   name="budget"
//                   type="number"
//                   value={form.budget}
//                   onChange={handleChange}
//                   placeholder="1000"
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
//                   required
//                 />
//               </div>
//             )}

//             {form.project_type === "bidding" && (
//               <div className="grid grid-cols-2 gap-3">
//                 {['budget_min', 'budget_max'].map((field) => (
//                   <div key={field}>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       {field === 'budget_min' ? 'Min' : 'Max'} Budget
//                     </label>
//                     <input
//                       name={field}
//                       type="number"
//                       value={form[field]}
//                       onChange={handleChange}
//                       placeholder={field === 'budget_min' ? '500' : '1500'}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
//                       required
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}

//             {form.project_type === "hourly" && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
//                 <input
//                   name="hourly_rate"
//                   type="number"
//                   value={form.hourly_rate}
//                   onChange={handleChange}
//                   placeholder="30"
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
//                   required
//                 />
//               </div>
//             )}

//             {form.project_type !== "hourly" && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
//                 <div className="flex gap-2 mb-2">
//                   {['days', 'hours'].map((type) => (
//                     <button
//                       key={type}
//                       type="button"
//                       onClick={() => setForm(prev => ({ ...prev, duration_type: type }))}
//                       className={`px-3 py-1 rounded text-xs font-medium ${
//                         form.duration_type === type
//                           ? "bg-gray-900 text-white"
//                           : "bg-gray-100 text-gray-700"
//                       }`}
//                     >
//                       {type}
//                     </button>
//                   ))}
//                 </div>
//                 <input
//                   name={`duration_${form.duration_type}`}
//                   type="number"
//                   value={form.duration_type === "days" ? form.duration_days : form.duration_hours}
//                   onChange={handleChange}
//                   placeholder={form.duration_type === "days" ? "30" : "240"}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
//                   required
//                 />
//               </div>
//             )}

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//               <textarea
//                 name="description"
//                 value={form.description}
//                 onChange={handleChange}
//                 placeholder="Describe your project"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
//                 rows={4}
//                 required
//               />
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Optional)</label>
//               <div className="flex gap-2 mb-2">
//                 <input
//                   type="text"
//                   value={skillInput}
//                   onChange={(e) => setSkillInput(e.target.value)}
//                   placeholder="Add skill"
//                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
//                   onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
//                 />
//                 <button
//                   type="button"
//                   onClick={addSkill}
//                   className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
//                 >
//                   <Plus className="w-4 h-4" />
//                 </button>
//               </div>
//               {form.preferred_skills.length > 0 && (
//                 <div className="flex flex-wrap gap-2">
//                   {form.preferred_skills.map((skill, index) => (
//                     <span
//                       key={index}
//                       className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800"
//                     >
//                       {skill}
//                       <button
//                         type="button"
//                         onClick={() => removeSkill(skill)}
//                         className="ml-1 text-gray-600 hover:text-gray-800"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Files (Optional)</label>
//               <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
//                 <input
//                   type="file"
//                   multiple
//                   onChange={handleFileSelect}
//                   className="hidden"
//                   id="file-upload"
//                   accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
//                 />
//                 <label htmlFor="file-upload" className="cursor-pointer">
//                   <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
//                   <p className="text-xs text-gray-600">Upload files</p>
//                 </label>
//               </div>

//               {selectedFiles.length > 0 && (
//                 <div className="mt-2 space-y-2">
//                   {selectedFiles.map((file, index) => (
//                     <div key={index} className="flex items-center justify-between border border-gray-200 p-2 rounded-lg">
//                       <div className="flex items-center text-xs">
//                         <File className="w-4 h-4 text-gray-500 mr-2" />
//                         <span className="text-gray-700">{file.name}</span>
//                         <span className="text-gray-500 ml-2">({formatFileSize(file.size)})</span>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => removeFile(index)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-4">
//             <div>
//               <h3 className="text-base font-semibold text-gray-900 mb-1">Notify Freelancers</h3>
//               <p className="text-xs text-gray-600 mb-3">
//                 Found {relatedFreelancers.length} freelancers. Select to notify them about your project.
//               </p>
//             </div>
            
//             <div className="space-y-2">
//               {relatedFreelancers.slice(0, 5).map((freelancer) => (
//                 <div
//                   key={freelancer.id}
//                   className={`border rounded-lg p-3 cursor-pointer ${
//                     selectedFreelancers.includes(freelancer.id) 
//                       ? "border-gray-900 bg-gray-50" 
//                       : "border-gray-200 hover:border-gray-300"
//                   }`}
//                   onClick={() => {
//                     if (selectedFreelancers.includes(freelancer.id)) {
//                       setSelectedFreelancers(prev => prev.filter(id => id !== freelancer.id));
//                     } else if (form.assignment_type === "solo" && selectedFreelancers.length === 0) {
//                       setSelectedFreelancers([freelancer.id]);
//                     } else if (form.assignment_type === "team") {
//                       setSelectedFreelancers(prev => [...prev, freelancer.id]);
//                     }
//                   }}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h4 className="font-medium text-sm text-gray-900">
//                         {freelancer.first_name} {freelancer.last_name}
//                       </h4>
//                       <p className="text-xs text-gray-600">{freelancer.title || 'Freelancer'}</p>
//                     </div>
//                     {selectedFreelancers.includes(freelancer.id) && (
//                       <CheckCircle className="w-4 h-4 text-gray-900" />
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
            
//             <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
//               Selected: {selectedFreelancers.length}
//               {form.assignment_type === "solo" ? "/1" : ""}
//             </div>
//           </div>
//         );

//       case 4:
//         const paymentAmount = calculatePaymentAmount();
        
//         return (
//           <div className="space-y-4">
//             <div className="border border-gray-200 rounded-lg p-4">
//               <h4 className="text-sm font-semibold text-gray-900 mb-3">Summary</h4>
              
//               <div className="space-y-2 text-xs">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Title:</span>
//                   <span className="text-gray-900 font-medium">{form.title}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Category:</span>
//                   <span className="text-gray-900">{categories.find(c => c.id == form.category_id)?.name}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Type:</span>
//                   <span className="text-gray-900 capitalize">{form.project_type}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="border border-gray-200 rounded-lg p-4">
//               <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment</h4>
              
//               {form.project_type === "fixed" && (
//                 <div className="text-xs">
//                   <div className="flex justify-between mb-2">
//                     <span className="text-gray-600">Amount:</span>
//                     <span className="text-lg font-bold text-gray-900">${form.budget}</span>
//                   </div>
//                   <p className="text-gray-600">Fixed price project</p>
//                 </div>
//               )}

//               {form.project_type === "hourly" && (
//                 <div className="text-xs space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Rate:</span>
//                     <span className="text-gray-900">${form.hourly_rate}/hr</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Min hours:</span>
//                     <span className="text-gray-900">3 hours</span>
//                   </div>
//                   <div className="flex justify-between pt-2 border-t">
//                     <span className="text-gray-900 font-medium">Initial:</span>
//                     <span className="text-lg font-bold text-gray-900">${paymentAmount}</span>
//                   </div>
//                 </div>
//               )}

//               {form.project_type === "bidding" && (
//                 <div className="text-xs">
//                   <div className="flex justify-between mb-2">
//                     <span className="text-gray-600">Range:</span>
//                     <span className="text-gray-900 font-medium">${form.budget_min} - ${form.budget_max}</span>
//                   </div>
//                   <p className="text-gray-600">Payment after bid selection</p>
//                 </div>
//               )}
//             </div>

//             {form.project_type !== "bidding" && (
//               <div className="border border-gray-200 rounded-lg p-4">
//                 <h4 className="text-sm font-semibold text-gray-900 mb-2">Upload Payment Proof</h4>
                
//                 <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center mb-2">
//                   <input
//                     type="file"
//                     onChange={handlePaymentFileSelect}
//                     className="hidden"
//                     id="payment-upload"
//                     accept=".jpg,.jpeg,.png,.pdf"
//                   />
//                   <label htmlFor="payment-upload" className="cursor-pointer">
//                     <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
//                     <p className="text-xs text-gray-600">
//                       {paymentFile ? paymentFile.name : "Upload receipt"}
//                     </p>
//                   </label>
//                   {paymentFile && (
//                     <button
//                       type="button"
//                       onClick={() => setPaymentFile(null)}
//                       className="mt-2 text-xs text-red-600 hover:text-red-800"
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   const isDisabled = creating || uploading || uploadingPayment || 
//     (currentStep === 0 && !validateStep0()) ||
//     (currentStep === 1 && !validateStep1()) || 
//     (currentStep === 4 && form.project_type !== "bidding" && !paymentFile);

//   return (
//     <div className="min-h-screen bg-white p-4">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Create Project</h1>
//         </div>

//         <div className="flex gap-4">
//           {/* Timeline - Left */}
//           <div className="w-32 flex-shrink-0">
//             <div className="space-y-3">
//               {steps.map((step, index) => (
//                 <div key={step.id} className="relative">
//                   <div className="flex items-center gap-2">
//                     <div
//                       className={`flex items-center justify-center w-7 h-7 rounded-full text-xs ${
//                         currentStep >= step.id
//                           ? "bg-gray-900 text-white"
//                           : "bg-white border border-gray-300 text-gray-400"
//                       }`}
//                     >
//                       <step.icon className="w-3 h-3" />
//                     </div>
//                     <div>
//                       <p className={`text-xs font-medium ${
//                         currentStep >= step.id ? "text-gray-900" : "text-gray-500"
//                       }`}>
//                         {step.title}
//                       </p>
//                     </div>
//                   </div>
//                   {index < steps.length - 1 && (
//                     <div className={`absolute left-3.5 top-7 w-px h-8 ${
//                       currentStep > step.id ? "bg-gray-900" : "bg-gray-200"
//                     }`} />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="flex-1 min-w-0">
//             <div className="border border-gray-200 rounded-lg p-6">
//               {renderStepContent()}

//               <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
//                 {currentStep > 0 && (
//                   <button
//                     onClick={() => setCurrentStep(prev => prev - 1)}
//                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
//                   >
//                     Back
//                   </button>
//                 )}
//                 <button
//                   onClick={handleNextStep}
//                   disabled={isDisabled}
//                   className={`px-6 py-2 rounded-lg text-sm font-medium ml-auto ${
//                     isDisabled 
//                       ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
//                       : 'bg-gray-900 text-white hover:bg-gray-800'
//                   }`}
//                 >
//                   {creating || uploading || uploadingPayment ? (
//                     <span className="flex items-center">
//                       <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
//                       Processing...
//                     </span>
//                   ) : (
//                     currentStep === 4 
//                       ? form.project_type === "bidding" 
//                         ? "Complete" 
//                         : "Submit" 
//                       : "Continue"
//                   )}
//                 </button>
//               </div>

//               <div className="mt-4 text-center">
//                 <p className="text-xs text-gray-500">Step {currentStep + 1} of {steps.length + 1}</p>
//                 <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
//                   <div 
//                     className="bg-gray-900 h-1 rounded-full transition-all"
//                     style={{ width: `${((currentStep + 1) / (steps.length + 1)) * 100}%` }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }