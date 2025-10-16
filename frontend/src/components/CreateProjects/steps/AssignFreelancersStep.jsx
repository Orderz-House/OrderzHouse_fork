import React, { useState, useEffect } from "react";
import { fetchRelatedFreelancersApi, assignFreelancerApi } from "../api/projects";

export default function AssignFreelancersStep({ projectId, categoryId, onNext, onBack }) {
  const [freelancers, setFreelancers] = useState([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState("");
  const [loading, setLoading] = useState(false);
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

  // Invite freelancer (creates a pending assignment)
  const handleInvite = async () => {
    if (!selectedFreelancer) return onNext();

    setLoading(true);
    try {
      const res = await assignFreelancerApi(projectId, selectedFreelancer);
      alert(res.message || "Invitation sent successfully. Waiting for freelancer response.");
      onNext();
    } catch (err) {
      alert(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Available Freelancers
            </label>

            {freelancers.length === 0 ? (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <p className="text-gray-600 font-medium">No freelancers available</p>
                <p className="text-sm text-gray-500 mt-1">You can skip this step and invite later</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {freelancers.map(freelancer => {
                  const freelancerName = getFreelancerName(freelancer);
                  return (
                    <button
                      key={freelancer.id}
                      type="button"
                      onClick={() => setSelectedFreelancer(freelancer.id)}
                      className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                        selectedFreelancer === freelancer.id
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-gray-400 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                          selectedFreelancer === freelancer.id ? "bg-blue-600" : "bg-gray-400"
                        }`}>
                          {freelancerName.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{freelancerName}</h3>
                          {freelancer.title && <p className="text-sm text-gray-600 mt-1">{freelancer.title}</p>}
                          {freelancer.rating && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < Math.floor(freelancer.rating) ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">{freelancer.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {selectedFreelancer === freelancer.id && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedFreelancerData && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3 className="text-lg font-bold text-blue-900">Selected Freelancer</h3>
              </div>
              <p className="text-blue-800">
                <span className="font-semibold">{getFreelancerName(selectedFreelancerData)}</span> will be invited to this project
              </p>
            </div>
          )}
        </>
      )}

      <div className="flex gap-4 mt-8">
        <button onClick={onBack} className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
          </svg>
          Back
        </button>
        <button onClick={handleInvite} disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Sending...
            </>
          ) : (
            <>
              {selectedFreelancer ? "Invite & Continue" : "Skip"}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
