import axios from "axios";

const API_BASE = import.meta.env.VITE_APP_API_URL;

export const fetchMessages = async (token, { projectId, taskId }) => {
  const endpoint = projectId
    ? `/chats/project/${projectId}/messages`
    : `/chats/task/${taskId}/messages`;
  const res = await axios.get(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.messages || [];
};

export const sendMessage = async (token, data) => {
  const res = await axios.post(`${API_BASE}/chats/messages`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
