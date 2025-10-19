import axios from "axios";

// Adjust base URL to your backend (Vite example)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create a reusable Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/plans`,
  withCredentials: true, 
});

// ----------------------
// PUBLIC ROUTES
// ----------------------

/**
 * Fetch all available plans
 */
export const getPlans = async () => {
  const response = await api.get("/");
  return response.data;
};

/**
 * Get subscription count for a plan by ID
 */
export const getPlanSubscriptions = async (planId) => {
  const response = await api.get(`/${planId}/subscriptions`);
  return response.data;
};

// ----------------------
// ADMIN ROUTES
// ----------------------

/**
 * Create a new plan
 */
export const createPlan = async (planData) => {
  const response = await api.post("/create", planData);
  return response.data;
};

/**
 * Edit a plan
 */
export const editPlan = async (id, planData) => {
  const response = await api.put(`/edit/${id}`, planData);
  return response.data;
};

/**
 * Delete a plan
 */
export const deletePlan = async (id) => {
  const response = await api.delete(`/delete/${id}`);
  return response.data;
};

// ----------------------
// FREELANCER ROUTES (require auth)
// ----------------------

/**
 * Get current freelancer’s active subscription
 */
export const getFreelancerSubscription = async (token) => {
  const response = await api.get("/subscription/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Subscribe to a plan
 */
export const subscribeToPlan = async (planId, token) => {
  const response = await api.post(
    "/subscribe",
    { plan_id: planId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Cancel active subscription
 */
export const cancelSubscription = async (token) => {
  const response = await api.patch(
    "/cancel",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export default {
  getPlans,
  getPlanSubscriptions,
  createPlan,
  editPlan,
  deletePlan,
  getFreelancerSubscription,
  subscribeToPlan,
  cancelSubscription,
};
