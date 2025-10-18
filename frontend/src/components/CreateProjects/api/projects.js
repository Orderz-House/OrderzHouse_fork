import axios from "axios";
import { store } from "../../../store/store";

const API_BASE = "http://localhost:5000/projects";

// Utility to get token from Redux
const getAuthToken = () => {
  const state = store.getState();
  if (!state.auth?.token) throw new Error("No auth token found");
  return state.auth.token;
};

// -------------------- CREATE PROJECT --------------------
export const createProjectApi = async (formData) => {
  const token = getAuthToken();
  const { data } = await axios.post(`${API_BASE}/`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!data.success) throw new Error(data.message || "Failed to create project");
  return data.project;
};

// -------------------- UPLOAD PROJECT FILES --------------------
export const uploadProjectFilesApi = async (projectId, files) => {
  const token = getAuthToken();
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const { data } = await axios.post(`${API_BASE}/${projectId}/files`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (data.success) return data.files;
  throw new Error(data.message || "Failed to upload files");
};

// -------------------- FETCH RELATED FREELANCERS --------------------
export const fetchRelatedFreelancersApi = async (categoryId) => {
  if (!categoryId) throw new Error("Missing categoryId");
  const token = getAuthToken();

  const { data } = await axios.get(
    `${API_BASE}/categories/${categoryId}/related-freelancers`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (data.success) return data.freelancers;
  throw new Error(data.message || "Failed to fetch freelancers");
};

// -------------------- ASSIGN FREELANCER --------------------
export const assignFreelancerApi = async (projectId, freelancerId) => {
  if (!projectId) throw new Error("Missing projectId");
  if (!freelancerId) throw new Error("Missing freelancerId");
  const token = getAuthToken();

  const { data } = await axios.post(
    `${API_BASE}/${projectId}/assign`,
    { freelancer_id: freelancerId },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!data.success) throw new Error(data.message || "Failed to assign freelancer");
  return data;
};

// -------------------- RECORD OFFLINE PAYMENT --------------------
export const recordOfflinePaymentApi = async (projectId, file) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("proof", file);

  const { data } = await axios.post(
    `${API_BASE}/${projectId}/payment/offline`,
    formData,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!data.success) throw new Error(data.message || "Failed to submit payment proof");
  return data.payment;
};

// -------------------- CREATE PROJECT DRAFT --------------------
export const createProjectDraftApi = async (projectData) => {
  const token = getAuthToken();
  try {
    const { data } = await axios.post(`${API_BASE}/draft`, projectData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
