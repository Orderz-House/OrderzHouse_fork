import axios from "axios";

const API_BASE = "https://backend.thi8ah.com/tasks";

//Create a new Task
export const createTaskApi = async (taskData, token) => {
  try {
    const res = await axios.post(`${API_BASE}/tasks`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // for file uploads if needed
      },
    });
    return res.data.task;
  } catch (err) {
    console.error("createTaskApi error:", err);
    throw err.response?.data || err;
  }
};

//Upload files for a specific Task
export const uploadTaskFilesApi = async (taskId, files, token) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await axios.post(`${API_BASE}/tasks/files/${taskId}`, formData, {
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
