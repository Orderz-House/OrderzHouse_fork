import pool from "../models/db.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

/**
 * @route   POST /auth/2fa/generate
 * @desc    
 * @access  
 */
export const generateTwoFactorSecret = async (req, res) => {
  try {
    const userId = req.token.userId; 
    
    const userResult = await pool.query(
      "SELECT email FROM users WHERE id = $1 AND is_deleted = FALSE",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const userEmail = userResult.rows[0].email;

    const secret = speakeasy.generateSecret({
      name: `OrderzHouse (${userEmail})`,
    });

    await pool.query(
      `UPDATE users SET two_factor_secret = $1, is_two_factor_enabled = FALSE WHERE id = $2`,
      [secret.base32, userId]
    );

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        console.error("QR Code Generation Error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Could not generate QR code." 
        });
      }
      res.status(200).json({
        success: true,
        message: "Scan this QR code with your authenticator app.",
        qrCodeUrl: data_url,
        secret: secret.base32, 
      });
    });
  } catch (error) {
    console.error("2FA Generate Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while generating 2FA secret." 
    });
  }
};

/**
 * @route 
 * @desc    
 * @access  
 */
export const verifyTwoFactorToken = async (req, res) => {
  try {
    const userId = req.token.userId; 
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ 
          success: false, 
          message: "Verification token is required." 
        });
    }

    const userResult = await pool.query(
      `SELECT two_factor_secret FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rowCount === 0 || !userResult.rows[0].two_factor_secret) {
      return res.status(400).json({ 
        success: false, 
        message: "2FA secret not found. Please generate one first." 
      });
    }

    const secret = userResult.rows[0].two_factor_secret;

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 
    });

    if (verified) {
      // If successful, permanently enable 2FA for the user
      await pool.query(
        `UPDATE users SET is_two_factor_enabled = TRUE WHERE id = $1`,
        [userId]
      );
      
      res.status(200).json({ 
        success: true, 
        message: "2FA has been enabled successfully!" 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: "Invalid 2FA token. Please try again." 
      });
    }
  } catch (error) {
    console.error("2FA Verify Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while verifying 2FA token." 
    });
  }
};

/**
 * @route   POST /auth/2fa/disable
 * @desc    Disable 2FA for the user.
 * @access  Private
 */
export const disableTwoFactor = async (req, res) => {
    try {
        const userId = req.token.userId; 
      
        await pool.query(
            `UPDATE users SET is_two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = $1`,
            [userId]
        );

        res.status(200).json({ 
          success: true, 
          message: "2FA has been disabled." 
        });

    } catch (error) {
        console.error("2FA Disable Error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Server error while disabling 2FA." 
        });
    }
};