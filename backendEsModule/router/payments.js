import express from "express";
import { authentication } from "../middleware/authentication.js";
import { requireVerified } from "../middleware/requireVerification.js";

import {
  recordOfflinePayment,
  approveOfflinePayment,
  takeProject,
  submitWorkCompletion,
  releasePayment,
  autoReleasePaymentsCron,
} from "../controller/payments.js";

const paymentsRouter = express.Router();

/**
 * CLIENT: Record offline payment (pending review by admin)
 * body: { projectId, amount }
 */
paymentsRouter.post(
  "/offline/record",
  authentication,
  requireVerified,
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

/**
 * FREELANCER: Take a project (first come, first served)
 * body: { projectId }
 */
paymentsRouter.post(
  "/projects/take",
  authentication,
  requireVerified,
  takeProject
);

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

export default paymentsRouter;
