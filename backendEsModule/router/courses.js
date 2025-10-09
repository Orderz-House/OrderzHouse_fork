// routes/courses.js
import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import {
  getCourses,
  getCoursesByCategory,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseMaterials,
  adminEnrollFreelancer,
  getMyCourses,
} from "../controller/courses.js";

const coursesRouter = express.Router();

/* Public / Authenticated Routes */
coursesRouter.get("/category/:categoryId", getCoursesByCategory);
coursesRouter.get("/view", authentication, getCourses);
coursesRouter.get("/view/:id", authentication, getCourseById);
coursesRouter.get("/:id/materials", authentication, getCourseMaterials);

/* Freelancer-specific */
coursesRouter.get("/my-courses", authentication, getMyCourses);

/* Admin-only */
coursesRouter.post("/create", authentication, authorization(["admin"]), createCourse);
coursesRouter.put("/update/:id", authentication, authorization(["admin"]), updateCourse);
coursesRouter.delete("/delete/:id", authentication, authorization(["admin"]), deleteCourse);
coursesRouter.post("/admin/enroll-freelancer", authentication, authorization(["admin"]), adminEnrollFreelancer);

export default coursesRouter;
