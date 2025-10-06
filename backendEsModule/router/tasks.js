import express from "express";
import { authentication } from "../middleware/authentication.js";
import {
  getFreelancerTasks,
  getTaskPool,
  createTask,
  updateTask,
  deleteTask,
  getTaskRequests,
  acceptTaskRequest,
  declineTaskRequest,
  requestTask,
} from "../controller/tasks.js";

const router = express.Router();

// --- PUBLIC ROUTES ---
// Get tasks for a specific freelancer
router.get("/freelancer/:freelancerId", getFreelancerTasks);

// Get tasks from all other freelancers
router.get("/pool/:freelancerId", getTaskPool);


// --- PROTECTED ROUTES (require authentication) ---

// Create a new task for the authenticated user
router.post("/", authentication, createTask);

// Update a task owned by the authenticated user
router.put("/:id", authentication, updateTask);

// Delete a task owned by the authenticated user
router.delete("/:id", authentication, deleteTask);

// Allow a client to request a specific task
router.post("/:taskId/request", authentication, requestTask);


// --- TASK REQUEST MANAGEMENT ROUTES (for the freelancer) ---

// Get all pending requests for the authenticated freelancer
router.get("/requests", authentication, getTaskRequests);

// Accept a pending request
router.put("/requests/:requestId/accept", authentication, acceptTaskRequest);

// Decline a pending request
router.put("/requests/:requestId/decline", authentication, declineTaskRequest);

export default router;
