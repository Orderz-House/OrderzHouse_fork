import axios from "axios";

const API_BASE = import.meta.env.VITE_APP_API_URL 

/**
 * Helper: Auth header
 */
const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});


/* =====================================================
    SEND OFFER FOR A PROJECT
===================================================== */
export const sendOfferApi = async (projectId, payload, token) => {
  if (!projectId) throw new Error("Missing projectId");

  const body = {
    bid_amount: payload.offer_amount, 
    proposal: payload.message || "",  
  };

  try {
    const { data } = await axios.post(
      `${API_BASE}/offers/${projectId}/offers`,
      body,
      token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : getAuthHeaders()
    );

    if (data?.success) return data;
    throw new Error(data?.message || "Failed to send offer");
  } catch (err) {
    console.error("sendOfferApi error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message || "Failed to send offer");
  }
};
/* =====================================================
    GET MY OFFERS FOR A SPECIFIC PROJECT
===================================================== */
export const getMyOffersForProjectApi = async (projectId, token) => {
  const { data } = await axios.get(
    `${API_BASE}/offers/${projectId}/my-offers`,
    authHeaders(token)
  );
  if (data.success) return data.offers;
  throw new Error(data.message || "Failed to fetch my offers for this project");
};

