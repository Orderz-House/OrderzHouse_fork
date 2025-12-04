import cron from "node-cron";
import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";
import { autoExpireOldProjects } from "../controller/projectsManagment/projects.js";

/**
 * Check for projects that will expire in 1 hour and send reminder notifications
 */
export const checkProjectExpirations = async () => {
  try {
    console.log("🔍 Checking for projects about to expire...");
    
    // Calculate the time window: projects created between 2 and 2.5 hours ago
    // This gives us a 30-minute window to catch projects that will expire in approximately 1 hour
    const { rows: expiringProjects } = await pool.query(`
      SELECT 
        p.id AS project_id,
        p.title AS project_title,
        p.user_id AS client_id
      FROM projects p
      WHERE 
        p.status = 'bidding'
        AND p.created_at <= NOW() - INTERVAL '2 hours'
        AND p.created_at > NOW() - INTERVAL '2.5 hours'
    `);

    console.log(`Found ${expiringProjects.length} projects about to expire`);

    // Send notifications for each project about to expire
    for (const project of expiringProjects) {
      try {
        await NotificationCreators.projectExpirationReminder(
          project.project_id,
          project.project_title,
          project.client_id
        );
        console.log(`🔔 Sent expiration reminder for project: ${project.project_title}`);
      } catch (error) {
        console.error(`❌ Failed to send expiration reminder for project ${project.project_title}:`, error);
      }
    }
  } catch (error) {
    console.error("Error checking project expirations:", error);
  }
};

/**
 * Register the cron job to run every 30 minutes
 */
export const registerProjectExpirationCronJob = () => {
  // Run every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    console.log("⏰ Running project expiration reminder job...");
    await checkProjectExpirations();
    // Also run the auto-expiration of old projects
    await autoExpireOldProjects();
  });
};