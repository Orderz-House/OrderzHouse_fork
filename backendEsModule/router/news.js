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

const newsRouter = express.Router();

// Anyone can see news
newsRouter.get("/", getNews);
newsRouter.get("/:id", getNewsById);

// Only admin/editor can create/update/delete
newsRouter.post("/", authentication, authorization("create_news"), createNews);
newsRouter.put("/:id", authentication, authorization("edit_news"), updateNews);
newsRouter.delete(
  "/:id",
  authentication,
  authorization("delete_news"),
  deleteNews
);

export default newsRouter;
