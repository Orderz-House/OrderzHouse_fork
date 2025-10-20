import API from "./axios";

/**
 * Create a new user (admin only)
 */
export const createUser = async (userData, token) => {
  const res = await API.post("/admUser", userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Get all users or users by role (admin only)
 * @param {number} [roleId] 
 * @param {string} token
 */
export const getUsers = async (roleId, token) => {
  const endpoint = roleId ? `/admUser/role/${roleId}` : "/admUser";
  const res = await API.get(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Get user by ID (admin only)
 */
export const getUserById = async (id, token) => {
  const res = await API.get(`/admUser/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Update user by ID (admin only)
 */
export const updateUser = async (id, userData, token) => {
  const res = await API.put(`/admUser/${id}`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Delete user by ID (admin only)
 */
export const deleteUser = async (id, token) => {
  const res = await API.delete(`/admUser/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Verify a freelancer (admin only)
 */
export const verifyFreelancer = async (id, token) => {
  const res = await API.patch(`/admUser/verify/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export default {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyFreelancer,
};