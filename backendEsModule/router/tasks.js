import express from "express";
import { authentication } from "../middleware/authentication.js";
import {
  getFreelancerTasks,
  getTaskPool,
  createTask,
  updateTask,
  deleteTask,
  requestTask,
  getUserRequestedTasks,
  getTaskRequests,
  updateTaskRequestStatus,
} from "../controller/tasks.js";

const taskRouter = express.Router();


// Get tasks from all active freelancers
taskRouter.get("/pool", getTaskPool);

// Get tasks for a specific freelancer (no auth required)
taskRouter.get("/freelancer/:freelancerId", getFreelancerTasks);

// Get my own tasks (freelancer)
taskRouter.get("/my", authentication, getFreelancerTasks);

// Create a new task (freelancer)
taskRouter.post("/", authentication, createTask);

// Update an existing task (freelancer)
taskRouter.put("/:id", authentication, updateTask);

// Delete a task (freelancer)
taskRouter.delete("/:id", authentication, deleteTask);

// Request a freelancer’s task (client)
taskRouter.post("/:taskId/request", authentication, requestTask);

// Get all tasks I requested (client)
taskRouter.get("/requests/my", authentication, getUserRequestedTasks);

// Get requests for my tasks (freelancer)
taskRouter.get("/requests", authentication, getTaskRequests);

// Update a request’s status (freelancer accepts/rejects)
taskRouter.patch(
  "/requests/:requestId/status",
  authentication,
  updateTaskRequestStatus
);

export default taskRouter;
