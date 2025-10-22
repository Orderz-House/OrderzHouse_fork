import express from "express";
import { authentication } from "../middleware/authentication.js";
import adminOnly from "../middleware/adminOnly.js"; 
import {
  submitFreelancerVerification,
  reviewVerification,
  getMyVerificationStatus,
} from "../controller/verification.js";

const verificationRouter = express.Router();

// ----------------------------
// Freelancer submits verification request
// ----------------------------
verificationRouter.post(
  "/freelancer",
  authentication,
  submitFreelancerVerification
);

// ----------------------------
// Get current user's verification status
// ----------------------------
verificationRouter.get(
  "/status",
  authentication,
  getMyVerificationStatus
);

// ----------------------------
// Admin approves/rejects freelancer verification
// ----------------------------
verificationRouter.patch(
  "/review",
  authentication,
  adminOnly,
  reviewVerification
);

export default verificationRouter;
