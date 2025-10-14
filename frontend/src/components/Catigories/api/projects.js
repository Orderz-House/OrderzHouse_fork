import axios from "axios";

export const fetchProjectsByCategory = async (categoryId) => {
  const { data } = await axios.get(`http://localhost:5000/projects/category/${categoryId}`);
  if (data.success) return data.projects;
  throw new Error(data.message || "Failed to fetch projects");
};

export const fetchProjectsBySubCategory = async (subCategoryId) => {
  const { data } = await axios.get(`http://localhost:5000/projects/sub-category/${subCategoryId}`);
  if (data.success) return data.projects;
  throw new Error(data.message || "Failed to fetch projects");
};

export const fetchProjectsBySubSubCategory = async (subSubCategoryId) => {
  const { data } = await axios.get(`http://localhost:5000/projects/sub-sub-category/${subSubCategoryId}`);
  if (data.success) return data.projects;
  throw new Error(data.message || "Failed to fetch projects");
};
