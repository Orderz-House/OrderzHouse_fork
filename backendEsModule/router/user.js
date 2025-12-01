import express from "express";
import multer from "multer";
import {
  register,
  login,
  verifyOTP,
  editUserSelf,
  rateFreelancer,
  verifyPassword,
  updatePassword,
  deactivateAccount,
  verifyEmailOtp,
  uploadProfilePic,
  sendOtpController,
} from "../controller/user.js";

import { authentication } from "../middleware/authentication.js";
const upload = multer({ storage: multer.memoryStorage() });

const usersRouter = express.Router();

// ==================== PUBLIC ROUTES ====================
usersRouter.post("/register", register);
usersRouter.post("/verify-email", verifyEmailOtp);
usersRouter.post("/login", login);
usersRouter.post("/verify-otp", verifyOTP);
usersRouter.post("/send-otp", sendOtpController);

// ==================== AUTHENTICATED ROUTES ====================
usersRouter.get("/getUserdata", authentication, verifyPassword); 
usersRouter.post("/uploadProfilePic", authentication, upload.single("file"), uploadProfilePic);

// ==================== USER PROFILE ====================
usersRouter.put("/edit", authentication, upload.array("files"), editUserSelf);

// ==================== RATING ROUTES ====================
usersRouter.post("/rate", authentication, rateFreelancer);

// ==================== PASSWORD AND ACCOUNT ROUTES ====================
usersRouter.post("/verify-password", authentication, verifyPassword);
usersRouter.put("/update-password", authentication, updatePassword);
usersRouter.put("/deactivate", authentication, deactivateAccount);

export default usersRouter;
