import API from "./axios";

/**
 * Submit freelancer verification request
 * (Authenticated freelancer)
 * 
 * @param {Object} data - { full_name, country, phone_number }
 */
export const submitFreelancerVerification = async (data) => {
  return await API.post("/verification/freelancer", data);
};

/**
 * Get current user's verification status
 * (Authenticated user)
 */
export const getMyVerificationStatus = async () => {
  return await API.get("/verification/status");
};

/**
 * Review (approve/reject) a freelancer's verification
 * (Admin only)
 * 
 * @param {Object} data - { user_id, approve }
 */
export const reviewFreelancerVerification = async (data) => {
  return await API.patch("/verification/review", data);
};
