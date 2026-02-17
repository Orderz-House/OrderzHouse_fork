import API from "../../../api/client.js";
import { store } from "../../../store/store";

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
export const createProjectApi = async (projectData, token, coverPic) => {
  const authToken = token || getAuthToken();
  const formData = new FormData();

  Object.entries(projectData).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== "") {
          formData.append(`${key}[]`, v);
        }
      });
    } else {
      formData.append(key, value);
    }
  });

  if (coverPic instanceof File) {
    formData.append("cover_pic", coverPic);
  }

  const { data } = await API.post("/projects/", formData, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!data?.success) {
    throw new Error(data?.message || "Failed to create project");
  }

  return data.project;
};

// -------------------- UPLOAD PROJECT FILES --------------------
export const uploadProjectFilesApi = async (projectId, files, token) => {
  if (!projectId) throw new Error("Project ID is required");
  if (!files || files.length === 0) throw new Error("No files to upload");

  const authToken = token || getAuthToken();
  const formData = new FormData();
  files.forEach((file) => formData.append("attachments", file));

  const { data } = await API.post(
    `/projects/${projectId}/files`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!data?.success) {
    throw new Error(data?.message || "Failed to upload files");
  }

  return data.files;
};

// -------------------- ASSIGN FREELANCER --------------------
export const assignFreelancerApi = async (projectId, freelancerId, token) => {
  if (!projectId) throw new Error("Missing projectId");
  if (!freelancerId) throw new Error("Missing freelancerId");

  const authToken = token || getAuthToken();

  const { data } = await API.post(
    `/projects/${projectId}/assign`,
    { freelancer_id: freelancerId },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );

  if (!data?.success) {
    throw new Error(data?.message || "Failed to assign freelancer");
  }

  return data;
};

// -------------------- CREATE STRIPE PROJECT CHECKOUT --------------------
export const createProjectCheckoutSessionApi = async (projectData, token) => {
  // API instance already handles Authorization header via interceptor
  // No need to manually add it - the interceptor will use token from localStorage/Redux
  // Only pass token if explicitly provided (for edge cases)
  const config = token ? {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  } : {};

  const { data } = await API.post(
    "/stripe/project-checkout-session",
    projectData,
    config
  );

  return data;
};

// -------------------- CREATE PROJECT DRAFT --------------------
export const createProjectDraftApi = async (projectData) => {
  const token = getAuthToken();

  const { data } = await API.post("/projects/draft", projectData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!data?.success) {
    throw new Error(data?.message || "Failed to create project draft");
  }

  return data;
};
