const express = require("express");

const {register, login, viewUsers, deleteUser, editUser, createPortfolio, editPortfolioFreelancer, getAllFreelancers} = require('../controller/user');
const authentiction= require('../middleware/authentication');
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
  authentiction
  // /*authorization("edit_freelancer_profile"),*/ editPortfolioFreelancer
);


usersRouter.post('/register', register);
usersRouter.post('/login', login);
usersRouter.get('/view',authentiction, authorization("view_users"), viewUsers);
usersRouter.delete('/delete/:userId',authentiction, authorization("delete_user"), deleteUser);
usersRouter.put('/edit/:userId',authentiction, authorization("edit_user"), editUser);
usersRouter.post('/freelancer/portfolio/create',authentiction, /*authorization("create_portfolio"),*/  createPortfolio);
usersRouter.put('/freelancer/portfolio/edit/:userId',authentiction, /*authorization("edit_freelancer_profile"),*/  editPortfolioFreelancer);
usersRouter.post('/freelancers', authentiction, authorization("view_freelancers"), getAllFreelancers);
module.exports = usersRouter;
