import express from "express";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";

const router = express.Router();

// Configure multer to handle file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// The upload route. 'image' is the name of the field in the form data.
router.post("/", upload.single('image'), async (req, res) => {
  // 1. Check if a file was received
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file provided." });
  }

  try {
    // 2. Create a form and append the image data
    const formData = new FormData();
    formData.append("image", req.file.buffer.toString("base64")); // Send as base64

    // 3. Make the POST request to the ImgBB API
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: {
          ...formData.getHeaders( ),
        },
      }
    );

    // 4. Check the response from ImgBB
    if (response.data.success) {
      // 5. Send the public URL back to the frontend
      res.status(200).json({
        success: true,
        message: "Image uploaded successfully.",
        url: response.data.data.url, // The public URL of the image
      });
    } else {
      throw new Error(response.data.error.message || "ImgBB upload failed.");
    }
  } catch (error) {
    console.error("Image upload error:", error.message);
    res.status(500).json({ success: false, message: "Server error during image upload." });
  }
});

export default router;
