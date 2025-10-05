import express from "express";
import { authentication } from "../middleware/authentication.js";
import {
  getFreelancerEarningsSummary,
  getFreelancerEarningsHistory, // Now this import will work
} from "../controller/earnings.js";

const router = express.Router();

// Route for the earnings summary (e.g., for the dashboard cards)
router.get(
  "/freelancer/:freelancerId/summary",
  authentication,
  getFreelancerEarningsSummary
);

// Route for the detailed earnings history (e.g., for the table)
router.get(
  "/freelancer/:freelancerId/history",
  authentication,
  getFreelancerEarningsHistory
);

export default router;
