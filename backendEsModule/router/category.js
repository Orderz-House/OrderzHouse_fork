import express from "express";
import { authentication } from "../middleware/authentication.js";
import { createCategory, getCategories , getSubSubCategoriesByCategoryId , getSubCategories} from "../controller/category.js";



const categoryRouter = express.Router();

// view categories
categoryRouter.get("/", getCategories);

// view sub categories by category id (not used currently)
categoryRouter.get("/subcategories/:categoryId", getSubCategories);

//create new category
categoryRouter.post("/", createCategory);

// get sub sub categories by category id
categoryRouter.get("/:categoryId/sub-sub-categories", getSubSubCategoriesByCategoryId);

export default categoryRouter;