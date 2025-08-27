import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import { getCourseById, getCourses, createCourse, deleteCourse, updateCourse, enrollInCourse } from "../controller/courses.js";

const coursesRouter = express.Router();
coursesRouter.get(
  "/view",
  authentication,
  authorization("view_courses"),
  getCourses
);
coursesRouter.post(
  "/create",
  authentication,
  authorization("create_course"),
  createCourse
);
coursesRouter.delete(
  "/delete/:id",
  authentication,
  authorization("delete_course"),
  deleteCourse
);
coursesRouter.put(
  "/update/:id",
  authentication,
  authorization("edit_course"),
  updateCourse
);
coursesRouter.get(
  "/view/:id",
  authentication,
  authorization("view_courses"),
  getCourseById
);

coursesRouter.post(
  "/enroll",
  authentication,
  authorization("enroll_course"),
  enrollInCourse
);

export default coursesRouter;
