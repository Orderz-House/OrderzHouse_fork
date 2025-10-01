// router/earning.js
import express from "express";
import { authentication } from "../middleware/authentication.js";
import { requireVerified } from "../middleware/requireVerification.js";
import { 
  getFreelancerEarningsSummary, 
  getFreelancerEarningsHistory 
} from "../controller/earnings.js";

const earningsRouter = express.Router();

/**
 * GET /earnings/freelancer/:freelancerId/summary
 * Returns earnings summary (wallet, total income, pending, etc.)
 */
earningsRouter.get(
  "/freelancer/:freelancerId/summary",
  authentication,
  requireVerified,
  getFreelancerEarningsSummary
);

/**
 * GET /earnings/freelancer/:freelancerId/history
 * Returns earnings history (list of payments with project info)
 */
earningsRouter.get(
  "/freelancer/:freelancerId/history",
  authentication,
  requireVerified,
  getFreelancerEarningsHistory
);

export default earningsRouter;
