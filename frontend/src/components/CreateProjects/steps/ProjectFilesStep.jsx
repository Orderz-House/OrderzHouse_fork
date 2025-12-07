// components/CreateProjects/steps/ProjectFilesStep.jsx
import React, { useState } from "react";

const THEME = "#028090";

export default function ProjectFilesStep({
  files,
  setFiles,
  onNext,
  onBack,
  isTask = false,
}) {
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []).slice(0, 5);
    setFiles(selectedFiles);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).slice(0, 5);
      setFiles(droppedFiles);
    }
  };

  const removeFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          {isTask ? "Upload Task Files" : "Upload Project Files"}
        </h2>
        <p className="text-slate-600">
          Drag & drop files or click to select (max 5) – Optional
        </p>
      </div>

      <div
        className={`rounded-2xl p-10 text-center border-2 border-dashed transition-all ${
          dragActive
            ? "border-[#028090] bg-[#E6F7F6]"
            : "border-slate-300 hover:border-[#028090]/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <svg
            className="mx-auto h-12 w-12 text-slate-400 mb-4"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-slate-600 text-lg">
            Drop files here or click to browse
          </p>
          <p className="text-slate-400 text-sm mt-1">
            You can skip this step if you don't have files yet
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-slate-800 mb-3">
            Selected Files ({files.length})
          </h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5"
                    style={{ color: THEME }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-slate-900 font-medium">
                      {file.name}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-700 font-semibold px-3 py-1 rounded hover:bg-red-50 transition"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-12 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 h-12 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2"
          style={{ background: THEME }}
        >
          {files.length === 0 ? "Skip" : "Continue"}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
