import axios from "axios";

export const fetchEarningsSummary = async (freelancerId, token) => {
  if (!freelancerId || !token) {
    throw new Error("User ID and token are required.");
  }

  try {
    const response = await axios.get(
      `http://localhost:5000/api/earnings/summary/${freelancerId}`, // Make sure this URL matches your backend route
      {
        headers: { Authorization: `Bearer ${token}` },
      }
     );
    
    if (response.data.success) {
      return response.data.summary;
    } else {
      throw new Error(response.data.message || "Failed to fetch earnings summary.");
    }
  } catch (error) {
    console.error("API Error in fetchEarningsSummary:", error);
    // Re-throw the error so the component can handle it
    throw error;
  }
};
