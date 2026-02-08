import API from "./axios.js";

// Admin Role 4 API functions

// Get all projects for admin dashboard
export const getAllProjects = async () => {
  try {
    const response = await API.get("/projects/admin/projects");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch projects");
  }
};

// Get all freelancers
export const getAllFreelancers = async () => {
  try {
    const response = await API.get("/projects/admin/freelancers");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch freelancers");
  }
};

// Create admin project
export const createAdminProject = async (projectData) => {
  try {
    const response = await API.post("/projects/admin", projectData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create project");
  }
};

// Get project details
export const getProjectDetails = async (projectId) => {
  try {
    const response = await API.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch project details");
  }
};

// Reassign freelancer to project
export const reassignFreelancer = async (projectId, freelancerId) => {
  try {
    const response = await API.put(`/projects/admin/projects/${projectId}/reassign`, {
      freelancerId,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reassign freelancer");
  }
};

export default API;