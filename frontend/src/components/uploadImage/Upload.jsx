import React, { useState } from "react";
import axios from "axios";

const ImgBBUpload = () => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select an image!");

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=3e98a98f3b7416d16ec2bf19527c5c65`,
        formData
      );
      setUrl(res.data.data.url); 
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
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
