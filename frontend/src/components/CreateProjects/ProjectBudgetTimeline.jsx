import React from "react";

const ProjectBudgetTimeline = ({ formData, setFormData, onNext, onBack }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProjectTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      project_type: type,
      budget: "",
      budget_min: "",
      budget_max: "",
      hourly_rate: ""
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation based on project type
    if (formData.project_type === "fixed" && !formData.budget) {
      alert("Please enter a budget for fixed project");
      return;
    }
    if (formData.project_type === "hourly" && !formData.hourly_rate) {
      alert("Please enter hourly rate");
      return;
    }
    if (formData.project_type === "bidding" && (!formData.budget_min || !formData.budget_max)) {
      alert("Please enter budget range for bidding project");
      return;
    }

    // Duration validation
    if (!formData.duration_type) {
      alert("Please select duration type");
      return;
    }
    if (formData.duration_type === "days" && !formData.duration_days) {
      alert("Please enter duration in days");
      return;
    }
    if (formData.duration_type === "hours" && !formData.duration_hours) {
      alert("Please enter duration in hours");
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Budget & Timeline
        </h2>

        {/* Project Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Project Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleProjectTypeChange("fixed")}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.project_type === "fixed"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-blue-300"
              }`}
            >
              <div className="font-semibold">Fixed Price</div>
              <div className="text-sm text-gray-600">One-time payment</div>
            </button>
            <button
              type="button"
              onClick={() => handleProjectTypeChange("hourly")}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.project_type === "hourly"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-blue-300"
              }`}
            >
              <div className="font-semibold">Hourly</div>
              <div className="text-sm text-gray-600">Pay per hour</div>
            </button>
            <button
              type="button"
              onClick={() => handleProjectTypeChange("bidding")}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.project_type === "bidding"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-blue-300"
              }`}
            >
              <div className="font-semibold">Bidding</div>
              <div className="text-sm text-gray-600">Accept bids</div>
            </button>
          </div>
        </div>

        {/* Budget Fields Based on Type */}
        {formData.project_type === "fixed" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Budget ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter fixed budget"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {formData.project_type === "hourly" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="hourly_rate"
              value={formData.hourly_rate}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter hourly rate"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Prepaid: 3 hours (${(formData.hourly_rate * 3 || 0).toFixed(2)})
            </p>
          </div>
        )}

        {formData.project_type === "bidding" && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Budget ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="budget_min"
                value={formData.budget_min}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Minimum"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Budget ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="budget_max"
                value={formData.budget_max}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Maximum"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Duration Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Duration Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="duration_type"
                value="days"
                checked={formData.duration_type === "days"}
                onChange={handleChange}
                className="mr-2"
              />
              <span>Days</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="duration_type"
                value="hours"
                checked={formData.duration_type === "hours"}
                onChange={handleChange}
                className="mr-2"
              />
              <span>Hours</span>
            </label>
          </div>
        </div>

        {/* Duration Input */}
        {formData.duration_type === "days" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (Days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="duration_days"
              value={formData.duration_days}
              onChange={handleChange}
              required
              min="1"
              placeholder="Enter number of days"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {formData.duration_type === "hours" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (Hours) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="duration_hours"
              value={formData.duration_hours}
              onChange={handleChange}
              required
              min="1"
              placeholder="Enter number of hours"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Review & Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProjectBudgetTimeline;