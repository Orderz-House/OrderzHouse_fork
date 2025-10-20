import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyFreelancer,
} from "../controller/adminUser.js";
import { authentication } from "../middleware/authentication.js"; 
const AdminUser = express.Router();

// Public or registration route
AdminUser.post("/", createUser);

// Admin only 
AdminUser.get("/", authentication, getUsers);
AdminUser.patch("/verify/:id", authentication, verifyFreelancer);

AdminUser.get("/:id", authentication, getUserById);
AdminUser.put("/:id", authentication, updateUser);
AdminUser.delete("/:id", authentication, deleteUser);

export default AdminUser;
