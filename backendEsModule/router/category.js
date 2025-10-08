import express from "express";
import { authentication } from "../middleware/authentication.js";
import { createCategory, getCategories } from "../controller/category.js";

const categoryRouter = express.Router();

// view categories
categoryRouter.get("./categories/:categoryId", getCategories);

//create new category
categoryRouter.post("./categories/:categoryId", createCategory);

export default categoryRouter;
