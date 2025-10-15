import express from "express";
import { authentication } from "../middleware/authentication.js";
import { requireVerified } from "../middleware/requireVerification.js";
import { sendOffer, getMyOffersForProject, getOffersForMyProjects, approveOrRejectOffer } from "../controller/offers.js";

const offersRouter = express.Router();

/**
 * -------------------------------
 * FREELANCER ROUTES
 * -------------------------------
 */

// Send an offer for a project
offersRouter.post(
  "/:projectId/offers",
  authentication,
  requireVerified,
  sendOffer
);

// Get all offers made by the logged-in freelancer for a specific project
offersRouter.get(
  "/:projectId/my-offers",
  authentication,
  requireVerified,
  getMyOffersForProject
);

/**
 * -------------------------------
 * CLIENT ROUTES
 * -------------------------------
 */

// Get all offers for all projects owned by the logged-in client
offersRouter.get(
  "/my-projects/offers",
  authentication,
  requireVerified,
  getOffersForMyProjects
);

// Approve or reject an offer
offersRouter.post(
  "/offers/approve-reject",
  authentication,
  requireVerified,
  approveOrRejectOffer
);

export default offersRouter;
