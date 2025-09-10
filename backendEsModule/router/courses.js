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
  enrollInCourse,
  getCourseMaterials,
  checkEnrollment,
  getCourseEnrollments, // make sure this exists in your controller
} from "../controller/courses.js";

const coursesRouter = express.Router();

// Get all active courses (public)
coursesRouter.get("/view", authentication, getCourses);

// Get courses by category
coursesRouter.get("/category/:categoryId", getCoursesByCategory);

// Get course by ID with materials and stats (public)
coursesRouter.get("/view/:id", authentication, getCourseById);

// Get course materials (for enrolled users)
coursesRouter.get("/:id/materials", authentication, getCourseMaterials);

// Check if user is enrolled in course
coursesRouter.get("/:id/enrollment", authentication, checkEnrollment);

// Enroll in course (for freelancers)
coursesRouter.post("/enroll", authentication, enrollInCourse);

// Course CRUD operations (admin only)
coursesRouter.post("/create", createCourse);
coursesRouter.put("/update/:id", updateCourse);
coursesRouter.delete("/delete/:id", deleteCourse);

// Get course enrollments (admin only)
coursesRouter.get("/:id/enrollments", getCourseEnrollments);

export default coursesRouter;
