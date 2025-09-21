import express from "express";
import { authentication } from "../middleware/authentication.js";
import { requireVerified } from "../middleware/requireVerification.js";
import {
  createProject,
  getMyProjects,
  assignProject,
  listUsersByRole,
  getRelatedFreelancers,
  getCategories,
  getSubCategories,
  getProjectById,
  updateAssignmentStatus,
  getAllProjectForOffer,
  sendOffer,
  approveOrRejectOffer,
  getProjectCompletion,
  submitWorkCompletion,
  releasePayment,
  getAllProjectForFreelancerById,
  uploadProjectFile,
  getProjectFiles,
  getCountProjectFreelancer,
  getMyProjectsAsFreelancer,
  quitProject,
  getProjectsByStatus
} from "../controller/projects.js";

const projectsRouter = express.Router();

// Create a project
projectsRouter.post("/", authentication, requireVerified, createProject);

// Get all available projects for offers
projectsRouter.get("/offers/available", authentication, requireVerified, getAllProjectForOffer);

// Get projects created by the authenticated user
projectsRouter.get("/mine", authentication, requireVerified, getMyProjects);

// Get project by ID
projectsRouter.get("/:projectId", authentication, requireVerified, getProjectById);

// Get all projects for a specific freelancer
projectsRouter.get("/freelancer/projects/:freelancerId", getAllProjectForFreelancerById);

// Send an offer
projectsRouter.post("/:projectId/offers", authentication, requireVerified, sendOffer);

// Assign a freelancer to a project
projectsRouter.post("/:projectId/assign", authentication, requireVerified, assignProject);

// Get related freelancers for a project
projectsRouter.get("/:projectId/related-freelancers", authentication, getRelatedFreelancers);

// Update assignment status
projectsRouter.put("/assigned/:projectId", authentication, requireVerified, updateAssignmentStatus);

// Approve or reject an offer
projectsRouter.post("/offer/action", authentication, requireVerified, approveOrRejectOffer);

// Get project completion details
projectsRouter.get("/:projectId/completion", authentication, requireVerified, getProjectCompletion);

// Quit project (freelancer)
projectsRouter.post("/:projectId/quit", authentication, requireVerified, quitProject);

// Upload project file (uncomment if using multer for file uploads)
// projectsRouter.post("/:projectId/files", upload.single("file"), uploadProjectFile);

// Get all project files
projectsRouter.get("/:projectId/files", getProjectFiles);

// Submit work completion request
projectsRouter.post("/:projectId/complete", authentication, submitWorkCompletion);

// Release payment for completed work
projectsRouter.post("/:projectId/release-payment/:freelancerId", authentication, requireVerified, releasePayment);

// Public endpoints
projectsRouter.get("/public/categories", getCategories);
projectsRouter.get("/public/categories/:categoryId/sub", getSubCategories);

// Helper: list users by role
projectsRouter.get("/users/by-role/:roleId", authentication, listUsersByRole);

// Get project counts for a freelancer
projectsRouter.get("/freelancer/:freelancer_id/counts", authentication, getCountProjectFreelancer);

// Add this to your projectsRouter
projectsRouter.get("/freelancer/:freelancerId/status", authentication, getProjectsByStatus);
// Add this to your router
projectsRouter.get("/freelancer/my-projects", authentication, requireVerified, getMyProjectsAsFreelancer);
export default projectsRouter;
