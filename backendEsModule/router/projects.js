import express from "express";
import { authentication } from "../middleware/authentication.js";
import { createProject, getMyProjects, assignProject, listUsersByRole, getRelatedFreelancers, getCategories, getSubCategories, getProjectById, updateAssignmentStatus, getAllProjectForOffer, sendOffer, approveOrRejectOffer, getProjectCompletion, submitWorkCompletion, releasePayment, getAllProjectForFreelancerById, uploadProjectFile, getProjectFiles } from "../controller/projects.js";
import {requireVerified} from "../middleware/requireVerification.js";
const projectsRouter = express.Router();

projectsRouter.post("/", authentication, requireVerified, createProject);
projectsRouter.get("/offers/available", authentication, requireVerified, getAllProjectForOffer);
projectsRouter.get("/mine", authentication, requireVerified, getMyProjects);
projectsRouter.get("/:projectId", authentication, requireVerified, getProjectById);
projectsRouter.get("/freelancer/projects/:freelancerId", getAllProjectForFreelancerById);
projectsRouter.post(`/:projectId/offers`, authentication, requireVerified, sendOffer)
projectsRouter.post("/:projectId/assign", authentication, requireVerified, assignProject);
projectsRouter.get("/:projectId/related-freelancers", authentication, getRelatedFreelancers);
projectsRouter.put("/assigned/:projectId", authentication, requireVerified, updateAssignmentStatus);
projectsRouter.post('/offer/action', authentication, requireVerified, approveOrRejectOffer);
projectsRouter.get('/:projectId/completion', authentication , requireVerified, getProjectCompletion);

//router.post("/:projectId/files", upload.single("file"), uploadProjectFile);
// جلب جميع الملفات
projectsRouter.get("/:projectId/files", getProjectFiles);

projectsRouter.post('/:projectId/complete',authentication, submitWorkCompletion);
projectsRouter.post('/:projectId/release-payment/:freelancerId', authentication, requireVerified, releasePayment)

// public listing
projectsRouter.get("/public/categories", getCategories);
projectsRouter.get("/public/categories/:categoryId/sub", getSubCategories);

// helper: list users by role id (e.g., 2 = employee, 3 = freelancer)
projectsRouter.get("/users/by-role/:roleId", authentication, listUsersByRole);

export default projectsRouter;