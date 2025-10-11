// router/accessControl.js
import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import {
  grantCourseAccess,
  getAllAccessControl,
  getFreelancerAccess,
  getCourseAccessList
} from "../controller/accessControl.js";

const accessControlRouter = express.Router();

// Admin-only routes
accessControlRouter.post("/grant-access", authentication, authorization(["admin"]), grantCourseAccess);
accessControlRouter.get("/all", authentication, authorization(["admin"]), getAllAccessControl);
accessControlRouter.get("/freelancer/:freelancerId", authentication, authorization(["admin"]), getFreelancerAccess);
accessControlRouter.get("/course/:courseId", authentication, authorization(["admin"]), getCourseAccessList);

export default accessControlRouter;