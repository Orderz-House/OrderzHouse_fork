const express = require("express");

const {
  register,
  login,
  viewUsers,
  deleteUser,
  editUser,
} = require("../controller/user");
const authentiction = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const usersRouter = express.Router();

usersRouter.post("/register", register);
usersRouter.post("/login", login);
usersRouter.get("/view", authentiction, authorization("view_users"), viewUsers);
usersRouter.delete(
  "/delete/:userId",
  authentiction,
  authorization("delete_user"),
  deleteUser
);
usersRouter.put(
  "/edit/:userId",
  authentiction,
  authorization("edit_user"),
  editUser
);

module.exports = usersRouter;
