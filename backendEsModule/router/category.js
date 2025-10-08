import express from "express";
import { authentication } from "../middleware/authentication.js";
import { createCategory, getCategories , getSubCategories} from "../controller/category.js";

const categoryRouter = express.Router();

// view categories
categoryRouter.get("./categories/:categoryId", getCategories);

// view sub categories by category id (not used currently)
categoryRouter.get("/subcategories/:categoryId", getSubCategories);

//create new category
categoryRouter.post("./categories/:categoryId", createCategory);

export default categoryRouter;