import React, { useState, useEffect } from "react";
import { fetchRelatedFreelancersApi } from "../api/projects";

const THEME = "#028090";

export default function AssignFreelancersStep({
  categoryId,
  selectedFreelancer,
  setSelectedFreelancer,
  onNext,
  onBack
}) {
  const [freelancers, setFreelancers] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) { setFetchLoading(false); return; }
    fetchRelatedFreelancersApi(categoryId)
      .then(data => { setFreelancers(data); setFetchLoading(false); })
      .catch(err => { console.error("Error fetching freelancers:", err); setFetchLoading(false); });
  }, [categoryId]);

  const getFreelancerName = (f) => `${f.first_name || ""} ${f.last_name || ""}`.trim();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Invite Freelancer</h2>
        <p className="text-slate-600">Select a freelancer to invite (optional)</p>
      </div>

      {fetchLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-12 w-12" style={{ color: THEME }} viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-6">
            {freelancers.length === 0 && (
              <div className="text-center py-10 rounded-xl border border-slate-200 bg-slate-50">
                <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-slate-600">No freelancers available for this category.</p>
                <p className="text-slate-400 text-sm mt-1">You can skip this step and continue.</p>
              </div>
            )}

            {freelancers.map(f => {
              const name = getFreelancerName(f);
              const selected = selectedFreelancer?.id === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFreelancer(f)}
                  className={`p-4 rounded-xl border-2 text-left transition-all w-full ${
                    selected ? "border-[#028090] bg-[#E6F7F6] shadow-sm"
                             : "border-slate-200 hover:border-[#028090]/50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full grid place-items-center font-bold text-white text-lg`}
                      style={{ background: selected ? THEME : "#94a3b8" }}
                    >
                      {name.charAt(0).toUpperCase() || "F"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{name || "Unnamed Freelancer"}</h3>
                      {f.title && <p className="text-sm text-slate-600">{f.title}</p>}
                      {f.hourly_rate && <p className="text-sm text-slate-500 mt-1">${f.hourly_rate}/hr</p>}
                    </div>
                    {selected && (
                      <svg className="w-6 h-6" style={{ color: THEME }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedFreelancer && (
            <div className="bg-[#E6F7F6] border border-[#028090]/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-[#05668D]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>
                  Selected: <span className="font-semibold">{getFreelancerName(selectedFreelancer)}</span>
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={onBack} className="flex-1 h-12 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition">Back</button>
            <button
              onClick={onNext}
              className="flex-1 h-12 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2"
              style={{ background: THEME }}
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
