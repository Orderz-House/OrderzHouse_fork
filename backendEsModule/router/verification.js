import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import {
  submitFreelancerVerification,
  reviewVerification,
  getMyVerificationStatus,
  getMyVerificationDetails,
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
// Current user verification info
// ----------------------------
verificationRouter.get(
  "/status",
  authentication, 
  getMyVerificationStatus
);

verificationRouter.get("/details", authentication, getMyVerificationDetails);

// ----------------------------
// Admin reviews verification requests
// ----------------------------
verificationRouter.patch(
  "/review",
  authentication,
  authorization("review_verification"), 
  reviewVerification
);

export default verificationRouter;
