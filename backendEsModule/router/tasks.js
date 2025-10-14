// src/routes/tasksRouter.js
import express from "express";
import { authentication } from "../middleware/authentication.js";
import {
  getFreelancerTasks,
  getTaskPool,
  createTask,
  updateTask,
  deleteTask,
  requestTask,
  getTaskRequests,
  updateTaskRequestStatus,
  getCategories,
  adminApproveTask, 
  addReview
} from "../controller/tasks.js";

const router = express.Router();

// Freelancer routes
router.get("/my-tasks", authentication, getFreelancerTasks);
router.post("/", authentication, createTask);
router.put("/:id", authentication, updateTask);
router.delete("/:id", authentication, deleteTask);
router.get("/requests", authentication, getTaskRequests);
router.patch("/requests/:requestId/status", authentication, updateTaskRequestStatus);

// Public/client routes
router.get("/pool", authentication, getTaskPool); 
router.post("/request/:id", authentication, requestTask);
router.get("/categories", getCategories); // public

// Admin routes
router.patch("/admin/approve", authentication, adminApproveTask); // Admin only

// Review routes
router.post("/reviews", authentication, addReview); 

export default router;