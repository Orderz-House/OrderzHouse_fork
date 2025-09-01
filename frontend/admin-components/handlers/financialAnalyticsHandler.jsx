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

// export const financialAnalyticsHandler = async (request) => {
//   const range = request?.query?.range || "7d";
//   const client = await pool.connect();

//   try {
//     let dateFilter = "";
//     let paymentDateFilter = "";
//     let intervalGroup = "DATE(payment_date)";

//     switch (range) {
//       case "7d":
//         paymentDateFilter = "WHERE payment_date >= CURRENT_DATE - INTERVAL '7 days'";
//         break;
//       case "30d":
//         paymentDateFilter = "WHERE payment_date >= CURRENT_DATE - INTERVAL '30 days'";
//         break;
//       case "90d":
//         paymentDateFilter = "WHERE payment_date >= CURRENT_DATE - INTERVAL '90 days'";
//         intervalGroup = "DATE_TRUNC('week', payment_date)";
//         break;
//       case "1y":
//         paymentDateFilter = "WHERE payment_date >= CURRENT_DATE - INTERVAL '1 year'";
//         intervalGroup = "DATE_TRUNC('month', payment_date)";
//         break;
//     }

//     const queries = await Promise.all([
//       // Payment analytics with receipts
//       client.query(`
//         SELECT 
//           SUM(p.amount)::numeric as total_revenue,
//           COUNT(p.id)::int as total_transactions,
//           SUM(CASE WHEN p.project_id IS NOT NULL THEN p.amount ELSE 0 END)::numeric as project_revenue,
//           SUM(CASE WHEN p.order_id IS NOT NULL THEN p.amount ELSE 0 END)::numeric as order_revenue,
//           SUM(CASE WHEN p.temp_project_id IS NOT NULL THEN p.amount ELSE 0 END)::numeric as temp_project_revenue,
//           SUM(CASE WHEN p.payment_date >= CURRENT_DATE - INTERVAL '30 days' THEN p.amount ELSE 0 END)::numeric as monthly_revenue,
//           SUM(CASE WHEN p.payment_date >= CURRENT_DATE - INTERVAL '7 days' THEN p.amount ELSE 0 END)::numeric as weekly_revenue,
//           SUM(CASE WHEN DATE(p.payment_date) = CURRENT_DATE THEN p.amount ELSE 0 END)::numeric as daily_revenue,
//           AVG(p.amount)::numeric as avg_transaction,
//           MAX(p.amount)::numeric as max_transaction,
//           MIN(p.amount)::numeric as min_transaction,
//           COUNT(r.id)::int as total_receipts
//         FROM payments p
//         LEFT JOIN receipts r ON p.id = r.payment_id
//       `),

//       // Payment trends over time
//       client.query(`
//         SELECT ${intervalGroup} as date,
//                SUM(amount)::numeric as amount,
//                COUNT(*)::int as transactions,
//                AVG(amount)::numeric as avg_amount
//         FROM payments 
//         ${paymentDateFilter}
//         GROUP BY ${intervalGroup}
//         ORDER BY date ASC
//       `),

//       // Payment type breakdown
//       client.query(`
//         SELECT 
//           CASE 
//             WHEN project_id IS NOT NULL THEN 'Project Payments'
//             WHEN order_id IS NOT NULL THEN 'Order Payments'
//             WHEN temp_project_id IS NOT NULL THEN 'Temp Project Payments'
//             ELSE 'Other Payments'
//           END as label,
//           SUM(amount)::numeric as amount,
//           COUNT(*)::int as count,
//           AVG(amount)::numeric as avg_amount
//         FROM payments
//         GROUP BY 
//           CASE 
//             WHEN project_id IS NOT NULL THEN 'Project Payments'
//             WHEN order_id IS NOT NULL THEN 'Order Payments'
//             WHEN temp_project_id IS NOT NULL THEN 'Temp Project Payments'
//             ELSE 'Other Payments'
//           END
//         ORDER BY amount DESC
//       `),

//       // Top payers
//       client.query(`
//         SELECT u.first_name, u.last_name, u.email,
//                COUNT(p.id)::int as payment_count,
//                SUM(p.amount)::numeric as total_paid,
//                AVG(p.amount)::numeric as avg_payment
//         FROM payments p
//         JOIN users u ON p.payer_id = u.id
//         GROUP BY u.id, u.first_name, u.last_name, u.email
//         ORDER BY total_paid DESC
//         LIMIT 10
//       `),

//       // Top receivers
//       client.query(`
//         SELECT u.first_name, u.last_name, u.email,
//                COUNT(p.id)::int as payment_count,
//                SUM(p.amount)::numeric as total_received,
//                AVG(p.amount)::numeric as avg_received
//         FROM payments p
//         JOIN users u ON p.receiver_id = u.id
//         GROUP BY u.id, u.first_name, u.last_name, u.email
//         ORDER BY total_received DESC
//         LIMIT 10
//       `),

//       // Monthly revenue breakdown
//       client.query(`
//         SELECT 
//           DATE_TRUNC('month', payment_date) as month,
//           SUM(amount)::numeric as revenue,
//           COUNT(*)::int as transactions,
//           AVG(amount)::numeric as avg_transaction
//         FROM payments
//         WHERE payment_date >= CURRENT_DATE - INTERVAL '12 months'
//         GROUP BY DATE_TRUNC('month', payment_date)
//         ORDER BY month DESC
//         LIMIT 12
//       `),

//       // Recent transactions
//       client.query(`
//         SELECT p.id, p.amount, p.payment_date,
//                payer.first_name as payer_first_name, payer.last_name as payer_last_name,
//                receiver.first_name as receiver_first_name, receiver.last_name as receiver_last_name,
//                p.project_id, p.order_id, p.temp_project_id,
//                r.receipt_url
//         FROM payments p
//         LEFT JOIN users payer ON p.payer_id = payer.id
//         LEFT JOIN users receiver ON p.receiver_id = receiver.id
//         LEFT JOIN receipts r ON p.id = r.payment_id
//         ORDER BY p.payment_date DESC
//         LIMIT 15
//       `),

//       // Receipt statistics
//       client.query(`
//         SELECT 
//           COUNT(r.id)::int as total_receipts,
//           COUNT(CASE WHEN r.receipt_url IS NOT NULL THEN 1 END)::int as receipts_with_url,
//           COUNT(DISTINCT p.id)::int as payments_with_receipts,
//           (SELECT COUNT(*) FROM payments)::int as total_payments
//         FROM receipts r
//         LEFT JOIN payments p ON r.payment_id = p.id
//       `),
//     ]);

//     const [
//       paymentOverview,
//       paymentTrends,
//       paymentTypeBreakdown,
//       topPayers,
//       topReceivers,
//       monthlyRevenue,
//       recentTransactions,
//       receiptStats,
//     ] = queries.map((q) => q.rows);

//     const overview = paymentOverview[0] || {};
//     const receipts = receiptStats[0] || {};

//     // Process payment trends
//     const processedPaymentTrends = paymentTrends.map((row) => ({
//       date: row.date instanceof Date ? row.date.toISOString() : row.date,
//       amount: parseFloat(row.amount) || 0,
//       transactions: parseInt(row.transactions) || 0,
//       avg_amount: parseFloat(row.avg_amount) || 0,
//     }));

//     // Add colors to payment types
//     const paymentStats = paymentTypeBreakdown.map((stat, index) => ({
//       ...stat,
//       color: ["#10b981", "#8b5cf6", "#3b82f6", "#f59e0b"][index] || "#6b7280",
//     }));

//     return {
//       overview: {
//         totalRevenue: parseFloat(overview.total_revenue) || 0,
//         totalTransactions: parseInt(overview.total_transactions) || 0,
//         projectRevenue: parseFloat(overview.project_revenue) || 0,
//         orderRevenue: parseFloat(overview.order_revenue) || 0,
//         tempProjectRevenue: parseFloat(overview.temp_project_revenue) || 0,
//         monthlyRevenue: parseFloat(overview.monthly_revenue) || 0,
//         weeklyRevenue: parseFloat(overview.weekly_revenue) || 0,
//         dailyRevenue: parseFloat(overview.daily_revenue) || 0,
//         avgTransaction: parseFloat(overview.avg_transaction) || 0,
//         maxTransaction: parseFloat(overview.max_transaction) || 0,
//         minTransaction: parseFloat(overview.min_transaction) || 0,
//         totalReceipts: parseInt(overview.total_receipts) || 0,
//       },
//       receiptStats: {
//         totalReceipts: parseInt(receipts.total_receipts) || 0,
//         receiptsWithUrl: parseInt(receipts.receipts_with_url) || 0,
//         paymentsWithReceipts: parseInt(receipts.payments_with_receipts) || 0,
//         totalPayments: parseInt(receipts.total_payments) || 0,
//         receiptCoverage: parseInt(receipts.total_payments) > 0 ? 
//           Math.round((parseInt(receipts.payments_with_receipts) / parseInt(receipts.total_payments)) * 100) : 0,
//       },
//       paymentTrends: processedPaymentTrends,
//       paymentStats,
//       topPayers,
//       topReceivers,
//       monthlyRevenue: monthlyRevenue.map(m => ({
//         ...m,
//         revenue: parseFloat(m.revenue) || 0,
//         avg_transaction: parseFloat(m.avg_transaction) || 0,
//       })),
//       recentTransactions,
//     };
//   } catch (error) {
//     console.error("Financial analytics error:", error);
//     return {
//       overview: {},
//       receiptStats: {},
//       paymentTrends: [],
//       paymentStats: [],
//       topPayers: [],
//       topReceivers: [],
//       monthlyRevenue: [],
//       recentTransactions: [],
//     };
//   } finally {
//     client.release();
//   }
// };