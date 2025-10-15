// controller/category.js
import pool from "../models/db.js";
import fs from "fs";
import cloudinary from "../cloudinary/setupfile.js";


// ========== Get all active categories ==========
export const getCategories = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, image_url, related_words
       FROM categories
       WHERE is_deleted = false
       ORDER BY id ASC`
    );

    return res.json({
      success: true,
      categories: rows,
    });

    return res.json({ success: true, categories: rows });
  } catch (error) {
    console.error("getCategories error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========== Get single category by ID ==========
export const getCategoryById = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const { rows } = await pool.query(
      `SELECT id, name, description, image_url, related_words
       FROM categories
       WHERE id = $1 AND is_deleted = false`,
      [categoryId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.json({ success: true, category: rows[0] });
  } catch (error) {
    console.error("getCategoryById error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========== Get sub-categories by category ID ==========
export const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, name
       FROM sub_categories
       WHERE category_id = $1
       ORDER BY id ASC`,
      [categoryId]
    );

    return res.json({ success: true, subCategories: rows });
  } catch (error) {
    console.error("getSubCategories error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========== Get sub-sub-categories by main category ID ==========

export const getSubSubCategoriesByCategoryId = async (req, res) => {
  const { categoryId } = req.params; 

  try {
    const result = await pool.query(
      `SELECT 
        ssc.id AS sub_sub_category_id,
        ssc.name AS sub_sub_category_name,
        ssc.description AS sub_sub_category_description,
        sc.id AS sub_category_id,
        sc.name AS sub_category_name,
        c.id AS category_id,
        c.name AS category_name
      FROM sub_sub_categories ssc
      JOIN sub_categories sc ON ssc.sub_category_id = sc.id
      JOIN categories c ON sc.category_id = c.id
      WHERE c.name = $1
      ORDER BY sc.id, ssc.id;`,
      [categoryId]
    );

    // If no categories found
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found or has no sub-sub-categories",
      });
    }

    return res.status(200).json({
      success: true,
      subSubCategories: result.rows,
    });
  } catch (err) {
    console.error("getSubSubCategoriesByCategoryId error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========== Get sub-sub-categories by sub-category ID ==========
export const getSubSubCategoriesBySubId = async (req, res) => {
  const { subCategoryId } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        id AS sub_sub_category_id,
        name AS sub_sub_category_name,
        description AS sub_sub_category_description,
        sub_category_id
       FROM sub_sub_categories
       WHERE sub_category_id = $1
       ORDER BY id ASC;`,
      [subCategoryId]
    );

    return res.status(200).json({ success: true, subSubCategories: result.rows });
  } catch (err) {
    console.error("getSubSubCategoriesBySubId error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========== Create a new category ==========
export const createCategory = async (req, res) => {
  try {
    const { name, description, related_words, image_url } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const existing = await pool.query(
      `SELECT id FROM categories WHERE LOWER(name) = LOWER($1)`,
      [name.trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    let wordsArray = related_words;
    if (typeof related_words === "string") {
      wordsArray = related_words.split(",").map((w) => w.trim()).filter((w) => w !== "");
    }

    let finalImageUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "categories" });
      finalImageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    } else if (image_url) {
      const uploadResult = await cloudinary.uploader.upload(image_url, { folder: "categories" });
      finalImageUrl = uploadResult.secure_url;
    }

    const { rows } = await pool.query(
      `INSERT INTO categories (name, description, image_url, related_words)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, image_url, related_words`,
      [name.trim(), description || null, finalImageUrl, wordsArray || []]
    );

    return res.json({ success: true, message: "Category created successfully", category: rows[0] });
  } catch (error) {
    console.error("createCategory error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========== Update category ==========
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, related_words, image_url } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const existing = await pool.query(`SELECT id FROM categories WHERE id = $1 AND is_deleted = false`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    let wordsArray = related_words;
    if (typeof related_words === "string") {
      wordsArray = related_words.split(",").map((w) => w.trim()).filter((w) => w !== "");
    }

    let finalImageUrl = null;
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "categories" });
      finalImageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    } else if (image_url) {
      const uploadResult = await cloudinary.uploader.upload(image_url, { folder: "categories" });
      finalImageUrl = uploadResult.secure_url;
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name.trim()); }
    if (description !== undefined) { updates.push(`description = $${paramCount++}`); values.push(description); }
    if (finalImageUrl !== null) { updates.push(`image_url = $${paramCount++}`); values.push(finalImageUrl); }
    if (wordsArray !== undefined) { updates.push(`related_words = $${paramCount++}`); values.push(wordsArray); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);

    const { rows } = await pool.query(
      `UPDATE categories SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} AND is_deleted = false
       RETURNING id, name, description, image_url, related_words`,
      values
    );

    return res.json({ success: true, message: "Category updated successfully", category: rows[0] });
  } catch (error) {
    console.error("updateCategory error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========== Soft delete category ==========
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const { rows } = await pool.query(
      `UPDATE categories SET is_deleted = true
       WHERE id = $1 AND is_deleted = false
       RETURNING id, name`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found or already deleted" });
    }

    return res.json({ success: true, message: "Category deleted successfully", deletedCategory: rows[0] });
  } catch (error) {
    console.error("deleteCategory error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
