import React, { useState, useEffect } from "react";

const ProjectBasicInfo = ({ formData, setFormData, onNext, categories }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  useEffect(() => {
    if (formData.category_id) {
      const category = categories.find(c => c.id === parseInt(formData.category_id));
      setSubCategories(category?.subcategories || []);
      setFormData(prev => ({ ...prev, sub_category_id: "", sub_sub_category_id: "" }));
    }
  }, [formData.category_id]);

  useEffect(() => {
    if (formData.sub_category_id) {
      const subCat = subCategories.find(s => s.id === parseInt(formData.sub_category_id));
      setSubSubCategories(subCat?.subsubcategories || []);
      setFormData(prev => ({ ...prev, sub_sub_category_id: "" }));
    }
  }, [formData.sub_category_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category_id || !formData.title || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Basic Project Information
        </h2>

        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Sub Category */}
        {subCategories.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Category
            </label>
            <select
              name="sub_category_id"
              value={formData.sub_category_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Sub Category</option>
              {subCategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sub Sub Category */}
        {subSubCategories.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Sub Category
            </label>
            <select
              name="sub_sub_category_id"
              value={formData.sub_sub_category_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Sub Sub Category</option>
              {subSubCategories.map(subsub => (
                <option key={subsub.id} value={subsub.id}>{subsub.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Project Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter a clear and descriptive title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Project Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="6"
            placeholder="Describe your project in detail..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Skills */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills (comma separated)
          </label>
          <input
            type="text"
            name="preferred_skills"
            value={formData.preferred_skills?.join(", ") || ""}
            onChange={(e) => {
              const skills = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
              setFormData(prev => ({ ...prev, preferred_skills: skills }));
            }}
            placeholder="e.g., React, Node.js, MongoDB"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continue to Budget & Timeline
        </button>
      </div>
    </form>
  );
};

export default ProjectBasicInfo;