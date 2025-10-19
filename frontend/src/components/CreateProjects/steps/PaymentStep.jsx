import React, { useRef, useState } from "react";

const THEME = "#028090";

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
    if (e.target.files && e.target.files[0]) setProofFile(e.target.files[0]);
  };
  const removeProofFile = () => {
    setProofFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setProofFile(e.dataTransfer.files[0]);
  };

  const calculateAmount = () => {
    if (!projectData.project_type) return 0;
    if (projectData.project_type === "fixed") return projectData.budget || 0;
    if (projectData.project_type === "hourly") return (projectData.hourly_rate || 0) * 3;
    if (projectData.project_type === "bidding") {
      const min = projectData.budget_min || 0, max = projectData.budget_max || 0;
      return `${min} - ${max}`;
    }
    return 0;
  };

  const getProjectTypeLabel = () => {
    const types = { fixed: "Fixed Price", hourly: "Hourly Rate", bidding: "Bidding" };
    return types[projectData.project_type] || "Not specified";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Payment & Submit</h2>
        <p className="text-slate-600">Review your project and upload payment proof to continue.</p>
      </div>

      {/* Project Preview */}
      <div className="rounded-2xl border border-slate-200 p-6 mb-6 bg-gradient-to-br from-[#02C39A]/10 via-[#028090]/10 to-[#05668D]/10">
        <h3 className="font-bold text-lg text-slate-900 mb-4">Project Preview</h3>
        <div className="grid gap-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</label>
            <p className="text-slate-900 font-medium mt-1">{projectData.title || "No title provided"}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
            <p className="text-slate-800 mt-1">{projectData.description || "No description provided"}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Type</label>
              <p className="text-slate-900 font-medium mt-1">{getProjectTypeLabel()}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget / Rate</label>
              <p className="text-slate-900 font-semibold mt-1" style={{ color: THEME }}>${calculateAmount()}</p>
            </div>
          </div>

          {projectData.preferred_skills?.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Required Skills</label>
              <div className="flex flex-wrap gap-2">
                {projectData.preferred_skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 border border-slate-200">
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Upload Payment Proof <span className="text-red-500">*</span>
        </label>

        <div
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging ? "border-[#028090] bg-[#E6F7F6]" : "border-slate-300 hover:border-[#028090]/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="proof-upload"
          />
          <label htmlFor="proof-upload" className="cursor-pointer block">
            <svg className="mx-auto h-10 w-10 text-slate-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-slate-600">Drop file here or click to browse</p>
          </label>
        </div>

        {proofFile && (
          <div className="mt-3 bg-[#E6F7F6] border border-[#028090]/30 p-3 rounded-xl flex justify-between items-center">
            <span className="text-slate-800">
              {proofFile.name} ({formatFileSize(proofFile.size)})
            </span>
            <button onClick={removeProofFile} className="text-red-600 font-semibold hover:underline">Remove</button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 h-12 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-60"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !proofFile}
          className="flex-1 h-12 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: THEME }}
        >
          {isSubmitting ? "Submitting..." : "Create Project"}
        </button>
      </div>
    </div>
  );
}
