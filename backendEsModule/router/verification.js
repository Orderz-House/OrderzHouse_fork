import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import {
  submitCustomerVerification,
  submitFreelancerVerification,
  reviewVerification,
  getMyVerificationStatus,
  getMyVerificationDetails,
} from "../controller/verification.js";

const verificationRouter = express.Router();

// ----------------------------
// Customer verification
// ----------------------------
verificationRouter.post(
  "/customer",
  authentication,
  submitCustomerVerification
);

// ----------------------------
// Freelancer verification
// ----------------------------
verificationRouter.post(
  "/freelancer",
  authentication,
  submitFreelancerVerification
);

// ----------------------------
// Unified endpoints for current user
// ----------------------------
verificationRouter.get("/status", authentication, getMyVerificationStatus);
verificationRouter.get("/details", authentication, getMyVerificationDetails);

// ----------------------------
// Admin review endpoint (protected by authorization middleware)
// ----------------------------
verificationRouter.patch(
  "/review",
  authentication,
  authorization("review_verification"),
  reviewVerification
);

export default verificationRouter;
