import express from "express";
import { authentication } from "../middleware/authentication.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getCount,
  createTestNotification,
  cleanupNotifications,
  deleteNotification
} from "../controller/notifications.js";

const notificationsRouter = express.Router();

// Apply authentication middleware to all routes
notificationsRouter.use(authentication);

// Get notifications for the authenticated user
notificationsRouter.get("/", getNotifications);

// Get notification count
notificationsRouter.get("/count", getCount);

// Mark a specific notification as read
notificationsRouter.put("/:id/read", markAsRead);

// Mark all notifications as read
notificationsRouter.put("/read-all", markAllAsRead);

// Create a test notification (for testing purposes)
notificationsRouter.post("/test", createTestNotification);

// Delete a specific notification
notificationsRouter.delete("/:id", deleteNotification);

// Clean up old notifications (admin only)
notificationsRouter.delete("/cleanup", cleanupNotifications);

export default notificationsRouter;