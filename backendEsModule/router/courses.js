// routes/courses.js
import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import {
  getCategories,
  getCourses,
  getCoursesByCategory,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getCourseMaterials,
  checkEnrollment,
  getCourseEnrollments,
} from "../controller/courses.js";

const coursesRouter = express.Router();

/* Categories */
coursesRouter.get("/categories", getCategories);

/* Courses */
coursesRouter.get("/view", authentication, getCourses);
coursesRouter.get("/category/:categoryId", getCoursesByCategory);
coursesRouter.get("/view/:id", authentication, getCourseById);

/* Materials */
coursesRouter.get("/:id/materials", authentication, getCourseMaterials);

/* Enrollments */
coursesRouter.get("/:id/enrollment", authentication, checkEnrollment);
coursesRouter.post("/enroll", authentication, enrollInCourse);
coursesRouter.get("/:id/enrollments", getCourseEnrollments);

/* Course CRUD (admin only) */
coursesRouter.post("/create", createCourse);
coursesRouter.put("/update/:id", updateCourse);
coursesRouter.delete("/delete/:id", deleteCourse);

export default coursesRouter;
