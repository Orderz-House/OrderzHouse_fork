import express from "express";
import { authentication } from "../middleware/authentication.js";
import { requireVerified } from "../middleware/requireVerification.js";
import authorization from "../middleware/authorization.js";
import {
  createProject,
  getMyProjects,
  assignProject,
  listUsersByRole,
  getRelatedFreelancers,
  getProjectById,
  updateAssignmentStatus,
  getAllProjectForOffer,
  sendOffer,
  getProjectCompletion,
  submitWorkCompletion,
  getAllProjectForFreelancerById,
  uploadProjectFile,
  getProjectFiles,
  getCountProjectFreelancer,
  getMyProjectsAsFreelancer,
  quitProject,
  getProjectsByStatus,
  approveOrRejectOffer,
  completeHourlyProject,
  getProjectsByCategoryId,
  getProjectsBySubCategoryId,
 getProjectsBySubSubCategoryId
} from "../controller/projects.js";

const projectsRouter = express.Router();

// ---------------------- Authenticated & Verified ----------------------

// Create a new project
projectsRouter.post(
  "/",
  authentication,
  authorization("create_project"),
  createProject
);
projectsRouter.put(
  "/hourly/:projectId",
  authentication,
  completeHourlyProject)

// Get projects created by the authenticated user
projectsRouter.get("/mine", authentication, getMyProjects);

// Get project by ID
projectsRouter.get(
  "/:projectId",
  authentication,
  requireVerified,
  getProjectById
);

// Assign a freelancer to a project
projectsRouter.post(
  "/:projectId/assign",
  authentication,
  requireVerified,
  assignProject
);

// Update assignment status
projectsRouter.put(
  "/assigned/:projectId",
  authentication,
  requireVerified,
  updateAssignmentStatus
);

// Get project completion details
projectsRouter.get(
  "/:projectId/completion",
  authentication,
  requireVerified,
  getProjectCompletion
);

// Submit work completion request
projectsRouter.post(
  "/:projectId/complete",
  authentication,
  submitWorkCompletion
);

// Quit project (freelancer)
projectsRouter.post(
  "/:projectId/quit",
  authentication,
  requireVerified,
  quitProject
);

// Send an offer for a project
projectsRouter.post(
  "/:projectId/offers",
  authentication,
  requireVerified,
  sendOffer
);

// projectsRouter.post("/:projectId/files", upload.single("file"), uploadProjectFile);

// Get all project files
projectsRouter.get("/:projectId/files", authentication, getProjectFiles);

// Get all available projects for freelancers to make offers
projectsRouter.get(
  "/offers/available",
  authentication,
  requireVerified,
  getAllProjectForOffer
);

// Get related freelancers for a project
projectsRouter.get(
  "/categories/:categoryId/related-freelancers",
  authentication,
  getRelatedFreelancers
);

// Get projects by freelancer with status filter
projectsRouter.get(
  "/freelancer/:freelancerId/status",
  authentication,
  getProjectsByStatus
);

// Get all projects for a specific freelancer
projectsRouter.get(
  "/freelancer/projects/:freelancerId",
  authentication,
  getAllProjectForFreelancerById
);

// Get projects assigned to authenticated freelancer
projectsRouter.get(
  "/freelancer/my-projects",
  authentication,
  requireVerified,
  getMyProjectsAsFreelancer
);

// Get project counts for a freelancer
projectsRouter.get(
  "/freelancer/:freelancer_id/counts",
  authentication,
  getCountProjectFreelancer
);

projectsRouter.get("/subcategory/:subCategoryId", getProjectsBySubCategoryId);
projectsRouter.get("/subsubcategory/:subSubCategoryId", getProjectsBySubSubCategoryId);

// List users by role
projectsRouter.get("/users/by-role/:roleId", authentication, listUsersByRole);

// ---------------------- Offers Approval (Client) ----------------------
projectsRouter.post(
  "/offers/approve-reject",
  authentication,
  requireVerified,
  approveOrRejectOffer
);

projectsRouter.get(
  "/category/:categoryId",
  getProjectsByCategoryId
);

export default projectsRouter;
