// routes/courses.js
import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getCourseMaterials,
  checkEnrollment,
} from "../controller/courses.js";

const router = express.Router();

router.get("/view", authentication, getCourses);
router.get("/view/:id", authentication, getCourseById);
router.get("/:id/materials", authentication, getCourseMaterials);
router.get("/:id/enrollment", authentication, checkEnrollment);

// Admin-only routes
router.post("/create", authentication, authorization("create_course"), createCourse);
router.put("/update/:id", authentication, authorization("edit_course"), updateCourse);
router.delete("/delete/:id", authentication, authorization("delete_course"), deleteCourse);

router.post("/enroll", authentication, enrollInCourse);

export default router;