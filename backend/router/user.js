const express = require("express");

const {
  register,
  login,
  viewUsers,
  deleteUser,
  editUser,
  createPortfolio,
  editPortfolioFreelancer,
  getAllFreelancers,
  deleteFreelancerById,
  listOnlineUsers,
  getUserById,
  updateUser,
  getPortfolioByUserId,
  deletePortfolioFreelancer
} = require("../controller/user");
const { authentication } = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const usersRouter = express.Router();

usersRouter.post("/register", register);
usersRouter.post("/login", login);
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
usersRouter.put(
  "/edit/:userId",
  authentication,
  authorization("edit_user"),
  editUser
);

usersRouter.get(`/freelancer/:userId/portfolio`, authentication, getPortfolioByUserId);

usersRouter.post(
  "/freelancer/portfolio/create",
  authentication,
  /*authorization("create_portfolio"),*/ createPortfolio
);
usersRouter.put(
  "/freelancer/portfolio/edit/:portfolioId",
  authentication,
  /*authorization("edit_freelancer_profile"),*/ editPortfolioFreelancer
);

usersRouter.delete("/freelancer/portfolio/delete", authentication, deletePortfolioFreelancer);

usersRouter.post(
  "/freelancers",
  authentication,
  authorization("view_freelancers"),
  getAllFreelancers
);
usersRouter.delete(
  "/freelancer/delete/:freelancerid",
  authentication,
  authorization("delete_freelancer"),
  deleteFreelancerById
);
usersRouter.get(
  "/list/online",
  authentication,
  authorization("show_online"),
  listOnlineUsers
),
  usersRouter.get("/getUserdata", authentication, getUserById);

  usersRouter.put("/update/:userId", authentication, updateUser);
module.exports = usersRouter;
