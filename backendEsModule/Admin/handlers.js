// (dashboard & analytics handlers) 
export const dashboardHandler = async (pool) => {
  const client = await pool.connect();
  try {
    const queries = await Promise.allSettled([
      client.query(`SELECT COUNT(*)::int AS count FROM users`),
      client.query(`SELECT COUNT(*)::int AS count FROM users WHERE role_id = 1`), // Admins count
      client.query(`SELECT COUNT(*)::int AS count FROM users WHERE role_id = 2`),
      client.query(`SELECT COUNT(*)::int AS count FROM users WHERE role_id = 3`),
      client.query(`SELECT COUNT(*)::int AS count FROM courses`),
      client.query(`SELECT COUNT(*)::int AS count FROM plans`),
      client.query(`SELECT COUNT(*)::int AS count FROM projects WHERE (is_deleted = false OR is_deleted IS NULL)`),
      client.query(`SELECT COUNT(*)::int AS count FROM appointments WHERE status = 'pending'`),
      client.query(`SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM payments`),
      client.query(`
        SELECT DATE(created_at) as date,
               COUNT(CASE WHEN role_id = 2 THEN 1 END)::int as clients,
               COUNT(CASE WHEN role_id = 3 THEN 1 END)::int as freelancers
        FROM users 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(created_at) ORDER BY date
      `),
      client.query(`SELECT status, COUNT(*)::int as count FROM appointments GROUP BY status`),
      client.query(`
        SELECT id, first_name, last_name, email, created_at, role_id 
        FROM users 
        ORDER BY created_at DESC LIMIT 5
      `),
      client.query(`
        SELECT id, status, appointment_date, created_at 
        FROM appointments 
        ORDER BY created_at DESC LIMIT 5
      `),
      client.query(`SELECT COUNT(*)::int AS count FROM logs WHERE created_at >= NOW() - INTERVAL '24 HOURS'`),
      client.query(`
        SELECT l.id, l.user_id, l.action, l.created_at,
               COALESCE(u.first_name, 'System') as first_name, 
               COALESCE(u.last_name, 'Admin') as last_name,
               COALESCE(u.email, 'system@admin') as email,
               COALESCE(u.role_id, 1) as role_id
        FROM logs l 
        LEFT JOIN users u ON u.id = l.user_id 
        ORDER BY l.created_at DESC 
        LIMIT 20
      `),
    ]);

    const getQueryResult = (result, defaultValue = []) => {
      if (result.status === 'fulfilled') {
        return result.value.rows;
      } else {
        return defaultValue;
      }
    };

    const [
      usersCount, adminsCount, clientsCount, freelancersCount, coursesCount, plansCount,
      projectsCount, pendingAppointments, totalRevenue, userTrendsRaw,
      appointmentStats, recentUsers, recentAppointments, recentLogsCount, recentLogs
    ] = queries.map((result, index) => {
      const defaultValues = [
        [{ count: 0 }], [{ count: 0 }], [{ count: 0 }], [{ count: 0 }], [{ count: 0 }], [{ count: 0 }], 
        [{ count: 0 }], [{ count: 0 }], [{ total: 0 }], [], [], [], [], [{ count: 0 }], []
      ];
      return getQueryResult(result, defaultValues[index]);
    });

    const userTrends = userTrendsRaw.map((row) => ({
      date: new Date(row.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      clients: parseInt(row.clients) || 0,
      freelancers: parseInt(row.freelancers) || 0,
    }));

    return {
      success: true,
      metrics: {
        usersCount: parseInt(usersCount[0]?.count) || 0,
        adminsCount: parseInt(adminsCount[0]?.count) || 0, // Added admins count
        clientsCount: parseInt(clientsCount[0]?.count) || 0,
        freelancersCount: parseInt(freelancersCount[0]?.count) || 0,
        coursesCount: parseInt(coursesCount[0]?.count) || 0,
        plansCount: parseInt(plansCount[0]?.count) || 0,
        projectsCount: parseInt(projectsCount[0]?.count) || 0,
        pendingAppointments: parseInt(pendingAppointments[0]?.count) || 0,
        totalRevenue: parseFloat(totalRevenue[0]?.total) || 0,
        recentLogsCount: parseInt(recentLogsCount[0]?.count) || 0,
      },
      chartData: { 
        userTrends: userTrends || [], 
        appointmentStats: appointmentStats || [] 
      },
      recentUsers: recentUsers || [],
      recentAppointments: recentAppointments || [],
      recentLogs: recentLogs || [],
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      metrics: {
        usersCount: 0, adminsCount: 0, clientsCount: 0, freelancersCount: 0, coursesCount: 0, 
        plansCount: 0, projectsCount: 0, pendingAppointments: 0, totalRevenue: 0, 
        recentLogsCount: 0,
      },
      chartData: { userTrends: [], appointmentStats: [] },
      recentUsers: [], recentAppointments: [], recentLogs: [],
    };
  } finally {
    client.release();
  }
};

export const analyticsHandler = async (request, pool) => {
  const range = request?.query?.range || "7d";
  const client = await pool.connect();

  try {
    let dateFilter = "";
    switch (range) {
      case "7d":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case "30d":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case "90d":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'";
        break;
      case "1y":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '1 year'";
        break;
    }

    const result = await client.query(`
      SELECT 'users' as name, COUNT(*) as count,
             COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
      FROM users
      UNION ALL
      SELECT 'admins' as name, COUNT(*) as count,
             COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
      FROM users WHERE role_id = 1
      UNION ALL
      SELECT 'projects' as name, COUNT(*) as count,
             COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
      FROM projects WHERE (is_deleted = false OR is_deleted IS NULL)
      UNION ALL
      SELECT 'appointments' as name, COUNT(*) as count,
             COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
      FROM appointments
      UNION ALL
      SELECT 'courses' as name, COUNT(*) as count,
             COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
      FROM courses
    `);

    return {
      tableStats: result.rows.map((stat) => ({
        ...stat,
        count: parseInt(stat.count) || 0,
        growth7d: parseInt(stat.growth7d) || 0,
      })),
      overview: {},
      userStats: { daily: [] },
      projectStats: { byStatus: [], byCategory: [] },
      paymentStats: [], paymentTrends: [],
      userDistribution: [], appointmentStats: [],
    };
  } catch (error) {
    return {
      overview: {}, userStats: { daily: [] },
      projectStats: { byStatus: [], byCategory: [] },
      paymentStats: [], paymentTrends: [], tableStats: [],
      userDistribution: [], appointmentStats: [],
    };
  } finally {
    client.release();
  }
};