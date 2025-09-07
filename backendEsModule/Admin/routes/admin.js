import express from "express";
import { dashboardHandler, analyticsHandler } from "../handlers.js";

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role_id !== 1) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    const dashboardData = await dashboardHandler(req.app.locals.pool);
    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

router.get("/analytics", requireAdmin, async (req, res) => {
  try {
    const analyticsData = await analyticsHandler(req, req.app.locals.pool);
    res.json(analyticsData);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

router.get("/dashboard/logs", requireAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const client = await pool.connect();
    const result = await client.query(`
      SELECT l.id, l.user_id, l.action, l.created_at,
             COALESCE(u.first_name, 'System') as first_name,
             COALESCE(u.last_name, 'Admin') as last_name,
             COALESCE(u.email, 'system@admin') as email,
             COALESCE(u.role_id, 1) as role_id
      FROM logs l
      LEFT JOIN users u ON u.id = l.user_id
      ORDER BY l.created_at DESC
      LIMIT 20
    `);
    client.release();

    res.json({
      success: true,
      recentLogs: result.rows || [],
    });
  } catch (error) {
    console.error("Logs error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch logs",
      recentLogs: [],
    });
  }
});

export default router;
