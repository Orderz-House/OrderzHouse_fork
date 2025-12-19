import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

import { authentication } from "../middleware/authentication.js";
import requireVerifiedWithSubscription from "../middleware/requireVerifiedWithSubscription.js";
import adminOnly from "../middleware/adminOnly.js";

import {
  createProject,
  uploadProjectMedia,
  assignFreelancer,
  applyForProject,
  approveOrRejectApplication,
  acceptAssignment,
  rejectAssignment,
  getApplicationsForMyProjects,
  approveWorkCompletion,
  resubmitWorkCompletion,
  completeHourlyProject,
  addProjectFiles,
  deleteProjectByOwner,
  getProjectTimeline,
  // admin helpers
  getAllFreelancers,
  getAllProjectsForAdmin,
  reassignFreelancer,
  submitProjectDelivery,
  getProjectDeliveries,
  // bulk project helpers
  createBulkProjects,
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
  getPublicCategories,
} from "../controller/projectsManagment/projectsFiltering.js";

import {getAssignmentsForProject} from "../controller/projectsManagment/assignments.js";


const projectsRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ======================================================================
   BULK PROJECT ENDPOINTS
====================================================================== */

// Endpoint to get titles for bulk project creation
projectsRouter.get(
  "/bulk-project-titles",
  authentication,
  adminOnly,
  (req, res) => {
    try {
      // Read titles from titles.txt file
      const titlesFilePath = path.join(process.cwd(), 'titles.txt');
      console.log('Attempting to read titles from:', titlesFilePath);
      console.log('Current working directory:', process.cwd());
      
      // Check if file exists
      if (!fs.existsSync(titlesFilePath)) {
        console.error('Titles file not found at:', titlesFilePath);
        // Try alternative path
        const altPath = path.join(__dirname, '..', '..', 'titles.txt');
        console.log('Trying alternative path:', altPath);
        if (fs.existsSync(altPath)) {
          console.log('Found file at alternative path');
          const titlesData = fs.readFileSync(altPath, 'utf8');
          const titles = titlesData.split('\n').filter(title => title.trim() !== '');
          console.log('Successfully read', titles.length, 'titles from alternative path');
          return res.json(titles);
        }
        return res.status(404).json({ 
          success: false, 
          message: "Titles file not found" 
        });
      }
      
      const titlesData = fs.readFileSync(titlesFilePath, 'utf8');
      const titles = titlesData.split('\n').filter(title => title.trim() !== '');
      
      console.log('Successfully read', titles.length, 'titles from file');
      res.json(titles);
    } catch (error) {
      console.error("Error reading titles file:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to read titles file",
        error: error.message
      });
    }
  }
);

// Endpoint to create bulk projects
projectsRouter.post(
  "/admin/bulk-create",
  authentication,
  adminOnly,
  createBulkProjects
);

/* ======================================================================
   1) CREATE + MY PROJECTS
====================================================================== */

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
      return deleteProjectByOwner(req, res, next);
    } catch (err) {
      return next(err);
    }
  }
);

/* ======================================================================
   2) ASSIGNMENT / APPLY
====================================================================== */

projectsRouter.post(
  "/:projectId/assign",
  authentication,
  assignFreelancer
);

projectsRouter.post(
  "/:projectId/apply",
  authentication,
  requireVerifiedWithSubscription,
  applyForProject
);

projectsRouter.post(
  "/applications/decision",
  authentication,
  approveOrRejectApplication
);

projectsRouter.get(
  "/applications/my-projects",
  authentication,
  getApplicationsForMyProjects
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


projectsRouter.post(
  "/:projectId/resubmit",
  authentication,
  requireVerifiedWithSubscription,
  upload.array("files"),
  resubmitWorkCompletion
);

projectsRouter.put(
  "/:projectId/approve",
  authentication,
  approveWorkCompletion
);

/* ======================================================================
   4) HOURLY PROJECT
====================================================================== */

projectsRouter.put(
  "/hourly/:projectId",
  authentication,
  completeHourlyProject
);

/* ======================================================================
   5) FILES (chat / attachments)
====================================================================== */

projectsRouter.post(
  "/:projectId/files",
  authentication,
  upload.array("files", 5),
  addProjectFiles
);

projectsRouter.get(
  "/:projectId/files",
  authentication,
  getProjectFilesByProjectId
);

/* ======================================================================
   6) TIMELINE + RELATED FREELANCERS + BASIC INFO
====================================================================== */

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

/* ======================================================================
   8) PUBLIC FILTER ROUTES (NO AUTH)
====================================================================== */

projectsRouter.get(
  "/public/categories",
  getPublicCategories
);

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

projectsRouter.get(
  "/project/:projectId/applications",
  authentication,
  getAssignmentsForProject
);


/* ======================================================================
   DELIVERY (freelancer submit) + RECEIVE (client view)
====================================================================== */

projectsRouter.post(
  "/:projectId/deliver",
  authentication,
  requireVerifiedWithSubscription,
  uploadProjectMedia,
  submitProjectDelivery
);
projectsRouter.get(
  "/:projectId/deliveries",
  authentication,
  getProjectDeliveries
);

export default projectsRouter;
