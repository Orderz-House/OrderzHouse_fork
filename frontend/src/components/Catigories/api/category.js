import axios from "axios";

const API_BASE = "http://localhost:5000/category";

// Get all categories
export const fetchCategories = async () => {
  const { data } = await axios.get(`${API_BASE}/`);
  if (data.success) return data.categories;
  throw new Error(data.message || "Failed to fetch categories");
};

// Get category by ID
export const fetchCategoryById = async (id) => {
  const { data } = await axios.get(`${API_BASE}/${id}`);
  if (data.success) return data.category;
  throw new Error(data.message || "Failed to fetch category");
};

// Get sub-categories by category ID
export const fetchSubCategoriesByCategoryId = async (categoryId) => {
  const { data } = await axios.get(`${API_BASE}/${categoryId}/sub-categories`);
  if (data.success) return data.subCategories;
  throw new Error(data.message || "Failed to fetch sub-categories");
};

// Get sub-sub-categories by category ID
export const fetchSubSubCategoriesByCategoryId = async (categoryId) => {
  const { data } = await axios.get(`${API_BASE}/${categoryId}/sub-sub-categories`);
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch sub-sub-categories");
};

// Get sub-sub-categories by sub-category ID
export const fetchSubSubCategoriesBySubId = async (subCategoryId) => {
  const { data } = await axios.get(`${API_BASE}/sub-category/${subCategoryId}/sub-sub-categories`);
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch sub-sub-categories by sub-category");
};
