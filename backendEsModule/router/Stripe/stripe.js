import express from "express";
import { createCheckoutSession } from "../../controller/Stripe/stripe.js";
import { confirmCheckoutSession } from "../../controller/Stripe/confirmCheckoutSession.js";


const StripeRouter = express.Router();

StripeRouter.post("/create-checkout-session", createCheckoutSession);
StripeRouter.get("/confirm", confirmCheckoutSession);

export default StripeRouter;
