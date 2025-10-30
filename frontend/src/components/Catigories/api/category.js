import axios from "axios";

const API_BASE = "https://backend.thi8ah.com/category";

export const fetchCategories = async () => {
  const { data } = await axios.get(`${API_BASE}/`);
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch categories");
};

export const fetchCategoryById = async (id) => {
  const { data } = await axios.get(`${API_BASE}/${id}`);
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch category");
};

export const fetchSubCategoriesByCategoryId = async (categoryId) => {
  const { data } = await axios.get(`${API_BASE}/${categoryId}/sub-categories`);
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch sub-categories");
};

export const fetchSubSubCategoriesByCategoryId = async (categoryId) => {
  const { data } = await axios.get(
    `${API_BASE}/sub-category/${categoryId}/sub-sub-categories`
  );
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch sub-sub-categories");
};

export const fetchSubSubCategoriesBySubId = async (subCategoryId) => {
  const { data } = await axios.get(
    `${API_BASE}/sub-category/${subCategoryId}/sub-sub-categories`
  );
  if (data.success) return data.data;
  throw new Error(
    data.message || "Failed to fetch sub-sub-categories by sub-category"
  );
};
