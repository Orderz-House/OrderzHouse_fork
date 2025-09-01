import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import {
  getCourseById,
  getCourses,
  createCourse,
  deleteCourse,
  updateCourse,
  enrollInCourse,
} from "../controller/courses.js";

const coursesRouter = express.Router();
coursesRouter.get("/view", authentication, getCourses);
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

// import express from "express";
// import { authentication } from "../middleware/authentication.js";
// import {
//   getCourseById,
//   getCourses,
//   createCourse,
//   deleteCourse,
//   updateCourse,
//   enrollInCourse,
// } from "../controller/courses.js";

// const coursesRouter = express.Router();

// // عرض جميع الكورسات - أي مستخدم مسجل يمكنه المشاهدة
// coursesRouter.get("/view", authentication, getCourses);

// // إنشاء كورس جديد - أي مستخدم مسجل يمكنه الإنشاء
// coursesRouter.post("/create", authentication, createCourse);

// // حذف كورس - أي مستخدم مسجل يمكنه الحذف
// coursesRouter.delete("/delete/:id", authentication, deleteCourse);

// // تحديث كورس - أي مستخدم مسجل يمكنه التحديث
// coursesRouter.put("/update/:id", authentication, updateCourse);

// // عرض كورس محدد - أي مستخدم مسجل يمكنه المشاهدة
// coursesRouter.get("/view/:id", authentication, getCourseById);

// // تسجيل في كورس - أي مستخدم مسجل يمكنه التسجيل
// coursesRouter.post("/enroll", authentication, enrollInCourse);

// export default coursesRouter;
