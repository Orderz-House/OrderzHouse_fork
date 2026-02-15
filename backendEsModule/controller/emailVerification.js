import pool from "../models/db.js";

// ✅ OTP Feature Flag - OTP temporarily disabled via OTP_ENABLED flag
const OTP_ENABLED = process.env.OTP_ENABLED === "true";

export const verifyEmailOtp = async (req, res) => {
  // ✅ OTP temporarily disabled via OTP_ENABLED flag
  if (!OTP_ENABLED) {
    return res.status(200).json({
      success: true,
      message: "OTP is disabled",
    });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, email_otp, email_otp_expires FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = rows[0];
    if (user.email_otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > new Date(user.email_otp_expires)) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    await pool.query(
      "UPDATE users SET email_verified = TRUE, email_otp = NULL, email_otp_expires = NULL WHERE id = $1",
      [user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("Verify Email OTP Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
