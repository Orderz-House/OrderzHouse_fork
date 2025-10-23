import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import { 
  createCategory, 
  getCategories, 
  getCategoryById,
  getSubCategories,
  getSubSubCategoriesByCategoryId,
  getSubSubCategoriesBySubId,
  updateCategory,
  deleteCategory
} from "../controller/category.js";

const categoryRouter = express.Router();

// ========== Public routes ==========
categoryRouter.get("/", getCategories);


//create new category
categoryRouter.post("/", createCategory);
// Get sub-categories
categoryRouter.get("/:categoryId/sub-categories", getSubCategories);

// Get sub-sub-categories by main category ID
categoryRouter.get("/:categoryId/sub-sub-categories", getSubSubCategoriesByCategoryId);


// Get sub-sub-categories by sub-category ID
categoryRouter.get("/sub-category/:subCategoryId/sub-sub-categories", getSubSubCategoriesBySubId);

// Get single category by ID (must be last)
categoryRouter.get("/:id", getCategoryById);

// ========== Admin-only routes ==========
// Create new category
categoryRouter.post("/", authentication, authorization(["1"]), createCategory);

// Update category
categoryRouter.put("/:id", authentication, authorization(["1"]), updateCategory);

// Soft delete category
categoryRouter.delete("/:id", authentication, authorization(["1"]), deleteCategory);

export default categoryRouter;