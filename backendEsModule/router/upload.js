import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const uploadRouter = express.Router();

// Cloudinary configuration (CLOUDINARY_URL or explicit creds)
// If CLOUDINARY_URL is set, the SDK picks it up automatically.
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || undefined,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY || undefined,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET || undefined,
});

// Use memory storage for transient buffering before uploading to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Allowed: PNG, JPG, JPEG, WEBP"));
    }
    cb(null, true);
  },
});

uploadRouter.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    // Ensure Cloudinary is configured
    const hasCloudinaryConfig =
      !!process.env.CLOUDINARY_URL ||
      (!!cloudinary.config().cloud_name && !!cloudinary.config().api_key);
    if (!hasCloudinaryConfig) {
      return res.status(500).json({ success: false, message: "Cloudinary is not configured" });
    }

    const folder = process.env.CLOUDINARY_FOLDER || "uploads";
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
      overwrite: false,
    });

    const url = result?.secure_url || result?.url;
    if (!url) {
      return res.status(502).json({ success: false, message: "Failed to get image URL from Cloudinary" });
    }

    return res.status(200).json({ success: true, url });
  } catch (error) {
    const message = error?.response?.data?.error?.message || error.message || "Upload failed";
    return res.status(500).json({ success: false, message });
  }
});

export default uploadRouter;


