import axios from "axios";
import store from "../../../store/store";

const API_BASE = "http://localhost:5000/tasks";

const getAuthHeaders = (isFormData = false ) => {
  const token = store?.getState()?.auth?.token || localStorage.getItem("token") || null;
  if (!token) return {};
  const headers = { Authorization: `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return { headers };
};

export const getTaskPoolApi = async (filters = {}) => {
  const { data } = await axios.get(`${API_BASE}/pool`, { ...getAuthHeaders(), params: filters });
  return data;
};

export const getTaskByIdApi = async (taskId) => {
  const { data } = await axios.get(`${API_BASE}/${taskId}`, getAuthHeaders());
  return data;
};

export const createTaskApi = async (taskData) => {
  const { data } = await axios.post(`${API_BASE}/`, taskData, getAuthHeaders(true));
  return data;
};

export const getMyCreatedTasksApi = async () => {
  const { data } = await axios.get(`${API_BASE}/my-created`, getAuthHeaders());
  return data;
};

export const requestTaskApi = async (taskId, requestData) => {
  const { data } = await axios.post(`${API_BASE}/request/${taskId}`, requestData, getAuthHeaders(true));
  return data;
};

export const getTaskRequestsApi = async () => {
  const { data } = await axios.get(`${API_BASE}/requests`, getAuthHeaders());
  return data;
};

export const getAssignedTasksApi = async () => {
  const { data } = await axios.get(`${API_BASE}/assigned-to-me`, getAuthHeaders());
  return data;
};

export const getClientRequestsApi = async () => {
  const { data } = await axios.get(`${API_BASE}/my-requests`, getAuthHeaders());
  return data;
};

export const updateTaskRequestStatusApi = async (requestId, statusData) => {
  const { data } = await axios.patch(`${API_BASE}/requests/${requestId}/status`, statusData, getAuthHeaders());
  return data;
};

export const updateTaskKanbanStatusApi = async (requestId, statusData) => {
  const { data } = await axios.patch(`${API_BASE}/requests/${requestId}/kanban-status`, statusData, getAuthHeaders());
  return data;
};

export const submitPaymentProofApi = async (requestId, paymentData) => {
  const { data } = await axios.post(`${API_BASE}/requests/${requestId}/submit-payment`, paymentData, getAuthHeaders(true));
  return data;
};

export const submitWorkCompletionApi = async (requestId, workData) => {
  const { data } = await axios.post(`${API_BASE}/requests/${requestId}/submit-completion`, workData, getAuthHeaders(true));
  return data;
};

export const resubmitWorkCompletionApi = async (requestId, workData) => {
    const { data } = await axios.post(`${API_BASE}/requests/${requestId}/resubmit-completion`, workData, getAuthHeaders(true));
    return data;
};

export const approveWorkCompletionApi = async (requestId, approvalData) => {
  const { data } = await axios.patch(`${API_BASE}/requests/${requestId}/approve-completion`, approvalData, getAuthHeaders(true));
  return data;
};

export const createReviewApi = async (requestId, reviewData) => {
  const { data } = await axios.post(`${API_BASE}/requests/${requestId}/review`, reviewData, getAuthHeaders());
  return data;
};

export const getAllTasksForAdminApi = async () => {
  const { data } = await axios.get(`${API_BASE}/admin/all`, getAuthHeaders());
  return data;
};

export const approveTaskByAdminApi = async (taskId, statusData) => {
  const { data } = await axios.patch(`${API_BASE}/admin/approve/${taskId}`, statusData, getAuthHeaders());
  return data;
};

export const confirmPaymentByAdminApi = async (requestId) => {
  const { data } = await axios.patch(`${API_BASE}/admin/confirm-payment/${requestId}`, {}, getAuthHeaders());
  return data;
};

export const updateTaskApi = async (taskId, taskData) => {
    const { data } = await axios.put(`${API_BASE}/${taskId}`, taskData, getAuthHeaders(true));
    return data;
};

export const deleteTaskApi = async (taskId) => {
    const { data } = await axios.delete(`${API_BASE}/${taskId}`, getAuthHeaders());
    return data;
};

export const getCategoriesApi = async () => {
    const { data } = await axios.get(`${API_BASE}/categories`, getAuthHeaders());
    return data;
};

export const addTaskFilesApi = async (requestId, filesData) => {
    const { data } = await axios.post(`${API_BASE}/requests/${requestId}/files`, filesData, getAuthHeaders(true));
    return data;
};