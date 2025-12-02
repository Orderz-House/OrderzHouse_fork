import axios from "axios";

const API = axios.create({ baseURL: `${import.meta.env.VITE_APP_API_URL}/tasks` });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

/* ============================== ADMIN ============================== */
export const getAllTasksForAdmin = () => API.get("/admin");
export const approveTaskByAdmin = (id, status) => API.put(`/admin/${id}/status`, { status });
export const confirmPaymentByAdmin = (id) => API.put(`/admin/payment/${id}/confirm`);

/* ============================== FREELANCER ============================== */
export const createTask = (data) =>
  API.post("/freelancer", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateTask = (id, data) => API.put(`/freelancer/${id}`, data);
export const deleteTask = (id) => API.delete(`/freelancer/${id}`);
export const updateTaskRequestStatus = (requestId, status) =>
  API.put(`/freelancer/requests/${requestId}/status`, { status });
export const submitWorkCompletion = (id, data) =>
  API.post(`/freelancer/requests/${id}/submit`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const resubmitWorkCompletion = (id, data) =>
  API.post(`/freelancer/requests/${id}/resubmit`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateTaskKanbanStatus = (id, status) => API.put(`/freelancer/${id}/kanban`, { status });
export const getFreelancerCreatedTasks = () => API.get("/freelancer/my-tasks");
export const getTaskRequests = () => API.get("/freelancer/requests");
export const getAssignedTasks = () => API.get("/freelancer/assigned");

/* ============================== CLIENT ============================== */
export const requestTask = (id, data) =>
  API.post(`/client/request/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const submitPaymentProof = (id, data) =>
  API.post(`/client/payment/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const approveWorkCompletion = (id, data) =>
  API.post(`/client/approve/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const createReview = (id, data) => API.post(`/client/review/${id}`, data);

/* ============================== PUBLIC & SHARED ============================== */
export const getTaskPool = (category) =>
  API.get(`/pool${category ? `?category=${category}` : ""}`);
export const getTaskById = (id) => API.get(`/${id}`);
export const addTaskFiles = (id, data) =>
  API.post(`/files/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });

/* ============================== CATEGORY HIERARCHY ============================== */
export const getCategories = () => API.get("/category");

// ✅ Get sub-categories by main category ID
export const getSubCategoriesByCategoryId = (categoryId) =>
  API.get(`/categories/${categoryId}/sub-categories`);

// ✅ Get sub-sub-categories by main category ID
export const getSubSubCategoriesByCategoryId = (categoryId) =>
  API.get(`/categories/${categoryId}/sub-sub-categories`);

// ✅ Get sub-sub-categories by sub-category ID
export const getSubSubCategoriesBySubCategoryId = (subCategoryId) =>
  API.get(`/categories/sub-category/${subCategoryId}/sub-sub-categories`);
