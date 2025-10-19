import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyFreelancer,
} from "../controller/users.js";
import { requireVerified } from "../middleware/requireVerification.js";

const AdminUser = express.Router();

// Public or registration route
AdminUser.post("/", createUser);

// Admin only
AdminUser.get("/", requireVerified, getUsers);
AdminUser.patch("/verify/:id", requireVerified, verifyFreelancer);

AdminUser.get("/:id", requireVerified, getUserById);
AdminUser.put("/:id", requireVerified, updateUser);
AdminUser.delete("/:id", requireVerified, deleteUser);

export default AdminUser;
