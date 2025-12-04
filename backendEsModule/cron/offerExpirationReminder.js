import cron from "node-cron";
import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";

/**
 * Check for offers that will expire in 2 hours and send reminder notifications
 */
export const checkOfferExpirations = async () => {
  try {
    console.log("🔍 Checking for offers about to expire...");
    
    // Calculate the time window: offers submitted between 22 and 22.5 hours ago
    // This gives us a 30-minute window to catch offers that will expire in approximately 2 hours
    const { rows: expiringOffers } = await pool.query(`
      SELECT 
        o.project_id,
        p.user_id AS client_id,
        p.title AS project_title,
        COUNT(o.id) AS offer_count
      FROM offers o
      JOIN projects p ON o.project_id = p.id
      WHERE 
        o.offer_status = 'pending'
        AND o.submitted_at <= NOW() - INTERVAL '22 hours'
        AND o.submitted_at > NOW() - INTERVAL '22.5 hours'
        AND p.status = 'bidding'
      GROUP BY 
        o.project_id,
        p.user_id,
        p.title
    `);

    console.log(`Found ${expiringOffers.length} projects with offers about to expire`);

    // Send notifications for each project with expiring offers
    for (const offer of expiringOffers) {
      try {
        await NotificationCreators.offerExpirationReminder(
          offer.client_id,
          offer.project_title,
          parseInt(offer.offer_count)
        );
        console.log(`🔔 Sent expiration reminder for project: ${offer.project_title}`);
      } catch (error) {
        console.error(`❌ Failed to send expiration reminder for project ${offer.project_title}:`, error);
      }
    }
  } catch (error) {
    console.error("Error checking offer expirations:", error);
  }
};

/**
 * Register the cron job to run every 30 minutes
 */
export const registerOfferExpirationCronJob = () => {
  // Run every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    console.log("⏰ Running offer expiration reminder job...");
    await checkOfferExpirations();
  });
};