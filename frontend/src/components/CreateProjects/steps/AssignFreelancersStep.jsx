import React, { useState, useEffect } from "react";
import { fetchRelatedFreelancersApi } from "../api/projects";

export default function AssignFreelancersStep({
  categoryId,
  selectedFreelancer,
  setSelectedFreelancer,
  onNext,
  onBack
}) {
  const [freelancers, setFreelancers] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch freelancers by category
  useEffect(() => {
    if (!categoryId) {
      setFetchLoading(false);
      return;
    }

    fetchRelatedFreelancersApi(categoryId)
      .then(data => {
        setFreelancers(data);
        setFetchLoading(false);
      })
      .catch(err => {
        console.error("Error fetching freelancers:", err);
        setFetchLoading(false);
      });
  }, [categoryId]);

  const selectedFreelancerData = freelancers.find(f => f.id === selectedFreelancer);

  const getFreelancerName = (freelancer) => {
    return `${freelancer.first_name || ""} ${freelancer.last_name || ""}`.trim();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Freelancer</h2>
        <p className="text-gray-600">
          Select a freelancer to invite for your project (optional)
        </p>
      </div>

      {fetchLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </div>
      ) : (
        <>
          {/* Freelancer Selection */}
          <div className="grid gap-4 mb-6">
            {freelancers.length === 0 && (
              <p className="text-gray-500 text-center">No freelancers available. You can skip this step.</p>
            )}

            {freelancers.map(freelancer => {
              const freelancerName = getFreelancerName(freelancer);
              return (
                <button
                  key={freelancer.id}
                  type="button"
                  onClick={() => setSelectedFreelancer(freelancer.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all w-full ${
                    selectedFreelancer === freelancer.id
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-300 hover:border-gray-400 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                      selectedFreelancer === freelancer.id ? "bg-blue-600" : "bg-gray-400"
                    }`}>
                      {freelancerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{freelancerName}</h3>
                      {freelancer.title && <p className="text-sm text-gray-600">{freelancer.title}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedFreelancerData && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-900">
                Selected Freelancer: <span className="font-semibold">{getFreelancerName(selectedFreelancerData)}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button onClick={onBack} className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200">
              Back
            </button>
            <button onClick={onNext} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800">
              {selectedFreelancer ? "Continue with Freelancer" : "Skip"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
