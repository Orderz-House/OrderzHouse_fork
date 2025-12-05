import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Admin Role 4 API functions

// Get all projects for admin dashboard
export const getAllProjects = async () => {
  try {
    const response = await api.get("/projects/admin/projects");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch projects");
  }
};

// Get all freelancers
export const getAllFreelancers = async () => {
  try {
    const response = await api.get("/projects/admin/freelancers");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch freelancers");
  }
};

// Create admin project
export const createAdminProject = async (projectData) => {
  try {
    const response = await api.post("/projects/admin", projectData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create project");
  }
};

// Get project details
export const getProjectDetails = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch project details");
  }
};

// Reassign freelancer to project
export const reassignFreelancer = async (projectId, freelancerId) => {
  try {
    const response = await api.put(`/projects/admin/projects/${projectId}/reassign`, {
      freelancerId,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reassign freelancer");
  }
};

export default api;