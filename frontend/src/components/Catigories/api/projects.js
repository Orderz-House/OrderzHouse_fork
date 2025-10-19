import axios from "axios";
import store from "../../../store/store";

const API_BASE = "http://localhost:5000/projects";


const getAuthHeaders = () => {
  const token =
    store?.getState()?.auth?.token || localStorage.getItem("token") || null;

  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

/* ==============================
   🔒 Authenticated (Token Required)
   ============================== */

export const fetchAuthProjectsByCategory = async (categoryId) => {
  try {
    const { data } = await axios.get(
      `${API_BASE}/category/${categoryId}`,
      getAuthHeaders()
    );
    if (data.success) return data.projects;
    throw new Error(data.message || "Failed to fetch projects");
  } catch (err) {
    console.error("fetchAuthProjectsByCategory error:", err);
    return [];
  }
};

export const fetchAuthProjectsBySubCategory = async (subCategoryId) => {
  try {
    const { data } = await axios.get(
      `${API_BASE}/sub-category/${subCategoryId}`,
      getAuthHeaders()
    );
    if (data.success) return data.projects;
    throw new Error(data.message || "Failed to fetch projects");
  } catch (err) {
    console.error("fetchAuthProjectsBySubCategory error:", err);
    return [];
  }
};

export const fetchAuthProjectsBySubSubCategory = async (subSubCategoryId) => {
  try {
    const { data } = await axios.get(
      `${API_BASE}/sub-sub-category/${subSubCategoryId}`,
      getAuthHeaders()
    );
    if (data.success) return data.projects;
    throw new Error(data.message || "Failed to fetch projects");
  } catch (err) {
    console.error("fetchAuthProjectsBySubSubCategory error:", err);
    return [];
  }
};

/* ==============================
   🌍 Public (No Auth)
   ============================== */

export const fetchProjectsByCategory = async (categoryId) => {
  const { data } = await axios.get(`${API_BASE}/public/category/${categoryId}`);
  if (data.success) return data.projects;
  throw new Error(data.message || "Failed to fetch projects");
};

export const fetchProjectsBySubCategory = async (subCategoryId) => {
  const { data } = await axios.get(
    `${API_BASE}/public/subcategory/${subCategoryId}`
  );
  if (data.success) return data.projects;
  throw new Error(data.message || "Failed to fetch projects");
};

export const fetchProjectsBySubSubCategory = async (subSubCategoryId) => {
  try {
    const { data } = await axios.get(
      `${API_BASE}/public/subsubcategory/${subSubCategoryId}`
    );
    if (data.success) return data.projects;
    throw new Error(data.message || "Failed to fetch projects");
  } catch (err) {
    console.error("fetchProjectsBySubSubCategory error:", err);
    return [];
  }
};

/* ==============================
   🧠 Auto Selector
   Chooses Auth or Public Automatically
   ============================== */

export const fetchProjectsByCategoryAuto = async (categoryId) => {
  const token =
    store?.getState()?.auth?.token || localStorage.getItem("token");
  return token
    ? fetchAuthProjectsByCategory(categoryId)
    : fetchProjectsByCategory(categoryId);
};

export const fetchProjectsBySubCategoryAuto = async (subCategoryId) => {
  const token =
    store?.getState()?.auth?.token || localStorage.getItem("token");
  return token
    ? fetchAuthProjectsBySubCategory(subCategoryId)
    : fetchProjectsBySubCategory(subCategoryId);
};

export const fetchProjectsBySubSubCategoryAuto = async (subSubCategoryId) => {
  const token =
    store?.getState()?.auth?.token || localStorage.getItem("token");
  return token
    ? fetchAuthProjectsBySubSubCategory(subSubCategoryId)
    : fetchProjectsBySubSubCategory(subSubCategoryId);
};
