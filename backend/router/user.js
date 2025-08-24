const express = require('express');

const {register, login, viewUsers, deleteUser} = require('../controller/user');
const authentiction= require('../middleware/authentication');
const authorization= require('../middleware/authorization');
const usersRouter = express.Router();

usersRouter.post('/register', register);
usersRouter.post('/login', login);
 usersRouter.get('/view', viewUsers);
usersRouter.delete('/delete/:id', deleteUser);


module.exports = usersRouter;