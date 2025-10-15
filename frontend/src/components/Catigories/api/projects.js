import axios from "axios";

export const fetchProjectsByCategory = async (categoryId) => {
  const { data } = await axios.get(`http://localhost:5000/projects/public/category/${categoryId}`);
  if (data.success) return data.projects;
  throw new Error(data.message || "Failed to fetch projects");
};

export const fetchProjectsBySubCategory = async (subCategoryId) => {
  const { data } = await axios.get(`http://localhost:5000/projects/public/subcategory/${subCategoryId}`);
  if (data.success) return data.projects;
  throw new Error(data.message || "Failed to fetch projects");
};

export const fetchProjectsBySubSubCategory = async (subSubCategoryId) => {
  try {
    const { data } = await axios.get(`http://localhost:5000/projects/public/subsubcategory/${subSubCategoryId}`);
    if (data.success) return data.projects;
    throw new Error(data.message || "Failed to fetch projects");
  } catch (err) {
    console.error("fetchProjectsBySubSubCategory error:", err);
    return [];
  }
};