import pool from "../models/db.js";
import fs from "fs";
import cloudinary from "../cloudinary/setupfile.js";


//  list categories
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
  } catch (error) {
    console.error("getCategories error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};


//  list sub categories by category id (not used currently)
export const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, name FROM sub_categories WHERE category_id = $1 ORDER BY id ASC`,
      [categoryId]
    );
    return res.json({ success: true, subCategories: rows });
  } catch (error) {
    console.error("getSubCategories error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
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
      WHERE c.id = $1
      ORDER BY sc.id, ssc.id;`,
      [categoryId]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Create a new category

export const createCategory = async (req, res) => {
  try {
    const { name, description, related_words, image_url } = req.body;

    if (!name?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    const existing = await pool.query(
      `SELECT id FROM categories WHERE LOWER(name) = LOWER($1)`,
      [name.trim()]
    );
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    let wordsArray = related_words;
    if (typeof related_words === "string") {
      wordsArray = related_words
        .split(",")
        .map((w) => w.trim())
        .filter((w) => w !== "");
    }

    let finalImageUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
      });
      finalImageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }
    else if (image_url) {
      const uploadResult = await cloudinary.uploader.upload(image_url, {
        folder: "categories",
      });
      finalImageUrl = uploadResult.secure_url;
    }

    const { rows } = await pool.query(
      `
      INSERT INTO categories (name, description, image_url, related_words)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, image_url, related_words
      `,
      [name.trim(), description || null, finalImageUrl, wordsArray || []]
    );

    return res.json({
      success: true,
      message: "Category created successfully",
      category: rows[0],
    });
  } catch (error) {
    console.error("createCategory error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};