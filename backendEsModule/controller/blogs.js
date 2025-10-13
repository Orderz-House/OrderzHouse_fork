import pool from "../models/db.js";

// Get all blogs with filters and pagination
export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'approved', search = '', user_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, user_id, fullname_user, title, description, 
             status, attachments, created_at, updated_at, likes_counter, saved_to_fav
      FROM blogs
      WHERE is_deleted = false
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    if (user_id) {
      params.push(user_id);
      query += ` AND user_id = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const { rows } = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM blogs WHERE is_deleted = false';
    const countParams = [];

    if (status) {
      countParams.push(status);
      countQuery += ` AND status = $${countParams.length}`;
    }

    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (title ILIKE $${countParams.length} OR description ILIKE $${countParams.length})`;
    }

    if (user_id) {
      countParams.push(user_id);
      countQuery += ` AND user_id = $${countParams.length}`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT id, user_id, fullname_user, title, description, 
              status, attachments, created_at, updated_at, likes_counter, saved_to_fav
       FROM blogs
       WHERE id = $1 AND is_deleted = false`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new blog
export const createBlog = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.token.userId;
    const fullname = req.token.fullname; // Assuming fullname is in token

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const { rows } = await pool.query(
      `INSERT INTO blogs (user_id, fullname_user, title, description, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id, title, created_at`,
      [userId, fullname, title, description]
    );

    res.status(201).json({
      success: true,
      message: "Blog created successfully. Awaiting approval.",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, attachments } = req.body;
    const userId = req.token.userId;

    const { rows } = await pool.query(
      `SELECT user_id, status FROM blogs WHERE id = $1 AND is_deleted = false`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this blog" });
    }

    if (rows[0].status === 'approved') {
      return res.status(400).json({ success: false, message: "Cannot update an approved blog" });
    }

    const updateFields = [];
    const params = [];
    let paramIndex = 2;

    if (title) {
      updateFields.push(`title = $${paramIndex}`);
      params.push(title);
      paramIndex++;
    }
    if (description) {
      updateFields.push(`description = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }
    if (attachments) {
      updateFields.push(`attachments = $${paramIndex}`);
      params.push(JSON.stringify(attachments));
      paramIndex++;
    }

    params.unshift(id); // Add ID as first parameter

    if (updateFields.length > 0) {
      const query = `UPDATE blogs SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`;
      await pool.query(query, params);
    }

    res.json({ success: true, message: "Blog updated successfully" });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.token.userId;

    const { rows } = await pool.query(
      `SELECT user_id, status FROM blogs WHERE id = $1 AND is_deleted = false`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this blog" });
    }

    await pool.query(`UPDATE blogs SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Approve a blog (Admin only)
export const approveBlog = async (req, res) => {
  try {
    const { id } = req.params;
    // Assuming admin authorization is handled by middleware

    const { rows } = await pool.query(
      `SELECT id FROM blogs WHERE id = $1 AND is_deleted = false`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    await pool.query(`UPDATE blogs SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);

    res.json({ success: true, message: "Blog approved successfully" });
  } catch (error) {
    console.error("Error approving blog:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reject a blog (Admin only)
export const rejectBlog = async (req, res) => {
  try {
    const { id } = req.params;
    // Assuming admin authorization is handled by middleware

    const { rows } = await pool.query(
      `SELECT id FROM blogs WHERE id = $1 AND is_deleted = false`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    await pool.query(`UPDATE blogs SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);

    res.json({ success: true, message: "Blog rejected successfully" });
  } catch (error) {
    console.error("Error rejecting blog:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Like a blog
export const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.token.userId;

    const { rows } = await pool.query(
      `SELECT id, likes_counter FROM blogs WHERE id = $1 AND is_deleted = false AND status = 'approved'`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found or not approved" });
    }

    // Check if user already liked (simplified - in real app, use a separate table)
    // For simplicity, just incrementing counter
    const newCounter = rows[0].likes_counter + 1;
    await pool.query(`UPDATE blogs SET likes_counter = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [newCounter, id]);

    res.json({ success: true, message: "Blog liked successfully", likes: newCounter });
  } catch (error) {
    console.error("Error liking blog:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Save a blog to favorites
export const saveBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.token.userId;

    const { rows } = await pool.query(
      `SELECT id, saved_to_fav FROM blogs WHERE id = $1 AND is_deleted = false AND status = 'approved'`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found or not approved" });
    }

    // Check if user already saved (simplified - in real app, use a separate table)
    // For simplicity, just incrementing counter
    const newCounter = rows[0].saved_to_fav + 1;
    await pool.query(`UPDATE blogs SET saved_to_fav = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [newCounter, id]);

    res.json({ success: true, message: "Blog saved successfully", saved: newCounter });
  } catch (error) {
    console.error("Error saving blog:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};