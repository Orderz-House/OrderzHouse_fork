import express from "express";
import { authentication } from "../middleware/authentication.js";
import { createProject, getMyProjects, assignProject, listUsersByRole, getCategories, getSubCategories,getRelatedFreelancers } from "../controller/projects.js";

const projectsRouter = express.Router();

projectsRouter.post("/", authentication, createProject);
projectsRouter.get("/mine", authentication, getMyProjects);
projectsRouter.post("/:projectId/assign", authentication, assignProject);
projectsRouter.get("/:projectId/related-freelancers", authentication, getRelatedFreelancers);
// public listing
projectsRouter.get("/public/categories", getCategories);
projectsRouter.get("/public/categories/:categoryId/sub", getSubCategories);

// helper: list users by role id (e.g., 2 = employee, 3 = freelancer)
projectsRouter.get("/users/by-role/:roleId", authentication, listUsersByRole);

export default projectsRouter;


