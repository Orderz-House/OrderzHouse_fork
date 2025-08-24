const pool = require("../models/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
  } = req.body;

  if (!role_id || !email || !password || !phone_number || !country) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const Email = email.toLowerCase();

    const result = await pool.query(
      "INSERT INTO Users (role_id, first_name, last_name, email, password, phone_number, country, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        role_id,
        first_name,
        last_name,
        Email,
        hashedPassword,
        phone_number,
        country,
        username,
      ]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    res.status(405).json({
      success: false,
      error: err.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM Users WHERE email = $1";
  const data = [email.toLowerCase()];

  try {
    const result = await pool.query(query, data);

    if (result.rows.length) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const payload = {
          userId: user.id,
          role: user.role_id,
        };

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
          message:
            "The email doesn't exist or the password you've entered is incorrect",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message:
          "The email doesn't exist or the password you've entered is incorrect",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const viewUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Users WHERE is_deleted = FALSE"
    );
    res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: err.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await pool.query(
      "UPDATE Users SET is_deleted = TRUE WHERE id = $1 RETURNING *",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: err.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const clientId = req.token.userId;

    if (!clientId) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: client_id missing" });
    }

    const query = `
      SELECT id, client_id, category_id, title, description, budget, status, created_at, due_date
      FROM orders
      WHERE client_id = $1
      ORDER BY created_at DESC
    `;

    const { rows } = await pool.query(query, [clientId]);

    return res.status(200).json({ success: true, orders: rows });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  getOrders,
  register,
  login,
  viewUsers,
  deleteUser,
};
