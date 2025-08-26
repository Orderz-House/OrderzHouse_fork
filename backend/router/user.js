
const express = require("express");

const {register, login, viewUsers, deleteUser, editUser, createPortfolio, editPortfolioFreelancer, getAllFreelancers, deleteFreelancerById} = require('../controller/user');
const {authentication}= require('../middleware/authentication');
const authorization= require('../middleware/authorization');
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
usersRouter.put(
  "/freelancer/portfolio/edit/:userId",
  authentication
  // /*authorization("edit_freelancer_profile"),*/ editPortfolioFreelancer
);

usersRouter.post('/register', register);
usersRouter.post('/login', login);
usersRouter.get('/view',authentication, authorization("view_users"), viewUsers);
usersRouter.delete('/delete/:userId',authentication, authorization("delete_user"), deleteUser);
usersRouter.put('/edit/:userId',authentication, authorization("edit_user"), editUser);
usersRouter.post('/freelancer/portfolio/create',authentication, /*authorization("create_portfolio"),*/  createPortfolio);
usersRouter.put('/freelancer/portfolio/edit/:userId',authentication, /*authorization("edit_freelancer_profile"),*/  editPortfolioFreelancer);

usersRouter.post('/freelancers', authentication, authorization("view_freelancers"), getAllFreelancers);
usersRouter.delete('/freelancer/delete/:userId', authentication, authorization("delete_freelancer"), deleteFreelancerById);
module.exports = usersRouter;
