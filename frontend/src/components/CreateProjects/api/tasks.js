import axios from "axios";

const API = import.meta.env.VITE_APP_API_URL;

// 1) Create task
export const createTaskApi = async (formData, token) => {
  try {
    const res = await axios.post(`${API}/tasks/freelancer`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.task;
  } catch (err) {
    console.error("createTaskApi error:", err);
    throw err.response?.data || err;
  }
};

// 2) Upload task files
export const uploadTaskFilesApi = async (requestId, files, token) => {
  try {
    const fd = new FormData();
    files.forEach((file) => fd.append("files", file));

    const res = await axios.post(`${API}/tasks/files/${requestId}`, fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (err) {
    console.error("uploadTaskFilesApi error:", err);
    throw err.response?.data || err;
  }
};

// 3) Fetch tasks by filter for /tasks catalog
export const fetchTasksByFilter = async ({ category, subcat, sub } = {}) => {
  try {
    const params = {};
    if (category) params.category = category;
    if (subcat) params.sub_category_id = subcat;
    if (sub) params.sub_sub_category_id = sub;

    const res = await axios.get(`${API}/tasks/pool`, { params });
    return res.data.tasks || [];
  } catch (err) {
    console.error("fetchTasksByFilter error:", err);
    throw err.response?.data || err;
  }
};

// 4) Single task
export const getTaskByIdApi = async (id) => {
  try {
    const res = await axios.get(`${API}/tasks/${id}`);
    return res.data.task;
  } catch (err) {
    console.error("getTaskByIdApi error:", err);
    throw err.response?.data || err;
  }
};