// routes/users.js
import express from "express";
import {
  register,
  login,
  viewUsers,
  deleteUser,
  editUser,
  updateUser,
  createPortfolio,
  editPortfolioFreelancer,
  getAllFreelancers,
  deleteFreelancerById,
  listOnlineUsers,
  getUserById,
  getPortfolioByUserId,
  deletePortfolioFreelancer,
  getFreelance,
  rateFreelancer,
  getTopFreelancers,
  getFreelanceById,
  checkVerificationStatus,
  updateVerificationStatus,
  getPortfolioByfreelance,
  verifyFreelancerByAdmin,
  rejectFreelancerByAdmin,
} from "../controller/user.js";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import requireVerified from "../middleware/requireVerification.js";

const usersRouter = express.Router();

// Public routes
usersRouter.post("/register", register);
usersRouter.post("/login", login);

// Authenticated routes
usersRouter.get("/getUserdata", authentication, getUserById);

// Freelancer profile routes
usersRouter.get("/freelancers/:id", authentication, getFreelanceById); // Get single freelancer
usersRouter.get("/freelancers", authentication, getFreelance); // Get all freelancers
usersRouter.get("/freelancers/top-rated", getTopFreelancers); // Public top-rated

// Portfolio routes
usersRouter.get(
  "/freelancers/:id/portfolio",
  authentication,
  getPortfolioByUserId
);
usersRouter.post(
  "/freelancers/portfolio/create",
  authentication,
  createPortfolio
);
usersRouter.put(
  "/freelancers/portfolio/edit/:portfolioId",
  authentication,
  requireVerified,
  editPortfolioFreelancer
);
usersRouter.delete(
  "/freelancers/portfolio/delete",
  authentication,
  deletePortfolioFreelancer
);

// Admin or authorized routes
usersRouter.post(
  "/view",
  authentication,
  authorization("view_users"),
  viewUsers
);
usersRouter.delete(
  "/delete/:userId",
  authentication,
  authorization("delete_user"),
  deleteUser
);
usersRouter.put("/edit/:userId", authentication, editUser);
// Self-service user update (used by Edit Profile)
usersRouter.put("/update/:userId", authentication, updateUser);
usersRouter.get(
  "/freelancers/all",
  authentication,
  authorization("view_freelancers"),
  getAllFreelancers
);
usersRouter.delete(
  "/freelancers/delete/:freelancerid",
  authentication,
  authorization("delete_freelancer"),
  deleteFreelancerById
);
usersRouter.get(
  "/list/online",
  authentication,
  authorization("show_online"),
  listOnlineUsers
);

// Rating
usersRouter.post("/rate", authentication, requireVerified, rateFreelancer);

// Verification
usersRouter.get(
  "/verification/status",
  authentication,
  checkVerificationStatus
);
usersRouter.post(
  "/verification/update",
  authentication,
  updateVerificationStatus
);
usersRouter.get(
  `/freelances/:userId/port`,
  authentication,
  getPortfolioByfreelance
); // routes/users.js
usersRouter.get("/allfreelance", getFreelance);
usersRouter.put(
  "/freelancers/:id/verify",
  authentication,
  authorization("verify_freelancer"),
  verifyFreelancerByAdmin
);

usersRouter.put(
  "/freelancers/:id/reject",
  authentication,
  authorization("verify_freelancer"),
  rejectFreelancerByAdmin
);

export default usersRouter;
