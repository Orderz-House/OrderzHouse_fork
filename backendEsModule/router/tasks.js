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

// Get my tasks
taskRouter.get("/my-tasks", authentication, getFreelancerTasks);

// Get task pool (other freelancers' tasks)
taskRouter.get("/pool", authentication, getTaskPool);

// Create new task
taskRouter.post("/", authentication, createTask);

// Request a task (client)
taskRouter.post("/request/:id", authentication, requestTask);

// Update task
taskRouter.put("/:id", authentication, updateTask);

// Delete task
taskRouter.delete("/:id", authentication, deleteTask);

// Get tasks requested by the logged-in client
taskRouter.get("/requests/my", authentication, getUserRequestedTasks); // client

// Get requests for a specific task (freelancer)
taskRouter.get("/requests/:id", authentication, getTaskRequests);      // freelancer

taskRouter.patch(
  "/requests/:requestId/status",
  authentication,
  updateTaskRequestStatus
);
export default taskRouter;
