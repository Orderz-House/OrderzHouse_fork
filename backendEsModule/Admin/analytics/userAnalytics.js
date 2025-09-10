// backendEsModule/analytics/userAnalytics.js

/**
 * Returns all user analytics data in one response:
 * - user counts by role (admins, clients, freelancers)
 * - freelancer categories
 * - freelancer plan preferences
 * - top client countries
 * - user registration trends
 */
export const getUsersAnalytics = async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { timeRange = "30d" } = req.query;

    // Determine date formatting for trends
    let dateFormat;
    switch (timeRange) {
      case "7d":
      case "30d":
        dateFormat = "TO_CHAR(created_at,'YYYY-MM-DD')";
        break;
      case "90d":
        dateFormat = "TO_CHAR(created_at,'YYYY-WW')";
        break;
      case "1y":
        dateFormat = "TO_CHAR(created_at,'YYYY-MM')";
        break;
      default:
        dateFormat = "TO_CHAR(created_at,'YYYY-MM-DD')";
    }

    // Fetch all analytics concurrently
    const [
      userCountsRes,
      freelancerCategoriesRes,
      planPreferencesRes,
      countriesRes,
      trendsRes,
    ] = await Promise.all([
      // Users count by role
      pool.query(
        `SELECT role_id, COUNT(*) as count
         FROM users
         WHERE is_deleted = false
         GROUP BY role_id`
      ),
      // Freelancer categories
      pool.query(
        `SELECT c.name as category, COUNT(u.id) as count
         FROM users u
         INNER JOIN categories c ON u.category_id = c.id
         WHERE u.role_id = 3 AND u.is_deleted = false
         GROUP BY c.id, c.name
         ORDER BY count DESC`
      ),
      // Freelancer plan preferences based on rating
      pool.query(
        `SELECT 
          CASE 
            WHEN rating >= 4.5 THEN 'Premium Plan'
            WHEN rating >= 3.5 THEN 'Professional Plan'
            WHEN rating >= 2 THEN 'Standard Plan'
            ELSE 'Basic Plan'
          END as plan,
          COUNT(*) as freelancers
         FROM users
         WHERE role_id = 3 AND is_deleted = false
         GROUP BY plan
         ORDER BY freelancers DESC`
      ),
      // Top client countries
      pool.query(
        `SELECT country, COUNT(*) as users
         FROM users
         WHERE role_id = 2 AND country IS NOT NULL AND is_deleted = false
         GROUP BY country
         ORDER BY users DESC
         LIMIT 10`
      ),
      // User registration trends
      pool.query(
        `SELECT ${dateFormat} as period,
                COUNT(*) as total,
                SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as freelancers,
                SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as clients
         FROM users
         WHERE is_deleted = false
         GROUP BY ${dateFormat}
         ORDER BY period ASC`
      ),
    ]);

    // Process user counts
    const userStats = { admins: 0, clients: 0, freelancers: 0 };
    userCountsRes.rows.forEach((r) => {
      if (r.role_id === 1) userStats.admins = parseInt(r.count);
      if (r.role_id === 2) userStats.clients = parseInt(r.count);
      if (r.role_id === 3) userStats.freelancers = parseInt(r.count);
    });

    res.json({
      userStats,
      freelancerCategories: freelancerCategoriesRes.rows,
      planPreferences: planPreferencesRes.rows,
      countryData: countriesRes.rows,
      userTrends: trendsRes.rows,
    });
  } catch (err) {
    console.error("Users analytics error:", err);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
};
