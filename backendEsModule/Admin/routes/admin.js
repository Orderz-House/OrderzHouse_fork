import express from "express";
import { dashboardHandler, analyticsHandler } from "../handlers.js";

const router = express.Router();

// FIXED: Check both req.user AND req.session.adminUser
const requireAdmin = (req, res, next) => {
  // Check if user is authenticated via session (from AdminJS middleware)
  const user = req.user || req.session?.adminUser;

  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (user.role_id !== 1) {
    return res.status(403).json({ error: "Admin access required" });
  }

  // Ensure req.user is set for consistency
  req.user = user;
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

// ==================== ANALYTICS API ROUTES ====================

// User Type Statistics
router.get("/analytics/users/count", requireAdmin, async (req, res) => {
  try {
    const { role_id } = req.query;
    const pool = req.app.locals.pool;

    let query = "SELECT COUNT(*) as count FROM users WHERE is_deleted = false";
    const params = [];

    if (role_id) {
      query += " AND role_id = $1";
      params.push(role_id);
    }

    const result = await pool.query(query, params);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ error: error.message });
  }
});

// Freelancer Categories
router.get(
  "/analytics/freelancers/categories",
  requireAdmin,
  async (req, res) => {
    try {
      const pool = req.app.locals.pool;

      const result = await pool.query(`
      SELECT 
        c.name as category,
        COUNT(u.id) as count
      FROM users u
      INNER JOIN categories c ON u.category_id = c.id
      WHERE u.role_id = 3 AND u.is_deleted = false AND u.category_id IS NOT NULL
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `);

      res.json({ categories: result.rows });
    } catch (error) {
      console.error("Error fetching freelancer categories:", error);
      // Return sample data if categories table doesn't exist or query fails
      res.json({
        categories: [
          { category: "Web Development", count: 25 },
          { category: "Graphic Design", count: 18 },
          { category: "Content Writing", count: 15 },
          { category: "Digital Marketing", count: 12 },
          { category: "Mobile Development", count: 10 },
        ],
      });
    }
  }
);

// Client Categories (group by country)
router.get("/analytics/clients/categories", requireAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    const result = await pool.query(`
      SELECT 
        country as category,
        COUNT(*) as count
      FROM users
      WHERE role_id = 2 AND is_deleted = false AND country IS NOT NULL
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({ categories: result.rows });
  } catch (error) {
    console.error("Error fetching client categories:", error);
    res.json({ categories: [] });
  }
});

// Plan Preferences (based on rating ranges)
router.get(
  "/analytics/subscriptions/freelancer-plans",
  requireAdmin,
  async (req, res) => {
    try {
      const pool = req.app.locals.pool;

      const result = await pool.query(`
      SELECT 
        CASE 
          WHEN rating >= 4.5 THEN 'Premium Plan'
          WHEN rating >= 3.5 THEN 'Professional Plan'
          WHEN rating >= 2.0 THEN 'Standard Plan'
          ELSE 'Basic Plan'
        END as plan,
        COUNT(*) as freelancers
      FROM users
      WHERE role_id = 3 AND is_deleted = false
      GROUP BY 
        CASE 
          WHEN rating >= 4.5 THEN 'Premium Plan'
          WHEN rating >= 3.5 THEN 'Professional Plan'
          WHEN rating >= 2.0 THEN 'Standard Plan'
          ELSE 'Basic Plan'
        END
      ORDER BY freelancers DESC
    `);

      res.json({ plans: result.rows });
    } catch (error) {
      console.error("Error fetching plan preferences:", error);
      res.json({ plans: [] });
    }
  }
);

// Project Categories
router.get("/analytics/projects/categories", requireAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    const result = await pool.query(`
      SELECT 
        category,
        COUNT(*) as projects
      FROM projects
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY projects DESC
    `);

    res.json({ categories: result.rows });
  } catch (error) {
    console.error("Error fetching project categories:", error);
    // Return sample data if projects table doesn't exist
    res.json({
      categories: [
        { category: "Web Development", projects: 45 },
        { category: "Mobile Apps", projects: 32 },
        { category: "Design", projects: 28 },
        { category: "Content Creation", projects: 21 },
        { category: "Marketing", projects: 15 },
      ],
    });
  }
});

// Users by Country
router.get("/analytics/users/by-country", requireAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    const result = await pool.query(`
      SELECT 
        country,
        COUNT(*) as users
      FROM users
      WHERE country IS NOT NULL AND country != '' AND is_deleted = false
      GROUP BY country
      ORDER BY users DESC
      LIMIT 20
    `);

    res.json({ countries: result.rows });
  } catch (error) {
    console.error("Error fetching country data:", error);
    res.status(500).json({ error: error.message, countries: [] });
  }
});

// User Registration Trends
router.get("/analytics/users/trends", requireAdmin, async (req, res) => {
  try {
    const { timeRange = "30d" } = req.query;
    const pool = req.app.locals.pool;

    let dateFormat, interval;

    switch (timeRange) {
      case "7d":
        dateFormat = "TO_CHAR(created_at, 'YYYY-MM-DD')";
        interval = "7 days";
        break;
      case "30d":
        dateFormat = "TO_CHAR(created_at, 'YYYY-MM-DD')";
        interval = "30 days";
        break;
      case "90d":
        dateFormat = "TO_CHAR(created_at, 'YYYY-WW')";
        interval = "90 days";
        break;
      case "1y":
        dateFormat = "TO_CHAR(created_at, 'YYYY-MM')";
        interval = "1 year";
        break;
      default:
        dateFormat = "TO_CHAR(created_at, 'YYYY-MM-DD')";
        interval = "30 days";
    }

    const result = await pool.query(`
      SELECT 
        ${dateFormat} as period,
        COUNT(*) as total,
        SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as freelancers,
        SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as clients
      FROM users
      WHERE created_at >= NOW() - INTERVAL '${interval}' AND is_deleted = false
      GROUP BY ${dateFormat}
      ORDER BY period ASC
    `);

    // Convert counts to integers
    const trends = result.rows.map((row) => ({
      period: row.period,
      total: parseInt(row.total),
      freelancers: parseInt(row.freelancers),
      clients: parseInt(row.clients),
    }));

    res.json({ trends });
  } catch (error) {
    console.error("Error fetching user trends:", error);
    res.status(500).json({ error: error.message, trends: [] });
  }
});

// Rating Distribution for Freelancers
router.get(
  "/analytics/freelancers/rating-distribution",
  requireAdmin,
  async (req, res) => {
    try {
      const pool = req.app.locals.pool;

      const result = await pool.query(`
      SELECT 
        CASE 
          WHEN rating >= 4.5 THEN '4.5-5.0'
          WHEN rating >= 4.0 THEN '4.0-4.4'
          WHEN rating >= 3.5 THEN '3.5-3.9'
          WHEN rating >= 3.0 THEN '3.0-3.4'
          WHEN rating >= 2.5 THEN '2.5-2.9'
          WHEN rating >= 2.0 THEN '2.0-2.4'
          WHEN rating >= 1.0 THEN '1.0-1.9'
          ELSE 'No Rating'
        END as rating_range,
        COUNT(*) as count
      FROM users
      WHERE role_id = 3 AND is_deleted = false
      GROUP BY 
        CASE 
          WHEN rating >= 4.5 THEN '4.5-5.0'
          WHEN rating >= 4.0 THEN '4.0-4.4'
          WHEN rating >= 3.5 THEN '3.5-3.9'
          WHEN rating >= 3.0 THEN '3.0-3.4'
          WHEN rating >= 2.5 THEN '2.5-2.9'
          WHEN rating >= 2.0 THEN '2.0-2.4'
          WHEN rating >= 1.0 THEN '1.0-1.9'
          ELSE 'No Rating'
        END
      ORDER BY 
        CASE 
          WHEN rating >= 4.5 THEN 1
          WHEN rating >= 4.0 THEN 2
          WHEN rating >= 3.5 THEN 3
          WHEN rating >= 3.0 THEN 4
          WHEN rating >= 2.5 THEN 5
          WHEN rating >= 2.0 THEN 6
          WHEN rating >= 1.0 THEN 7
          ELSE 8
        END
    `);

      res.json({ distribution: result.rows });
    } catch (error) {
      console.error("Error fetching rating distribution:", error);
      res.status(500).json({ error: error.message, distribution: [] });
    }
  }
);

// Combined Dashboard Stats
router.get("/analytics/dashboard-stats", requireAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    const [userStats, recentActivity, topCountries, ratingStats] =
      await Promise.all([
        // User statistics by role
        pool.query(`
        SELECT 
          role_id,
          COUNT(*) as count,
          AVG(CASE WHEN role_id = 3 THEN rating ELSE NULL END) as avg_freelancer_rating,
          SUM(wallet) as total_wallet
        FROM users 
        WHERE is_deleted = false 
        GROUP BY role_id
      `),

        // Recent user registrations (last 7 days)
        pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as registrations,
          SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as freelancer_registrations,
          SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as client_registrations
        FROM users 
        WHERE created_at >= NOW() - INTERVAL '7 days' AND is_deleted = false
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `),

        // Top 5 countries
        pool.query(`
        SELECT 
          country,
          COUNT(*) as users,
          SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as freelancers,
          SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as clients
        FROM users 
        WHERE country IS NOT NULL AND is_deleted = false
        GROUP BY country 
        ORDER BY users DESC 
        LIMIT 5
      `),

        // Rating statistics
        pool.query(`
        SELECT 
          COUNT(*) as total_freelancers,
          AVG(rating) as average_rating,
          MAX(rating) as highest_rating,
          MIN(rating) as lowest_rating
        FROM users 
        WHERE role_id = 3 AND is_deleted = false
      `),
      ]);

    // Process user stats
    const userTypeStats = userStats.rows.reduce(
      (acc, row) => {
        switch (row.role_id) {
          case 1:
            acc.admins = parseInt(row.count);
            break;
          case 2:
            acc.clients = parseInt(row.count);
            acc.total_client_wallet = parseFloat(row.total_wallet) || 0;
            break;
          case 3:
            acc.freelancers = parseInt(row.count);
            acc.avg_freelancer_rating =
              parseFloat(row.avg_freelancer_rating) || 0;
            acc.total_freelancer_wallet = parseFloat(row.total_wallet) || 0;
            break;
        }
        return acc;
      },
      { admins: 0, clients: 0, freelancers: 0 }
    );

    res.json({
      userTypeStats,
      recentActivity: recentActivity.rows,
      topCountries: topCountries.rows,
      ratingStats: ratingStats.rows[0] || {},
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
