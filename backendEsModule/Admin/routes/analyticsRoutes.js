// backendEsModule/Admin/routes/analyticsRoutes.js
import express from "express";
import { getUsersAnalytics } from "../analytics/userAnalytics.js";

const router = express.Router();

// Single endpoint returning all user analytics
router.get("/users", getUsersAnalytics);

export default router;
