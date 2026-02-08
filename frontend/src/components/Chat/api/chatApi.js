import API from "../../../api/client.js";

export const fetchMessages = async (token, { projectId, taskId }) => {
  const endpoint = projectId
    ? `/chat/project/${projectId}/messages`
    : `/chat/task/${taskId}/messages`;
  const res = await API.get(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.messages || [];
};

export const sendMessage = async (token, data) => {
  const res = await API.post("/chat/messages", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
