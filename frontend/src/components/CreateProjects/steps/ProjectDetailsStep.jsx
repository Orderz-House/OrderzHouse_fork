import React, { useState, useEffect } from "react";
import { fetchCategories, fetchSubSubCategoriesByCategoryId } from "../api/category";

export default function ProjectDetailsStep({ onNext, projectData, setProjectData }) {
  const [categories, setCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    sub_sub_category_id: "",
    duration_type: "days",
    duration_days: 0,
    duration_hours: 0,
    project_type: "fixed",
    budget: 0,
    budget_min: 0,
    budget_max: 0,
    hourly_rate: 0,
    preferred_skills: [],
    ...projectData
  });
  const [errors, setErrors] = useState({});

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.category_id) newErrors.category_id = "Category is required";

    if (form.project_type === "fixed" && form.budget <= 0) newErrors.budget = "Budget must be greater than 0";
    if (form.project_type === "hourly" && form.hourly_rate <= 0) newErrors.hourly_rate = "Hourly rate must be greater than 0";
    if (form.project_type === "bidding") {
      if (form.budget_min <= 0) newErrors.budget_min = "Min budget must be greater than 0";
      if (form.budget_max <= 0) newErrors.budget_max = "Max budget must be greater than 0";
      if (form.budget_max < form.budget_min) newErrors.budget_max = "Max budget must be greater than min budget";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Send form data to parent for draft project creation
    setProjectData(form);
    onNext(form);
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-category</label>
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
          </div>
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Project Type <span className="text-red-500">*</span></label>
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
                  placeholder="0.00"
                  value={form.budget}
                  onChange={handleChange}
                  className={`w-full border-2 ${errors.budget ? 'border-red-500' : 'border-gray-300'} pl-8 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                />
              </div>
              {errors.budget && <p className="mt-1 text-sm text-red-500">{errors.budget}</p>}
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
                  placeholder="0.00"
                  value={form.hourly_rate}
                  onChange={handleChange}
                  className={`w-full border-2 ${errors.hourly_rate ? 'border-red-500' : 'border-gray-300'} pl-14 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                />
              </div>
              {errors.hourly_rate && <p className="mt-1 text-sm text-red-500">{errors.hourly_rate}</p>}
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
              placeholder={`Duration in ${form.duration_type}`}
              value={form.duration_type === "days" ? form.duration_days : form.duration_hours}
              onChange={handleChange}
              className="border-2 border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
