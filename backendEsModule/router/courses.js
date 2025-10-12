// routes/course.js
import express from "express";
import authentication  from "../middleware/authentication.js";
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
  getFreelancerAccessibleCourses,
  checkCourseAccess
} from "../controller/courses.js";

const courseRouter = express.Router();



/* Public / Authenticated Routes */
courseRouter.get("/category/:categoryId", getCoursesByCategory);
courseRouter.get("/view", authentication, getCourses);
courseRouter.get("/view/:id", authentication, getCourseById);
courseRouter.get("/:id/materials", authentication, getCourseMaterials);

/* Freelancer-specific (RESTRICTED) */
courseRouter.get("/accessible", authentication, getFreelancerAccessibleCourses);
courseRouter.get("/check-access/:id", authentication, checkCourseAccess);
courseRouter.get("/my-courses", authentication, getMyCourses);

/* Admin-only */
courseRouter.post("/create", authentication, authorization(["1"]), createCourse);
courseRouter.put("/update/:id", authentication, authorization(["1"]), updateCourse);
courseRouter.delete("/delete/:id", authentication, authorization(["1"]), deleteCourse);
courseRouter.post("/admin/enroll-freelancer", authentication, authorization(["1"]), adminEnrollFreelancer);

export default courseRouter;