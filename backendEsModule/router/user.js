import express from "express";

import {
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
  getPortfolioByUserId,
  deletePortfolioFreelancer,
  getFreelance,
  rateFreelancer,
  getTopFreelancers,
  // rateFreelancer,
  // getTopFreelancers,
} from "../controller/user.js";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
const usersRouter = express.Router();

/*
usersRouter.post(
  "/freelancer/portfolio/create",
  authentiction,
  authorization("create_portfolio"), createPortfolio
);
usersRouter.put(
  "/freelancer/portfolio/edit/:userId",
  authentiction,
  authorization("edit_freelancer_profile"), editPortfolioFreelancer

usersRouter.put("/edit/:userId", authentiction, editUser);
usersRouter.post(
  "/freelancer/portfolio/create",
  authentiction
  /*authorization("create_portfolio"),*/
// );
// This route is already defined below with the handler
// usersRouter.put(
//   "/freelancer/portfolio/edit/:userId",
//   authentication
//   // /*authorization("edit_freelancer_profile"),*/ editPortfolioFreelancer
// );
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
usersRouter.post(
  "/freelancer/portfolio/create",
  authentication,
  /*authorization("create_portfolio"),*/ createPortfolio
);

usersRouter.get(
  "/freelancer/:userId/portfolio",
  authentication,
  getPortfolioByUserId
);
usersRouter.put(
  "/freelancer/portfolio/edit/:portfolioId",
  authentication,
  /*authorization("edit_freelancer_profile"),*/ editPortfolioFreelancer
);

usersRouter.delete(
  `/freelancer/portfolio/delete`,
  authentication,
  deletePortfolioFreelancer
);

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
usersRouter.post("/rate", authentication, rateFreelancer);
usersRouter.get("/freelancers/top-rated", getTopFreelancers);
usersRouter.get(`/allfreelance`, getFreelance); 

export default usersRouter;
