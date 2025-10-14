import express from "express";
import { authentication } from "../middleware/authentication.js";
import { requireVerified } from "../middleware/requireVerification.js";
import requireVerifiedWithSubscription from "../middleware/requireVerifiedWithSubscription.js";
import authorization from "../middleware/authorization.js";

import {
  createProject,
  assignProject,
  getRelatedFreelancers,
  updateAssignmentStatus,
  getAllProjectForOffer,
  completeHourlyProject,
  getProjectsByCategoryId,
  getProjectsBySubCategoryId,
  getProjectsBySubSubCategoryId
} from "../controller/projects.js";

import {
  getProjectsByCategory,
  getProjectsBySubCategory,
  getProjectsBySubSubCategory
} from "../controller/projectsManagment/projectsFiltering.js";

const projectsRouter = express.Router();

/* ==============================
   🔒 Authenticated & Verified Routes
   ============================== */

// Create a new project
projectsRouter.post(
  "/",
  authentication,
  authorization("create_project"),
  createProject
);

// Complete hourly project
projectsRouter.put(
  "/hourly/:projectId",
  authentication,
  completeHourlyProject
);

// Assign a freelancer
projectsRouter.post(
  "/:projectId/assign",
  authentication,
  requireVerifiedWithSubscription,
  assignProject
);

// Update assignment status
projectsRouter.put(
  "/assigned/:projectId",
  authentication,
  requireVerified,
  updateAssignmentStatus
);

// Get related freelancers for a category
projectsRouter.get(
  "/categories/:categoryId/related-freelancers",
  authentication,
  getRelatedFreelancers
);

// Get all available projects for offers
projectsRouter.get(
  "/offers/available",
  authentication,
  requireVerified,
  getAllProjectForOffer
);

/* ==============================
   🔒 Authenticated Category-Based Filters
   ============================== */

// Main category
projectsRouter.get(
  "/category/:category_id",
  authentication,
  getProjectsByCategory
);

// Sub-category
projectsRouter.get(
  "/sub-category/:sub_category_id",
  authentication,
  getProjectsBySubCategory
);

// Sub-sub-category
projectsRouter.get(
  "/sub-sub-category/:sub_sub_category_id",
  authentication,
  getProjectsBySubSubCategory
);

/* ==============================
   🔓 Public Category-Based Filters
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

export default projectsRouter;
