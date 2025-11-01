// src/components/CreateProjects/api/category.js
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_APP_API_URL}/category`;

/* ================================
   MAIN CATEGORIES
================================ */
export const fetchCategories = async () => {
  const { data } = await axios.get(`${API_BASE}/`);
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch categories");
};

/* ================================
   SUB-CATEGORIES
================================ */
export const fetchSubCategoriesByCategoryId = async (categoryId) => {
  const { data } = await axios.get(`${API_BASE}/${categoryId}/sub-categories`);
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch sub-categories");
};

/* ================================
   SUB-SUB-CATEGORIES
================================ */
/**
 * Fetch all sub-sub-categories by sub-category ID
 */
export const fetchSubSubCategoriesBySubId = async (subCategoryId) => {
  const { data } = await axios.get(
    `${API_BASE}/sub-category/${subCategoryId}/sub-sub-categories`
  );
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch sub-sub-categories");
};


export const fetchSubSubCategoriesByCategoryId = fetchSubSubCategoriesBySubId;
