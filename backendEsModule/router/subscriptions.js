import express from "express";
import { subscriptionToPlan, getSubscriptionByPlanId, updateSubscription,  } from "../controller/subscriptions.js";

const router = express.Router();


router.post("/", subscriptionToPlan);

router.get("/plan/:planId", getSubscriptionByPlanId);

router.put("/:subscriptionId", updateSubscription);


export default router;
