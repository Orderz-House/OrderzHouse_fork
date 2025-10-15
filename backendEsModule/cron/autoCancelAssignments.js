import cron from "node-cron";
import pool from "../models/db.js";

// Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    const { rows: activeAssignments } = await pool.query(
      `SELECT pa.id AS assignment_id, pa.project_id, pa.freelancer_id, pa.assignment_type
       FROM project_assignments pa
       JOIN projects p ON pa.project_id = p.id
       LEFT JOIN subscriptions s ON pa.freelancer_id = s.freelancer_id
       WHERE pa.status = 'active'
         AND (pa.deadline < NOW()
              OR s.end_date < NOW()
              OR s.status != 'active')`
    );

    if (!activeAssignments.length) return;

    console.log(`Auto-cancelling ${activeAssignments.length} assignments.`);

    for (const assignment of activeAssignments) {
      const { assignment_id, project_id, assignment_type } = assignment;

      await pool.query(
        `UPDATE project_assignments
         SET status = 'cancelled'
         WHERE id = $1`,
        [assignment_id]
      );

      if (assignment_type === "solo") {
        await pool.query(
          `UPDATE projects
           SET status = 'cancelled'
           WHERE id = $1 AND status = 'active'`,
          [project_id]
        );
      }
    }

    console.log("Auto-cancellation completed.");
  } catch (err) {
    console.error("Error during auto-cancellation:", err);
  }
});
