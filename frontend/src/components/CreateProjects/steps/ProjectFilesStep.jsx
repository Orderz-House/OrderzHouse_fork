import React, { useState } from "react";

export default function ProjectFilesStep({ files, setFiles, onNext, onBack }) {
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    setFiles([...e.target.files]);
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
      setFiles([...e.dataTransfer.files]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-2">Upload Project Files (Optional)</h2>
      <p className="text-gray-600 mb-6">Drag & drop files or click to select files</p>

      <div
        className={`border-3 border-dashed rounded-xl p-12 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input type="file" multiple onChange={handleChange} className="hidden" id="file-upload"/>
        <label htmlFor="file-upload" className="cursor-pointer">
          <p className="text-gray-500">Drop files here or click to browse</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Selected Files ({files.length})</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>{file.name} ({formatFileSize(file.size)})</span>
                <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 font-bold">Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <button onClick={onBack} className="flex-1 bg-gray-100 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200">
          Back
        </button>
        <button onClick={onNext} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800">
          {files.length > 0 ? "Continue" : "Skip"}
        </button>
      </div>
    </div>
  );
}
