import axios from "axios";

// ----------------------
// Axios instance
// ----------------------
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// Add JWT token automatically if stored in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ----------------------
// BLOGS API FUNCTIONS
// ----------------------

// 🟢 Get blogs (public or with query params: page, limit, status, search, user_id)
export const getBlogs = async (params = {}) => {
  const res = await API.get("/blogs", { params });
  return res.data;
};

// 🟢 Get single blog by ID
export const getBlogById = async (id) => {
  const res = await API.get(`/blogs/${id}`);
  return res.data;
};

// 🟢 Create new blog (authenticated, supports cover & attachments)
export const createBlog = async (blogData) => {
  const formData = new FormData();
  for (const key in blogData) {
    if (key === "cover" && blogData.cover instanceof File) {
      formData.append("cover", blogData.cover);
    } else if (key === "attachments" && Array.isArray(blogData.attachments)) {
      blogData.attachments.forEach((file) => formData.append("attachments", file));
    } else if (Array.isArray(blogData[key])) {
      blogData[key].forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, blogData[key]);
    }
  }

  const res = await API.post("/blogs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🟡 Update blog (authenticated)
export const updateBlog = async (id, blogData) => {
  const formData = new FormData();
  for (const key in blogData) {
    if (key === "cover" && blogData.cover instanceof File) {
      formData.append("cover", blogData.cover);
    } else if (key === "attachments" && Array.isArray(blogData.attachments)) {
      blogData.attachments.forEach((file) => formData.append("attachments", file));
    } else if (Array.isArray(blogData[key])) {
      blogData[key].forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, blogData[key]);
    }
  }

  const res = await API.put(`/blogs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🔴 Delete blog (authenticated)
export const deleteBlog = async (id) => {
  const res = await API.delete(`/blogs/${id}`);
  return res.data;
};

// 🟢 Like a blog
export const likeBlog = async (id) => {
  const res = await API.post(`/blogs/${id}/like`);
  return res.data;
};

// 🟢 Save a blog (favorite)
export const saveBlog = async (id) => {
  const res = await API.post(`/blogs/${id}/save`);
  return res.data;
};

// 🟣 Approve blog (admin only)
export const approveBlog = async (id) => {
  const res = await API.put(`/blogs/${id}/approve`);
  return res.data;
};

// 🔵 Reject blog (admin only)
export const rejectBlog = async (id) => {
  const res = await API.put(`/blogs/${id}/reject`);
  return res.data;
};

// 🟡 Get blogs pending approval (admin only)
export const getPendingBlogs = async (params = {}) => {
  const res = await API.get("/blogs", { params: { ...params, status: "pending" } });
  return res.data;
};

// 🟢 Search blogs by keyword, category, or tags
export const searchBlogs = async (queryParams) => {
  const res = await API.get("/blogs", { params: queryParams });
  return res.data;
};
