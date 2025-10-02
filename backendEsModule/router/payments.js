import express from "express";
import multer from "multer";
import { authentication } from "../middleware/authentication.js";
import { requireVerified } from "../middleware/requireVerification.js";

import {
  recordOfflinePayment,
  approveOfflinePayment,
  // takeProject,
  submitWorkCompletion,
  releasePayment,
  autoReleasePaymentsCron,
} from "../controller/payments.js";
import { getMyFinancialOverview } from "../controller/financial/financialOverview.js";

const paymentsRouter = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

/**
 * CLIENT: Record offline payment (pending review by admin)
 * body: {  amount }
 * file: proof
 */
paymentsRouter.post(
  "/offline/record/:projectId",
  authentication,
  recordOfflinePayment
);

/**
 * ADMIN: Approve or reject offline payment
 * body: { paymentId, action: "approve" | "reject" }
 */
paymentsRouter.post(
  "/offline/approve",
  authentication,
  requireVerified,
  approveOfflinePayment
);

// /**
//  * FREELANCER: Take a project (first come, first served)
//  * body: { projectId }
//  */
// paymentsRouter.post(
//   "/projects/take",
//   authentication,
//   requireVerified,
//   takeProject
// );

/**
 * FREELANCER: Submit work completion
 * params: :projectId
 */
paymentsRouter.post(
  "/projects/:projectId/submit-completion",
  authentication,
  requireVerified,
  submitWorkCompletion
);

/**
 * CLIENT: Release payment to freelancer (manual)
 * params: :projectId, :freelancerId
 */
paymentsRouter.post(
  "/projects/:projectId/release-payment/:freelancerId",
  authentication,
  requireVerified,
  releasePayment
);

paymentsRouter.get(
  "/overview",
  authentication,
  getMyFinancialOverview
);

export default paymentsRouter;