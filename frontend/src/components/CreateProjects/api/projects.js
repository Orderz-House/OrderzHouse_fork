import axios from "axios";
import { store } from "../../../store/store";

const API_BASE = "http://localhost:5000/projects";

// -------------------- UTILITY --------------------
/**
 * Get auth token from Redux store
 */
const getAuthToken = () => {
  const state = store.getState();
  if (!state.auth?.token) throw new Error("No auth token found");
  return state.auth.token;
};

// -------------------- CREATE PROJECT --------------------
export const createProjectApi = async (formData, token) => {
  const authToken = token || getAuthToken();
  try {
    const { data } = await axios.post(`${API_BASE}/`, formData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!data.success) throw new Error(data.message || "Failed to create project");
    return data.project;
  } catch (err) {
    console.error("Create project error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// -------------------- UPLOAD PROJECT FILES --------------------
export const uploadProjectFilesApi = async (projectId, files, token) => {
  if (!projectId) throw new Error("Project ID is required");
  if (!files || files.length === 0) throw new Error("No files to upload");

  const authToken = token || getAuthToken();
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  try {
    const { data } = await axios.post(`${API_BASE}/${projectId}/files`, formData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (!data.success) throw new Error(data.message || "Failed to upload files");
    return data.files;
  } catch (err) {
    console.error("Upload files error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// -------------------- FETCH RELATED FREELANCERS --------------------
export const fetchRelatedFreelancersApi = async (categoryId) => {
  if (!categoryId) throw new Error("Missing categoryId");
  const token = getAuthToken();

  try {
    const { data } = await axios.get(
      `${API_BASE}/categories/${categoryId}/related-freelancers`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!data.success) throw new Error(data.message || "Failed to fetch freelancers");
    return data.freelancers;
  } catch (err) {
    console.error("Fetch related freelancers error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// -------------------- ASSIGN FREELANCER --------------------
export const assignFreelancerApi = async (projectId, freelancerId, token) => {
  if (!projectId) throw new Error("Missing projectId");
  if (!freelancerId) throw new Error("Missing freelancerId");
  const authToken = token || getAuthToken();

  try {
    const { data } = await axios.post(
      `${API_BASE}/${projectId}/assign`,
      { freelancer_id: freelancerId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    if (!data.success) throw new Error(data.message || "Failed to assign freelancer");
    return data;
  } catch (err) {
    console.error("Assign freelancer error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

// -------------------- RECORD OFFLINE PAYMENT --------------------
export const recordOfflinePaymentApi = async (projectId, file, token, amount) => {
  if (!projectId) throw new Error("Missing projectId");
  if (!file) throw new Error("No payment proof file provided");
  if (amount == null || isNaN(amount)) throw new Error("Payment amount is required and must be numeric");
  if (!token) throw new Error("User token is required");

  const formData = new FormData();
  formData.append("proof", file);
  formData.append("amount", amount);

  const { data } = await axios.post(
    `http://localhost:5000/payment/offline/record/${projectId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
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

    if (!data.success) throw new Error(data.message || "Failed to create project draft");
    return data;
  } catch (err) {
    console.error("Create draft error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

