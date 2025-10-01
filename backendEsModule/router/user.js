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
const router = express.Router();
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
  viewUsers
);
usersRouter.delete(
  "/delete/:userId",
  authentication,
  deleteUser
);
usersRouter.put("/edit/:userId", authentication, editUser);
// Self-service user update (used by Edit Profile)
usersRouter.put("/update/:userId", authentication, updateUser);
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
  verifyFreelancerByAdmin
);

usersRouter.put(
  "/freelancers/:id/reject",
  authentication,
  rejectFreelancerByAdmin
);
// Get freelancer profile by ID
router.get("/freelancers/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, username, email, phone_number, 
              country, bio, profile_pic_url, category, rating, rating_count, 
              violation_count, created_at, is_online
       FROM users 
       WHERE id = $1 AND role = 'freelancer'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Freelancer not found" });
    }

    res.json({ success: true, freelancer: result.rows[0] });
  } catch (err) {
    console.error("Error fetching freelancer:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default usersRouter;
