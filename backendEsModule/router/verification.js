import express from "express";
import { authentication } from "../middleware/authentication.js";
import { 
  submitCustomerVerification, 
  submitFreelancerVerification, 
  reviewVerification, 
  getMyVerificationStatus,
  getMyVerificationDetails 
} from "../controller/verification.js";

const verificationRouter = express.Router();

// Customer verification endpoints
verificationRouter.post("/customer", authentication, submitCustomerVerification);
verificationRouter.get("/customer/status", authentication, getMyVerificationStatus);
verificationRouter.get("/customer/details", authentication, getMyVerificationDetails);

// Freelancer verification endpoints
verificationRouter.post("/freelancer", authentication, submitFreelancerVerification);
verificationRouter.get("/freelancer/status", authentication, getMyVerificationStatus);
verificationRouter.get("/freelancer/details", authentication, getMyVerificationDetails);

// Admin review endpoint
verificationRouter.patch("/review", authentication, reviewVerification);

export default verificationRouter;