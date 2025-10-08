import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../constants";

export const useFreelancerSelection = (token) => {
  const [selectedFreelancers, setSelectedFreelancers] = useState([]);
  const [relatedFreelancers, setRelatedFreelancers] = useState([]);

  const fetchRelatedFreelancers = async (categoryId) => {
    if (!categoryId) return;

    try {
      const response = await axios.get(
        `${API_BASE}/projects/categories/${categoryId}/related-freelancers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRelatedFreelancers(response.data.freelancers || []);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      setRelatedFreelancers([]);
    }
  };

  const toggleFreelancerSelection = (freelancerId, assignmentType) => {
    if (selectedFreelancers.includes(freelancerId)) {
      setSelectedFreelancers((prev) => prev.filter((id) => id !== freelancerId));
    } else if (assignmentType === "solo" && selectedFreelancers.length === 0) {
      setSelectedFreelancers([freelancerId]);
    } else if (assignmentType === "team") {
      setSelectedFreelancers((prev) => [...prev, freelancerId]);
    }
  };

  const notifyFreelancers = async (projectId) => {
    if (selectedFreelancers.length === 0) return;

    try {
      await axios.post(
        `${API_BASE}/projects/${projectId}/notify-freelancers`,
        { freelancer_ids: selectedFreelancers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (error) {
      console.error("Error sending notifications:", error);
      return false;
    }
  };

  return {
    selectedFreelancers,
    relatedFreelancers,
    fetchRelatedFreelancers,
    toggleFreelancerSelection,
    notifyFreelancers,
  };
};