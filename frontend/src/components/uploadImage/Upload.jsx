import React, { useState } from "react";
import axios from "axios";
import { toastError, toastSuccess } from "../../services/toastService";

const ImgBBUpload = ({ onUpload }) => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) return toastError("Please select an image!");

    if (!/(png|jpe?g|webp)$/i.test(image.name)) {
      return toastError("Only PNG, JPG, JPEG, WEBP are allowed");
    }
    if (image.size > 5 * 1024 * 1024) {
      return toastError("Max file size is 5MB");
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post(
        `http://localhost:5000/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const uploadedUrl = res.data?.url || "";
      setUrl(uploadedUrl);
      if (uploadedUrl && typeof onUpload === "function") {
        onUpload(uploadedUrl);
      }
      toastSuccess("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || "Upload failed!");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload</button>
      {url && (
        <div>
          <p>Uploaded Image:</p>
          <img src={url} alt="uploaded" width="200" />
        </div>
      )}
    </div>
  );
};

export default ImgBBUpload;
