import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LogCreators, ACTION_TYPES } from "../services/loggingService.js";
import { NotificationCreators } from "../services/notificationService.js";
import nodemailer from "nodemailer";
import pool from "../models/db.js";
import cloudinary from "../cloudinary/setupfile.js";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();


/* =========================================
   CLOUDINARY UPLOAD HELPER
========================================= */
const uploadFilesToCloudinary = async (files, folder) => {
  const uploadedFiles = [];

  for (const file of files) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });

    uploadedFiles.push({
      url: result.secure_url,
      public_id: result.public_id,
      name: file.originalname,
      size: file.size,
    });
  }

  return uploadedFiles;
};

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
    categories = [],         
    sub_sub_categories = [], 
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

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [emailLower, username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users 
        (role_id, first_name, last_name, email, password, phone_number, country, username, email_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,FALSE)
       RETURNING *`,
      [role_id, first_name, last_name, emailLower, hashedPassword, phone_number, country, username]
    );
    const user = rows[0];

    if (parseInt(role_id) === 3) {
      if (Array.isArray(categories) && categories.length > 0) {
        for (const catId of categories) {
          await pool.query(
            `INSERT INTO freelancer_categories (freelancer_id, category_id)
             VALUES ($1, $2)
             ON CONFLICT (freelancer_id, category_id) DO NOTHING`,
            [user.id, catId]
          );
        }
      }

      if (Array.isArray(sub_sub_categories) && sub_sub_categories.length > 0) {
        for (const subSubId of sub_sub_categories) {
          await pool.query(
            `INSERT INTO freelancer_sub_sub_categories (freelancer_id, sub_sub_category_id)
             VALUES ($1, $2)
             ON CONFLICT (freelancer_id, sub_sub_category_id) DO NOTHING`,
            [user.id, subSubId]
          );
        }
      }
    }

    // ✅ Step 4: Generate & store OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); 

    await pool.query("UPDATE users SET email_otp = $1, email_otp_expires = $2 WHERE id = $3", [
      otp,
      otpExpiry,
      user.id,
    ]);

    // ✅ Step 5: Send OTP via email
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

    // ✅ Step 6: Respond success
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


/* =========================================
   EDIT USER PROFILE 
========================================= */
export const editUserSelf = async (req, res) => {
  const userId = req.token.userId;
  const {
    first_name,
    last_name,
    username,
    phone_number,
    country,
    profile_pic_url,
  } = req.body;

  try {
    let finalProfileUrl = profile_pic_url;

    if (req.files && req.files.length > 0) {
      const uploaded = await uploadFilesToCloudinary(req.files, "users/profile_pics");
      finalProfileUrl = uploaded[0].url;
    }

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
      [first_name, last_name, username, phone_number, country, finalProfileUrl, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("editUserSelf Error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Error updating profile" });
  }
};


export const uploadProfilePic = async (req, res) => {
  const userId = req.token.userId;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "users/profile_pics", resource_type: "image" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ success: false, message: "Error uploading image" });
        }

        const { rows } = await pool.query(
          `UPDATE users
           SET profile_pic_url = $1, updated_at = NOW()
           WHERE id = $2 AND is_deleted = FALSE
           RETURNING profile_pic_url`,
          [result.secure_url, userId]
        );

        return res.status(200).json({
          success: true,
          message: "Profile picture uploaded successfully",
          url: rows[0].profile_pic_url,
        });
      }
    );

    Readable.from(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    console.error("uploadProfilePic Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error uploading profile picture" });
  }
};

const rateFreelancer = async (req, res) => {
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

const getUserdata = async (req, res) => {
  const userId = req.token.userId;

  const user = await pool.query(
    "SELECT id, first_name, last_name, email, username, role_id, profile_pic_url FROM users WHERE id = $1 AND is_deleted = FALSE",
    [userId]
  );

  if (!user.rows.length) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.json({
    success: true,
    user: user.rows[0],
  });
};

// ==================== PASSWORD & ACCOUNT MANAGEMENT ====================

const verifyPassword = async (req, res) => {
  const { password } = req.body;  // <-- هذا هو المطلوب
  const userId = req.token.userId;

  try {
    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1 AND is_deleted = FALSE",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = userResult.rows[0].password;

    if (!password || !hashedPassword) {
      return res.status(400).json({
        success: false,
        message: "Password or hashed password missing"
      });
    }

    const match = await bcrypt.compare(password, hashedPassword);

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
  register,
  login,
  rateFreelancer,
  verifyPassword,
  updatePassword,
  deactivateAccount,
  verifyEmailOtp,
  getUserdata
};