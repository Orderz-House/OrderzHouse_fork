import { useState } from "react";
import axios from "axios";
import { toastError, toastSuccess } from "../../../services/toastService";
import { API_BASE } from "../constants";

export const useFileUpload = (token) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFilesToProject = async (projectId) => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const uploadPromises = selectedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          `${API_BASE}/uploads/upload/${projectId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error("File upload error:", error);
        toastError(`Failed to upload ${file.name}`);
        return null;
      }
    });

    try {
      await Promise.all(uploadPromises);
      toastSuccess("Files uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return {
    selectedFiles,
    uploading,
    handleFileSelect,
    removeFile,
    uploadFilesToProject,
  };
};