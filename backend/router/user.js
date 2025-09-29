const express = require("express");
const multer = require('multer'); 
const { checkAvailability, verifyUser } = require('../controller/user'); // Import the new controller functions

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Adjust path if needed

// --- Twilio Setup (Securely loads from .env) ---
require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Initialize the Twilio client using the API Key (recommended)
const client = require('twilio')(apiKeySid, apiKeySecret, { accountSid: accountSid });


// --- ENDPOINT 1: Send Verification Code ---
router.post('/send-verification', async (req, res) => {
  const { phone_number } = req.body;
  if (!phone_number) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  try {
    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: phone_number, channel: 'sms' });

    res.status(200).json({ success: true, message: `Verification code sent to ${phone_number}.` });
  } catch (error) {
    console.error("Twilio Send-Verification Error:", error);
    if (error.code === 60200) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format. Please include the country code (e.g., +1).' });
    }
    res.status(500).json({ success: false, message: 'Failed to send verification code.' });
  }
});


// --- ENDPOINT 2: Check Code and Register User ---
router.post('/check-verification-and-register', async (req, res) => {
  const { code, ...userData } = req.body;
  if (!code || !userData.phone_number) {
    return res.status(400).json({ message: 'Verification code and phone number are required.' });
  }

  try {
    // Step 1: Check the code with Twilio
    const verification_check = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({ to: userData.phone_number, code: code });

    if (verification_check.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    // Step 2: If code is correct, create the user
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = await User.create({
      ...userData,
      password: hashedPassword,
      phone_verified: true, // Mark phone as verified in the database
    });

    // Step 3: Create a JWT to log the user in automatically
    const token = jwt.sign(
        { userId: newUser.id, role: newUser.role_id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token: token,
      userId: newUser.id,
      role: newUser.role_id,
    });

  } catch (error) {
    console.error("Registration Error:", error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Email or username already exists.' });
    }
    res.status(500).json({ success: false, message: 'An error occurred during registration.' });
  }
});


const { register, login, viewUsers, deleteUser, editUser, createPortfolio, editPortfolioFreelancer, updateProfilePicture } = require('../controller/user'); // 2. افترض أنك ستضيف دالة جديدة في الـ controller
const authentiction = require('../middleware/authentication');
const authorization = require('../middleware/authorization');
const usersRouter = express.Router();

const upload = multer({ dest: 'uploads/' }); 

usersRouter.post('/register', register);
usersRouter.post('/login', login);
usersRouter.get('/view', authentiction, authorization("view_users"), viewUsers);
usersRouter.delete('/delete/:userId', authentiction, authorization("delete_user"), deleteUser);
usersRouter.put('/edit/:userId', authentiction, authorization("edit_user"), editUser);
usersRouter.post('/freelancer/portfolio/create', authentiction, createPortfolio);
usersRouter.put('/freelancer/portfolio/edit/:userId', authentiction, editPortfolioFreelancer);
usersRouter.post('/check-availability', checkAvailability);
usersRouter.post('/verify', verifyUser); // New route for user verification

usersRouter.put(
  '/profile/picture',         
  authentiction,              
  upload.single('profile_pic'),
  updateProfilePicture         
);

module.exports = usersRouter;
