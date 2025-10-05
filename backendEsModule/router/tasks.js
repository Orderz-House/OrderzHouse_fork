import pool from "../db.js"; // Assuming you have a db connection pool exported

// --- GET Freelancer's Own Tasks ---
export const getFreelancerTasks = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    // This query JOINS tasks with users to get freelancer details
    const query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.price,
        t.freelancer_id,
        CONCAT(u.first_name, ' ', u.last_name) AS freelancer_name,
        u.avatar_url AS freelancer_avatar
      FROM 
        tasks AS t
      JOIN 
        users AS u ON t.freelancer_id = u.id
      WHERE 
        t.freelancer_id = $1
      ORDER BY
        t.created_at DESC;
    `;

    const result = await pool.query(query, [freelancerId]);

    res.status(200).json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("Error in getFreelancerTasks:", err);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

// --- GET Other Freelancers' Tasks (Task Pool) ---
export const getTaskPool = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    // This query is similar but excludes the current freelancer's tasks
    const query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.price,
        t.freelancer_id,
        CONCAT(u.first_name, ' ', u.last_name) AS freelancer_name,
        u.avatar_url AS freelancer_avatar
      FROM 
        tasks AS t
      JOIN 
        users AS u ON t.freelancer_id = u.id
      WHERE 
        t.freelancer_id != $1
      ORDER BY
        t.created_at DESC;
    `;

    const result = await pool.query(query, [freelancerId]);

    res.status(200).json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("Error in getTaskPool:", err);
    res.status(500).json({ success: false, message: "Failed to fetch task pool" });
  }
};

// --- CRUD Functions (assuming they are already working) ---

export const createTask = async (req, res) => {
  try {
    const { title, description, price, freelancerId } = req.body;

    // Basic validation
    if (!title || !description || !price || !freelancerId) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const query = `
      INSERT INTO tasks (title, description, price, freelancer_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const result = await pool.query(query, [title, description, price, freelancerId]);
    const newTask = result.rows[0];

    // Fetch the newly created task with freelancer data to return to the frontend
    const getNewTaskQuery = `
      SELECT 
        t.*,
        CONCAT(u.first_name, ' ', u.last_name) AS freelancer_name,
        u.avatar_url AS freelancer_avatar
      FROM tasks t
      JOIN users u ON t.freelancer_id = u.id
      WHERE t.id = $1;
    `;
    const finalResult = await pool.query(getNewTaskQuery, [newTask.id]);

    res.status(201).json({ success: true, task: finalResult.rows[0] });
  } catch (err) {
    console.error("Error in createTask:", err);
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

export const updateTask = async (req, res) => {
  // Add your update logic here
  // Remember to return the updated task with freelancer data
  res.status(501).send("Not Implemented");
};

export const deleteTask = async (req, res) => {
  // Add your delete logic here
  res.status(501).send("Not Implemented");
};
