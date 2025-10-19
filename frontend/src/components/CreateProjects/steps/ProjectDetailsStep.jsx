import React, { useState, useEffect } from "react";
import { fetchCategories, fetchSubSubCategoriesByCategoryId } from "../api/category";

export default function ProjectDetailsStep({ onNext, projectData, setProjectData }) {
  const [categories, setCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [skillsInput, setSkillsInput] = useState("");
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
    ...projectData
  });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!form.category_id) return;
    fetchSubSubCategoriesByCategoryId(form.category_id)
      .then(setSubSubCategories)
      .catch(console.error);
    setForm(prev => ({ ...prev, sub_sub_category_id: "" }));
  }, [form.category_id]);

  useEffect(() => {
    setIsFormValid(validateForm(false));
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Fields that cannot be 0
    const noZeroFields = ["budget", "hourly_rate", "duration_days", "duration_hours", "budget_min", "budget_max"];

    let newValue = value;
    if (noZeroFields.includes(name)) {
      newValue = Math.max(Number(value), 1); // minimum 1
    }

    setForm(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleAddSkill = () => {
    const newSkill = skillsInput.trim();
    if (!newSkill) return;
    if (form.preferred_skills.includes(newSkill)) {
      setSkillsInput("");
      return;
    }
    setForm(prev => ({
      ...prev,
      preferred_skills: [...prev.preferred_skills, newSkill]
    }));
    setSkillsInput("");
  };

  const handleRemoveSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      preferred_skills: prev.preferred_skills.filter(s => s !== skill)
    }));
  };

  const calculateAmountToPay = () => {
    if (form.project_type === "fixed") return form.budget;
    if (form.project_type === "hourly") return form.hourly_rate * 3;
    return null;
  };

  const validateForm = (showErrors = true) => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.category_id) newErrors.category_id = "Category is required";
    if (!form.sub_sub_category_id) newErrors.sub_sub_category_id = "Sub-category is required";

    if (form.project_type === "fixed" && form.budget <= 0) newErrors.budget = "Budget must be greater than 0";
    if (form.project_type === "hourly" && form.hourly_rate <= 0) newErrors.hourly_rate = "Hourly rate must be greater than 0";
    if (form.project_type === "bidding") {
      if (form.budget_min <= 0) newErrors.budget_min = "Min budget must be greater than 0";
      if (form.budget_max <= 0) newErrors.budget_max = "Max budget must be greater than 0";
      if (form.budget_max < form.budget_min) newErrors.budget_max = "Max budget must be greater than min budget";
    }

    if (showErrors) setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setProjectData(form);
    onNext();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Details</h2>
        <p className="text-gray-600">Tell us about your project</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            placeholder="e.g., Build a responsive website"
            value={form.title}
            onChange={handleChange}
            className={`w-full border-2 ${errors.title ? 'border-red-500' : 'border-gray-300'} px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            placeholder="Describe your project in detail..."
            value={form.description}
            onChange={handleChange}
            rows={5}
            className={`w-full border-2 ${errors.description ? 'border-red-500' : 'border-gray-300'} px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Preferred Skills */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Skills</label>
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
              placeholder="Type a skill and press Enter or Add"
              className="flex-1 border-2 border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              Add
            </button>
          </div>

          {form.preferred_skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.preferred_skills.map((skill, i) => (
                <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-blue-500 hover:text-blue-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className={`w-full border-2 ${errors.category_id ? 'border-red-500' : 'border-gray-300'} px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sub-category <span className="text-red-500">*</span>
            </label>
            <select
              name="sub_sub_category_id"
              value={form.sub_sub_category_id}
              onChange={handleChange}
              disabled={!form.category_id}
              className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Sub-category</option>
              {subSubCategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
            {errors.sub_sub_category_id && <p className="mt-1 text-sm text-red-500">{errors.sub_sub_category_id}</p>}
          </div>
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Project Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "fixed", label: "Fixed Price", icon: "💰" },
              { value: "hourly", label: "Hourly Rate", icon: "⏰" },
              { value: "bidding", label: "Bidding", icon: "🎯" }
            ].map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleChange({ target: { name: "project_type", value: type.value } })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  form.project_type === type.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="font-medium text-sm">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="bg-gray-50 p-6 rounded-lg">
          {form.project_type === "fixed" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Budget <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-medium">$</span>
                <input
                  name="budget"
                  type="number"
                  min={1}
                  placeholder="0.00"
                  value={form.budget}
                  onChange={handleChange}
                  className={`w-full border-2 ${errors.budget ? 'border-red-500' : 'border-gray-300'} pl-8 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                />
              </div>
              {errors.budget && <p className="mt-1 text-sm text-red-500">{errors.budget}</p>}
              <p className="mt-1 text-gray-700 font-medium">Estimated amount to pay: ${calculateAmountToPay() || 0}</p>
            </div>
          )}

          {form.project_type === "hourly" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-medium">$/hr</span>
                <input
                  name="hourly_rate"
                  type="number"
                  min={1}
                  placeholder="0.00"
                  value={form.hourly_rate}
                  onChange={handleChange}
                  className={`w-full border-2 ${errors.hourly_rate ? 'border-red-500' : 'border-gray-300'} pl-14 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                />
              </div>
              {errors.hourly_rate && <p className="mt-1 text-sm text-red-500">{errors.hourly_rate}</p>}
              <p className="mt-1 text-gray-700 font-medium">Estimated amount to pay: ${calculateAmountToPay() || 0}</p>
            </div>
          )}

          {form.project_type === "bidding" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Budget <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 font-medium">$</span>
                  <input
                    name="budget_min"
                    type="number"
                    min={1}
                    placeholder="0.00"
                    value={form.budget_min}
                    onChange={handleChange}
                    className={`w-full border-2 ${errors.budget_min ? 'border-red-500' : 'border-gray-300'} pl-8 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                  />
                </div>
                {errors.budget_min && <p className="mt-1 text-sm text-red-500">{errors.budget_min}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Budget <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 font-medium">$</span>
                  <input
                    name="budget_max"
                    type="number"
                    min={1}
                    placeholder="0.00"
                    value={form.budget_max}
                    onChange={handleChange}
                    className={`w-full border-2 ${errors.budget_max ? 'border-red-500' : 'border-gray-300'} pl-8 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
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
            <label className="block text-sm font-semibold text-gray-700 mb-3">Project Duration</label>
            <div className="grid md:grid-cols-2 gap-4">
              <select
                name="duration_type"
                value={form.duration_type}
                onChange={handleChange}
                className="border-2 border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                className="border-2 border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
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
