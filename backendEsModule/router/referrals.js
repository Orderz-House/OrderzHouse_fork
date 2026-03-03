import express from "express";
import { authentication } from "../middleware/authentication.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  getMyReferrals,
  createOrGetReferralCode,
  applyReferralCode,
  completeReferral,
  recordPartnerVisit,
  getPartnerReferralStats,
  getReferralPartners,
  getPartnerSignups,
} from "../controller/referrals.js";

const referralsRouter = express.Router();

// ============== Partner referral tracking (public + admin) ==============
// POST /referrals/visit — record visit (public, no auth)
referralsRouter.post("/visit", recordPartnerVisit);
// GET /referrals/partners — admin only (list for dropdown)
referralsRouter.get("/partners", authentication, adminOnly, getReferralPartners);
// GET /referrals/stats — admin only
referralsRouter.get("/stats", authentication, adminOnly, getPartnerReferralStats);
// GET /referrals/signups — admin only (paginated users from partner)
referralsRouter.get("/signups", authentication, adminOnly, getPartnerSignups);

// ============== User referral (invite friends) ==============
// GET /referrals/me - Get current user's referral info
referralsRouter.get("/me", authentication, getMyReferrals);

// POST /referrals/code - Create or get referral code (optional, GET /me already returns code)
referralsRouter.post("/code", authentication, createOrGetReferralCode);

// POST /referrals/apply - Apply referral code during signup
referralsRouter.post("/apply", authentication, applyReferralCode);

// POST /referrals/complete - Mark referral as completed (called after first paid plan purchase)
referralsRouter.post("/complete", authentication, completeReferral);

export default referralsRouter;
