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

export const appointmentAnalyticsHandler = async (request) => {
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
      // Appointment statistics
      client.query(`
        SELECT status, COUNT(*)::int as count
        FROM appointments 
        GROUP BY status
        ORDER BY 
          CASE status 
            WHEN 'pending' THEN 1 
            WHEN 'accepted' THEN 2 
            WHEN 'rejected' THEN 3 
            WHEN 'cancelled' THEN 4 
          END
      `),

      // Appointment type breakdown
      client.query(`
        SELECT appointment_type, COUNT(*)::int as count,
               COUNT(CASE WHEN status = 'accepted' THEN 1 END)::int as accepted,
               COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending,
               COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int as rejected
        FROM appointments
        GROUP BY appointment_type
        ORDER BY count DESC
      `),

      // Appointment timeline
      client.query(`
        SELECT ${intervalGroup} as date,
               COUNT(*)::int as total,
               COUNT(CASE WHEN status = 'accepted' THEN 1 END)::int as accepted,
               COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending,
               COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int as rejected,
               COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::int as cancelled
        FROM appointments
        ${dateFilter}
        GROUP BY ${intervalGroup}
        ORDER BY date ASC
      `),

      // Appointment overview statistics
      client.query(`
        SELECT 
          (SELECT COUNT(*) FROM appointments) as total_appointments,
          (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pending_appointments,
          (SELECT COUNT(*) FROM appointments WHERE status = 'accepted') as accepted_appointments,
          (SELECT COUNT(*) FROM appointments WHERE status = 'rejected') as rejected_appointments,
          (SELECT COUNT(*) FROM appointments WHERE status = 'cancelled') as cancelled_appointments,
          (SELECT COUNT(*) FROM appointments WHERE DATE(created_at) = CURRENT_DATE) as appointments_today,
          (SELECT COUNT(*) FROM appointments WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as appointments_this_week,
          (SELECT COUNT(*) FROM appointments WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as appointments_this_month,
          (SELECT COUNT(*) FROM appointments WHERE appointment_date >= CURRENT_DATE) as upcoming_appointments,
          (SELECT COUNT(DISTINCT freelancer_id) FROM appointments) as unique_freelancers
      `),

      // Top freelancers by appointments
      client.query(`
        SELECT u.first_name, u.last_name, u.email,
               COUNT(a.id)::int as total_appointments,
               COUNT(CASE WHEN a.status = 'accepted' THEN 1 END)::int as accepted_appointments,
               COUNT(CASE WHEN a.status = 'pending' THEN 1 END)::int as pending_appointments,
               ROUND(
                 COUNT(CASE WHEN a.status = 'accepted' THEN 1 END)::numeric / 
                 NULLIF(COUNT(a.id), 0) * 100, 2
               ) as acceptance_rate
        FROM appointments a
        JOIN users u ON a.freelancer_id = u.id
        GROUP BY u.id, u.first_name, u.last_name, u.email
        ORDER BY total_appointments DESC
        LIMIT 10
      `),

      // Appointment patterns by time
      client.query(`
        SELECT 
          EXTRACT(HOUR FROM appointment_date)::int as hour,
          COUNT(*)::int as count,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END)::int as accepted
        FROM appointments
        WHERE appointment_date IS NOT NULL
        GROUP BY EXTRACT(HOUR FROM appointment_date)
        ORDER BY hour
      `),

      // Recent appointments
      client.query(`
        SELECT a.id, a.status, a.appointment_type, a.appointment_date, a.created_at,
               u.first_name as freelancer_first_name, u.last_name as freelancer_last_name,
               a.message
        FROM appointments a
        LEFT JOIN users u ON a.freelancer_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 15
      `),

      // Monthly appointment trends
      client.query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*)::int as total,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END)::int as accepted,
          COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending
        FROM appointments
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      `),
    ]);

    const [
      appointmentStats,
      appointmentTypes,
      appointmentTimeline,
      appointmentOverview,
      topFreelancers,
      appointmentHours,
      recentAppointments,
      monthlyTrends,
    ] = queries.map((q) => q.rows);

    const overview = appointmentOverview[0] || {};

    // Process timeline data
    const processedTimeline = appointmentTimeline.map((item) => ({
      date: item.date instanceof Date ? item.date.toISOString() : item.date,
      total: parseInt(item.total) || 0,
      accepted: parseInt(item.accepted) || 0,
      pending: parseInt(item.pending) || 0,
      rejected: parseInt(item.rejected) || 0,
      cancelled: parseInt(item.cancelled) || 0,
    }));

    const statsWithColors = appointmentStats.map((stat) => ({
      ...stat,
      color: stat.status === 'pending' ? '#f59e0b' :
             stat.status === 'accepted' ? '#10b981' :
             stat.status === 'rejected' ? '#ef4444' :
             stat.status === 'cancelled' ? '#6b7280' : '#9ca3af'
    }));

    return {
      overview: {
        totalAppointments: parseInt(overview.total_appointments) || 0,
        pendingAppointments: parseInt(overview.pending_appointments) || 0,
        acceptedAppointments: parseInt(overview.accepted_appointments) || 0,
        rejectedAppointments: parseInt(overview.rejected_appointments) || 0,
        cancelledAppointments: parseInt(overview.cancelled_appointments) || 0,
        appointmentsToday: parseInt(overview.appointments_today) || 0,
        appointmentsThisWeek: parseInt(overview.appointments_this_week) || 0,
        appointmentsThisMonth: parseInt(overview.appointments_this_month) || 0,
        upcomingAppointments: parseInt(overview.upcoming_appointments) || 0,
        uniqueFreelancers: parseInt(overview.unique_freelancers) || 0,
        acceptanceRate: overview.accepted_appointments && overview.total_appointments ? 
          Math.round((parseInt(overview.accepted_appointments) / parseInt(overview.total_appointments)) * 100) : 0,
      },
      appointmentStats: statsWithColors,
      appointmentTypes: appointmentTypes.map((type, index) => ({
        ...type,
        color: ['#3b82f6', '#8b5cf6', '#10b981'][index] || '#6b7280'
      })),
      appointmentTimeline: processedTimeline,
      topFreelancers,
      appointmentHours,
      recentAppointments,
      monthlyTrends: monthlyTrends.map(trend => ({
        ...trend,
        month: trend.month,
        total: parseInt(trend.total) || 0,
        accepted: parseInt(trend.accepted) || 0,
        pending: parseInt(trend.pending) || 0,
      })),
    };
  } catch (error) {
    console.error("Appointment analytics error:", error);
    return {
      overview: {},
      appointmentStats: [],
      appointmentTypes: [],
      appointmentTimeline: [],
      topFreelancers: [],
      appointmentHours: [],
      recentAppointments: [],
      monthlyTrends: [],
    };
  } finally {
    client.release();
  }
};