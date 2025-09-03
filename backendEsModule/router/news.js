import express from "express";
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  approveNews,
  SelectNewsisNotApprove,
} from "../controller/news.js";
import { authentication } from "../middleware/authentication.js";

// Simple role check middleware: only role id 1 permitted
const requireAdminRole = (req, res, next) => {
  try {
    if (req?.token?.role === 1) return next();
    return res.status(403).json({ success: false, message: "unauthorized" });
  } catch (e) {
    return res.status(403).json({ success: false, message: "unauthorized" });
  }
};

const newsRouter = express.Router();

// Anyone can see news
newsRouter.get("/", getNews);
newsRouter.get("/:id", getNewsById);

// Only admin/editor can create/update/delete
newsRouter.post("/", authentication, requireAdminRole, createNews);
newsRouter.put("/:id", authentication, requireAdminRole, updateNews);
newsRouter.delete("/:id", authentication, requireAdminRole, deleteNews);

// Only admin can approve news
newsRouter.put("/approve/:id", authentication, requireAdminRole, approveNews);
newsRouter.get("/admin/notApporve", authentication, SelectNewsisNotApprove);

export default newsRouter;
