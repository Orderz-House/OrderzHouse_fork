import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LogCreators, ACTION_TYPES } from "../services/loggingService.js";
import { NotificationCreators } from "../services/notificationService.js";
import nodemailer from "nodemailer";
import pool from "../models/db.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ------------------ EMAIL TRANSPORTER ------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ------------------ OTP GENERATOR ------------------
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ======================================================
// REGISTER FUNCTION
// ======================================================
 const register = async (req, res) => {
  const {
    role_id,
    first_name,
    last_name,
    email,
    password,
    phone_number,
    country,
    username,
    categories,
  } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

  if (
    !role_id ||
    !first_name ||
    !last_name ||
    !email ||
    !password ||
    !phone_number ||
    !country ||
    !username
  ) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must include at least 8 characters, 1 uppercase, 1 lowercase, and 1 number",
    });
  }

  try {
    const emailLower = email.toLowerCase();

    // ✅ Step 1: Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [emailLower, username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email or username already exists" });
    }

    // ✅ Step 2: Hash password & insert user
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users 
        (role_id, first_name, last_name, email, password, phone_number, country, username, email_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,FALSE)
       RETURNING *`,
      [role_id, first_name, last_name, emailLower, hashedPassword, phone_number, country, username]
    );
    const user = rows[0];

    // ✅ Step 3: Generate & store OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await pool.query("UPDATE users SET email_otp = $1, email_otp_expires = $2 WHERE id = $3", [
      otp,
      otpExpiry,
      user.id,
    ]);

    // ✅ Step 4: Send OTP via email
    const mailOptions = {
      from: `"OrderzHouse" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "Verify your email address",
      html: `
        <h2>Hello ${user.first_name},</h2>
        <p>Use the following One-Time Password (OTP) to verify your email:</p>
        <h1 style="color:#007bff; font-size: 28px;">${otp}</h1>
        <p>This code expires in <b>5 minutes</b>.</p>
        <br/>
        <p>Thanks,<br/>OrderzHouse Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // ✅ Step 5: Respond success
    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent to email for verification ✅",
      user_id: user.id,
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ======================================================
// ✅ VERIFY EMAIL OTP FUNCTION
// ======================================================
 const verifyEmailOtp = async (req, res) => {
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
      message: "Email verified successfully ✅",
    });
  } catch (err) {
    console.error("Verify Email OTP Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// ===================== LOGIN + OTP =====================
const login = async (req, res) => {
  try {
    const { email, password, otpMethod = "email" } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email.toLowerCase()]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.email_verified) {
      return res.status(403).json({
    success: false,
    message: "Please verify your email before logging in",
    });
    }
    const validPassword = await bcrypt.compare(password, user.password);

    if (validPassword) {
      
      if (user.failed_login_attempts === 0) {
        await pool.query("UPDATE users SET otp_code=NULL, otp_expires=NULL WHERE id=$1", [user.id]);
        
        const tokenPayload = {
          userId: user.id,
          role: user.role_id,
          is_verified: user.is_verified,
          username: user.username,
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });
        
        return res.status(200).json({
          success: true,
          message: "Login successful",
          token: token,
          userInfo: {
            id: user.id,
            username: user.username,
            email: user.email,
            role_id: user.role_id
          }
        });
      }
      
      
      await pool.query("UPDATE users SET failed_login_attempts=0 WHERE id=$1", [user.id]);

    } else {
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      await pool.query("UPDATE users SET failed_login_attempts=$1 WHERE id=$2", [newAttempts, user.id]);

      if (newAttempts < 3) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    }
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); 

    await pool.query("UPDATE users SET otp_code=$1, otp_expires=$2 WHERE id=$3", [
      otp,
      expiresAt,
      user.id,
    ]);

    const destination = otpMethod === "email" ? user.email : user.phone_number;
    await deliverOtp(destination, otpMethod, otp); 

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      user_id: user.id,
      username: user.username, 
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// ===================== VERIFY OTP =====================
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email.toLowerCase()]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp_code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await pool.query("UPDATE users SET otp_code=NULL, otp_expires=NULL, failed_login_attempts=0 WHERE id=$1", [user.id]);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===================== SEND OTP (Manual API) =====================
export const sendOtpController = async (req, res) => {
  try {
    const { email, method = "email" } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = generateOtp();
    const expires = new Date(Date.now() + 2 * 60 * 1000);
    await pool.query("UPDATE users SET otp_code = $1, otp_expires = $2 WHERE email = $3", [
      otp,
      expires,
      email.toLowerCase(),
    ]);

    await deliverOtp(email, method, otp);
    return res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: "Login error", error: err.message });
  }
};

// ==================== USER MANAGEMENT FUNCTIONS ====================

const viewUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE is_deleted = FALSE");
    return res.status(200).json({ success: true, users: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching users", error: err.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await pool.query(
      "UPDATE users SET is_deleted = TRUE WHERE id = $1 RETURNING *",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error deleting user", error: err.message });
  }
};

export const editUserSelf = async (req, res) => {
  const userId = req.token.userId;
  const { first_name, last_name, username, phone_number, country, profile_pic_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         username = COALESCE($3, username),
         phone_number = COALESCE($4, phone_number),
         country = COALESCE($5, country),
         profile_pic_url = COALESCE($6, profile_pic_url),
         updated_at = NOW()
       WHERE id = $7 AND is_deleted = FALSE
       RETURNING id, first_name, last_name, username, email, phone_number, country, profile_pic_url`,
      [first_name, last_name, username, phone_number, country, profile_pic_url, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("editUserSelf Error:", err.message);
    return res.status(500).json({ success: false, message: "Error updating profile" });
  }
};


const getUserById = async (req, res) => {
  const { userId } = req.token;

  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// ==================== PORTFOLIO FUNCTIONS ====================

const getPortfolioByUserId = async (req, res) => {
  const { userId } = req.token;

  if (!userId) {
    return res.status(400).json({ success: false, message: "freelancer_id required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM portfolios WHERE freelancer_id = $1 ORDER BY added_at DESC",
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: `Get All portfolio For ${userId}`,
      portfolios: result.rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "server error", error: err.message });
  }
};

const createPortfolio = async (req, res) => {
  const { freelancer_id, title, description, skills, hourly_rate, work_url } = req.body;

  if (!freelancer_id || !title) {
    return res.status(400).json({ success: false, message: "freelancer_id and title are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO portfolios (freelancer_id, title, description, skills, hourly_rate, work_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [freelancer_id, title, description, skills, hourly_rate, work_url]
    );

    return res.status(201).json({
      success: true,
      message: "Portfolio created successfully",
      portfolio: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error creating portfolio", error: err.message });
  }
};

const editPortfolioFreelancer = async (req, res) => {
  const { portfolioId } = req.params;
  const { title, description, skills, hourly_rate, work_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE portfolios
       SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         skills = COALESCE($3, skills),
         hourly_rate = COALESCE($4, hourly_rate),
         work_url = COALESCE($5, work_url),
         edit_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, description, skills, hourly_rate, work_url, portfolioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Portfolio not found for this freelancer" });
    }

    return res.status(200).json({
      success: true,
      message: "Portfolio updated successfully",
      portfolio: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating profile", error: err.message });
  }
};

const deletePortfolioFreelancer = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { freelancerId, portfolioId } = req.body;

    if (parseInt(freelancerId) !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own portfolio items.",
      });
    }

    const result = await pool.query(
      "DELETE FROM portfolios WHERE freelancer_id = $1 AND id = $2 RETURNING *",
      [freelancerId, portfolioId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Portfolio not found." });
    }

    return res.status(200).json({ success: true, message: "Deleted Portfolio Successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ==================== FREELANCER FUNCTIONS ====================

const getAllFreelancers = async (req, res) => {
  const filterValue = (req.body.filter || "").toLowerCase();
  const validFilters = ["active", "deactivated", "all"];

  if (!validFilters.includes(filterValue)) {
    return res.status(400).json({
      success: false,
      message: "Invalid filter value. Must be 'active', 'deactivated', or 'all'.",
    });
  }

  let whereCondition = "users.role_id = 3";
  if (filterValue === "active") whereCondition += " AND users.is_deleted = FALSE";
  else if (filterValue === "deactivated") whereCondition += " AND users.is_deleted = TRUE";

  const sqlQuery = `
    SELECT
      users.id,
      users.first_name,
      users.last_name,
      users.email,
      COUNT(order_assignments.id) AS orders_count,
      COALESCE(
        json_agg(json_build_object('ip_address', ip_adress.ip_address)) FILTER (WHERE ip_adress.ip_address IS NOT NULL),
        '[]'
      ) AS ip_addresses
    FROM users
    LEFT JOIN ip_adress ON users.id = ip_adress.user_id
    LEFT JOIN order_assignments ON users.id = order_assignments.freelancer_id
    WHERE ${whereCondition}
    GROUP BY users.id, users.first_name, users.last_name, users.email;
  `;

  try {
    const result = await pool.query(sqlQuery);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No freelancers found" });
    }

    return res.status(200).json({ success: true, freelancers: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching freelancers", error: err.message });
  }
};

const deleteFreelancerById = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      "UPDATE users SET is_deleted = NOT is_deleted WHERE id = $1 AND role_id = 3 RETURNING *",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Freelancer not found" });
    }

    const message = result.rows[0].is_deleted
      ? "Freelancer deactivated successfully"
      : "Freelancer activated successfully";

    return res.status(200).json({ success: true, message, freelancer: result.rows[0] });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error toggling freelancer deletion status",
      error: err.message,
    });
  }
};

const listOnlineUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE is_online = TRUE");

    if (result.rows.length === 0) {
      return res.status(200).json({ success: true, message: "No one is active" });
    }

    return res.status(200).json({ success: true, message: "Active Users found", users: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

const rateFreelancer = async (req, res) => {
  const reviewerId = req.token.userId;
  const reviewerName = req.token.username;
  const { userId, rating, projectId } = req.body;

  if (!userId || !rating) {
    return res.status(400).json({ success: false, message: "userId and rating are required" });
  }

  try {
    const freelancerResult = await pool.query(
      "SELECT role_id, rating_sum, rating_count FROM users WHERE id = $1 AND is_deleted = FALSE",
      [userId]
    );

    if (freelancerResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Freelancer not found" });
    }

    const freelancer = freelancerResult.rows[0];

    if (freelancer.role_id !== 3) {
      return res.status(403).json({ success: false, message: "Target user is not a freelancer" });
    }

    const newSum = Number(freelancer.rating_sum) + Number(rating);
    const newCount = Number(freelancer.rating_count) + 1;
    const newAvg = (newSum / newCount).toFixed(2);

    const updateResult = await pool.query(
      `UPDATE users
       SET rating_sum = $1, rating_count = $2, rating = $3
       WHERE id = $4
       RETURNING id, first_name, last_name, rating, rating_count`,
      [newSum, newCount, newAvg, userId]
    );

    try {
      await NotificationCreators.reviewSubmitted(null, userId, reviewerName || "A client");
    } catch (notificationError) {
      console.error(`Failed to create rating notification for freelancer ${userId}:`, notificationError);
    }

    return res.status(200).json({
      success: true,
      message: "Freelancer rated successfully",
      freelancer: updateResult.rows[0],
    });
  } catch (err) {
    console.error("Rating error:", err.message);
    return res.status(500).json({ success: false, message: "Server error during rating", error: err.message });
  }
};

const getTopFreelancers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, first_name, last_name, country, username, rating, profile_pic_url
      FROM users
      WHERE role_id = 3 AND is_deleted = FALSE
      ORDER BY rating DESC
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No freelancers found" });
    }

    return res.status(200).json({ success: true, freelancers: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching top freelancers", error: err.message });
  }
};

const getFreelance = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE role_id = 3 AND is_deleted = FALSE"
    );
    return res.status(200).json({ success: true, freelancers: rows });
  } catch (error) {
    console.error("Error fetching freelancers:", error.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getFreelanceById = async (req, res) => {
  try {
    const freelancerId = req.params.id;

    if (!freelancerId || isNaN(freelancerId)) {
      return res.status(400).json({ success: false, message: "Invalid freelancer ID" });
    }

    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, username, country, profile_pic_url, rating, rating_count, rating_sum
       FROM users
       WHERE id = $1 AND role_id = 3 AND is_deleted = FALSE`,
      [freelancerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Freelancer not found" });
    }

    return res.status(200).json({ success: true, freelancer: rows[0] });
  } catch (error) {
    console.error("Error fetching freelancer:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPortfolioByfreelance = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: "freelancer_id required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM portfolios WHERE freelancer_id = $1 ORDER BY added_at DESC",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No portfolio found" });
    }

    return res.status(200).json({
      success: true,
      message: `Get All portfolio For ${userId}`,
      portfolios: result.rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "server error", error: err.message });
  }
};

// ==================== VERIFICATION FUNCTIONS ====================

const checkVerificationStatus = async (req, res) => {
  const userId = req.token.userId;

  try {
    const userResult = await pool.query(
      "SELECT first_name, last_name, bio, profile_pic_url, is_verified FROM users WHERE id = $1 AND is_deleted = FALSE",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userResult.rows[0];

    const portfolioResult = await pool.query(
      "SELECT COUNT(*) as count FROM portfolios WHERE freelancer_id = $1",
      [userId]
    );

    const portfolioCount = parseInt(portfolioResult.rows[0].count, 10);

    const missingFields = [];
    if (!user.first_name) missingFields.push("First Name");
    if (!user.last_name) missingFields.push("Last Name");
    if (!user.bio) missingFields.push("Bio");
    if (!user.profile_pic_url) missingFields.push("Profile Picture");
    if (portfolioCount === 0) missingFields.push("Portfolio Item");

    const isProfileComplete = missingFields.length === 0;

    return res.status(200).json({
      success: true,
      isVerified: user.is_verified,
      isProfileComplete,
      missingFields,
      portfolioCount,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

const updateVerificationStatus = async (req, res) => {
  const userId = req.token.userId;

  try {
    const userResult = await pool.query(
      "SELECT first_name, last_name, bio, profile_pic_url FROM users WHERE id = $1 AND is_deleted = FALSE",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userResult.rows[0];

    const portfolioResult = await pool.query(
      "SELECT COUNT(*) as count FROM portfolios WHERE freelancer_id = $1",
      [userId]
    );

    const hasPortfolio = parseInt(portfolioResult.rows[0].count, 10) > 0;
    const isProfileComplete = user.first_name && user.last_name && user.bio && user.profile_pic_url;

    if (isProfileComplete && hasPortfolio) {
      const updateResult = await pool.query(
        "UPDATE users SET is_verified = TRUE WHERE id = $1 RETURNING id, is_verified",
        [userId]
      );

      try {
        await NotificationCreators.userVerified(userId, user.first_name);
      } catch (notificationError) {
        console.error(`Failed to create self-verification notification for user ${userId}:`, notificationError);
      }

      return res.status(200).json({
        success: true,
        message: "Profile verified successfully",
        isVerified: true,
        user: updateResult.rows[0],
      });
    } else {
      const missingFields = [];
      if (!user.first_name) missingFields.push("first_name");
      if (!user.last_name) missingFields.push("last_name");
      if (!user.bio) missingFields.push("bio");
      if (!user.profile_pic_url) missingFields.push("profile_image");
      if (!hasPortfolio) missingFields.push("portfolio_item");

      return res.status(400).json({
        success: false,
        message: "Profile is not complete.",
        missingFields,
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

const verifyFreelancerByAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE users
       SET is_verified = TRUE, reason_for_disruption = NULL
       WHERE id = $1 AND role_id = 3 AND is_deleted = FALSE
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found or not eligible for verification.",
      });
    }

    const freelancer = result.rows[0];

    try {
      await NotificationCreators.userVerified(freelancer.id, freelancer.first_name);
    } catch (notificationError) {
      console.error(`Failed to create admin verification notification for freelancer ${freelancer.id}:`, notificationError);
    }

    await LogCreators.userManagement(req.token.userId, ACTION_TYPES.ADMIN_VERIFY_USER, true, {
      targetUserId: freelancer.id,
    });

    return res.status(200).json({
      success: true,
      message: "Freelancer verified successfully.",
      freelancer,
    });
  } catch (err) {
    console.error("Error verifying freelancer:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying freelancer",
      error: err.message,
    });
  }
};

const rejectFreelancerByAdmin = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ success: false, message: "A reason for rejection is required." });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET is_verified = FALSE, reason_for_disruption = $1
       WHERE id = $2 AND role_id = 3 AND is_deleted = FALSE
       RETURNING *`,
      [reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Freelancer not found or not eligible." });
    }

    const freelancer = result.rows[0];

    try {
      await NotificationCreators.userVerificationRejected(freelancer.id, reason);
    } catch (notificationError) {
      console.error(`Failed to create rejection notification for freelancer ${freelancer.id}:`, notificationError);
    }

    await LogCreators.userManagement(req.token.userId, ACTION_TYPES.ADMIN_REJECT_USER, true, {
      targetUserId: freelancer.id,
      reason,
    });

    return res.status(200).json({
      success: true,
      message: "Freelancer rejected successfully.",
      freelancer,
    });
  } catch (err) {
    console.error("Error rejecting freelancer:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error while rejecting freelancer",
      error: err.message,
    });
  }
};

// ==================== PASSWORD & ACCOUNT MANAGEMENT ====================

const verifyPassword = async (req, res) => {
  const { password } = req.body;
  const userId = req.token.userId;

  try {
    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1 AND is_deleted = FALSE",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, userResult.rows[0].password);

    return res.json({
      success: match,
      message: match ? "Password verified" : "Incorrect password",
    });
  } catch (error) {
    console.error("Verify Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error during password verification" });
  }
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.token.userId;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Current and new passwords are required" });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: "New password does not meet complexity requirements.",
    });
  }

  try {
    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1 AND is_deleted = FALSE",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(currentPassword, userResult.rows[0].password);

    if (!match) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);

    await LogCreators.userAuth(userId, ACTION_TYPES.PASSWORD_CHANGE, true, { ip: req.ip });

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error during password update" });
  }
};

const deactivateAccount = async (req, res) => {
  const userId = req.token.userId;

  try {
    const userCheck = await pool.query("SELECT id, is_deleted FROM users WHERE id = $1", [userId]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (userCheck.rows[0].is_deleted) {
      return res.status(400).json({ success: false, message: "Account is already deactivated" });
    }

    await pool.query(
      `UPDATE users
       SET is_deleted = TRUE, deactivated_at = NOW(), reason_for_disruption = 'Deactivated by user'
       WHERE id = $1`,
      [userId]
    );

    await LogCreators.userAuth(userId, ACTION_TYPES.ACCOUNT_DEACTIVATED, true, {
      ip: req.ip,
      reason: "user_initiated",
    });

    return res.json({
      success: true,
      message: "Account deactivated successfully. You have 30 days to reactivate by logging in.",
    });
  } catch (error) {
    console.error("Deactivate Account Error:", error);
    return res.status(500).json({ success: false, message: "Server error during account deactivation" });
  }
};

// ==================== EXPORTS ====================

export {
  getUserById,
  register,
  login,
  viewUsers,
  deleteUser,
  getPortfolioByUserId,
  createPortfolio,
  editPortfolioFreelancer,
  deletePortfolioFreelancer,
  getAllFreelancers,
  deleteFreelancerById,
  listOnlineUsers,
  rateFreelancer,
  getTopFreelancers,
  getFreelance,
  getFreelanceById,
  getPortfolioByfreelance,
  checkVerificationStatus,
  updateVerificationStatus,
  verifyFreelancerByAdmin,
  rejectFreelancerByAdmin,
  verifyPassword,
  updatePassword,
  deactivateAccount,
  verifyEmailOtp,
};
