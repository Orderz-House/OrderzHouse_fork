import express from "express";
import { authentication } from "../middleware/authentication.js";
import {
  getMyReferrals,
  applyReferralCode,
  completeReferral,
} from "../controller/referrals.js";

const referralsRouter = express.Router();

// GET /referrals/me - Get current user's referral info
referralsRouter.get("/me", authentication, getMyReferrals);

// POST /referrals/apply - Apply referral code during signup
referralsRouter.post("/apply", authentication, applyReferralCode);

// POST /referrals/complete - Mark referral as completed (called after first paid plan purchase)
referralsRouter.post("/complete", authentication, completeReferral);

export default referralsRouter;
