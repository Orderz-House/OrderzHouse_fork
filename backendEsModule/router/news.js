import express from "express";
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from "../controller/news.js";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";

// Simple role check middleware: only role id 1 permitted
const requireAdminRole = (req, res, next) => {
  try {
    if (req?.token?.role === 1) return next();
    return res.status(403).json({ success: false, message: "unauthorized" });
  } catch (e) {
    return res.status(403).json({ success: false, message: "unauthorized" });
  }
};
// Disk storage removed; images should be uploaded via /upload to imgbb

const newsRouter = express.Router();

// Anyone can see news
newsRouter.get("/", getNews);
newsRouter.get("/:id", getNewsById);

// Only admin/editor can create/update/delete
newsRouter.post("/", authentication, requireAdminRole, createNews);
newsRouter.put("/:id", authentication, requireAdminRole, updateNews);
newsRouter.delete("/:id", authentication, requireAdminRole, deleteNews);

export default newsRouter;
