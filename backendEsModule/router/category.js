import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import { 
  createCategory, 
  getCategories, 
  getSubSubCategoriesByCategoryId,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controller/category.js";

const categoryRouter = express.Router();

// Public routes
categoryRouter.get("/", getCategories);
categoryRouter.get("/:id", getCategoryById);

// Admin-only routes
categoryRouter.post("/", authentication, authorization(["1"]), createCategory);
categoryRouter.put("/:id", authentication, authorization(["1"]), updateCategory);
categoryRouter.delete("/:id", authentication, authorization(["1"]), deleteCategory);

// Other routes
categoryRouter.get("/:categoryId/sub-sub-categories", getSubSubCategoriesByCategoryId);

export default categoryRouter;