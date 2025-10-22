import express from "express";
import { authentication } from "../middleware/authentication.js";
import { requireVerified } from "../middleware/requireVerification.js";
import {
  updateFreelancerCategories,
  getFreelancerCategories
} from "../controller/freelancerCategories.js";

const freelancerCategoriesRouter = express.Router();

// ------------------------
// Get categories for a freelancer (self or admin)
freelancerCategoriesRouter.get(
  "/",
  authentication,
  requireVerified,
  getFreelancerCategories
);

// ------------------------
// Update categories (self or admin)
freelancerCategoriesRouter.put(
  "/",
  authentication,
  requireVerified,
  updateFreelancerCategories
);

export default freelancerCategoriesRouter;
