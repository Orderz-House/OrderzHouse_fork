import express from "express";
import { createCheckoutSession } from "../../controller/Stripe/stripe.js";

const StripeRouter = express.Router();

StripeRouter.post("/create-checkout-session", createCheckoutSession);

export default StripeRouter;
