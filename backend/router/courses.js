const express = require("express");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const { getCourseById } = require("../controller/courses");
const { getCourses } = require("../controller/courses");
const { createCourse } = require("../controller/courses");
const { deleteCourse } = require("../controller/courses");
const { updateCourse } = require("../controller/courses");
const { enrollFreelancer } = require("../controller/courses");

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

// coursesRouter.post("/enroll/:course_id", authentication, enrollFreelancer);

module.exports = coursesRouter;
