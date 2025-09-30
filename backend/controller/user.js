// Import required packages
const pool = require("../models/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dns = require('dns');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// --- Nodemailer Setup (use your own credentials from .env file) ---
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email service you use
  auth: {
    user: process.env.EMAIL_USER, // Your email, e.g., 'youremail@gmail.com'
    pass: process.env.EMAIL_PASS, // Your email provider's app password
  },
});

// --- Twilio Setup (use your own credentials from .env file) ---
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


// --- New function to check if email, username, or phone is already taken ---
const checkAvailability = async (req, res) => {
  const { field, value } = req.body;
  
  // Security: Ensure the field is one of the allowed unique fields to prevent SQL injection
  if (!['email', 'username', 'phone_number'].includes(field)) {
    return res.status(400).json({ message: 'Invalid field for availability check' });
  }

  try {
    // Dynamically create the query based on the field
    const query = `SELECT id FROM users WHERE ${field} = $1`;
    const result = await pool.query(query, [value]);
    
    // Respond with true if no records are found (meaning the value is available)
    res.json({ isAvailable: result.rows.length === 0 });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ message: 'Server error during availability check' });
  }
};


// --- Modified register function with verification step ---
const register = async (req, res) => {
  const { role_id, first_name, last_name, email, password, phone_number, country, username } = req.body;

  // 1. Validate the email's domain to ensure it's a real, existing domain
  const domain = email.split('@')[1];
  dns.lookup(domain, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: "Email domain does not exist. Please use a real email address." });
    }

    try {
      // 2. Generate a 6-digit verification code and hash the user's password
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedPassword = await bcrypt.hash(password, 10); // Using a salt round of 10 is standard
      const Email = email.toLowerCase();

      // 3. Save the user to the database with an 'unverified' status.
      // Use "ON CONFLICT" to handle cases where a user tries to register again before verifying.
      // This will update their details and send a new code instead of causing an error.
      const query = `
        INSERT INTO Users (role_id, first_name, last_name, email, password, phone_number, country, username, verification_code, is_verified) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
        ON CONFLICT (email) DO UPDATE SET
          first_name = EXCLUDED.first_name, 
          last_name = EXCLUDED.last_name, 
          password = EXCLUDED.password, 
          phone_number = EXCLUDED.phone_number, 
          country = EXCLUDED.country, 
          username = EXCLUDED.username, 
          verification_code = EXCLUDED.verification_code, 
          is_verified = false
        RETURNING id;
      `;
      const values = [role_id, first_name, last_name, Email, hashedPassword, phone_number, country, username, verificationCode];
      await pool.query(query, values);

      // 4. Send the verification code via email using Nodemailer
      await transporter.sendMail({
        from: `"Your App Name" <${process.env.EMAIL_USER}>`,
        to: Email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${verificationCode}`,
        html: `<b>Your verification code is: ${verificationCode}</b>`,
      });

      // 5. Send the verification code via SMS using Twilio
      await twilioClient.messages.create({
        body: `Your verification code is: ${verificationCode}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone_number, // The phone number must be in E.164 format, e.g., '+15558675310'
      });

      // 6. Send a success response to the frontend
      res.status(201).json({
        success: true,
        message: "Registration successful. Please check your email and phone for the verification code.",
      });

    } catch (error) {
      // Handle specific database errors, like a unique field violation (username or phone)
      if (error.code === '23505') { // PostgreSQL unique violation error code
        return res.status(409).json({ success: false, message: `An account with this ${error.constraint.split('_')[1]} already exists.` });
      }
      console.error('Registration process error:', error);
      res.status(500).json({ success: false, message: "Server error during registration." });
    }
  });
};


// --- New function to verify the user's account with the provided code ---
const verifyUser = async (req, res) => {
  const { email, code } = req.body;
  try {
    // Find the user by their email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const user = result.rows[0];

    // Check if the account is already verified
    if (user.is_verified) {
        return res.status(400).json({ success: false, message: "This account is already verified." });
    }
    
    // Check if the provided code matches the one in the database
    if (user.verification_code !== code) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }

    // If the code is correct, update the user's status to 'verified' and clear the code
    await pool.query('UPDATE users SET is_verified = true, verification_code = NULL WHERE id = $1', [user.id]);

    res.status(200).json({ success: true, message: "Account verified successfully. You can now log in." });

  } catch (error) {
    console.error('Verification process error:', error);
    res.status(500).json({ success: false, message: "Server error during verification." });
  }
};


// --- Your other existing controller functions ---

const login = async (req, res) => {
  const { email, password } = req.body;
  // Important: Add a check to prevent unverified users from logging in
  const query = "SELECT * FROM users WHERE email = $1";
  const data = [email.toLowerCase()];

  pool
    .query(query, data)
    .then(async (result) => {
      if (result.rows.length > 0) {
        const user = result.rows[0];

        // **CRITICAL: Check if the user is verified before allowing login**
        if (!user.is_verified) {
          return res.status(403).json({
            success: false,
            message: "Your account is not verified. Please check your email for the verification code.",
          });
        }

        bcrypt.compare(password, user.password, (err, response) => {
          if (err) {
            res.json(err);
            return;
          }
          if (response) {
            const payload = { userId: user.id, role: user.role_id };
            const options = { expiresIn: "1d" };
            const secret = process.env.JWT_SECRET;
            const token = jwt.sign(payload, secret, options);
            
            res.status(200).json({
              token,
              success: true,
              message: "Valid login credentials",
              userId: user.id,
              role: user.role_id,
              userInfo: user,
            });
          } else {
            res.status(403).json({
              success: false,
              message: "The email doesn't exist or the password you've entered is incorrect",
            });
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: "The email doesn't exist or the password you've entered is incorrect",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "Server error during login",
        error: err.message,
      });
    });
};

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
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted successfully", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting user", error: err.message });
  }
};

const editUser = async (req, res) => {
  const { userId } = req.params;
  const { first_name, last_name, email, phone_number, country, username, role_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), email = COALESCE($3, email), phone_number = COALESCE($4, phone_number), country = COALESCE($5, country), username = COALESCE($6, username), role_id = COALESCE($7, role_id) WHERE id=$8 AND is_deleted = FALSE RETURNING *`,
      [first_name, last_name, email?.toLowerCase(), phone_number, country, username, role_id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found or deleted" });
    }
    res.status(200).json({ success: true, message: "User updated successfully", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating user", error: err.message });
  }
};

const createPortfolio = async (req, res) => {
  const { freelancer_id, title, description, skills, hourly_rate, work_url } = req.body;
  if (!freelancer_id || !title) {
    return res.status(400).json({ success: false, message: "freelancer_id and title are required" });
  }
  try {
    const result = await pool.query("INSERT INTO Portfolios (freelancer_id, title, description, skills, hourly_rate, work_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [freelancer_id, title, description, skills, hourly_rate, work_url]);
    res.status(201).json({ success: true, message: "Portfolio created successfully", portfolio: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating portfolio", error: err.message });
  }
};

const editPortfolioFreelancer = async (req, res) => {
  const { userId } = req.params;
  const { title, description, skills, hourly_rate, work_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Portfolios SET title = COALESCE($1, title), description = COALESCE($2, description), skills = COALESCE($3, skills), hourly_rate = COALESCE($4, hourly_rate), work_url = COALESCE($5, work_url) WHERE freelancer_id=$6 RETURNING *`,
      [title, description, skills, hourly_rate, work_url, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Portfolio not found for this freelancer" });
    }
    res.status(200).json({ success: true, message: "Profile updated successfully", portfolio: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating profile", error: err.message });
  }
};

const updateProfilePicture = async (req, res) => {
  const userId = req.token.userId;
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file was uploaded." });
  }
  const profilePicUrl = req.file.path;
  try {
    const result = await pool.query('UPDATE users SET profile_pic_url = $1 WHERE id = $2 RETURNING profile_pic_url', [profilePicUrl, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const newUrl = result.rows[0].profile_pic_url;
    res.status(200).json({ success: true, message: "Profile picture updated successfully.", url: newUrl });
  } catch (error) {
    console.error("Database update error:", error);
    res.status(500).json({ success: false, message: "Server error while updating profile picture." });
  }
};


// --- Export all controller functions ---
module.exports = { 
  register, 
  login,
  viewUsers,
  deleteUser,
  editUser,
  createPortfolio,
  editPortfolioFreelancer,
  updateProfilePicture,
  checkAvailability, // Don't forget to export the new functions
  verifyUser,        // Don't forget to export the new functions
};
