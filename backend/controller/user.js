const pool = require("../models/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cron = require("node-cron");

const register = async (req, res) => {
  // Extract all required fields from request body
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

  // Validate that all fields are provided
  if (!role_id || !first_name || !last_name || !email || !password || !phone_number ||!country || !username) {
      return res.status(400).json({
          success: false,
          message: "All fields are required"
      });
  }
  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.SECRET)
  );

  // Normalize email to lowercase
  const Email = email.toLowerCase();

  // Insert the new user into the database
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
      const user = result.rows[0]

      // Determine user role name for logging
      const positionRole = user.role_id === 1 ? "Admin" : user.role_id === 2 ? "Client" : "Freelancer";
      
      // Create a clear log message
      const actionUser = `${user.first_name} ${user.last_name}, a ${positionRole} from ${user.country}, has registered successfully.`;
      await pool.query('INSERT INTO logs (user_id, action) VALUES ($1,$2)', [user.id, actionUser])
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: result.rows[0],
      });
    })
    .catch((err) => {

      // Handle email uniqueness constraint violation
      if (err.constraint === "users_email_key") {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      } else {
        // Handle any other server/database errors
        return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: err.message,
        });
      }
    });
};

const login = async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = $1";
  const data = [email.toLowerCase()];// normalize email to lowercase

  // Function to get client IP address
  function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
      ? forwarded.split(",")[0] // get the first IP in the list
      : req.connection.remoteAddress;
    return ip === "::1" ? "127.0.0.1" : ip; // handle localhost IPv6
  }

  try {
    // Check if the user exists
    const result = await pool.query(query, data);

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "The email desn't exist or the password you've entered is incorrect",
      });
    }

    const user = result.rows[0];

    // Compare entered password with hashed password in DB
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(403).json({
        success: false,
        message:
          "The email desn't exist or the password you've entered is incorrect",
      });
    }

    // Prepare JWT payload
    const payload = {
      userId: user.id,
      role: user.role_id,
    };

    const options = { expiresIn: "1d" };
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, options);

    // Check if token was generated successfully
    if (!token) {
      return res.status(500).json({
        success: false,
        message: "Token generation failed",
      });
    }

    // Get client's IP address
    const ipAddress = getClientIp(req);
    const ipAddressQuery =
      "INSERT INTO ip_adress (user_id, ip_address) VALUES ($1, $2)";
    const ipAddressData = [user.id, ipAddress];

    // Only log IPs for freelancers
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
    // Handle server or database errors
    console.error("Login error:", err.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: err.message,
    });
  }
};

const viewUsers = async (req, res) => {
  const {is_deleted} = req.body;
  

  try {
    let query = "SELECT * FROM users";
    let values = [];

    if (typeof is_deleted === "boolean") {
      query += " WHERE is_deleted = $1";
      values.push(is_deleted);
    }

    const result = await pool.query(query, values);
    
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
    // Get the user ID from route parameters
    const userId = req.params.id;

    // Update the user in the database to mark as deleted
    // RETURNING * returns the updated user
    const result = await pool.query(
      "UPDATE Users SET is_deleted = TRUE WHERE id = $1 RETURNING *",
      [userId]
    );

    // If no user was found, return 404
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Return success response with deleted user data
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: result.rows[0],
    });
  } catch (err) {
    // Handle any server or database errors
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: err.message,
    });
  }
};

const editUser = async (req, res) => {
  // Get the user ID from route parameters
  const { userId } = req.params;

  // Extract the fields to update from request body
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
    // Update the user in the database
    // COALESCE ensures that if a field is not provided, the existing value is kept
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
        email?.toLowerCase(),// normalize email to lowercase
        phone_number,
        country,
        username,
        role_id,
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

const createPortfolio = async (req, res) => {
  // Extract the required data from the request body
  const { freelancer_id, title, description, skills, hourly_rate, work_url } =
    req.body;
  // Validate required fields
  if (!freelancer_id || !title) {
    return res.status(400).json({
      success: false,
      message: "freelancer_id and title are required",
    });
  }

  try {
    // Insert the portfolio using a CTE (WITH inserted) to return the newly created row
    // Join with Users table to get freelancer information in the same query
    const result = await pool.query(
      "WITH inserted AS ( INSERT INTO Portfolios (freelancer_id, title, description, skills, hourly_rate, work_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *) SELECT i.*, u.first_name, u.last_name, u.email, u.country FROM inserted i JOIN Users u ON i.freelancer_id = u.id;",
      [freelancer_id, title, description, skills, hourly_rate, work_url]
    );

    // Get freelancer info associated with the new portfolio
    const user = result.rows[0];

    // Prepare a clear log message for activity tracking
    const actionUser = `${user.first_name} ${user.last_name}, a Freelancer from ${user.country}, has created a portfolio.`;

    // Insert the activity into the logs table
    await pool.query('INSERT INTO logs (user_id, action) VALUES ($1,$2)', [freelancer_id, actionUser])
    
    // Send response with the newly created portfolio data
    res.status(201).json({
      success: true,
      message: "Portfolio created successfully",
      portfolio: result.rows[0],
    });
  } catch (err) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Error creating portfolio",
      error: err.message,
    });
  }
};

const editPortfolioFreelancer = async (req, res) => {
    // Get freelancer's userId from the JWT token
  const { userId } = req.token;
  // Get portfolioId from route parameters
  const {portfolioId} = req.params
  // Get the fields to update from request body
  const { title, description, skills, hourly_rate, work_url } = req.body;
  try {
    // Update the portfolio using a CTE (WITH inserted) to return the updated row
    // Join with Users table to get freelancer info in the same query
    const result = await pool.query(
      `WITH inserted AS ( UPDATE Portfolios
       SET 
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         skills = COALESCE($3, skills),
         hourly_rate = COALESCE($4, hourly_rate),
         work_url = COALESCE($5, work_url)
       WHERE freelancer_id=$6 AND id=$7
       RETURNING *) SELECT i.*, u.first_name, u.last_name, u.email, u.country FROM inserted i JOIN Users u ON i.freelancer_id = u.id;`,
      [title, description, skills, hourly_rate, work_url, userId, portfolioId]
    );
    // If no portfolio found for this freelancer, return 404
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found for this freelancer",
      });
    }
    // Get updated portfolio + freelancer info
    const user = result.rows[0];

    // Prepare a clear log message
    const actionUser = `${user.first_name} ${user.last_name}, a Freelancer from ${user.country},  has updated a portfolio.`;

    // Insert log into logs table
    await pool.query('INSERT INTO logs (user_id, action) VALUES ($1,$2)', [userId, actionUser])
    // Send response with updated portfolio
    res.status(200).json({
      success: true,
      message: "Portfolio updated successfully",
      portfolio: result.rows[0],
    });
  } catch (err) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Error updating Portfolio",
      error: err.message,
    });
  }
};

const deactivateInactiveUsers = async () => {
  // SQL query to deactivate inactive clients
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
    // Execute the update query
    const result = await pool.query(query);

    // Log how many users were deactivated
    console.log(`Deactivated ${result.rowCount} inactive users.`);
  } catch (err) {
    // Handle any errors during the database operation
    console.error("Error deactivating inactive users:", err);
  }
};



// Schedule a cron job to run every day at 3 AM
// This will deactivate users who have been inactive
cron.schedule("0 3 * * *", () => {
  deactivateInactiveUsers(); // call the function to deactivate inactive users
  console.log("Ran deactivate Inactive Users at 3AM daily");
});

const getAllFreelancers = async (req, res) => {
  // Get filter value from request body and convert to lowercase
  // Default to empty string if not provided
  const filterValue = (req.body.filter || "").toLowerCase();
  // Define valid filter options
  const validFilters = ["active", "deactivated", "all"];
  if (!validFilters.includes(filterValue)) {
    // Return 400 if filter is invalid
    return res.status(400).json({
      success: false,
      message:
        "Invalid filter value. Must be 'active', 'deactivated', or 'all'.",
    });
  }
  // Base WHERE condition: only users with role_id = 3 (freelancers)
  let whereCondition = "users.role_id = 3";

  // Modify WHERE condition based on filter
  if (filterValue === "active") {
    whereCondition += " AND users.is_deleted = FALSE"; // only active freelancers
  } else if (filterValue === "deactivated") {
    whereCondition += " AND users.is_deleted = TRUE"; // only deactivated freelancers
  }
  // if filterValue === "all", no additional condition is needed

  // SQL query to fetch freelancer details
  const sqlQuery = ` SELECT users.id, users.first_name, users.last_name, users.email, COUNT(order_assignments.id) AS orders_count, COALESCE( json_agg(json_build_object('ip_address', ip_adress.ip_address)) FILTER (WHERE ip_adress.ip_address IS NOT NULL), '[]' ) AS ip_addresses FROM users LEFT JOIN ip_adress ON users.id = ip_adress.user_id LEFT JOIN order_assignments ON users.id = order_assignments.freelancer_id WHERE ${whereCondition} GROUP BY users.id, users.first_name, users.last_name, users.email;`;

  try {
    // Execute the query
    const result = await pool.query(sqlQuery);

    // If no freelancers found, return 404
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No freelancers found",
      });
    }
  // Return the list of freelancers with orders count and IP addresses
    return res.status(200).json({
      success: true,
      freelancers: result.rows,
    });
  } catch (err) {
    // Handle database errors
    return res.status(500).json({
      success: false,
      message: "Error fetching freelancers",
      error: err.message,
    });
  }
};

const deleteFreelancerById = async (req, res) => {

  // Get the freelancer ID from route parameters and the admin's user ID from the token
  const { freelancerid } = req.params;
  const { userId } = req.token;


  try {
    // Toggle the is_deleted flag for the freelancer (only if role_id = 3)
    const result = await pool.query(
      `UPDATE Users 
       SET is_deleted = NOT is_deleted 
       WHERE id = $1 AND role_id = 3 
       RETURNING *`,
      [freelancerid]
    );
    // Get the updated freelancer row
    const freelancer = result.rows[0];
    // If freelancer not found, return 404
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found",
      });
    }
    
    // Fetch admin's details for logging
    const adminResult = await pool.query(
      "SELECT first_name, last_name FROM Users WHERE id = $1",
      [userId]
    );
    const admin = adminResult.rows[0];
    // Determine the action type based on new is_deleted value
    const action = freelancer.is_deleted ? "deactivated" : "activated";
    // Prepare a clear log message
    const actionUser = `${admin.first_name} ${admin.last_name} (admin) has ${action} the account of ${freelancer.first_name} ${freelancer.last_name} (Freelancer).`;
    // Insert the log into the logs table
    await pool.query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [userId, actionUser]
    );
    
    // Send successful response
    res.status(200).json({
      success: true,
      message: `Freelancer ${action} successfully`,
      freelancer,
    });


  } catch (err) {
    // Handle any errors
    res.status(500).json({
      success: false,
      message: "Error toggling freelancer deletion status",
      error: err.message,
    });
  }
};

const listOnlineUsers = async (req, res) => {
  try {

    // Query the database for users where is_online is TRUE
    const result = await pool.query("SELECT * FROM users WHERE is_online = TRUE")

    // If no online users found, return a 404 response
    if(result.rows.length === 0){
      return res.status(404).json({
        success : true, // still true because request succeeded, just no data
        message : "No one is active"
      })
    }
    // Return the list of online users
    return res.status(200).json({
      success: true,
      message: "Active Users found",
      users: result.rows,
    });
  } catch (err) {
    // Handle any database or server errors
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
  listOnlineUsers,
  getUserById,
};
