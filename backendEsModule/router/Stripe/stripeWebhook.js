// routes/stripeWebhookRoutes.js

import express from "express";
import { handleStripeWebhook } from "../../controller/Stripe/stripeWebhookController.js";

const webhookRouter = express.Router();

webhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default webhookRouter;
