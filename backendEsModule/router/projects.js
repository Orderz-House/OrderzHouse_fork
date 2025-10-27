import express from "express";
import { authentication } from "../middleware/authentication.js";
import requireVerifiedWithSubscription from "../middleware/requireVerifiedWithSubscription.js";
import multer from "multer";

import {
  createProject,
  assignProject,
  getRelatedFreelancers,
  completeHourlyProject,
  submitWorkCompletion,
  approveWorkCompletion,
  resubmitWorkCompletion,
  addProjectFiles,
  assignFreelancer,
  acceptAssignment,
  rejectAssignment,
  applyForProject,
  approveOrRejectApplication,
  getApplicationsForMyProjects,
  getProjectTimeline
} from "../controller/projectsManagment/projects.js";

import {
  getProjectsByCategory,
  getProjectsBySubCategory,
  getProjectsBySubSubCategory,
  getProjectsByCategoryId,
  getProjectsBySubCategoryId,
  getProjectsBySubSubCategoryId,
  getProjectById,
} from "../controller/projectsManagment/projectsFiltering.js";

const projectsRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

projectsRouter.post("/", authentication, createProject);

projectsRouter.get("/:projectId", authentication, getProjectById);

projectsRouter.put("/hourly/:projectId", authentication, completeHourlyProject);

projectsRouter.post("/:projectId/assign", authentication, assignFreelancer);

projectsRouter.post(
  "/:projectId/submit",
  authentication,
  requireVerifiedWithSubscription,
  upload.array("files"),
  submitWorkCompletion
);

projectsRouter.post(
  "/:projectId/resubmit",
  authentication,
  requireVerifiedWithSubscription,
  upload.array("files"),
  resubmitWorkCompletion
);

projectsRouter.post(
  "/assignments/:assignmentId/accept",
  authentication,
  requireVerifiedWithSubscription,
  acceptAssignment
);

projectsRouter.post(
  "/assignments/:assignmentId/reject",
  authentication,
  requireVerifiedWithSubscription,
  rejectAssignment
);

projectsRouter.put(
  "/:projectId/approve",
  authentication,
  approveWorkCompletion
);

projectsRouter.get(
  "/categories/:categoryId/related-freelancers",
  authentication,
  getRelatedFreelancers
);

projectsRouter.post(
  "/:projectId/files",
  authentication,
  upload.array("files", 5),
  addProjectFiles
);

/* -------------------------------
   NEW ROUTES ADDED
-------------------------------- */

// Freelancer applies for active fixed/hourly project
projectsRouter.post(
  "/:projectId/apply",
  authentication,
  requireVerifiedWithSubscription,
  applyForProject
);

// Client approves or rejects freelancer application
projectsRouter.post(
  "/applications/decision",
  authentication,
  approveOrRejectApplication
);

// Client fetches all applications for their projects
projectsRouter.get(
  "/applications/my-projects",
  authentication,
  getApplicationsForMyProjects
);

// Get full project timeline
projectsRouter.get(
  "/:projectId/timeline",
  authentication,
  getProjectTimeline
);

/* -------------------------------
   EXISTING CATEGORY FILTER ROUTES
-------------------------------- */
projectsRouter.get("/category/:category_id", authentication, getProjectsByCategory);
projectsRouter.get("/sub-category/:sub_category_id", authentication, getProjectsBySubCategory);
projectsRouter.get("/sub-sub-category/:sub_sub_category_id", authentication, getProjectsBySubSubCategory);

projectsRouter.get("/public/category/:categoryId", getProjectsByCategoryId);
projectsRouter.get("/public/subcategory/:subCategoryId", getProjectsBySubCategoryId);
projectsRouter.get("/public/subsubcategory/:subSubCategoryId", getProjectsBySubSubCategoryId);

export default projectsRouter;
