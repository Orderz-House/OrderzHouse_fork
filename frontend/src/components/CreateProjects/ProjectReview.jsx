import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProjectThunk } from "./api/projects";

const ProjectReview = ({ formData, onBack, onSuccess }) => {
  const dispatch = useDispatch();
  const { creating, error } = useSelector(state => state.project);

  const handleSubmit = async () => {
    try {
      const result = await dispatch(createProjectThunk(formData)).unwrap();
      onSuccess(result);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const formatBudget = () => {
    if (formData.project_type === "fixed") {
      return `$${formData.budget}`;
    } else if (formData.project_type === "hourly") {
      return `$${formData.hourly_rate}/hour (Prepaid: $${formData.hourly_rate * 3})`;
    } else if (formData.project_type === "bidding") {
      return `$${formData.budget_min} - $${formData.budget_max}`;
    }
    return "N/A";
  };

  const formatDuration = () => {
    if (formData.duration_type === "days") {
      return `${formData.duration_days} days`;
    } else if (formData.duration_type === "hours") {
      return `${formData.duration_hours} hours`;
    }
    return "N/A";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Review Your Project
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
            Basic Information
          </h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Title:</span>
              <span className="text-gray-800">{formData.title}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Description:</span>
              <span className="text-gray-800">{formData.description}</span>
            </div>
            {formData.preferred_skills?.length > 0 && (
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Skills:</span>
                <span className="text-gray-800">
                  {formData.preferred_skills.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Budget & Timeline */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
            Budget & Timeline
          </h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Project Type:</span>
              <span className="text-gray-800 capitalize">{formData.project_type}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Budget:</span>
              <span className="text-gray-800">{formatBudget()}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Duration:</span>
              <span className="text-gray-800">{formatDuration()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={creating}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={creating}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {creating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Project...
              </>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectReview;