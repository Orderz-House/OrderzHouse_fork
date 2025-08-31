import express from "express";
import { authentication } from "../middleware/authentication.js";
import { createProject, getMyProjects, assignProject, listUsersByRole, getRelatedFreelancers, getCategories, getSubCategories } from "../controller/projects.js";
import {requireVerified} from "../middleware/requireVerification.js";
const projectsRouter = express.Router();

projectsRouter.post("/", authentication, requireVerified, createProject);
projectsRouter.get("/mine", authentication, requireVerified, getMyProjects);
projectsRouter.post("/:projectId/assign", authentication, requireVerified, assignProject);
projectsRouter.get("/:projectId/related-freelancers", authentication, getRelatedFreelancers);
// public listing
projectsRouter.get("/public/categories", getCategories);
projectsRouter.get("/public/categories/:categoryId/sub", getSubCategories);

// helper: list users by role id (e.g., 2 = employee, 3 = freelancer)
projectsRouter.get("/users/by-role/:roleId", authentication, listUsersByRole);

export default projectsRouter;