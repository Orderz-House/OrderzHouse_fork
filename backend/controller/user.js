const {pool} = require("../models/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cron = require("node-cron");

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

    if (!role_id || !first_name || !last_name || !email || !password || !phone_number || !country || !username) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.SECRET)
  );
  const Email = email.toLowerCase();

  pool
    .query(
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
    )
    .then( async(result) => {
      //console.log(result.rows[0].id);
      const user = result.rows[0]
      const positionRole = user.role_id === 1 ? "Admin" : user.role_id === 2 ? "Client" : "Freelancer";
      const actionUser = `${user.first_name} ${user.last_name}, a ${positionRole} from ${user.country}, has registered successfully.`;
      await pool.query('INSERT INTO logs (user_id, action) VALUES ($1,$2)', [user.id, actionUser])
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: result.rows[0],
      });
    })
    .catch((err) => {
      if (err.constraint === "users_email_key") {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: err.message,
        });
      }
    });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = $1";
  const data = [email.toLowerCase()];

  function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
      ? forwarded.split(",")[0]
      : req.connection.remoteAddress;
    return ip === "::1" ? "127.0.0.1" : ip;
  }

  try {
    const result = await pool.query(query, data);

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "The email desn't exist or the password you've entered is incorrect",
      });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(403).json({
        success: false,
        message:
          "The email desn't exist or the password you've entered is incorrect",
      });
    }
    const payload = {
      userId: user.id,
      role: user.role_id,
    };

    const options = { expiresIn: "1d" };
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, options);

    if (!token) {
      return res.status(500).json({
        success: false,
        message: "Token generation failed",
      });
    }
    const ipAddress = getClientIp(req);
    const ipAddressQuery =
      "INSERT INTO ip_adress (user_id, ip_address) VALUES ($1, $2)";
    const ipAddressData = [user.id, ipAddress];

    if (user.role_id === 3) {
      await pool.query(ipAddressQuery, ipAddressData);
    }
      const positionRole = user.role_id === 1 ? "Admin" : user.role_id === 2 ? "Client" : "Freelancer";
      const actionUser = `${user.first_name} ${user.last_name}, a ${positionRole} from ${user.country}, has logged in successfully.`;
      await pool.query('INSERT INTO logs (user_id, action) VALUES ($1,$2)', [user.id, actionUser])
    return res.status(201).json({
      token,
      success: true,
      message: "Valid login credentials",
      userId: user.id,
      role: user.role_id,
      userInfo: user,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login",
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

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: err.message,
    });
  }
};
const editUser = async (req, res) => {
  const { userId } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone_number,
    country,
    username,
    role_id,
  } = req.body;

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
      [
        first_name,
        last_name,
        email?.toLowerCase(),
        phone_number,
        country,
        username,
        role_id,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found or deleted" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: err.message,
    });
  }
};

const createPortfolio = async (req, res) => {
  const { freelancer_id, title, description, skills, hourly_rate, work_url } =
    req.body;

  if (!freelancer_id || !title) {
    return res
      .status(400)
      .json({
        success: false,
        message: "freelancer_id and title are required",
      });
  }

  try {
    const result = await pool.query(
      "INSERT INTO Portfolios (freelancer_id, title, description, skills, hourly_rate, work_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [freelancer_id, title, description, skills, hourly_rate, work_url]
    );

    res.status(201).json({
      success: true,
      message: "Portfolio created successfully",
      portfolio: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating portfolio",
      error: err.message,
    });
  }
};

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

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Portfolio not found for this freelancer",
        });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      portfolio: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: err.message,
    });
  }
};

const deactivateInactiveUsers = async () => {
  const query = `
    UPDATE Users
    SET is_deleted = TRUE,
    reason_for_disruption = 'Deactivated due to inactivity or Order for 30 days'
    WHERE role_id = 2
    AND is_deleted = FALSE
    AND created_at < NOW() - INTERVAL '30 days'
    AND id NOT IN (
    SELECT DISTINCT client_id FROM orders
    );
  `;

  try {
    const result = await pool.query(query);
    console.log(`Deactivated ${result.rowCount} inactive users.`);
  } catch (err) {
    console.error("Error deactivating inactive users:", err);
  }
};

cron.schedule("0 3 * * *", () => {
  deactivateInactiveUsers();
  console.log("Ran deactivate Inactive Users at 3AM daily");
});


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
  if (filterValue === "active") {
    whereCondition += " AND users.is_deleted = FALSE";
  } else if (filterValue === "deactivated") {
    whereCondition += " AND users.is_deleted = TRUE";
  }

  const sqlQuery = ` SELECT users.id, users.first_name, users.last_name, users.email, COUNT(order_assignments.id) AS orders_count, COALESCE( json_agg(json_build_object('ip_address', ip_adress.ip_address)) FILTER (WHERE ip_adress.ip_address IS NOT NULL), '[]' ) AS ip_addresses FROM users LEFT JOIN ip_adress ON users.id = ip_adress.user_id LEFT JOIN order_assignments ON users.id = order_assignments.freelancer_id WHERE ${whereCondition} GROUP BY users.id, users.first_name, users.last_name, users.email;`;

  try {
    const result = await pool.query(sqlQuery);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No freelancers found",
      });
    }

    return res.status(200).json({
      success: true,
      freelancers: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching freelancers",
      error: err.message,
    });
  }
};

const deleteFreelancerById = async (req, res) => {
const { userId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE Users 
       SET is_deleted = NOT is_deleted 
       WHERE id = $1 AND role_id = 3 
       RETURNING *`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found",
      });
    }
    if(result.rows[0].is_deleted){
      res.status(200).json({
      success: true,
      message: `Freelancer deactivated successfully`,
      freelancer: result.rows[0],
    }
  );
  }else {
    res.status(200).json({
      success: true,
      message: `Freelancer activated successfully`,
      freelancer: result.rows[0],
    });
  }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error toggling freelancer deletion status",
      error: err.message,
    });
  }
}

const listOnlineUsers = async(req, res) =>{
  try {

    const result = await pool.query("SELECT * FROM users WHERE is_online = TRUE")

    if(result.rows.length === 0){
      return res.status(404).json({
        success : true,
        message : "No one is active"
      })
    }

    return res.status(200).json({
      success : true,
      message : "Active Users found",
      users : result.rows
    })


  } catch (err) {
    return res.status(500).json({
      success : false,
      messagge : "Server Error",
      error : err
    })
  }
}




module.exports = {
  register,
  login,
  viewUsers,
  deleteUser,
  editUser,
  createPortfolio,
  editPortfolioFreelancer,
  getAllFreelancers,
  deleteFreelancerById,
  listOnlineUsers
};