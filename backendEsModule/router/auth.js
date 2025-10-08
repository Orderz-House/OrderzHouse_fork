import express from "express";
import { authentication } from "../middleware/authentication.js";
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  disableTwoFactor,
} from "../controller/auth.js";

const authRouter = express.Router();

// All 2FA routes require a user to be logged in
authRouter.use(authentication);

// Generate a secret and QR code
authRouter.post("/2fa/generate", generateTwoFactorSecret);

// Verify a token and enable 2FA
authRouter.post("/2fa/verify", verifyTwoFactorToken);

// Disable 2FA
authRouter.post("/2fa/disable", disableTwoFactor);

export default authRouter;