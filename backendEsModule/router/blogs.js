// routes/blogs.js
import express from "express";
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

// Public routes
router.get("/", getBlogs);
router.get("/:id", getBlogById);

// Protected routes
router.post("/", authentication, createBlog);
router.put("/:id", authentication, updateBlog);
router.delete("/:id", authentication, deleteBlog);
router.put("/:id/approve", authentication, authorization("admin"), approveBlog);
router.put("/:id/reject", authentication, authorization("admin"), rejectBlog);
router.post("/:id/like", authentication, likeBlog);
router.post("/:id/save", authentication, saveBlog);

export default router;