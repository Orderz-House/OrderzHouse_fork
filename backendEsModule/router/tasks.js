import express from "express";
import { authentication } from "../middleware/authentication.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  // Admin Routes
  getAllTasksForAdmin,
  approveTaskByAdmin,
  confirmPaymentByAdmin,

  // Freelancer Routes
  createTask,
  updateTask,
  deleteTask,
  getFreelancerCreatedTasks,
  getAssignedTasks,
  getTaskRequests,
  updateTaskRequestStatus,
  updateTaskKanbanStatus,
  submitWorkCompletion,
  resubmitWorkCompletion,

  // Client Routes
  requestTask,
  submitPaymentProof,
  approveWorkCompletion,
  createReview,

  // Public & Shared Routes
  getTaskPool,
  getTaskById,
  getCategories,
  addTaskFiles,
} from "../controller/tasks.js";

const router = express.Router();

/* =============================================
   ADMIN ROUTES
   ============================================= */
router.get("/admin/all", authentication, getAllTasksForAdmin);
router.patch("/admin/approve/:id", authentication, approveTaskByAdmin);
router.patch("/admin/confirm-payment/:id", authentication, confirmPaymentByAdmin);


/* =============================================
   FREELANCER ROUTES
   ============================================= */
// Now accepts files via form-data
router.post("/", authentication, upload.array('files'), createTask); 
router.put("/:id", authentication, updateTask);
router.delete("/:id", authentication, deleteTask);
router.get("/my-created", authentication, getFreelancerCreatedTasks);
router.get("/requests", authentication, getTaskRequests);
router.patch("/requests/:requestId/status", authentication, updateTaskRequestStatus);
router.get("/assigned-to-me", authentication, getAssignedTasks);
router.patch("/:id/kanban-status", authentication, updateTaskKanbanStatus);
router.post("/:id/submit-completion", authentication, upload.array('files'), submitWorkCompletion);
router.post("/:id/resubmit-completion", authentication, upload.array('files'), resubmitWorkCompletion);


/* =============================================
   CLIENT ROUTES
   ============================================= */
// Now accepts files via form-data
router.post("/request/:id", authentication, upload.array('files'), requestTask); 
// New route for payment proof
router.post("/:id/submit-payment-proof", authentication, upload.single('paymentProof'), submitPaymentProof);
router.post("/:id/approve-completion", authentication, upload.array('files', 5), approveWorkCompletion);
router.post("/:id/review", authentication, createReview);


/* =============================================
   PUBLIC & SHARED ROUTES
   ============================================= */
router.get("/pool", authentication, getTaskPool);
router.get("/categories", getCategories);
router.get("/:id", getTaskById);
router.post("/:id/files", authentication, upload.array('files'), addTaskFiles);

export default router;