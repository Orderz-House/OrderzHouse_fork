// routes/blogs.js
import express from "express";
import multer from "multer";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  approveBlog,
  rejectBlog,
  likeBlog,
  saveBlog
} from "../controller/blogs.js";

const router = express.Router();

// Configure multer for memory storage (required for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'cover') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Cover must be an image'), false);
      }
    } else if (file.fieldname === 'attachments') {
      const allowedTypes = [
        'image/', 
        'application/pdf', 
        'text/', 
        'application/msword',
        'application/vnd.openxmlformats-officedocument'
      ];
      const isValid = allowedTypes.some(type => file.mimetype.startsWith(type));
      cb(null, isValid);
    } else {
      cb(null, true);
    }
  }
}).fields([
  { name: 'cover', maxCount: 1 },
  { name: 'attachments', maxCount: 5 }
]);

// Public routes
router.get("/", getBlogs);
router.get("/:id", getBlogById);

// Protected routes with upload middleware
router.post("/", authentication, upload, createBlog);
router.put("/:id", authentication, upload, updateBlog);
router.delete("/:id", authentication, deleteBlog);
router.put("/:id/approve", authentication, authorization("admin"), approveBlog);
router.put("/:id/reject", authentication, authorization("admin"), rejectBlog);
router.post("/:id/like", authentication, likeBlog);
router.post("/:id/save", authentication, saveBlog);

export default router;