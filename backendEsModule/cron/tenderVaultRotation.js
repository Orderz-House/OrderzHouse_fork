/**
 * Tender Vault Rotation System - Cron Jobs
 * - Daily rotation (stored tenders → active with temp projects)
 * - Hourly expiration of active tenders
 * - Every 5 min: cycle-only rotation (expire cycles, refill 8–12 from published tenders, no projects table)
 */

import cron from "node-cron";
import {
  performDailyRotation,
  checkAndExpireActiveTenders,
} from "../services/tenderVaultRotation.js";
import { runTenderRotation } from "../services/tenderRotationEngine.js";

export const registerTenderVaultRotationJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 [CRON] Starting daily tender vault rotation...");
    try {
      const result = await performDailyRotation();
      console.log(`✅ [CRON] Daily rotation completed:`, result);
    } catch (error) {
      console.error("❌ [CRON] Daily rotation failed:", error);
    }
  });

  cron.schedule("0 * * * *", async () => {
    console.log("⏰ [CRON] Checking for expired active tenders...");
    try {
      const result = await checkAndExpireActiveTenders();
      console.log(`✅ [CRON] Expiration check completed:`, result);
    } catch (error) {
      console.error("❌ [CRON] Expiration check failed:", error);
    }
  });

  // Cycle-only rotation: every 5 min — expire cycles, keep 8–12 active from published tenders
  cron.schedule("*/5 * * * *", async () => {
    try {
      const result = await runTenderRotation();
      if (result.created > 0 || result.expired > 0) {
        console.log(`✅ [CRON] Tender rotation:`, result);
      }
    } catch (error) {
      console.error("❌ [CRON] Tender rotation failed:", error);
    }
  });

  console.log("✅ Tender Vault Rotation cron jobs registered (including cycle-only rotation)");
};
