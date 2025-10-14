import express from "express";
import multer from "multer";
import { authentication } from "../middleware/authentication.js";
import { requireVerified } from "../middleware/requireVerification.js";

import {
  recordOfflinePayment,
  approveOfflinePayment,
  submitWorkCompletion,
  releasePayment,
  autoReleasePaymentsCron,
  recordPlanPayment,
  approvePlanPayment,
} from "../controller/payments.js";
import { getMyFinancialOverview } from "../controller/financial/financialOverview.js";

const paymentsRouter = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

/**
 * -------------------------------
 * PROJECT PAYMENTS
 * -------------------------------
 */

// CLIENT: Record offline payment (pending review by admin)
paymentsRouter.post(
  "/offline/record/:projectId",
  authentication,
  recordOfflinePayment
);

// ADMIN: Approve or reject offline payment
paymentsRouter.post(
  "/offline/approve",
  authentication,
  requireVerified,
  approveOfflinePayment
);

// FREELANCER: Submit work completion
paymentsRouter.post(
  "/projects/:projectId/submit-completion",
  authentication,
  requireVerified,
  submitWorkCompletion
);

// CLIENT: Release payment to freelancer (manual)
paymentsRouter.post(
  "/projects/:projectId/release-payment/:freelancerId",
  authentication,
  requireVerified,
  releasePayment
);

/**
 * -------------------------------
 * PLAN PAYMENTS
 * -------------------------------
 */

// FREELANCER: Record offline plan payment
paymentsRouter.post(
  "/plans/offline/record",
  authentication,
  upload.single("planProof"),
  recordPlanPayment
);

// ADMIN: Approve or reject plan payment
paymentsRouter.post(
  "/plans/offline/approve",
  authentication,
  requireVerified,
  approvePlanPayment
);

/**
 * -------------------------------
 * FINANCIAL OVERVIEW
 * -------------------------------
 */
paymentsRouter.get(
  "/overview",
  authentication,
  getMyFinancialOverview
);

export default paymentsRouter;
