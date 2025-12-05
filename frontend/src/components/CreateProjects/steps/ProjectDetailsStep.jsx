import React, { useState, useEffect } from "react";
import { fetchCategories, fetchSubSubCategoriesByCategoryId } from "../api/category";
import { useSelector } from "react-redux";

const THEME = "#028090";

export default function ProjectDetailsStep({ onNext, projectData, setProjectData }) {
  const [categories, setCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [skillsInput, setSkillsInput] = useState("");
  const [availableFreelancers, setAvailableFreelancers] = useState([]);
  const [loadingFreelancers, setLoadingFreelancers] = useState(false);
  const roleId = useSelector((state) => state.auth.roleId);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    sub_sub_category_id: "",
    duration_type: "days",
    duration_days: 1,
    duration_hours: 1,
    project_type: "fixed",
    budget: 1,
    budget_min: 1,
    budget_max: 1,
    hourly_rate: 1,
    preferred_skills: [],
    // Admin-specific fields
    admin_category: "",
    assigned_freelancer_id: "",
    ...projectData
  });
  
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Only fetch categories normally for non-admin users
    if (Number(roleId) !== 4) {
      fetchCategories()
        .then(data => setCategories(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error("Failed to fetch categories:", err);
          setCategories([]);
        });
    }
  }, [roleId]);

  useEffect(() => {
    if (!form.category_id) return;
    fetchSubSubCategoriesByCategoryId(form.category_id)
      .then(data => setSubSubCategories(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Failed to fetch sub-sub-categories:", err);
        setSubSubCategories([]);
      });
    setForm(prev => ({ ...prev, sub_sub_category_id: "" }));
  }, [form.category_id]);

  useEffect(() => {
    setIsFormValid(validateForm(false));
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const noZeroFields = ["budget", "hourly_rate", "duration_days", "duration_hours", "budget_min", "budget_max"];
    let newValue = value;
    if (noZeroFields.includes(name)) newValue = Math.max(Number(value), 1);
    setForm(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    
    // Reset freelancer assignment when admin category changes
    if (name === "admin_category") {
      setForm(prev => ({ ...prev, assigned_freelancer_id: "" }));
      // Fetch freelancers when Government or CV category is selected
      if ((value === "Government Project" || value === "CV/Resume Project") && Number(roleId) === 4) {
        fetchAvailableFreelancers(form.category_id);
      }
    }
  };

  const handleAddSkill = () => {
    const newSkill = skillsInput.trim();
    if (!newSkill) return;
    if (form.preferred_skills.includes(newSkill)) return setSkillsInput("");
    setForm(prev => ({ ...prev, preferred_skills: [...prev.preferred_skills, newSkill] }));
    setSkillsInput("");
  };

  const handleRemoveSkill = (skill) => {
    setForm(prev => ({ ...prev, preferred_skills: prev.preferred_skills.filter(s => s !== skill) }));
  };

  const calculateAmountToPay = () => {
    if (form.project_type === "fixed") return form.budget;
    if (form.project_type === "hourly") return form.hourly_rate * 3;
    return null;
  };

  const fetchAvailableFreelancers = async (categoryId) => {
    if (!categoryId) return;
    setLoadingFreelancers(true);
    try {
      const response = await fetch(`/api/projects/categories/${categoryId}/related-freelancers`);
      const data = await response.json();
      if (data.success) {
        setAvailableFreelancers(data.freelancers || []);
      }
    } catch (err) {
      console.error("Failed to fetch freelancers:", err);
      setAvailableFreelancers([]);
    } finally {
      setLoadingFreelancers(false);
    }
  };

  const validateForm = (showErrors = true) => {
    const newErrors = {};
    const titleLength = form.title.trim().length;
    const descLength = form.description.trim().length;

    // Title validation with min/max limits
    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    } else if (titleLength < 10) {
      newErrors.title = "Title must be at least 10 characters";
    } else if (titleLength > 100) {
      newErrors.title = "Title must not exceed 100 characters";
    }

    // Description validation with min/max limits
    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (descLength < 100) {
      newErrors.description = "Description must be at least 100 characters";
    } else if (descLength > 2000) {
      newErrors.description = "Description must not exceed 2000 characters";
    }

    if (!form.category_id) newErrors.category_id = "Category is required";
    if (!form.sub_sub_category_id) newErrors.sub_sub_category_id = "Sub-category is required";
    if (form.project_type === "fixed" && form.budget <= 0) newErrors.budget = "Budget must be greater than 0";
    if (form.project_type === "hourly" && form.hourly_rate <= 0) newErrors.hourly_rate = "Hourly rate must be greater than 0";
    if (form.project_type === "bidding") {
      if (form.budget_min <= 0) newErrors.budget_min = "Min budget must be greater than 0";
      if (form.budget_max <= 0) newErrors.budget_max = "Max budget must be greater than 0";
      if (form.budget_max < form.budget_min) newErrors.budget_max = "Max budget must be greater than min budget";
    }

    // Admin-specific validation
    if (Number(roleId) === 4) {
      if (!form.admin_category) {
        newErrors.admin_category = "Admin category is required";
      } else if (!['Government Project', 'CV/Resume Project', 'Other'].includes(form.admin_category)) {
        newErrors.admin_category = "Invalid admin category";
      }
      
      // For Government and CV projects, freelancer assignment is required
      if ((form.admin_category === 'Government Project' || form.admin_category === 'CV/Resume Project') && !form.assigned_freelancer_id) {
        newErrors.assigned_freelancer_id = "Freelancer assignment is required for this category";
      }
    }

    if (showErrors) setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // For admin users, we need to send different data
    if (Number(roleId) === 4) {
      // Prepare admin project data
      const adminProjectData = {
        admin_category: form.admin_category,
        sub_category_id: form.category_id,
        sub_sub_category_id: form.sub_sub_category_id,
        title: form.title,
        description: form.description,
        duration_type: form.duration_type,
        duration_days: form.duration_type === "days" ? form.duration_days : undefined,
        duration_hours: form.duration_type === "hours" ? form.duration_hours : undefined,
        project_type: form.project_type,
        budget: form.project_type === "fixed" ? form.budget : undefined,
        budget_min: form.project_type === "bidding" ? form.budget_min : undefined,
        budget_max: form.project_type === "bidding" ? form.budget_max : undefined,
        hourly_rate: form.project_type === "hourly" ? form.hourly_rate : undefined,
        preferred_skills: form.preferred_skills,
        assigned_freelancer_id: (form.admin_category === 'Government Project' || form.admin_category === 'CV/Resume Project') ? form.assigned_freelancer_id : undefined
      };
      
      setProjectData({...form, isAdminProject: true, adminData: adminProjectData});
    } else {
      setProjectData(form);
    }
    onNext();
  };

  const inputBase = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent transition";

  // Character count helpers
  const titleLength = form.title.trim().length;
  const descLength = form.description.trim().length;
  const titleProgress = Math.min((titleLength / 10) * 100, 100);
  const descProgress = Math.min((descLength / 100) * 100, 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-[#02C39A]/10 via-[#028090]/10 to-[#05668D]/10 border-b border-slate-100">
        <h2 className="text-2xl font-black tracking-tight text-slate-800">Project Details</h2>
        <p className="text-slate-500">Tell us about your project</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Admin Category Selection - Only for role_id = 4 */}
        {Number(roleId) === 4 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Admin Project Category <span className="text-red-500">*</span>
            </label>
            <select
              name="admin_category"
              value={form.admin_category}
              onChange={handleChange}
              className={`${inputBase} ${errors.admin_category ? "ring-red-400 border-red-300" : ""}`}
            >
              <option value="">Select Admin Category</option>
              <option value="Government Project">Government Project</option>
              <option value="CV/Resume Project">CV/Resume Project</option>
              <option value="Other">Other</option>
            </select>
            {errors.admin_category && <p className="mt-1 text-sm text-red-500">{errors.admin_category}</p>}
            
            {/* Freelancer Assignment - Only for Government and CV projects */}
            {(form.admin_category === "Government Project" || form.admin_category === "CV/Resume Project") && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Assign Freelancer <span className="text-red-500">*</span>
                </label>
                {loadingFreelancers ? (
                  <div className="py-4 text-center text-slate-500">Loading freelancers...</div>
                ) : availableFreelancers.length > 0 ? (
                  <>
                    <select
                      name="assigned_freelancer_id"
                      value={form.assigned_freelancer_id}
                      onChange={handleChange}
                      className={`${inputBase} ${errors.assigned_freelancer_id ? "ring-red-400 border-red-300" : ""}`}
                    >
                      <option value="">Select a Freelancer</option>
                      {availableFreelancers.map(freelancer => (
                        <option key={freelancer.id} value={freelancer.id}>
                          {freelancer.first_name} {freelancer.last_name} ({freelancer.email})
                        </option>
                      ))}
                    </select>
                    {errors.assigned_freelancer_id && <p className="mt-1 text-sm text-red-500">{errors.assigned_freelancer_id}</p>}
                  </>
                ) : (
                  <div className="py-4 text-center text-slate-500">
                    No available freelancers for this category
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Regular Category Selection - Hidden for admin users */}
        {Number(roleId) !== 4 && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className={`${inputBase} ${errors.category_id ? "ring-red-400 border-red-300" : ""}`}
              >
                <option value="">Select Category</option>
                {Array.isArray(categories) && categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sub-category <span className="text-red-500">*</span>
              </label>
              <select
                name="sub_sub_category_id"
                value={form.sub_sub_category_id}
                onChange={handleChange}
                disabled={!form.category_id}
                className={`${inputBase} disabled:bg-slate-100 disabled:cursor-not-allowed ${errors.sub_sub_category_id ? "ring-red-400 border-red-300" : ""}`}
              >
                <option value="">Select Sub-category</option>
                {Array.isArray(subSubCategories) && subSubCategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
              {errors.sub_sub_category_id && <p className="mt-1 text-sm text-red-500">{errors.sub_sub_category_id}</p>}
            </div>
          </div>
        )}

        {/* For admin users, show category selection after admin category selection */}
        {Number(roleId) === 4 && form.admin_category && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className={`${inputBase} ${errors.category_id ? "ring-red-400 border-red-300" : ""}`}
              >
                <option value="">Select Category</option>
                {Array.isArray(categories) && categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sub-category <span className="text-red-500">*</span>
              </label>
              <select
                name="sub_sub_category_id"
                value={form.sub_sub_category_id}
                onChange={handleChange}
                disabled={!form.category_id}
                className={`${inputBase} disabled:bg-slate-100 disabled:cursor-not-allowed ${errors.sub_sub_category_id ? "ring-red-400 border-red-300" : ""}`}
              >
                <option value="">Select Sub-category</option>
                {Array.isArray(subSubCategories) && subSubCategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
              {errors.sub_sub_category_id && <p className="mt-1 text-sm text-red-500">{errors.sub_sub_category_id}</p>}
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            placeholder="e.g., Build a responsive website"
            value={form.title}
            onChange={handleChange}
            maxLength={100}
            className={`${inputBase} ${errors.title ? "ring-red-400 border-red-300" : ""}`}
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={`font-medium ${titleLength < 10 ? "text-amber-600" : titleLength > 100 ? "text-red-600" : "text-emerald-600"}`}>
              {titleLength < 10 ? `${10 - titleLength} more characters needed` : `${titleLength}/100 characters`}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${titleLength >= 10 ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${titleProgress}%` }}
                />
              </div>
            </div>
          </div>
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            rows={6}
            placeholder="Describe your project in detail..."
            value={form.description}
            onChange={handleChange}
            maxLength={2000}
            className={`${inputBase} resize-y ${errors.description ? "ring-red-400 border-red-300" : ""}`}
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={`font-medium ${descLength < 100 ? "text-amber-600" : descLength > 2000 ? "text-red-600" : "text-emerald-600"}`}>
              {descLength < 100 ? `${100 - descLength} more characters needed` : `${descLength}/2000 characters`}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${descLength >= 100 ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${descProgress}%` }}
                />
              </div>
            </div>
          </div>
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Preferred Skills */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Skills</label>
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
              placeholder="Type a skill and press Enter or Add"
              className={inputBase}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-5 rounded-xl font-semibold text-white transition"
              style={{ background: THEME }}
            >
              Add
            </button>
          </div>
          {form.preferred_skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.preferred_skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 border border-slate-200">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-500 hover:text-slate-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Project Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "fixed", label: "Fixed Price", icon: "💰" },
              { value: "hourly", label: "Hourly Rate", icon: "⏰" },
              { value: "bidding", label: "Bidding", icon: "🎯" }
            ].map(type => {
              const active = form.project_type === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange({ target: { name: "project_type", value: type.value } })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    active ? "border-[#028090] bg-[#E6F7F6] shadow-sm" : "border-slate-200 hover:border-[#028090]/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="font-semibold text-slate-800">{type.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          {form.project_type === "fixed" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Budget <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                <input
                  name="budget"
                  type="number"
                  min={1}
                  placeholder="0.00"
                  value={form.budget}
                  onChange={handleChange}
                  className={`${inputBase} pl-8 ${errors.budget ? "ring-red-400 border-red-300" : ""}`}
                />
              </div>
              {errors.budget && <p className="mt-1 text-sm text-red-500">{errors.budget}</p>}
              <p className="mt-2 text-slate-700 font-medium">Estimated amount to pay: ${calculateAmountToPay() || 0}</p>
            </div>
          )}

          {form.project_type === "hourly" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Hourly Rate <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$/hr</span>
                <input
                  name="hourly_rate"
                  type="number"
                  min={1}
                  placeholder="0.00"
                  value={form.hourly_rate}
                  onChange={handleChange}
                  className={`${inputBase} pl-14 ${errors.hourly_rate ? "ring-red-400 border-red-300" : ""}`}
                />
              </div>
              {errors.hourly_rate && <p className="mt-1 text-sm text-red-500">{errors.hourly_rate}</p>}
              <p className="mt-2 text-slate-700 font-medium">Estimated amount to pay: ${calculateAmountToPay() || 0}</p>
            </div>
          )}

          {form.project_type === "bidding" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Min Budget <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    name="budget_min"
                    type="number"
                    min={1}
                    placeholder="0.00"
                    value={form.budget_min}
                    onChange={handleChange}
                    className={`${inputBase} pl-8 ${errors.budget_min ? "ring-red-400 border-red-300" : ""}`}
                  />
                </div>
                {errors.budget_min && <p className="mt-1 text-sm text-red-500">{errors.budget_min}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Max Budget <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    name="budget_max"
                    type="number"
                    min={1}
                    placeholder="0.00"
                    value={form.budget_max}
                    onChange={handleChange}
                    className={`${inputBase} pl-8 ${errors.budget_max ? "ring-red-400 border-red-300" : ""}`}
                  />
                </div>
                {errors.budget_max && <p className="mt-1 text-sm text-red-500">{errors.budget_max}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Duration */}
        {form.project_type !== "hourly" && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Project Duration</label>
            <div className="grid sm:grid-cols-2 gap-4">
              <select
                name="duration_type"
                value={form.duration_type}
                onChange={handleChange}
                className={inputBase}
              >
                <option value="days">Days</option>
                <option value="hours">Hours</option>
              </select>
              <input
                name={form.duration_type === "days" ? "duration_days" : "duration_hours"}
                type="number"
                min={1}
                placeholder={`Duration in ${form.duration_type}`}
                value={form.duration_type === "days" ? form.duration_days : form.duration_hours}
                onChange={handleChange}
                className={inputBase}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full h-12 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${!isFormValid ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
          style={{ background: THEME }}
        >
          Continue to Files
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </form>
    </div>
  );
}