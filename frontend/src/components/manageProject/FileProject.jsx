import { useState, useEffect } from "react";
import { 
  Download, 
  Upload, 
  Eye, 
  Paperclip, 
  Trash2, 
  FileText, 
  Image, 
  File, 
  Video,
  Music,
  Archive,
  FileQuestion,
  CheckCircle,
  XCircle,
  Loader,
  MoreVertical
} from "lucide-react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";

function FileProject() {
  const { projectId } = useParams();
  const { token, userData } = useSelector((state) => state.auth);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, [projectId, token]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://backend.thi8ah.com/projects/${projectId}/files`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFiles(response.data.files || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectId);
    formData.append("sender_id", userData.id);
    formData.append(
      "sender_type",
      userData.role_id === 1 || userData.role_id === 2 ? "client" : "freelancer"
    );

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const res = await axios.post(
        `https://backend.thi8ah.com/projects/${projectId}/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      
      setFiles(prevFiles => [res.data.file, ...prevFiles]);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      e.target.value = "";
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await axios.get(
        `https://backend.thi8ah.com/projects/${projectId}/files/${file.id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    
    try {
      setDeletingFileId(fileId);
      await axios.delete(
        `https://backend.thi8ah.com/projects/${projectId}/files/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      alert("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file");
    } finally {
      setDeletingFileId(null);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const fileType = getFileType(extension);
    
    switch (fileType) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-purple-500" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-amber-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-green-500" />;
      default:
        return <FileQuestion className="w-5 h-5 text-gray-400" />;
    }
  };

  const getFileType = (extension) => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const audioTypes = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
    const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'];
    
    if (imageTypes.includes(extension)) return 'image';
    if (videoTypes.includes(extension)) return 'video';
    if (audioTypes.includes(extension)) return 'audio';
    if (archiveTypes.includes(extension)) return 'archive';
    if (documentTypes.includes(extension)) return 'document';
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Files</h2>
          <p className="text-gray-600 mt-1">
            Share and manage files with your team members
          </p>
        </div>
        
        {/* Upload Button */}
        <label className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md font-medium">
          <Upload className="w-5 h-5 mr-2" />
          Upload File
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              Uploading {selectedFile?.name}...
            </span>
            <span className="text-sm text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Files List */}
      {files.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Paperclip className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No files yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Upload files to share with your team. Supported formats: documents, images, videos, and more.
          </p>
          <label className="inline-flex items-center px-6 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 mt-4">
            <Upload className="w-4 h-4 mr-2" />
            Select File
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      {getFileIcon(file.file_name)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {file.file_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>{file.sender_type === "client" ? "Client" : "Freelancer"}</span>
                      <span>•</span>
                      <span>
                        {new Date(file.sent_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingFileId === file.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    {deletingFileId === file.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {files.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{files.length}</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {files.filter(f => getFileType(f.file_name.split('.').pop()) === 'document').length}
              </div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {files.filter(f => getFileType(f.file_name.split('.').pop()) === 'image').length}
              </div>
              <div className="text-sm text-gray-600">Images</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {files.filter(f => getFileType(f.file_name.split('.').pop()) === 'other').length}
              </div>
              <div className="text-sm text-gray-600">Other</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileProject;