import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import speakeasy from "speakeasy";

import {
  LogCreators,
  ACTION_TYPES,
} from "../services/loggingService.js";
import { NotificationCreators } from "../services/notificationService.js";
import pool from "../models/db.js";

// ==================== AUTHENTICATION FUNCTIONS ====================

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

  if (!role_id || !first_name || !last_name || !email || !password || !phone_number || !country || !username) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters long, include 1 uppercase letter, 1 lowercase letter, and 1 number" });
  }
  if (role_id === 3 && (!categories || !Array.isArray(categories) || categories.length === 0)) {
    return res.status(400).json({ success: false, message: "Freelancer must have at least one category" });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const Email = email.toLowerCase();

    const existingUser = await pool.query("SELECT id FROM Users WHERE email=$1 OR username=$2", [Email, username]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email or username already exists" });
    }

    const { rows: userRows } = await pool.query(
      `INSERT INTO Users (role_id, first_name, last_name, email, password, phone_number, country, username) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [role_id, first_name, last_name, Email, hashedPassword, phone_number, country, username]
    );
    const user = userRows[0];

    if (role_id === 3 && categories.length > 0) {
      const insertValues = categories.map((_, idx) => `($1, $${idx + 2})`).join(", ");
      await pool.query(`INSERT INTO freelancer_categories (freelancer_id, category_id) VALUES ${insertValues}`, [user.id, ...categories]);
    }

    await LogCreators.userAuth(user.id, ACTION_TYPES.USER_REGISTER, true, { role_id, country });

    // ✨ NOTIFICATION INTEGRATION: Call the notification creator for user registration.
    try {
      await NotificationCreators.userRegistered(user.id, user.first_name);
    } catch (notificationError) {
      console.error("Error creating welcome notification:", notificationError);
    }

    res.status(201).json({ success: true, message: "User registered successfully", user });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password, twoFactorToken } = req.body;
  const query = "SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE";
  const data = [email.toLowerCase()];

  function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0] : req.connection.remoteAddress;
    return ip === "::1" ? "127.0.0.1" : ip;
  }

  try {
    const result = await pool.query(query, data);
    if (result.rows.length === 0) return res.status(403).json({ success: false, message: "Invalid credentials" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(403).json({ success: false, message: "Invalid credentials" });

    if (user.is_two_factor_enabled) {
      if (!twoFactorToken) return res.status(200).json({ success: true, twoFactorRequired: true, message: "2FA token required" });
      const verified = speakeasy.totp.verify({ secret: user.two_factor_secret, encoding: 'base32', token: twoFactorToken, window: 1 });
      if (!verified) return res.status(401).json({ success: false, message: "Invalid 2FA token" });
    }

    const payload = { userId: user.id, role: user.role_id, is_verified: user.is_verified, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    if (!token) return res.status(500).json({ success: false, message: "Token generation failed" });

    if (user.role_id === 3) {
      const ipAddress = getClientIp(req);
      await pool.query("INSERT INTO ip_adress (user_id, ip_address) VALUES ($1, $2)", [user.id, ipAddress]);
    }

    await LogCreators.userAuth(user.id, ACTION_TYPES.USER_LOGIN, true, { role_id: user.role_id, country: user.country, ip: req.ip });

    return res.status(200).json({ token, success: true, message: "Login successful", userId: user.id, role: user.role_id, userInfo: user, is_verified: user.is_verified });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, message: "Login error", error: err.message });
  }
};

// ==================== USER MANAGEMENT FUNCTIONS ====================

const viewUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Users WHERE is_deleted = FALSE");
    res.status(200).json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users", error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await pool.query("UPDATE Users SET is_deleted = TRUE WHERE id = $1 RETURNING *", [userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "User deleted successfully", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting user", error: err.message });
  }
};

const editUser = async (req, res) => {
  const { userId } = req.params;
  const { first_name, last_name, phone_number, country, username, profile_pic_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET
         first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), username = COALESCE($3, username),
         phone_number = COALESCE($4, phone_number), country = COALESCE($5, country), profile_pic_url = COALESCE($6, profile_pic_url),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND is_deleted = FALSE RETURNING *`,
      [first_name, last_name, username, phone_number, country, profile_pic_url, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found or deleted" });
    res.status(200).json({ success: true, message: "Profile updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error("❌ updateMyProfile error:", err);
    res.status(500).json({ success: false, message: "Error updating profile", error: err.message });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.token;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// ==================== PORTFOLIO FUNCTIONS ====================

const getPortfolioByUserId = async (req, res) => {
  const { userId } = req.token;
  if (!userId) return res.status(400).json({ success: false, message: "freelancer_id required" });
  try {
    const result = await pool.query("SELECT * FROM portfolios WHERE freelancer_id = $1 ORDER BY added_at DESC", [userId]);
    res.status(200).json({ success: true, message: `Get All portfolio For ${userId}`, portfolios: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: `server error`, error: err.message });
  }
};

const createPortfolio = async (req, res) => {
  const { freelancer_id, title, description, skills, hourly_rate, work_url } = req.body;
  if (!freelancer_id || !title) return res.status(400).json({ success: false, message: "freelancer_id and title are required" });
  try {
    const result = await pool.query(
      "INSERT INTO Portfolios (freelancer_id, title, description, skills, hourly_rate, work_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [freelancer_id, title, description, skills, hourly_rate, work_url]
    );
    res.status(201).json({ success: true, message: "Portfolio created successfully", portfolio: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating portfolio", error: err.message });
  }
};

const editPortfolioFreelancer = async (req, res) => {
  const { portfolioId } = req.params;
  const { title, description, skills, hourly_rate, work_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE portfolios SET title = COALESCE($1, title), description = COALESCE($2, description), skills = COALESCE($3, skills),
         hourly_rate = COALESCE($4, hourly_rate), work_url = COALESCE($5, work_url), edit_at = NOW()
       WHERE id = $6 RETURNING *`,
      [title, description, skills, hourly_rate, work_url, portfolioId]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Portfolio not found for this freelancer" });
    res.status(200).json({ success: true, message: "Portfolio updated successfully", portfolio: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating profile", error: err.message });
  }
};

const deletePortfolioFreelancer = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { freelancerId, portfolioId } = req.body;
    if (parseInt(freelancerId) !== userId) return res.status(403).json({ success: false, message: "You can only delete your own portfolio items." });
    const result = await pool.query("DELETE FROM portfolios WHERE freelancer_id = $1 AND id = $2 RETURNING *", [freelancerId, portfolioId]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: `Portfolio not found.` });
    res.status(200).json({ success: true, message: `Deleted Portfolio Successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ==================== FREELANCER FUNCTIONS ====================

const getAllFreelancers = async (req, res) => {
  const filterValue = (req.body.filter || "").toLowerCase();
  const validFilters = ["active", "deactivated", "all"];
  if (!validFilters.includes(filterValue)) {
    return res.status(400).json({ success: false, message: "Invalid filter value. Must be 'active', 'deactivated', or 'all'." });
  }
  let whereCondition = "users.role_id = 3";
  if (filterValue === "active") whereCondition += " AND users.is_deleted = FALSE";
  else if (filterValue === "deactivated") whereCondition += " AND users.is_deleted = TRUE";
  const sqlQuery = ` SELECT users.id, users.first_name, users.last_name, users.email, COUNT(order_assignments.id) AS orders_count, COALESCE( json_agg(json_build_object('ip_address', ip_adress.ip_address)) FILTER (WHERE ip_adress.ip_address IS NOT NULL), '[]' ) AS ip_addresses FROM users LEFT JOIN ip_adress ON users.id = ip_adress.user_id LEFT JOIN order_assignments ON users.id = order_assignments.freelancer_id WHERE ${whereCondition} GROUP BY users.id, users.first_name, users.last_name, users.email;`;
  try {
    const result = await pool.query(sqlQuery);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "No freelancers found" });
    return res.status(200).json({ success: true, freelancers: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching freelancers", error: err.message });
  }
};

const deleteFreelancerById = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(`UPDATE Users SET is_deleted = NOT is_deleted WHERE id = $1 AND role_id = 3 RETURNING *`, [userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Freelancer not found" });
    const message = result.rows[0].is_deleted ? `Freelancer deactivated successfully` : `Freelancer activated successfully`;
    res.status(200).json({ success: true, message, freelancer: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error toggling freelancer deletion status", error: err.message });
  }
};

const listOnlineUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE is_online = TRUE");
    if (result.rows.length === 0) return res.status(404).json({ success: true, message: "No one is active" });
    return res.status(200).json({ success: true, message: "Active Users found", users: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, messagge: "Server Error", error: err });
  }
};

const rateFreelancer = async (req, res) => {
  const reviewerId = req.token.userId;
  const reviewerName = req.token.username;
  const { userId, rating, projectId } = req.body;

  if (!userId || !rating) return res.status(400).json({ success: false, message: "userId and rating are required" });

  try {
    // ... (your existing validation logic) ...
    const freelancerResult = await pool.query("SELECT role_id, rating_sum, rating_count FROM users WHERE id = $1 AND is_deleted = FALSE", [userId]);
    if (freelancerResult.rows.length === 0) return res.status(404).json({ success: false, message: "Freelancer not found" });
    const freelancer = freelancerResult.rows[0];
    if (freelancer.role_id !== 3) return res.status(403).json({ success: false, message: "Target user is not a freelancer" });

    // ... (your existing rating insertion logic) ...
    const newSum = Number(freelancer.rating_sum) + Number(rating);
    const newCount = Number(freelancer.rating_count) + 1;
    const newAvg = (newSum / newCount).toFixed(2);
    const updateResult = await pool.query(
      `UPDATE users SET rating_sum = $1, rating_count = $2, rating = $3 WHERE id = $4 RETURNING id, first_name, last_name, rating, rating_count`,
      [newSum, newCount, newAvg, userId]
    );

    // ✨ NOTIFICATION INTEGRATION: Notify the freelancer they received a new rating.
    try {
      await NotificationCreators.reviewSubmitted(null, userId, reviewerName || 'A client');
    } catch (notificationError) {
      console.error(`Failed to create rating notification for freelancer ${userId}:`, notificationError);
    }

    return res.status(200).json({ success: true, message: "Freelancer rated successfully", freelancer: updateResult.rows[0] });
  } catch (err) {
    console.error("Rating error:", err.message);
    return res.status(500).json({ success: false, message: "Server error during rating", error: err.message });
  }
};

const getTopFreelancers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, country, username, rating, profile_pic_url FROM users WHERE role_id = 3 AND is_deleted = FALSE ORDER BY rating DESC LIMIT 10`
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "No freelancers found" });
    res.status(200).json({ success: true, freelancers: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching top freelancers", error: err.message });
  }
};

const getFreelance = async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE role_id = 3 AND is_deleted = FALSE`);
    return res.status(200).json({ success: true, freelancers: rows });
  } catch (error) {
    console.error("Error fetching freelancers:", error.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getFreelanceById = async (req, res) => {
  try {
    const freelancerId = req.params.id;
    if (!freelancerId || isNaN(freelancerId)) return res.status(400).json({ success: false, message: "Invalid freelancer ID" });
    const { rows } = await pool.query(`SELECT id, first_name, last_name, username, country, profile_pic_url, rating, rating_count, rating_sum FROM users WHERE id = $1 AND role_id = 3 AND is_deleted = FALSE`, [freelancerId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Freelancer not found" });
    return res.status(200).json({ success: true, freelancer: rows[0] });
  } catch (error) {
    console.error("Error fetching freelancer:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPortfolioByfreelance = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ success: false, message: "freelancer_id required" });
  try {
    const result = await pool.query("SELECT * FROM portfolios WHERE freelancer_id = $1 ORDER BY added_at DESC", [userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "No portfolio found" });
    res.status(200).json({ success: true, message: `Get All portfolio For ${userId}`, portfolios: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: `server error`, error: err.message });
  }
};

// ==================== VERIFICATION FUNCTIONS ====================

const checkVerificationStatus = async (req, res) => {
  const userId = req.token.userId;
  try {
    const userResult = await pool.query("SELECT first_name, last_name, bio, profile_pic_url, is_verified FROM users WHERE id = $1 AND is_deleted = FALSE", [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    const user = userResult.rows[0];

    const portfolioResult = await pool.query("SELECT COUNT(*) as count FROM portfolios WHERE freelancer_id = $1", [userId]);
    const portfolioCount = parseInt(portfolioResult.rows[0].count);

    const missingFields = [];
    if (!user.first_name) missingFields.push("First Name");
    if (!user.last_name) missingFields.push("Last Name");
    if (!user.bio) missingFields.push("Bio");
    if (!user.profile_pic_url) missingFields.push("Profile Picture");
    if (portfolioCount === 0) missingFields.push("Portfolio Item");

    const isProfileComplete = missingFields.length === 0;

    res.status(200).json({ success: true, isVerified: user.is_verified, isProfileComplete, missingFields, portfolioCount });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

const updateVerificationStatus = async (req, res) => {
  const userId = req.token.userId;
  try {
    const userResult = await pool.query("SELECT first_name, last_name, bio, profile_pic_url FROM users WHERE id = $1 AND is_deleted = FALSE", [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    const user = userResult.rows[0];

    const portfolioResult = await pool.query("SELECT COUNT(*) as count FROM portfolios WHERE freelancer_id = $1", [userId]);
    const hasPortfolio = parseInt(portfolioResult.rows[0].count) > 0;
    const isProfileComplete = user.first_name && user.last_name && user.bio && user.profile_pic_url;

    if (isProfileComplete && hasPortfolio) {
      const updateResult = await pool.query("UPDATE users SET is_verified = TRUE WHERE id = $1 RETURNING id, is_verified", [userId]);
      
      // ✨ NOTIFICATION INTEGRATION: Notify user their profile is now verified.
      try {
        await NotificationCreators.userVerified(userId, user.first_name);
      } catch (notificationError) {
        console.error(`Failed to create self-verification notification for user ${userId}:`, notificationError);
      }

      res.status(200).json({ success: true, message: "Profile verified successfully", isVerified: true, user: updateResult.rows[0] });
    } else {
      const missingFields = [];
      if (!user.first_name) missingFields.push("first_name");
      if (!user.last_name) missingFields.push("last_name");
      if (!user.bio) missingFields.push("bio");
      if (!user.profile_pic_url) missingFields.push("profile_image");
      if (!hasPortfolio) missingFields.push("portfolio_item");
      res.status(400).json({ success: false, message: "Profile is not complete.", missingFields });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

const verifyFreelancerByAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE users SET is_verified = TRUE, reason_for_disruption = NULL WHERE id = $1 AND role_id = 3 AND is_deleted = FALSE RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Freelancer not found or not eligible for verification." });
    const freelancer = result.rows[0];

    // ✨ NOTIFICATION INTEGRATION: Notify freelancer they have been verified by an admin.
    try {
      await NotificationCreators.userVerified(freelancer.id, freelancer.first_name);
    } catch (notificationError) {
      console.error(`Failed to create admin verification notification for freelancer ${freelancer.id}:`, notificationError);
    }

    await LogCreators.userManagement(req.token.userId, ACTION_TYPES.ADMIN_VERIFY_USER, true, { targetUserId: freelancer.id });
    res.status(200).json({ success: true, message: "Freelancer verified successfully.", freelancer });
  } catch (err) {
    console.error("Error verifying freelancer:", err.message);
    res.status(500).json({ success: false, message: "Server error while verifying freelancer", error: err.message });
  }
};

const rejectFreelancerByAdmin = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ success: false, message: "A reason for rejection is required." });

  try {
    const result = await pool.query(
      `UPDATE users SET is_verified = FALSE, reason_for_disruption = $1 WHERE id = $2 AND role_id = 3 AND is_deleted = FALSE RETURNING *`,
      [reason, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Freelancer not found or not eligible." });
    const freelancer = result.rows[0];

    // ✨ NOTIFICATION INTEGRATION: Notify freelancer their verification was rejected.
    try {
      // NOTE: You may need to add a 'userVerificationRejected' type to your notification service.
      await NotificationCreators.userVerificationRejected(freelancer.id, reason);
    } catch (notificationError) {
      console.error(`Failed to create rejection notification for freelancer ${freelancer.id}:`, notificationError);
    }

    await LogCreators.userManagement(req.token.userId, ACTION_TYPES.ADMIN_REJECT_USER, true, { targetUserId: freelancer.id, reason });
    res.status(200).json({ success: true, message: "Freelancer rejected successfully.", freelancer });
  } catch (err) {
    console.error("Error rejecting freelancer:", err.message);
    res.status(500).json({ success: false, message: "Server error while rejecting freelancer", error: err.message });
  }
};

// ==================== PASSWORD & ACCOUNT MANAGEMENT ====================

const verifyPassword = async (req, res) => {
  const { password } = req.body;
  const userId = req.token.userId;
  try {
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1 AND is_deleted = FALSE', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    const match = await bcrypt.compare(password, userResult.rows[0].password);
    res.json({ success: match, message: match ? 'Password verified' : 'Incorrect password' });
  } catch (error) {
    console.error('Verify Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error during password verification' });
  }
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.token.userId;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
  if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
  if (!passwordRegex.test(newPassword)) return res.status(400).json({ success: false, message: 'New password does not meet complexity requirements.' });

  try {
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1 AND is_deleted = FALSE', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    const match = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    await LogCreators.userAuth(userId, ACTION_TYPES.PASSWORD_CHANGE, true, { ip: req.ip });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error during password update' });
  }
};

const deactivateAccount = async (req, res) => {
  const userId = req.token.userId;
  try {
    const userCheck = await pool.query('SELECT id, is_deleted FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    if (userCheck.rows[0].is_deleted) return res.status(400).json({ success: false, message: 'Account is already deactivated' });

    await pool.query(`UPDATE users SET is_deleted = TRUE, deactivated_at = NOW(), reason_for_disruption = 'Deactivated by user' WHERE id = $1`, [userId]);
    await LogCreators.userAuth(userId, ACTION_TYPES.ACCOUNT_DEACTIVATED, true, { ip: req.ip, reason: 'user_initiated' });
    res.json({ success: true, message: 'Account deactivated successfully. You have 30 days to reactivate by logging in.' });
  } catch (error) {
    console.error('Deactivate Account Error:', error);
    res.status(500).json({ success: false, message: 'Server error during account deactivation' });
  }
};

// ==================== EXPORTS ====================

export {
  getUserById, register, login, viewUsers, deleteUser, editUser
  , getPortfolioByUserId, createPortfolio, editPortfolioFreelancer, deletePortfolioFreelancer
  , getAllFreelancers, deleteFreelancerById, listOnlineUsers, rateFreelancer, getTopFreelancers, getFreelance, getFreelanceById, getPortfolioByfreelance
  , checkVerificationStatus, updateVerificationStatus, verifyFreelancerByAdmin, rejectFreelancerByAdmin
  , verifyPassword, updatePassword, deactivateAccount
};  