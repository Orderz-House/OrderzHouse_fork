import API from "../api/axios"; 

// ----------------------
// PUBLIC ROUTES
// ----------------------

export const getPlans = async () => {
  const response = await API.get("/plans");
  return response.data;
};

export const getPlanSubscriptions = async (planId) => {
  const response = await API.get(`/plans/${planId}/subscriptions`);
  return response.data;
};

// ----------------------
// ADMIN ROUTES
// ----------------------

export const createPlan = async (planData) => {
  const response = await API.post("/plans/create", planData);
  return response.data;
};

export const editPlan = async (id, planData) => {
  const response = await API.put(`/plans/edit/${id}`, planData);
  return response.data;
};

export const deletePlan = async (id) => {
  const response = await API.delete(`/plans/delete/${id}`);
  return response.data;
};

// ----------------------
// FREELANCER ROUTES
// ----------------------

export const getFreelancerSubscription = async () => {
  const response = await API.get("/plans/subscription/me");
  return response.data;
};

export const subscribeToPlan = async (planId) => {
  const response = await API.post("/plans/subscribe", { plan_id: planId });
  return response.data;
};

export const cancelSubscription = async () => {
  const response = await API.patch("/plans/cancel");
  return response.data;
};

// ----------------------
// EXPORT ALL
// ----------------------
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
