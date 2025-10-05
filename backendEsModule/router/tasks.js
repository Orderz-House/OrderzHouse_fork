import express from "express";
import { authentication } from "../middleware/authentication.js";
import {
  getFreelancerTasks,
  getTaskPool,
  createTask,
  updateTask,
  deleteTask
} from "../controller/tasks.js";

const taskRouter = express.Router();

// Get my tasks
taskRouter.get("/my-tasks", authentication, getFreelancerTasks);

// Get task pool (other freelancers' tasks)
taskRouter.get("/pool", authentication, getTaskPool);

// Create new task
taskRouter.post("/", authentication, createTask);

// Update task
taskRouter.put("/:id", authentication, updateTask);

// Delete task
taskRouter.delete("/:id", authentication, deleteTask);

export default taskRouter;
