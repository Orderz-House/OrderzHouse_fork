import express from "express";
import { authentication } from "../middleware/authentication.js";
import { requireVerified } from "../middleware/requireVerification.js";
import requireVerifiedWithSubscription from "../middleware/requireVerifiedWithSubscription.js";
import authorization from "../middleware/authorization.js";
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
  // startProject,
} from "../controller/projectsManagment/projects.js";

import {
  getProjectsByCategory,
  getProjectsBySubCategory,
  getProjectsBySubSubCategory,
  getProjectsByCategoryId,
  getProjectsBySubCategoryId,
  getProjectsBySubSubCategoryId,
  getProjectById 
} from "../controller/projectsManagment/projectsFiltering.js";

const projectsRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ==============================
   🔒 Authenticated & Verified Routes
   ============================== */

// Create a new project
projectsRouter.post("/", authentication, createProject);


//get a project details 
projectsRouter.get(
  "/:projectId",
  authentication,         
  getProjectById
);

// client approve for Freelancer assignment

// projectsRouter.post("/:projectId/start", authentication, startProject);

// Complete hourly project
projectsRouter.put("/hourly/:projectId", authentication, completeHourlyProject);

// Assign a freelancer
projectsRouter.post("/:projectId/assign", authentication, assignFreelancer);

// Freelancer submits work completion
projectsRouter.post(
  "/:projectId/submit",
  authentication,
  requireVerified,
  upload.array("files"),
  submitWorkCompletion
);

// Freelancer resubmits after revision
projectsRouter.post(
  "/:projectId/resubmit",
  authentication,
  requireVerified,
  upload.array("files"),
  resubmitWorkCompletion
);

// Client approves or requests revision
projectsRouter.put(
  "/:projectId/approve",
  authentication,
  requireVerified,
  approveWorkCompletion
);

// Get related freelancers for a category
projectsRouter.get(
  "/categories/:categoryId/related-freelancers",
  authentication,
  getRelatedFreelancers
);

/* ==============================
   📂 Project File Uploads
   ============================== */
projectsRouter.post(
  "/:projectId/files",
  authentication,
  upload.array("files", 5),
  addProjectFiles
);

/* ==============================
   🔒 Authenticated Category-Based Filters
   ============================== */

// Main category (requires token)
projectsRouter.get(
  "/category/:category_id",
  authentication,
  getProjectsByCategory
);

// Sub-category (requires token)
projectsRouter.get(
  "/sub-category/:sub_category_id",
  authentication,
  getProjectsBySubCategory
);

// Sub-sub-category (requires token)
projectsRouter.get(
  "/sub-sub-category/:sub_sub_category_id",
  authentication,
  getProjectsBySubSubCategory
);

/* ==============================
   🌐 Public Category-Based Filters
   ============================== */

// Public main category
projectsRouter.get(
  "/public/category/:categoryId",
  getProjectsByCategoryId
);

// Public sub-category
projectsRouter.get(
  "/public/subcategory/:subCategoryId",
  getProjectsBySubCategoryId
);

// Public sub-sub-category
projectsRouter.get(
  "/public/subsubcategory/:subSubCategoryId",
  getProjectsBySubSubCategoryId
);

/* ==============================
   🔒 Assignment Acceptance / Rejection
   ============================== */
projectsRouter.post(
  "/assignments/:assignmentId/accept",
  authentication,
  acceptAssignment
);

projectsRouter.post(
  "/assignments/:assignmentId/reject",
  authentication,
  rejectAssignment
);

export default projectsRouter;
