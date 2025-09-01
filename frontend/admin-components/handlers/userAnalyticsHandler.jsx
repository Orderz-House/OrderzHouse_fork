import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const userAnalyticsHandler = async (request) => {
  const range = request?.query?.range || "7d";
  const client = await pool.connect();

  try {
    let dateFilter = "";
    let intervalGroup = "DATE(created_at)";

    switch (range) {
      case "7d":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case "30d":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case "90d":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'";
        intervalGroup = "DATE_TRUNC('week', created_at)";
        break;
      case "1y":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '1 year'";
        intervalGroup = "DATE_TRUNC('month', created_at)";
        break;
    }

    const queries = await Promise.all([
      // User growth trends with real data
      client.query(`
        SELECT ${intervalGroup} as date,
               COUNT(CASE WHEN role_id = 2 THEN 1 END)::int as clients,
               COUNT(CASE WHEN role_id = 3 THEN 1 END)::int as freelancers,
               COUNT(*)::int as total
        FROM users 
        ${dateFilter}
        GROUP BY ${intervalGroup} 
        ORDER BY date ASC
      `),

      // User distribution
      client.query(`
        SELECT CASE 
            WHEN role_id = 1 THEN 'Admins'
            WHEN role_id = 2 THEN 'Clients'
            WHEN role_id = 3 THEN 'Freelancers'
            ELSE 'Others'
          END as name, 
          COUNT(*)::int as value,
          role_id
        FROM users 
        GROUP BY role_id
        ORDER BY value DESC
      `),

      // User statistics by role
      client.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE role_id = 1) as total_admins,
          (SELECT COUNT(*) FROM users WHERE role_id = 2) as total_clients,
          (SELECT COUNT(*) FROM users WHERE role_id = 3) as total_freelancers,
          (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE) as new_users_today,
          (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_week,
          (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_month,
          (SELECT AVG(CASE WHEN role_id IN (2,3) THEN 
            EXTRACT(EPOCH FROM (CURRENT_DATE - DATE(created_at))) / 86400 
          END)::int) as avg_user_age_days
      `),

      // User activity by months
      client.query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*)::int as total_users,
          COUNT(CASE WHEN role_id = 2 THEN 1 END)::int as clients,
          COUNT(CASE WHEN role_id = 3 THEN 1 END)::int as freelancers
        FROM users 
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      `),

      // Recent user registrations
      client.query(`
        SELECT id, first_name, last_name, email, role_id, created_at
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 10
      `),

      // User engagement metrics
      client.query(`
        SELECT 
          role_id,
          COUNT(*) as user_count,
          CASE 
            WHEN role_id = 1 THEN 'Admin'
            WHEN role_id = 2 THEN 'Client'
            WHEN role_id = 3 THEN 'Freelancer'
            ELSE 'Other'
          END as role_name
        FROM users
        GROUP BY role_id, role_name
        ORDER BY user_count DESC
      `),
    ]);

    const [
      userGrowthRaw,
      userDistribution,
      userStats,
      monthlyActivity,
      recentUsers,
      roleBreakdown,
    ] = queries.map((q) => q.rows);

    // Process user growth data
    const userGrowth = userGrowthRaw.map((row) => ({
      date: row.date instanceof Date ? row.date.toISOString() : row.date,
      clients: parseInt(row.clients) || 0,
      freelancers: parseInt(row.freelancers) || 0,
      total: parseInt(row.total) || 0,
    }));

    const stats = userStats[0] || {};

    return {
      overview: {
        totalUsers: parseInt(stats.total_users) || 0,
        totalAdmins: parseInt(stats.total_admins) || 0,
        totalClients: parseInt(stats.total_clients) || 0,
        totalFreelancers: parseInt(stats.total_freelancers) || 0,
        newUsersToday: parseInt(stats.new_users_today) || 0,
        newUsersWeek: parseInt(stats.new_users_week) || 0,
        newUsersMonth: parseInt(stats.new_users_month) || 0,
        avgUserAgeDays: parseInt(stats.avg_user_age_days) || 0,
      },
      userGrowth,
      userDistribution: userDistribution.map(u => ({
        name: u.name,
        value: parseInt(u.value) || 0,
        color: u.role_id === 1 ? '#ef4444' : 
               u.role_id === 2 ? '#3b82f6' : 
               u.role_id === 3 ? '#8b5cf6' : '#6b7280'
      })),
      monthlyActivity: monthlyActivity.map(m => ({
        month: m.month,
        total_users: parseInt(m.total_users) || 0,
        clients: parseInt(m.clients) || 0,
        freelancers: parseInt(m.freelancers) || 0,
      })),
      recentUsers,
      roleBreakdown,
    };
  } catch (error) {
    console.error("User analytics error:", error);
    return {
      overview: {},
      userGrowth: [],
      userDistribution: [],
      monthlyActivity: [],
      recentUsers: [],
      roleBreakdown: [],
    };
  } finally {
    client.release();
  }
};