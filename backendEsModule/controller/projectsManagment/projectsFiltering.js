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
