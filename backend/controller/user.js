const pool = require("../models/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
const {role_id, first_name, last_name, email, password, phone_number, country , username} = req.body;

if(!role_id || !email || !password || !phone_number || !country ){
    return res.status(400).json({ success: false, message: "All fields are required" });
}

const hashedPassword = await bcrypt.hash(password, Number(process.env.SECRET));
const Email = email.toLowerCase();

pool.query(
  "INSERT INTO Users (role_id, first_name, last_name, email, password, phone_number, country, username) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
  [role_id, first_name, last_name, Email, hashedPassword, phone_number, country, username]
).then((result) => {
    res.status(201).json({
        success: true,
         message: "User registered successfully", 
         user: result.rows[0] });
    }).catch((err) => {
        res.status(409).json({
            success: false,
            message : "Email already exists",
            error: err
        })
    });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = $1";
  const data = [email.toLowerCase()];

  pool.query(query, data)
    .then(async (result) => {
      if (result.rows.length > 0) {
        bcrypt.compare(password, result.rows[0].password, (err, response) => {
          if (err) return res.status(500).json({ success: false, message: "Error comparing password" });

          if (response) {
            const payload = {
              userId: result.rows[0].id,
              role: result.rows[0].role_id,
            };

            const options = { expiresIn: "1d" };
            const secret = process.env.JWT_SECRET;
            const token = jwt.sign(payload, secret, options);

            return res.status(200).json({
              token,
              success: true,
              message: "Valid login credentials",
              userId: result.rows[0].id,
              role: result.rows[0].role_id,
              userInfo: result.rows[0]
            });
          } else {
            return res.status(403).json({
              success: false,
              message: "The email desn't exist or the password you've entered is incorrect"
            });
          }
        });
      } else {
        return res.status(403).json({
          success: false,
          message: "The email desn't exist or the password you've entered is incorrect"
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message
      });
    });
};
const viewUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Users WHERE is_deleted = FALSE");
    res.status(200).json({
      success: true,
      users: result.rows
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: err.message
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
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: err.message
    });
  }
}
const editUser = async (req, res) => {
  const { userId } = req.params;
  const { first_name, last_name, email, phone_number, country, username, role_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Users 
       SET 
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         email = COALESCE($3, email),
         phone_number = COALESCE($4, phone_number),
         country = COALESCE($5, country),
         username = COALESCE($6, username),
         role_id = COALESCE($7, role_id)
       WHERE id=$8 AND is_deleted = FALSE
       RETURNING *`,
      [first_name, last_name, email?.toLowerCase(), phone_number, country, username, role_id, userId]
    );

    if(result.rows.length === 0){
      return res.status(404).json({ success: false, message: "User not found or deleted" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: err.message
    });
  }
};

 const createPortfolio = async (req, res) => {
  const { freelancer_id, title, description, skills, hourly_rate, work_url } = req.body;

  if (!freelancer_id || !title) {
    return res.status(400).json({ success: false, message: "freelancer_id and title are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO Portfolios (freelancer_id, title, description, skills, hourly_rate, work_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [freelancer_id, title, description, skills, hourly_rate, work_url]
    );

    res.status(201).json({
      success: true,
      message: "Portfolio created successfully",
      portfolio: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating portfolio",
      error: err.message
    });
  }
}


const editPortfolioFreelancer = async (req, res) => {
  const { userId } = req.params;
  const { title, description, skills, hourly_rate, work_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Portfolios 
       SET 
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         skills = COALESCE($3, skills),
         hourly_rate = COALESCE($4, hourly_rate),
         work_url = COALESCE($5, work_url)
       WHERE freelancer_id=$6
       RETURNING *`,
      [title, description, skills, hourly_rate, work_url, userId]
    );

    if(result.rows.length === 0){
      return res.status(404).json({ success: false, message: "Portfolio not found for this freelancer" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      portfolio: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: err.message
    });
  }

}






module.exports = { 
register, 
login ,
viewUsers,
deleteUser,
editUser,
createPortfolio,
editPortfolioFreelancer
};
