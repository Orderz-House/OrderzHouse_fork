import express from "express";
import {
  getPlans,
  createPlan,
  editPlan,
  deletePlan,
  getPlanSubscribers,
  getPlanSubscriptionCounts,
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

plansRouter.get("/", getPlans);

plansRouter.get(
  "/subscriptions/counts",
  authentication,
  adminOnly,
  getPlanSubscriptionCounts
);

plansRouter.get(
  "/subscriptions/all",
  authentication,
  adminOnly,
  getAllSubscriptions
);

plansRouter.get(
  "/:id/subscribers",
  authentication,
  adminOnly,
  getPlanSubscribers
);

plansRouter.post("/create", authentication, adminOnly, createPlan);
plansRouter.put("/edit/:id", authentication, adminOnly, editPlan);
plansRouter.delete("/delete/:id", authentication, adminOnly, deletePlan);

plansRouter.patch(
  "/admin/subscription",
  authentication,
  adminOnly,
  adminUpdateSubscription
);

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

plansRouter.patch(
  "/:planId/subscribers/:id",
  authentication,
  adminOnly,
  adminCancelSubscription
);
 
export default plansRouter;
