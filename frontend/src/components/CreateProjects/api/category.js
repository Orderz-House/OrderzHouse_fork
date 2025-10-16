import axios from "axios";

const API_BASE = "http://localhost:5000/category";

// Get all categories
export const fetchCategories = async () => {
  const { data } = await axios.get(`${API_BASE}/`);
  if (data.success) return data.categories;
  throw new Error(data.message || "Failed to fetch categories");
};

// Get sub-sub-categories by category ID
export const fetchSubSubCategoriesByCategoryId = async (categoryId) => {
  const { data } = await axios.get(`${API_BASE}/${categoryId}/sub-sub-categories`);
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch sub-sub-categories");
};
