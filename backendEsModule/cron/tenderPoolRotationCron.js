/**
 * Tender Pool Rotation Cron — every 5 minutes.
 * runRotation() expires visible tenders and refills 40–70 if visible count is below 40.
 * Visibility window is 12h via rotation_visible_until.
 */

import cron from "node-cron";
import { runRotation } from "../services/tenderPoolRotation.js";

export function registerTenderPoolRotationCron() {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const result = await runRotation();
      if (result.activated > 0 || result.expired > 0) {
        console.log(`[TenderPoolRotation] expired=${result.expired} activated=${result.activated} visible=${result.visible}`);
      }
    } catch (err) {
      console.error("[TenderPoolRotation] Error:", err);
    }
  });
  console.log("✅ Tender Pool Rotation cron registered (every 5 min)");
}
