const express = require("express");

<<<<<<< HEAD
const {register, login, viewUsers, deleteUser, editUser, createPortfolio, editPortfolioFreelancer} = require('../controller/user');
=======
const {register, login, viewUsers, deleteUser, editUser, createPortfolio, editPortfolioFreelancer, getAllFreelancers, deleteFreelancerById} = require('../controller/user');
>>>>>>> 458ea86109a5ecb53ca50a4c1d84991fa49a3fd7
const authentiction= require('../middleware/authentication');
const authorization= require('../middleware/authorization');
const usersRouter = express.Router();

<<<<<<< HEAD
usersRouter.post('/register', register);
usersRouter.post('/login', login);
usersRouter.get('/view',authentiction, authorization("view_users"), viewUsers);
usersRouter.delete('/delete/:userId',authentiction, authorization("delete_user"), deleteUser);
usersRouter.put('/edit/:userId',authentiction, authorization("edit_user"), editUser);
usersRouter.post('/freelancer/portfolio/create',authentiction, /*authorization("create_portfolio"),*/  createPortfolio);
usersRouter.put('/freelancer/portfolio/edit/:userId',authentiction, /*authorization("edit_freelancer_profile"),*/  editPortfolioFreelancer);
=======

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
>>>>>>> 458ea86109a5ecb53ca50a4c1d84991fa49a3fd7


usersRouter.post('/register', register);
usersRouter.post('/login', login);
usersRouter.get('/view',authentiction, authorization("view_users"), viewUsers);
usersRouter.delete('/delete/:userId',authentiction, authorization("delete_user"), deleteUser);
usersRouter.put('/edit/:userId',authentiction, authorization("edit_user"), editUser);
usersRouter.post('/freelancer/portfolio/create',authentiction, /*authorization("create_portfolio"),*/  createPortfolio);
usersRouter.put('/freelancer/portfolio/edit/:userId',authentiction, /*authorization("edit_freelancer_profile"),*/  editPortfolioFreelancer);
usersRouter.post('/freelancers', authentiction, authorization("view_freelancers"), getAllFreelancers);
usersRouter.delete('/freelancer/delete/:userId', authentiction, authorization("delete_freelancer"), deleteFreelancerById);
module.exports = usersRouter;
