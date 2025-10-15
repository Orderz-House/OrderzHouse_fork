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
plansRouter.post("/create", createPlan);
plansRouter.put("/edit/:id", editPlan);
plansRouter.delete("/delete/:id", deletePlan);

// ----------------------
// Freelancer routes (require verified login)
// ----------------------
plansRouter.get("/subscription/me", requireVerified, getFreelancerSubscription);
plansRouter.post("/subscribe", requireVerified, subscribeToPlan);
plansRouter.patch("/cancel", requireVerified, cancelSubscription);

export default plansRouter;
