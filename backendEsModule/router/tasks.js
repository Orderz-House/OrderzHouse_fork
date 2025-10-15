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
  getCategories
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
router.get("/pool", authentication, getTaskPool); // auth optional but supported
router.post("/request/:id", authentication, requestTask);
router.get("/categories", getCategories); // public

export default router;