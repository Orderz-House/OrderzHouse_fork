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

  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.SECRET)
  );
  const Email = email.toLowerCase();

  pool
    .query(
      "INSERT INTO Users (role_id, first_name, last_name, email, password, phone_number, country, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
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
    )
    .then((result) => {
      res.status(201).json({
        success: true,
         message: "User registered successfully", 
         user: result.rows[0] });
    }).catch((err) => {
        res.status(405).json({
            success: false,
            //message : "Email already exists",
            error: err
        })
    });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = $1";
  const data = [email.toLowerCase()];

  pool
    .query(query, data)
    .then(async (result) => {
        if(result.row.length){
            bcrypt.compare(password, result.rows[0].password, (err, response) =>{
                if(err) res.json(err);
                if(response){
                    const payload = {
                        userId : result.rows[0].id,
                        role: result.rows[0].role_id,
                    };

            const options = { expiresIn: "1d" };
            const secret = process.env.JWT_SECRET;
            const token = jwt.sign(payload, secret, options);
            if (token) {
              res.status(200).json({
                token,
                success: true,
                message: "Valid login credentials",
                userId: result.rows[0].id,
                role: result.rows[0].role_id,
                userInfo: result.rows[0],
              });
            } else {
              throw Error;
            }
          } else {
            res.status(403).json({
              success: false,
              message:
                "The email desn't exist or the password you've entered is incorrect",
              error: err.message,
            });
          }
        });
      } else throw Error;
    })
    .catch((err) => {
      res.status(403).json({
        success: false,
        message:
          "The email desn't exist or the password you've entered is incorrect",
        error: err.message,
      });
    });
};

const pool = require("../models/db");

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
};
