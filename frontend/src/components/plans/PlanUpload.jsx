import React, { useState, useEffect } from "react";
import axios from "axios";

const PlanUpload = ({ plan, onClose }) => {
  const [name, setName] = useState(plan?.name || "");
  const [price, setPrice] = useState(plan?.price || 0);
  const [duration, setDuration] = useState(plan?.duration || 30);
  const [description, setDescription] = useState(plan?.description || "");
  const [features, setFeatures] = useState(plan?.features?.join(", ") || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        price,
        duration,
        description,
        features: features.split(",").map((f) => f.trim()),
      };

      if (plan) {
        await axios.put(`/https://backend.thi8ah.com/plans/edit/${plan.id}`, payload);
      } else {
        await axios.post("/https://backend.thi8ah.com/plans/create", payload);
      }

      onClose();
    } catch (err) {
      console.error("Error submitting plan:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">
          {plan ? "Edit Plan" : "Create Plan"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Plan Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Duration (days)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Features (comma separated)"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {plan ? "Update Plan" : "Create Plan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlanUpload;
