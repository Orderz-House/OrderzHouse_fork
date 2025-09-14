import express from "express";
import {
  getAllUsers,
  getUserById,
  getUsersByRoleId,
  createUser,
  updateUser,
  deleteUser,
} from "../controller/adminUsers.js";

const adminRouter = express.Router();

// Generic route next
adminRouter.get("/:id", getUserById);

// Specific route first
adminRouter.get("/role/:roleId", getUsersByRoleId);

// Fetch all users
adminRouter.get("/", getAllUsers);

// Create user
adminRouter.post("/", createUser);

// Update user
adminRouter.put("/:id", updateUser);

// Delete user (soft delete)
adminRouter.delete("/:id", deleteUser);

export default adminRouter;
