import API from "./axios";

// ----------------------
// MAIN CATEGORIES
// ----------------------
export const getCategories = () => API.get("/category");
export const getCategoryById = (id) => API.get(`/category/${id}`);
export const createCategory = (data) => API.post("/category", data);
export const updateCategory = (id, data) => API.put(`/category/${id}`, data);
export const deleteCategory = (id) => API.delete(`/category/${id}`);

// ----------------------
// SUB-CATEGORIES
// ----------------------
export const getSubCategories = (categoryId) =>
  API.get(`/category/${categoryId}/sub-categories`);

export const createSubCategory = (categoryId, data) =>
  API.post(`/category/${categoryId}/sub-categories`, data);

export const updateSubCategory = (categoryId, id, data) =>
  API.put(`/category/${categoryId}/sub-categories/${id}`, data);

export const deleteSubCategory = (categoryId, id) =>
  API.delete(`/category/${categoryId}/sub-categories/${id}`);

// ----------------------
// SUB-SUB-CATEGORIES
// ----------------------
export const getSubSubCategories = (subCategoryId) =>
  API.get(`/category/sub-category/${subCategoryId}/sub-sub-categories`);

export const createSubSubCategory = (subCategoryId, data) =>
  API.post(`/category/sub-category/${subCategoryId}/sub-sub-categories`, data);

export const updateSubSubCategory = (subCategoryId, id, data) =>
  API.put(`/category/sub-category/${subCategoryId}/sub-sub-categories/${id}`, data);

export const deleteSubSubCategory = (subCategoryId, id) =>
  API.delete(`/category/sub-category/${subCategoryId}/sub-sub-categories/${id}`);
