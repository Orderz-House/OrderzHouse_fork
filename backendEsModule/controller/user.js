import pool from "../models/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cron from "node-cron";

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
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }


  const configuredRounds = Number(process.env.SECRET);
  const saltRounds =
    Number.isFinite(configuredRounds) && configuredRounds > 0
      ? configuredRounds
      : 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

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
    .then(async (result) => {
      //console.log(result.rows[0].id);
      const user = result.rows[0];
      const positionRole =
        user.role_id === 1
          ? "Admin"
          : user.role_id === 2
          ? "Client"
          : "Freelancer";
      const actionUser = `${user.first_name} ${user.last_name}, a ${positionRole} from ${user.country}, has registered successfully.`;
      await pool.query("INSERT INTO logs (user_id, action) VALUES ($1,$2)", [
        user.id,
        actionUser,
      ]);
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
    const positionRole =
      user.role_id === 1
        ? "Admin"
        : user.role_id === 2
        ? "Client"
        : "Freelancer";
    const actionUser = `${user.first_name} ${user.last_name}, a ${positionRole} from ${user.country}, has logged in successfully.`;
    await pool.query("INSERT INTO logs (user_id, action) VALUES ($1,$2)", [
      user.id,
      actionUser,
    ]);
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

const updateUser = async (req, res) => {
  // Get the user ID from route parameters
  const { userId } = req.params;

  // Extract the fields to update from request body
  const {
    first_name,
    last_name,
    phone_number,
    country,
    username,
  } = req.body;

  try {
    // Update the user in the database
    // COALESCE ensures that if a field is not provided, the existing value is kept
    const result = await pool.query(
      `UPDATE Users
        SET
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone_number = COALESCE($3, phone_number),
          country = COALESCE($4, country),
          username = COALESCE($5, username)
        WHERE id = $6 AND is_deleted = FALSE
        RETURNING *;`,
      [
        first_name,
        last_name,
        phone_number,
        country,
        username,
        userId,
      ]
    );

    // If no user found or the user is deleted, return 404
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found or deleted" });
    }

    // Return the updated user
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    // Handle database or server errors
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: err.message,
    });
  }
};

const getPortfolioByUserId = async (req,res)=>{
  const {userId} = req.params;

  if(!userId){
    return res.status(400).json({
      success: false,
      message: "freelancer_id required",
    });
  }

  try{
    const result = await pool.query("SELECT * FROM portfolios WHERE freelancer_id = $1 ORDER BY added_at DESC", [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No portfolio found",
      });
    }

    res.status(200).json({
      success : true,
      message : `Get All portfolio For ${userId}`,
      portfolios : result.rows
    })
  } catch (err){
    res.status(500).json({
      success : false,
      message : `server error`,
      error : err.message
    })
  }
}

const createPortfolio = async (req, res) => {
  const { freelancer_id, title, description, skills, hourly_rate, work_url } =
    req.body;

  if (!freelancer_id || !title) {
    return res.status(400).json({
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
  const { portfolioId } = req.params;
  console.log(portfolioId);
  
  const { title, description, skills, hourly_rate, work_url } = req.body;
  console.log("skills =>", req.body);
  
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
      return res.status(404).json({
        success: false,
        message: "Portfolio not found for this freelancer",
      });
    }

    res.status(200).json({
      success: true,
      message: "Portfolio updated successfully",
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

const deletePortfolioFreelancer = async (req,res)=>{
  const {freelnacerId, portfolioId} = req.body;
  console.log(typeof freelnacerId)
  console.log(typeof portfolioId)
  pool.query(
    "DELETE FROM portfolios WHERE freelancer_id = $1 AND id = $2 RETURNING *",
    [freelnacerId, portfolioId]
  )
  .then((result) => {
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Portfolio ID: ${portfolioId} not found or does not belong to freelancer ${freelnacerId}`,
      });
    }
    res.status(200).json({
      success: true,
      message: `Deleted Portfolio ID: ${portfolioId} Successfully`,
    });
  })
  .catch((err) => {
    res.status(500).json({
      success: false,
      message: "Server Error",
      err,
    });
  });
}

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
      message:
        "Invalid filter value. Must be 'active', 'deactivated', or 'all'.",
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
    if (result.rows[0].is_deleted) {
      res.status(200).json({
        success: true,
        message: `Freelancer deactivated successfully`,
        freelancer: result.rows[0],
      });
    } else {
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
};

const listOnlineUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE is_online = TRUE"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No one is active",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Active Users found",
      users: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messagge: "Server Error",
      error: err,
    });
  }
};
const getUserById = async (req, res) => {
  const { userId } = req.token;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};
const rateFreelancer = async (req, res) => {
  // ReviewerId comes from JWT token
  const reviewerId = req.token.userId;
  const { freelancerId, rating } = req.body;

  if (!freelancerId || !rating) {
    return res.status(400).json({
      success: false,
      message: "freelancerId and rating are required",
    });
  }

  try {
    // 1. Validate reviewer (must exist and must have role_id = 1 or 2)
    const reviewerResult = await pool.query(
      "SELECT role_id FROM users WHERE id = $1 AND is_deleted = FALSE",
      [reviewerId]
    );
    if (reviewerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reviewer not found",
      });
    }
    const reviewerRole = reviewerResult.rows[0].role_id;
    if (![1, 2].includes(reviewerRole)) {
      return res.status(403).json({
        success: false,
        message: "Only Admins or Clients can rate freelancers",
      });
    }

    // 2. Validate freelancer (must exist and have role_id = 3)
    const freelancerResult = await pool.query(
      "SELECT role_id, rating_sum, rating_count FROM users WHERE id = $1 AND is_deleted = FALSE",
      [freelancerId]
    );
    if (freelancerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found",
      });
    }
    const freelancer = freelancerResult.rows[0];
    if (freelancer.role_id !== 3) {
      return res.status(403).json({
        success: false,
        message: "Target user is not a freelancer",
      });
    }

    // 3. Calculate new average rating
    const newSum = Number(freelancer.rating_sum) + Number(rating);
    const newCount = Number(freelancer.rating_count) + 1;
    const newAvg = (newSum / newCount).toFixed(2);

    // 4. Update freelancer record with new rating
    const updateResult = await pool.query(
      `UPDATE users 
       SET rating_sum = $1,
           rating_count = $2,
           rating = $3
       WHERE id = $4
       RETURNING id, first_name, last_name, rating, rating_count`,
      [newSum, newCount, newAvg, freelancerId]
    );

    return res.status(200).json({
      success: true,
      message: "Freelancer rated successfully",
      freelancer: updateResult.rows[0],
    });
  } catch (err) {
    console.error("Rating error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error during rating",
      error: err.message,
    });
  }
};
const getTopFreelancers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, country, username, rating, profile_pic_url 
       FROM users 
       WHERE role_id = 3 AND is_deleted = FALSE
       ORDER BY rating DESC
       LIMIT 10`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No freelancers found",
      });
    }

    res.status(200).json({
      success: true,
      freelancers: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching top freelancers",
      error: err.message,
    });
  }
};
export {
  register,
  login,
  viewUsers,
  deleteUser,
  editUser,
  createPortfolio,
  editPortfolioFreelancer,
  getAllFreelancers,
  deleteFreelancerById,
  listOnlineUsers,
  getUserById,

  rateFreelancer,
  getTopFreelancers,

};
