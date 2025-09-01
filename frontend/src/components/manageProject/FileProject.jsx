import { useState } from "react";
import { Download, Upload, Eye,Paperclip, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";

function FileProject() {
  const { projectId } = useParams();
  const { token, userData } = useSelector((state) => state.auth);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectId);
    formData.append("sender_id", userData.id);
    formData.append(
      "sender_type",
      userData.role_id === 1 || userData.role_id === 2 ? "client" : "freelancer"
    );

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `http://localhost:5000/projects/${projectId}/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFiles([...files, res.data.file]);
      alert("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setIsSubmitting(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Project Files</h2>
        <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload File
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isSubmitting}
          />
        </label>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12">
          <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No files uploaded yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Upload files to share with{" "}
            {userData.role_id === 1 || userData.role_id === 2
              ? "freelancers"
              : "the client"}
            .
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Paperclip className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {file.file_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.sender_type === "client" ? "Client" : "Freelancer"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(file.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FileProject;
