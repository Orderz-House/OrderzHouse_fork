import express from "express";
import { subscriptionToPlan, getSubscriptionByPlanId, updateSubscription, deleteSubscription } from "../controllers/subscriptionController.js";

const router = express.Router();

// Create subscription
router.post("/", subscriptionToPlan);

// Get subscriptions by plan ID
router.get("/plan/:planId", getSubscriptionByPlanId);

// Update subscription by ID
router.put("/:subscriptionId", updateSubscription);

// Delete subscription by ID
router.delete("/:subscriptionId", deleteSubscription);

export default router;
