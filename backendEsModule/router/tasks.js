// router/tasks.js
import express from "express";
import { authentication } from "../middleware/authentication.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  getFreelancerTasks,
  getAssignedTasks,
  getTaskPool,
  createTask,
  updateTask,
  deleteTask,
  requestTask,
  getTaskRequests,
  updateTaskRequestStatus,
  getCategories,
  updateTaskStatus,
  submitWorkCompletion,
  approveWorkCompletion,
  resubmitWorkCompletion,
  addTaskFiles,
  getAllTasksForAdmin
} from "../controller/tasks.js";

const router = express.Router();

router.get("/my-tasks", authentication, getFreelancerTasks); // GET tasks created by freelancer
router.get("/assigned-to-me", authentication, getAssignedTasks); // NEW: GET tasks assigned to freelancer
router.post("/", authentication, createTask); // POST create task
router.put("/:id", authentication, updateTask); // PUT update task (before approval)
router.delete("/:id", authentication, deleteTask); // DELETE task (before approval)
router.get("/requests", authentication, getTaskRequests); // GET requests for freelancer's tasks
router.patch("/requests/:requestId/status", authentication, updateTaskRequestStatus); // PATCH update request status
router.patch("/:id/status", authentication, updateTaskStatus); // NEW: PATCH update task status (kanban)

router.post("/:id/submit-completion", authentication, upload.array('files'), submitWorkCompletion);
router.post("/:id/resubmit-completion", authentication, upload.array('files'), resubmitWorkCompletion);
router.post("/:id/files", authentication, upload.array('files'), addTaskFiles);

router.get("/pool", authentication, getTaskPool); // GET task pool (excludes assigned)
router.post("/request/:id", authentication, requestTask); // POST request a task
router.get("/categories", getCategories); // GET categories (public)

router.post("/:id/approve-completion", authentication, upload.array('files', 5), approveWorkCompletion);

router.get("/admin/tasks", authentication, getAllTasksForAdmin); // GET all tasks for admin

export default router;