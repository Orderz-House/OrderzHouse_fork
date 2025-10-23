import express from "express";
import {
  register,
  login,
  verifyOTP,
  viewUsers,
  deleteUser,
  editUser,
  createPortfolio,
  editPortfolioFreelancer,
  getAllFreelancers,
  deleteFreelancerById,
  listOnlineUsers,
  getPortfolioByUserId,
  deletePortfolioFreelancer,
  rateFreelancer,
  getTopFreelancers,
  getFreelanceById,
  checkVerificationStatus,
  updateVerificationStatus,
  getPortfolioByfreelance,
  getFreelance,
  rejectFreelancerByAdmin,
  verifyFreelancerByAdmin,
  verifyPassword,
  updatePassword,
  deactivateAccount,
  getUserById,
  sendOtpController
  
} from "../controller/user.js";
import { authentication } from "../middleware/authentication.js";

const usersRouter = express.Router();

// ==================== PUBLIC ROUTES ====================
usersRouter.post("/register", register);
usersRouter.post("/login", login);
usersRouter.post("/verify-otp", verifyOTP);
usersRouter.post("/send-otp", sendOtpController);
usersRouter.get("/freelancers/verification-status", authentication, checkVerificationStatus);
usersRouter.put("/freelancers/verification-status", authentication, updateVerificationStatus);
usersRouter.get("/freelancers/:id/portfolio", getPortfolioByfreelance);
usersRouter.get("/freelancers/top-rated", getTopFreelancers);
usersRouter.get("/allfreelance", getFreelance);

// ==================== AUTHENTICATED ROUTES ====================
usersRouter.get("/getUserdata", authentication, getUserById);
usersRouter.get("/freelancers/:id", authentication, getFreelanceById);
usersRouter.get("/freelancers", authentication, getFreelance);

// Portfolio routes
usersRouter.get("/me/portfolio", authentication, getPortfolioByUserId);
usersRouter.post("/portfolio", authentication, createPortfolio);
usersRouter.put("/portfolio/:portfolioId", authentication, editPortfolioFreelancer);
usersRouter.delete("/portfolio", authentication, deletePortfolioFreelancer);

// Admin or authorized routes
usersRouter.post(
  "/view",
  authentication,
  viewUsers
);
usersRouter.delete(
  "/delete/:userId",
  authentication,
  deleteUser
);
usersRouter.put("/edit/:userId", authentication, editUser);
usersRouter.get(
  "/freelancers/all",
  authentication,
  getAllFreelancers
);
usersRouter.delete(
  "/freelancers/delete/:freelancerid",
  authentication,
  deleteFreelancerById
);
usersRouter.get(
  "/list/online",
  authentication,
  listOnlineUsers
);

// Rating
usersRouter.post("/rate", authentication, rateFreelancer);

// Password & Account Management
usersRouter.post("/verify-password", authentication, verifyPassword);
usersRouter.put("/update-password", authentication, updatePassword);
usersRouter.put("/deactivate", authentication, deactivateAccount);

// ==================== ADMIN ROUTES ====================
usersRouter.get("/admin/users", authentication, viewUsers);
usersRouter.delete("/admin/users/:id", authentication, deleteUser);
usersRouter.get("/admin/freelancers/all", authentication, getAllFreelancers);
usersRouter.delete("/admin/freelancers/:id", authentication, deleteFreelancerById);
usersRouter.put("/admin/freelancers/:id/verify", authentication, verifyFreelancerByAdmin);
usersRouter.put("/admin/freelancers/:id/reject", authentication, rejectFreelancerByAdmin);

export default usersRouter;
