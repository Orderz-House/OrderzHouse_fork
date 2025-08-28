import express from "express";
import { authentication } from "../middleware/authentication.js";
import {
  createProject,
  getMyProjects,
  assignProject,
  listUsersByRole,
} from "../controller/projects.js";

const projectsRouter = express.Router();

projectsRouter.post("/", authentication, createProject);
projectsRouter.get("/mine", authentication, getMyProjects);
projectsRouter.post("/:projectId/assign", authentication, assignProject);

// helper: list users by role id (e.g., 2 = employee, 3 = freelancer)
projectsRouter.get("/users/by-role/:roleId", authentication, listUsersByRole);

export default projectsRouter;
