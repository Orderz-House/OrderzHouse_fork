import express from "express";
import {
  getPlans,
  createPlan,
  editPlan,
  deletePlan,
  getPlanSubscriptions,
  getPlanSubscribers, 
  getFreelancerSubscription,
  subscribeToPlan,
  cancelSubscription,
  adminUpdateSubscription,
  getAllSubscriptions,
  adminCancelSubscription
} from "../controller/plans.js";

import { authentication } from "../middleware/authentication.js";
import adminOnly from "../middleware/adminOnly.js";
import { requireVerified } from "../middleware/requireVerification.js";

const plansRouter = express.Router();

/* ----------------------
   PUBLIC ROUTES
---------------------- */
plansRouter.get("/", getPlans);

/* ----------------------
   ADMIN ROUTES
---------------------- */
// Get all subscriptions for a specific plan
plansRouter.get("/:id/subscriptions", authentication, adminOnly, getPlanSubscriptions);

//  Get all subscribers (freelancers) for a specific plan
plansRouter.get("/:id/subscribers", authentication, adminOnly, getPlanSubscribers);

plansRouter.get(
  "/subscriptions/all",
  authentication,
  adminOnly,
  getAllSubscriptions
);
plansRouter.post("/create", authentication, adminOnly, createPlan);
plansRouter.put("/edit/:id", authentication, adminOnly, editPlan);
plansRouter.delete("/delete/:id", authentication, adminOnly, deletePlan);

// Admin can manage freelancer subscriptions manually
plansRouter.patch(
  "/admin/subscription",
  authentication,
  adminOnly,
  adminUpdateSubscription
);

/* ----------------------
   FREELANCER ROUTES
---------------------- */
plansRouter.get(
  "/subscription/me",
  authentication,
  requireVerified,
  getFreelancerSubscription
);

plansRouter.post(
  "/subscribe",
  authentication,
  requireVerified,
  subscribeToPlan
);

plansRouter.patch(
  "/cancel",
  authentication,
  requireVerified,
  cancelSubscription
);

// Admin: cancel a user's subscription
plansRouter.patch(
  "/admin/cancel-subscription",
  authentication,
  adminOnly,
  adminCancelSubscription
);

export default plansRouter;
