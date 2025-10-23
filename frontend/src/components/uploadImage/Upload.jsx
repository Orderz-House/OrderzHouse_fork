import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, Loader, Image as ImageIcon } from 'lucide-react';
import { toastError, toastSuccess } from '../../services/toastService'; 

const Upload = ({ onUpload, currentImageUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || '');
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) return toastError('Please select a valid image file.');
    if (file.size > 5 * 1024 * 1024) return toastError('Image size cannot exceed 5MB.');

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
     
      const response = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const imageUrl = response.data.url;
        toastSuccess('Image uploaded!');
        if (typeof onUpload === 'function') {
          onUpload(imageUrl);
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Upload failed. Please try again.';
      toastError(errorMessage);
      setPreview(currentImageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 text-center">
      <div className="relative inline-block mb-4">
        <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-2">
          {isUploading ? <Loader className="w-10 h-10 text-blue-500 animate-spin" /> : (
            preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-gray-400" />
          )}
        </div>
      </div>
      <h4 className="font-semibold">Profile Picture</h4>
      <p className="text-xs text-gray-500 mt-1 mb-3">Max 5MB.</p>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={isUploading} />
      <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="w-full px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 disabled:opacity-50">
        <UploadCloud className="w-4 h-4 mr-2 inline" />
        {isUploading ? 'Uploading...' : 'Choose Image'}
      </button>
    </div>
  );
};

export default Upload;
