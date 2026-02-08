import API from "./axios.js";

// ----------------------
// BLOGS API FUNCTIONS
// ----------------------

export const getBlogs = async (params = {}) => {
  const res = await API.get("/blogs", { params });
  return res.data;
};

export const getBlogById = async (id) => {
  const res = await API.get(`/blogs/${id}`);
  return res.data;
};

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

export const deleteBlog = async (id) => {
  const res = await API.delete(`/blogs/${id}`);
  return res.data;
};

export const likeBlog = async (id) => {
  const res = await API.post(`/blogs/${id}/like`);
  return res.data;
};

export const saveBlog = async (id) => {
  const res = await API.post(`/blogs/${id}/save`);
  return res.data;
};

export const approveBlog = async (id) => {
  const res = await API.put(`/blogs/${id}/approve`);
  return res.data;
};

export const rejectBlog = async (id) => {
  const res = await API.put(`/blogs/${id}/reject`);
  return res.data;
};

export const getPendingBlogs = async (params = {}) => {
  const res = await API.get("/blogs", { params: { ...params, status: "pending" } });
  return res.data;
};

export const searchBlogs = async (queryParams) => {
  const res = await API.get("/blogs", { params: queryParams });
  return res.data;
};
