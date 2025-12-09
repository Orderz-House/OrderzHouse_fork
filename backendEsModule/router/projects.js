import express from "express";
import multer from "multer";

import { authentication } from "../middleware/authentication.js";
import requireVerifiedWithSubscription from "../middleware/requireVerifiedWithSubscription.js";
// import adminViewerOnly from "../middleware/adminViewerOnly.js";
// import handleJsonOrForm from "../middleware/handleJsonOrForm.js";

import {
  createProject,
  // createAdminProject,
  uploadProjectMedia,
  getRelatedFreelancers,
  completeHourlyProject,
  approveWorkCompletion,
  resubmitWorkCompletion,
  addProjectFiles,
  assignFreelancer,
  acceptAssignment,
  rejectAssignment,
  applyForProject,
  approveOrRejectApplication,
  getApplicationsForMyProjects,
  getProjectTimeline,
  // admin helpers
  getAllFreelancers,
  getAllProjectsForAdmin,
  reassignFreelancer,
} from "../controller/projectsManagment/projects.js";

import {
  getProjectsByCategory,
  getProjectsBySubCategory,
  getProjectsBySubSubCategory,
  getProjectsByCategoryId,
  getProjectsBySubCategoryId,
  getProjectsBySubSubCategoryId,
  getProjectById,
  getProjectsByUserRole,
  getProjectFilesByProjectId,
} from "../controller/projectsManagment/projectsFiltering.js";

import { submitWorkCompletion } from "../controller/payments.js";

const projectsRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* --------------------------------
   CREATE PROJECTS
--------------------------------- */

projectsRouter.post(
  "/",
  authentication,
  uploadProjectMedia,
  createProject
);

// مشروع عن طريق admin viewer (لو فعلته)
// projectsRouter.post(
//   "/admin",
//   authentication,
//   adminViewerOnly,
//   handleJsonOrForm,
//   createAdminProject
// );

projectsRouter.get("/myprojects", authentication, getProjectsByUserRole);

/* --------------------------------
   DELETE (SOFT DELETE) PROJECT BY OWNER
--------------------------------- */

projectsRouter.delete(
  "/myprojects/:projectId",
  authentication,
  async (req, res, next) => {
    try {
      const { deleteProjectByOwner } = await import(
        "../controller/projectsManagment/projects.js"
      );
      return deleteProjectByOwner(req, res, next);
    } catch (err) {
      return next(err);
    }
  }
);

/* --------------------------------
   SINGLE PROJECT / BASIC ACTIONS
--------------------------------- */

// Get project by id
projectsRouter.get("/:projectId", authentication, getProjectById);

// Complete hourly project (client side)
projectsRouter.put(
  "/hourly/:projectId",
  authentication,
  completeHourlyProject
);

// Invite specific freelancer to this project
projectsRouter.post(
  "/:projectId/assign",
  authentication,
  assignFreelancer
);

// Get all files for project (any authorized user)
projectsRouter.get(
  "/:projectId/files",
  authentication,
  getProjectFilesByProjectId
);

/* --------------------------------
   WORK SUBMISSION (PAYMENTS)
--------------------------------- */

// Submit work for review (first submit)
projectsRouter.post(
  "/:projectId/submit",
  authentication,
  requireVerifiedWithSubscription,
  upload.array("files"),
  submitWorkCompletion
);

// Resubmit after revision requested
projectsRouter.post(
  "/:projectId/resubmit",
  authentication,
  requireVerifiedWithSubscription,
  upload.array("files"),
  resubmitWorkCompletion
);

/* --------------------------------
   ASSIGNMENT ACCEPT / REJECT
--------------------------------- */

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

/* --------------------------------
   CLIENT APPROVAL / REVISION
--------------------------------- */

projectsRouter.put(
  "/:projectId/approve",
  authentication,
  approveWorkCompletion
);

/* --------------------------------
   RELATED FREELANCERS + FILE UPLOAD
--------------------------------- */

// Get available freelancers for category
projectsRouter.get(
  "/categories/:categoryId/related-freelancers",
  authentication,
  getRelatedFreelancers
);

// Add chat-style files to project (client / freelancer)
projectsRouter.post(
  "/:projectId/files",
  authentication,
  upload.array("files", 5),
  addProjectFiles
);

/* --------------------------------
   NEW ROUTES (APPLY / APPLICATIONS / TIMELINE / ADMIN)
--------------------------------- */

// Freelancer applies to active fixed/hourly project
projectsRouter.post(
  "/:projectId/apply",
  authentication,
  requireVerifiedWithSubscription,
  applyForProject
);

// Client decides on freelancer application (accept/reject)
projectsRouter.post(
  "/applications/decision",
  authentication,
  approveOrRejectApplication
);

// Client gets all applications on his projects
projectsRouter.get(
  "/applications/my-projects",
  authentication,
  getApplicationsForMyProjects
);

// Project full timeline
projectsRouter.get(
  "/:projectId/timeline",
  authentication,
  getProjectTimeline
);

// Admin: list all freelancers
projectsRouter.get(
  "/admin/freelancers",
  authentication,
  // adminViewerOnly,
  getAllFreelancers
);

// Admin: list all projects
projectsRouter.get(
  "/admin/projects",
  authentication,
  // adminViewerOnly,
  getAllProjectsForAdmin
);

// Admin: reassign freelancer to admin project
projectsRouter.put(
  "/admin/projects/:projectId/reassign",
  authentication,
  // adminViewerOnly,
  reassignFreelancer
);

/* --------------------------------
   CATEGORY FILTER ROUTES (AUTH)
--------------------------------- */

projectsRouter.get(
  "/category/:category_id",
  authentication,
  getProjectsByCategory
);

projectsRouter.get(
  "/sub-category/:sub_category_id",
  authentication,
  getProjectsBySubCategory
);

projectsRouter.get(
  "/sub-sub-category/:sub_sub_category_id",
  authentication,
  getProjectsBySubSubCategory
);

/* --------------------------------
   PUBLIC CATEGORY ROUTES (NO AUTH)
--------------------------------- */

projectsRouter.get(
  "/public/category/:categoryId",
  getProjectsByCategoryId
);

projectsRouter.get(
  "/public/subcategory/:subCategoryId",
  getProjectsBySubCategoryId
);

projectsRouter.get(
  "/public/subsubcategory/:subSubCategoryId",
  getProjectsBySubSubCategoryId
);

export default projectsRouter;
