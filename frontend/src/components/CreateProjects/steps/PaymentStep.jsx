import React, { useRef, useState } from "react";

export default function PaymentStep({
  onBack,
  files,
  projectData = {},
  selectedFreelancer,
  proofFile,
  setProofFile,
  isSubmitting,
  onSubmit
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const removeProofFile = () => {
    setProofFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setProofFile(e.dataTransfer.files[0]);
    }
  };

  const calculateAmount = () => {
    if (!projectData.project_type) return 0;
    if (projectData.project_type === "fixed") return projectData.budget || 0;
    if (projectData.project_type === "hourly") return (projectData.hourly_rate || 0) * 3;
    if (projectData.project_type === "bidding") {
      const min = projectData.budget_min || 0;
      const max = projectData.budget_max || 0;
      return `${min} - ${max}`;
    }
    return 0;
  };

  const getProjectTypeLabel = () => {
    const types = {
      fixed: "Fixed Price",
      hourly: "Hourly Rate",
      bidding: "Bidding"
    };
    return types[projectData.project_type] || "Not specified";
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment & Submit</h2>
        <p className="text-gray-600">
          Review your project details and upload proof of payment to continue.
        </p>
      </div>

      {/* Project Preview */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-100">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Project Preview</h3>
        
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Title</label>
            <p className="text-gray-900 font-medium mt-1">{projectData.title || 'No title provided'}</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Description</label>
            <p className="text-gray-900 mt-1 line-clamp-3">{projectData.description || 'No description provided'}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Project Type</label>
              <p className="text-gray-900 font-medium mt-1">{getProjectTypeLabel()}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Budget / Rate</label>
              <p className="text-gray-900 font-medium mt-1 text-green-600">${calculateAmount()}</p>
            </div>
          </div>

          {projectData.preferred_skills?.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Required Skills</label>
              <div className="flex flex-wrap gap-2">
                {projectData.preferred_skills.map((skill, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Proof Upload */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Upload Payment Proof <span className="text-red-500">*</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="border p-3 rounded-lg w-full"
        />
        {proofFile && (
          <div className="mt-3 bg-green-50 p-3 rounded-lg flex justify-between items-center">
            <span>{proofFile.name} ({formatFileSize(proofFile.size)})</span>
            <button onClick={removeProofFile} className="text-red-600 font-semibold">Remove</button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !proofFile}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Create Project'}
        </button>
      </div>
    </div>
  );
}
