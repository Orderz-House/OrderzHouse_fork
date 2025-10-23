// controller/accessControl.js
import pool from "../models/db.js";

export const grantCourseAccess = async (req, res) => {
  try {
    const { freelancer_id, course_id, can_access } = req.body;
    
    if (!freelancer_id || !course_id || can_access === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "freelancer_id, course_id, and can_access are required" 
      });
    }

    const freelancerCheck = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND role = 'freelancer'",
      [freelancer_id]
    );
    if (freelancerCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Freelancer not found" 
      });
    }

    const courseCheck = await pool.query(
      "SELECT * FROM courses WHERE id = $1 AND is_deleted = FALSE",
      [course_id]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    const existingAccess = await pool.query(
      "SELECT * FROM course_access WHERE freelancer_id = $1 AND course_id = $2",
      [freelancer_id, course_id]
    );

    if (existingAccess.rows.length > 0) {
      await pool.query(
        "UPDATE course_access SET can_access = $1, updated_at = CURRENT_TIMESTAMP WHERE freelancer_id = $2 AND course_id = $3",
        [can_access, freelancer_id, course_id]
      );
    } else {
      await pool.query(
        "INSERT INTO course_access (freelancer_id, course_id, can_access, granted_by) VALUES ($1, $2, $3, $4)",
        [freelancer_id, course_id, can_access, req.token.userId]
      );
    }

    return res.status(200).json({ 
      success: true, 
      message: can_access ? "Access granted successfully" : "Access revoked successfully",
      access: {
        freelancer_id,
        course_id,
        can_access
      }
    });
  } catch (error) {
    console.error("Error granting course access:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const getAllAccessControl = async (req, res) => {
  try {
    const query = `
      SELECT 
        ca.id,
        ca.freelancer_id,
        ca.course_id,
        ca.can_access,
        ca.granted_at,
        ca.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        c.title as course_title,
        c.description as course_description
      FROM course_access ca
      LEFT JOIN users u ON ca.freelancer_id = u.id
      LEFT JOIN courses c ON ca.course_id = c.id
      ORDER BY ca.granted_at DESC
    `;
    const { rows } = await pool.query(query);
    
    const accessControl = {};
    rows.forEach(row => {
      if (!accessControl[row.freelancer_id]) {
        accessControl[row.freelancer_id] = {};
      }
      accessControl[row.freelancer_id][row.course_id] = row.can_access;
    });

    return res.status(200).json({ 
      success: true, 
      accessControl,
      allRecords: rows
    });
  } catch (error) {
    console.error("Error fetching access control:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const getFreelancerAccess = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    
    const query = `
      SELECT 
        ca.course_id,
        ca.can_access,
        ca.granted_at,
        c.title as course_title,
        c.description as course_description,
        c.price
      FROM course_access ca
      LEFT JOIN courses c ON ca.course_id = c.id
      WHERE ca.freelancer_id = $1
      ORDER BY ca.granted_at DESC
    `;
    const { rows } = await pool.query(query, [freelancerId]);
    
    const access = {};
    rows.forEach(row => {
      access[row.course_id] = row.can_access;
    });

    return res.status(200).json({ 
      success: true, 
      access,
      details: rows
    });
  } catch (error) {
    console.error("Error fetching freelancer access:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const getCourseAccessList = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const query = `
      SELECT 
        u.id as freelancer_id,
        u.first_name,
        u.last_name,
        u.email,
        COALESCE(ca.can_access, FALSE) as can_access
      FROM users u
      LEFT JOIN course_access ca ON u.id = ca.freelancer_id AND ca.course_id = $1
      WHERE u.role = 'freelancer'
      ORDER BY u.first_name, u.last_name
    `;
    const { rows } = await pool.query(query, [courseId]);

    return res.status(200).json({ 
      success: true, 
      freelancers: rows
    });
  } catch (error) {
    console.error("Error fetching course access list:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};