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
accessControlRouter.post("/grant-access", authentication, authorization(["1"]), grantCourseAccess);
accessControlRouter.get("/all", authentication, authorization(["1"]), getAllAccessControl);
accessControlRouter.get("/freelancer/:freelancerId", authentication, authorization(["1"]), getFreelancerAccess);
accessControlRouter.get("/course/:courseId", authentication, authorization(["1"]), getCourseAccessList);

export default accessControlRouter;