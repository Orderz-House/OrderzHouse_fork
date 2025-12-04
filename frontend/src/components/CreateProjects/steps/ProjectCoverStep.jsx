// components/CreateProjects/steps/ProjectCoverStep.jsx
import React, { useState } from "react";

const THEME = "#028090";

export default function ProjectCoverStep({
  coverPic,
  setCoverPic,
  onNext,
  onBack,
  isTask = false,
}) {
  const [preview, setPreview] = useState(
    coverPic ? URL.createObjectURL(coverPic) : null
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemove = () => {
    setCoverPic(null);
    setPreview(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          {isTask ? "Task Cover Image" : "Project Cover Image"}
        </h2>
        <p className="text-slate-600">
          {isTask
            ? "Upload a nice preview image for your task (optional)"
            : "Upload a nice preview image for your project (optional)"}
        </p>
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:border-[#028090]/50 transition-all">
        {!preview ? (
          <>
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="cover-upload" className="cursor-pointer block">
              <svg
                className="mx-auto h-12 w-12 text-slate-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                />
              </svg>
              <p className="text-slate-600 text-lg">
                Click to upload cover image
              </p>
              <p className="text-slate-400 text-sm mt-1">
                You can skip this step if you prefer
              </p>
            </label>
          </>
        ) : (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Cover preview"
              className="w-full max-w-md mx-auto rounded-2xl shadow-md border border-slate-200"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 font-bold rounded-full px-2"
            >
              ×
            </button>
          </div>
        )}
      </div>

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
          {preview ? "Continue" : "Skip"}
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
