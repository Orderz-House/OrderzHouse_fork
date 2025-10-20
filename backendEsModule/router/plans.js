import express from "express";
import {
  getPlans,
  createPlan,
  editPlan,
  deletePlan,
  getPlanSubscriptions,
  getFreelancerSubscription,
  subscribeToPlan,
  cancelSubscription,
} from "../controller/plans.js";

import authentication from "../middleware/authentication.js";
import adminOnly from "../middleware/adminOnly.js"; 
import { requireVerified } from "../middleware/requireVerification.js";

const plansRouter = express.Router();

// ----------------------
// Public routes
// ----------------------
plansRouter.get("/", getPlans);
plansRouter.get("/:id/subscriptions", getPlanSubscriptions);

// ----------------------
// Admin routes
// ----------------------
// Only accessible to authenticated admins
plansRouter.post("/create", authentication, adminOnly, createPlan);
plansRouter.put("/edit/:id", authentication, adminOnly, editPlan);
plansRouter.delete("/delete/:id", authentication, adminOnly, deletePlan);

// ----------------------
// Freelancer routes (require verified login)
// ----------------------
plansRouter.get("/subscription/me", authentication, requireVerified, getFreelancerSubscription);
plansRouter.post("/subscribe", authentication, requireVerified, subscribeToPlan);
plansRouter.patch("/cancel", authentication, requireVerified, cancelSubscription);

export default plansRouter;
