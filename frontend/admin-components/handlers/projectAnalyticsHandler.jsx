// import pg from "pg";
// import dotenv from "dotenv";

// dotenv.config();

// const { Pool } = pg;
// const pool = new Pool({
//   connectionString: process.env.DB_URL,
//   ssl:
//     process.env.NODE_ENV === "production"
//       ? { rejectUnauthorized: false }
//       : false,
// });

// export const projectAnalyticsHandler = async (request) => {
//   const range = request?.query?.range || "7d";
//   const client = await pool.connect();

//   try {
//     let dateFilter = "";
//     let intervalGroup = "DATE(created_at)";

//     switch (range) {
//       case "7d":
//         dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'";
//         break;
//       case "30d":
//         dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'";
//         break;
//       case "90d":
//         dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'";
//         intervalGroup = "DATE_TRUNC('week', created_at)";
//         break;
//       case "1y":
//         dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '1 year'";
//         intervalGroup = "DATE_TRUNC('month', created_at)";
//         break;
//     }

//     const queries = await Promise.all([
//       // Project categories
//       client.query(`
//         SELECT COALESCE(c.name, 'Uncategorized') as category, 
//                COUNT(p.id)::int as count,
//                COUNT(CASE WHEN p.status = 'completed' THEN 1 END)::int as completed,
//                COUNT(CASE WHEN p.status = 'in_progress' THEN 1 END)::int as in_progress,
//                COUNT(CASE WHEN p.status = 'active' THEN 1 END)::int as active,
//                COUNT(CASE WHEN (p.status = '' OR p.status IS NULL) THEN 1 END)::int as draft,
//                AVG(NULLIF(p.budget_max - p.budget_min, 0))::numeric as avg_budget_range
//         FROM projects p
//         LEFT JOIN categories c ON c.id = p.category_id
//         WHERE p.is_deleted = false OR p.is_deleted IS NULL
//         GROUP BY c.id, c.name
//         ORDER BY count DESC
//       `),

//       // Project status breakdown
//       client.query(`
//         SELECT 
//           CASE 
//             WHEN status = '' OR status IS NULL THEN 'draft'
//             WHEN status = 'active' THEN 'active'
//             WHEN status = 'in_progress' THEN 'in_progress'
//             WHEN status = 'completed' THEN 'completed'
//             WHEN status = 'cancelled' THEN 'cancelled'
//             ELSE 'draft'
//           END as status,
//           COUNT(*)::int as count,
//           AVG(NULLIF(budget_max - budget_min, 0))::numeric as avg_budget,
//           AVG(NULLIF(budget_max, 0))::numeric as avg_max_budget,
//           AVG(NULLIF(budget_min, 0))::numeric as avg_min_budget
//         FROM projects
//         WHERE is_deleted = false OR is_deleted IS NULL
//         GROUP BY CASE 
//           WHEN status = '' OR status IS NULL THEN 'draft'
//           WHEN status = 'active' THEN 'active'
//           WHEN status = 'in_progress' THEN 'in_progress'
//           WHEN status = 'completed' THEN 'completed'
//           WHEN status = 'cancelled' THEN 'cancelled'
//           ELSE 'draft'
//         END
//         ORDER BY count DESC
//       `),

//       // Project creation timeline
//       client.query(`
//         SELECT ${intervalGroup} as date,
//                COUNT(*)::int as total,
//                COUNT(CASE WHEN status = 'completed' THEN 1 END)::int as completed,
//                COUNT(CASE WHEN status = 'active' THEN 1 END)::int as active,
//                AVG(NULLIF(budget_max, 0))::numeric as avg_budget
//         FROM projects
//         ${dateFilter}
//         AND (is_deleted = false OR is_deleted IS NULL)
//         GROUP BY ${intervalGroup}
//         ORDER BY date ASC
//       `),

//       // Project overview statistics
//       client.query(`
//         SELECT 
//           (SELECT COUNT(*) FROM projects WHERE is_deleted = false OR is_deleted IS NULL) as total_projects,
//           (SELECT COUNT(*) FROM projects WHERE status = 'completed' AND (is_deleted = false OR is_deleted IS NULL)) as completed_projects,
//           (SELECT COUNT(*) FROM projects WHERE status = 'active' AND (is_deleted = false OR is_deleted IS NULL)) as active_projects,
//           (SELECT COUNT(*) FROM projects WHERE status = 'in_progress' AND (is_deleted = false OR is_deleted IS NULL)) as in_progress_projects,
//           (SELECT COUNT(*) FROM projects WHERE (status = '' OR status IS NULL) AND (is_deleted = false OR is_deleted IS NULL)) as draft_projects,
//           (SELECT COUNT(*) FROM projects WHERE status = 'cancelled' AND (is_deleted = false OR is_deleted IS NULL)) as cancelled_projects,
//           (SELECT COUNT(*) FROM projects WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND (is_deleted = false OR is_deleted IS NULL)) as projects_this_week,
//           (SELECT COUNT(*) FROM projects WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND (is_deleted = false OR is_deleted IS NULL)) as projects_this_month,
//           (SELECT AVG(NULLIF(budget_max, 0))::numeric FROM projects WHERE is_deleted = false OR is_deleted IS NULL) as avg_max_budget,
//           (SELECT AVG(NULLIF(budget_min, 0))::numeric FROM projects WHERE is_deleted = false OR is_deleted IS NULL) as avg_min_budget,
//           (SELECT COUNT(*) FROM projects WHERE assigned_freelancer_id IS NOT NULL AND (is_deleted = false OR is_deleted IS NULL)) as assigned_projects
//       `),

//       // Top project clients
//       client.query(`
//         SELECT u.first_name, u.last_name, u.email,
//                COUNT(p.id)::int as project_count,
//                AVG(NULLIF(p.budget_max, 0))::numeric as avg_budget
//         FROM projects p
//         JOIN users u ON p.user_id = u.id
//         WHERE (p.is_deleted = false OR p.is_deleted IS NULL)
//         GROUP BY u.id, u.first_name, u.last_name, u.email
//         ORDER BY project_count DESC
//         LIMIT 10
//       `),

//       // Assigned freelancers performance
//       client.query(`
//         SELECT u.first_name, u.last_name, u.email,
//                COUNT(p.id)::int as assigned_projects,
//                COUNT(CASE WHEN p.status = 'completed' THEN 1 END)::int as completed_projects,
//                AVG(NULLIF(p.budget_max, 0))::numeric as avg_project_value
//         FROM projects p
//         JOIN users u ON p.assigned_freelancer_id = u.id
//         WHERE (p.is_deleted = false OR p.is_deleted IS NULL)
//           AND p.assigned_freelancer_id IS NOT NULL
//         GROUP BY u.id, u.first_name, u.last_name, u.email
//         ORDER BY assigned_projects DESC
//         LIMIT 10
//       `),

//       // Recent projects
//       client.query(`
//         SELECT p.id, p.title, p.status, p.budget_min, p.budget_max, p.created_at,
//                u.first_name as client_first_name, u.last_name as client_last_name,
//                c.name as category_name
//         FROM projects p
//         LEFT JOIN users u ON p.user_id = u.id
//         LEFT JOIN categories c ON p.category_id = c.id
//         WHERE (p.is_deleted = false OR p.is_deleted IS NULL)
//         ORDER BY p.created_at DESC
//         LIMIT 10
//       `),
//     ]);

//     const [
//       projectCategories,
//       projectStatusStats,
//       projectTimeline,
//       projectOverview,
//       topClients,
//       freelancerPerformance,
//       recentProjects,
//     ] = queries.map((q) => q.rows);

//     const overview = projectOverview[0] || {};

//     // Add colors to categories
//     const categoriesWithColors = projectCategories.map((cat, index) => ({
//       ...cat,
//       color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"][
//         index % 6
//       ],
//     }));

//     // Process timeline data
//     const processedTimeline = projectTimeline.map((item) => ({
//       date: item.date instanceof Date ? item.date.toISOString() : item.date,
//       total: parseInt(item.total) || 0,
//       completed: parseInt(item.completed) || 0,
//       active: parseInt(item.active) || 0,
//       avg_budget: parseFloat(item.avg_budget) || 0,
//     }));

//     return {
//       overview: {
//         totalProjects: parseInt(overview.total_projects) || 0,
//         completedProjects: parseInt(overview.completed_projects) || 0,
//         activeProjects: parseInt(overview.active_projects) || 0,
//         inProgressProjects: parseInt(overview.in_progress_projects) || 0,
//         draftProjects: parseInt(overview.draft_projects) || 0,
//         cancelledProjects: parseInt(overview.cancelled_projects) || 0,
//         projectsThisWeek: parseInt(overview.projects_this_week) || 0,
//         projectsThisMonth: parseInt(overview.projects_this_month) || 0,
//         avgMaxBudget: parseFloat(overview.avg_max_budget) || 0,
//         avgMinBudget: parseFloat(overview.avg_min_budget) || 0,
//         assignedProjects: parseInt(overview.assigned_projects) || 0,
//       },
//       projectCategories: categoriesWithColors,
//       projectStatusStats: projectStatusStats.map(stat => ({
//         ...stat,
//         color: stat.status === 'completed' ? '#10b981' :
//                stat.status === 'in_progress' ? '#f59e0b' :
//                stat.status === 'active' ? '#3b82f6' :
//                stat.status === 'draft' ? '#6b7280' :
//                stat.status === 'cancelled' ? '#ef4444' : '#9ca3af'
//       })),
//       projectTimeline: processedTimeline,
//       topClients,
//       freelancerPerformance,
//       recentProjects,
//     };
//   } catch (error) {
//     console.error("Project analytics error:", error);
//     return {
//       overview: {},
//       projectCategories: [],
//       projectStatusStats: [],
//       projectTimeline: [],
//       topClients: [],
//       freelancerPerformance: [],
//       recentProjects: [],
//     };
//   } finally {
//     client.release();
//   }
// };