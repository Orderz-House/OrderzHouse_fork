// In router/user.js - fix the typo from 'authentiction' to 'authentication'
const express = require('express');
const usersRouter = express.Router();
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
} = require('../controller/user');
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');



usersRouter.post('/register', register);
usersRouter.post('/login', login);
usersRouter.get('/view', authentication, authorization("view_users"), viewUsers);
usersRouter.delete('/delete/:userId', authentication, authorization("delete_user"), deleteUser);
usersRouter.put('/edit/:userId', authentication, authorization("edit_user"), editUser);
usersRouter.post('/freelancer/portfolio/create', authentication, createPortfolio);
usersRouter.put('/freelancer/portfolio/edit/:userId', authentication, editPortfolioFreelancer);
usersRouter.post('/freelancers', authentication, authorization("view_freelancers"), getAllFreelancers);
usersRouter.delete('/freelancer/delete/:userId', authentication, authorization("delete_freelancer"), deleteFreelancerById);

module.exports = usersRouter;