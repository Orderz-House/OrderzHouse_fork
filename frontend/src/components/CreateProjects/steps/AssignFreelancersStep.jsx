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
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500">No freelancers available for this category.</p>
                <p className="text-gray-400 text-sm mt-1">You can skip this step and continue.</p>
              </div>
            )}

            {freelancers.map(freelancer => {
              const freelancerName = getFreelancerName(freelancer);
              const isSelected = selectedFreelancer?.id === freelancer.id;
              
              return (
                <button
                  key={freelancer.id}
                  type="button"
                  onClick={() => setSelectedFreelancer(freelancer)}
                  className={`p-4 rounded-xl border-2 text-left transition-all w-full ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-300 hover:border-gray-400 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                      isSelected ? "bg-blue-600" : "bg-gray-400"
                    }`}>
                      {freelancerName.charAt(0).toUpperCase() || "F"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{freelancerName || "Unnamed Freelancer"}</h3>
                      {freelancer.title && <p className="text-sm text-gray-600">{freelancer.title}</p>}
                      {freelancer.hourly_rate && (
                        <p className="text-sm text-gray-500 mt-1">${freelancer.hourly_rate}/hr</p>
                      )}
                    </div>
                    {isSelected && (
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedFreelancer && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-blue-900">
                  Selected: <span className="font-semibold">{getFreelancerName(selectedFreelancer)}</span>
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button 
              onClick={onBack} 
              className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all"
            >
              Back
            </button>
            <button 
              onClick={onNext} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {selectedFreelancer ? "Continue with Freelancer" : "Skip"}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}