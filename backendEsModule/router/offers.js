import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js"; 
import { requireVerified } from "../middleware/requireVerification.js";

const offersRouter = express.Router();

import { sendOffer, getMyOffersForProject, getOffersForMyProjects, approveOrRejectOffer } from "../controller/offers.js";

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

// Get all offers for all projects owned by the logged-in user (project owner)
offersRouter.get(
  "/my-projects/offers",
  authentication,
  requireVerified,
  getOffersForMyProjects
);
;

offersRouter.post(
  "/offers/approve-reject",
  authentication,
  requireVerified,
  approveOrRejectOffer
);

export default offersRouter;
