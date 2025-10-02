import express from "express";
import { authentication } from "../middleware/authentication.js";
import { requireVerified } from "../middleware/requireVerification.js";
import { 
  getFreelancerEarningsSummary, 
  getFreelancerEarningsHistory 
} from "../controller/earnings.js";

const earningsRouter = express.Router();

// Get earnings summary for freelancer
earningsRouter.get(
  "/freelancer/:freelancerId/summary",
  authentication,
  requireVerified,
  getFreelancerEarningsSummary
);

// 📜 Get earnings history for freelancer
earningsRouter.get(
  "/freelancer/:freelancerId/history",
  authentication,
  requireVerified,
  getFreelancerEarningsHistory
);

export default earningsRouter;
