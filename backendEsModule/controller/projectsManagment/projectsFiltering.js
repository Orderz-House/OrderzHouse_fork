import pool from "../../models/db.js";

/**
 * Helper to build the status condition dynamically
 * based on project_type and status logic
 */
const buildStatusCondition = () => {
  return `
    AND p.is_deleted = false
    AND (
      (p.project_type IN ('fixed', 'hourly') AND p.status = 'active')
      OR (p.status = 'bidding')
    )
  `;
};

/**
 * ✅ Get projects by main category
 */
export const getProjectsByCategory = async (req, res) => {
  const { category_id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        p.*, 
        c.name AS category_name,
        sc.name AS sub_category_name,
        ssc.name AS sub_sub_category_name
      FROM projects p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id
      WHERE p.category_id = $1
      ${buildStatusCondition()}
      ORDER BY p.created_at DESC
      `,
      [category_id]
    );

    res.status(200).json({ success: true, projects: rows });
  } catch (error) {
    console.error("Error fetching projects by category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ✅ Get projects by sub-category
 */
export const getProjectsBySubCategory = async (req, res) => {
  const { sub_category_id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        p.*, 
        sc.name AS sub_category_name,
        c.name AS category_name,
        ssc.name AS sub_sub_category_name
      FROM projects p
      JOIN sub_categories sc ON p.sub_category_id = sc.id
      JOIN categories c ON sc.category_id = c.id
      LEFT JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id
      WHERE p.sub_category_id = $1
      ${buildStatusCondition()}
      ORDER BY p.created_at DESC
      `,
      [sub_category_id]
    );

    res.status(200).json({ success: true, projects: rows });
  } catch (error) {
    console.error("Error fetching projects by sub-category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ✅ Get projects by sub-sub-category
 */
export const getProjectsBySubSubCategory = async (req, res) => {
  const { sub_sub_category_id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        p.*, 
        ssc.name AS sub_sub_category_name,
        sc.name AS sub_category_name,
        c.name AS category_name
      FROM projects p
      JOIN sub_sub_categories ssc ON p.sub_sub_category_id = ssc.id
      JOIN sub_categories sc ON ssc.sub_category_id = sc.id
      JOIN categories c ON sc.category_id = c.id
      WHERE p.sub_sub_category_id = $1
      ${buildStatusCondition()}
      ORDER BY p.created_at DESC
      `,
      [sub_sub_category_id]
    );

    res.status(200).json({ success: true, projects: rows });
  } catch (error) {
    console.error("Error fetching projects by sub-sub-category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//public 

export const getProjectsBySubCategoryId = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    // Validate
    if (!subCategoryId || isNaN(subCategoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subcategory ID" });
    }

    const result = await pool.query(
      `
      SELECT 
        p.*, 
        u.username AS client_username, 
        c.name AS category_name,
        sc.name AS sub_category_name
      FROM projects p
      JOIN users u ON u.id = p.user_id
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      WHERE p.sub_category_id = $1 
        AND p.is_deleted = false
      ORDER BY p.created_at DESC;
      `,
      [subCategoryId]
    );

    return res.json({
      success: true,
      projects: result.rows,
    });
  } catch (error) {
    console.error("getProjectsBySubCategoryId error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};
export const getProjectsBySubSubCategoryId = async (req, res) => {
  try {
    const { subSubCategoryId } = req.params;

    if (!subSubCategoryId || isNaN(subSubCategoryId)) {
      return res.status(400).json({ success: false, message: "Invalid sub-subcategory ID" });
    }

    const { rows } = await pool.query(`
      SELECT 
        p.*,
        u.username AS client_username,
        c.name AS category_name,
        sc.name AS sub_category_name,
        ssc.name AS sub_sub_category_name
      FROM projects p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN sub_categories sc ON sc.id = p.sub_category_id
      LEFT JOIN sub_sub_categories ssc ON ssc.id = p.sub_sub_category_id
      WHERE p.sub_sub_category_id = $1 AND p.is_deleted = false
      ORDER BY p.created_at DESC;
    `, [subSubCategoryId]);

    return res.json({ success: true, projects: rows });
  } catch (err) {
    console.error("getProjectsBySubSubCategoryId error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getPublicCategories = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name FROM categories WHERE is_active = true ORDER BY name`
    );
    res.json({ success: true, categories: rows });
  } catch (error) {
    console.error("getPublicCategories error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProjectsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId || isNaN(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    const result = await pool.query(
      `
      SELECT p.*, u.username AS client_username, c.name AS category_name
      FROM projects p
      JOIN users u ON u.id = p.user_id
      JOIN categories c ON c.id = p.category_id
      WHERE p.category_id = $1 AND p.is_deleted = false
      ORDER BY p.created_at DESC
      `,
      [categoryId]
    );

    return res.json({
      success: true,
      projects: result.rows,
    });
  } catch (error) {
    console.error("getProjectsByCategoryId error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
}