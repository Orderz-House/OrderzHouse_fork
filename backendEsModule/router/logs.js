import express from "express";
import { authentication } from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";
import {
  getMessageLogs,
  getSystemLogs,
  getEntityLogsRoute,
  getUserLogsRoute,
  getErrorLogsRoute,
  getCriticalLogsRoute,
  getLogStatisticsRoute,
  cleanupLogs,
  exportLogs
} from "../controller/logs.js";

const logsRouter = express.Router();

// Apply authentication middleware to all routes
logsRouter.use(authentication);

// Get message logs (existing functionality)
logsRouter.get("/messages", authorization("view_logs"), getMessageLogs);

// Get system logs with filtering and pagination
logsRouter.get("/", authorization("view_logs"), getSystemLogs);

// Get logs for a specific entity
logsRouter.get("/entity/:entityType/:entityId", authorization("view_logs"), getEntityLogsRoute);

// Get logs for a specific user
logsRouter.get("/user/:userId", authorization("view_logs"), getUserLogsRoute);

// Get error logs
logsRouter.get("/errors", authorization("view_logs"), getErrorLogsRoute);

// Get critical logs
logsRouter.get("/critical", authorization("view_logs"), getCriticalLogsRoute);

// Get log statistics
logsRouter.get("/statistics", authorization("view_logs"), getLogStatisticsRoute);

// Export logs to CSV (admin only)
logsRouter.get("/export", authorization("view_logs"), exportLogs);

// Clean up old logs (admin only)
logsRouter.delete("/cleanup", authorization("view_logs"), cleanupLogs);

export default logsRouter;