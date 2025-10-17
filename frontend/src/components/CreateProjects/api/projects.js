import axios from "axios";

const API_BASE = "http://localhost:5000/projects";

// Create a project

export const createProjectApi = async (formData) => {
  const { data } = await axios.post(`${API_BASE}/`, formData);
  if (!data.success) throw new Error(data.message || "Failed to create project");
  return data.project; 
};
// Upload project files
export const uploadProjectFilesApi = async (projectId, files) => {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));

  const { data } = await axios.post(`${API_BASE}/${projectId}/files`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data"
    }
  });

  if (data.success) return data.files;
  throw new Error(data.message || "Failed to upload files");
};

// Fetch related freelancers
export const fetchRelatedFreelancersApi = async (categoryId) => {
  if (!categoryId) throw new Error("Missing categoryId");
  
  const { data } = await axios.get(
    `${API_BASE}/categories/${categoryId}/related-freelancers`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );

  if (data.success) return data.freelancers;
  throw new Error(data.message || "Failed to fetch freelancers");
};

// Invite freelancer 
export const assignFreelancerApi = async (projectId, freelancerId) => {
  if (!projectId) throw new Error("Missing projectId");
  if (!freelancerId) throw new Error("Missing freelancerId");

  const { data } = await axios.post(
    `${API_BASE}/${projectId}/assign`,
    { freelancer_id: freelancerId },
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );

  if (!data.success) throw new Error(data.message || "Failed to send invitation");
  return data; 
};

// Record offline payment
export const recordOfflinePaymentApi = async (projectId, file) => {
  const formData = new FormData();
  formData.append("proof", file);

  const { data } = await axios.post(
    `http://localhost:5000/projects/${projectId}/payment/offline`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!data.success) throw new Error(data.message || "Failed to submit payment proof");
  return data.payment;
};

export const createProjectDraftApi = async (projectData) => {
  try {
    const res = await axios.post("/projects/draft", projectData);
    return res.data; 
  } catch (err) {
    throw err.response?.data || err;
  }
};
