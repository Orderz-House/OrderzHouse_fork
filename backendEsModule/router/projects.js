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
  getPublicCategories 
} from "../controller/projects.js";
import {
  getProjectsByCategory,
  getProjectsBySubCategory,
  getProjectsBySubSubCategory,
} from "../controller/projectsManagment/projectsFiltering.js"; 


const projectsRouter = express.Router();

// Public route - no authentication needed
projectsRouter.get("/public/categories", getPublicCategories); 

// ---------------------- Authenticated & Verified ----------------------



/* ==============================
   ✅ Project Management Routes
   ============================== */

// Create a new project
projectsRouter.post(
  "/",
  authentication,
  authorization("create_project"),
  createProject
);

// Complete hourly project with final hours calculation
projectsRouter.put(
  "/hourly/:projectId",
  authentication,
  completeHourlyProject
);

// Assign a freelancer to a project
projectsRouter.post(
  "/:projectId/assign",
  authentication,
  requireVerifiedWithSubscription, // ✅ enforce verified + active subscription
  assignProject
);

// Update assignment status (active, kicked, quit, banned, completed)
projectsRouter.put(
  "/assigned/:projectId",
  authentication,
  requireVerified,
  updateAssignmentStatus
);

// Get related freelancers for a specific category
projectsRouter.get(
  "/categories/:categoryId/related-freelancers",
  authentication,
  getRelatedFreelancers
);

// Get all available projects for freelancers to make offers
projectsRouter.get(
  "/offers/available",
  authentication,
  requireVerified,
  getAllProjectForOffer
);

/* ==============================
   ✅ Category-based Project Filters
   ============================== */

// Get projects by main category
projectsRouter.get(
  "/category/:category_id",
  authentication,
  getProjectsByCategory
);

// Get projects by sub-category
projectsRouter.get(
  "/sub-category/:sub_category_id",
  authentication,
  getProjectsBySubCategory
);

// Get projects by sub-sub-category
projectsRouter.get(
  "/sub-sub-category/:sub_sub_category_id",
  authentication,
  getProjectsBySubSubCategory
);

export default projectsRouter;