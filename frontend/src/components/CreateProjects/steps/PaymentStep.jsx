import React, { useState } from "react";
import { recordOfflinePaymentApi } from "../api/projects"; 
import { useSelector } from "react-redux";

export default function PaymentStep({ projectId, onBack, onNext }) {
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!proofFile) {
      alert("Please upload a payment proof.");
      return;
    }

    setLoading(true);
    try {
      await recordOfflinePaymentApi(projectId, proofFile);
      alert(
        "Payment proof submitted! Admin will review. Once approved, your project will be available to freelancers."
      );
      onNext();
    } catch (err) {
      alert(err.message || "Failed to submit payment proof");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Record Offline Payment</h2>
        <p className="text-gray-600">
          Upload a proof of payment. Admin will review and approve your payment.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Proof</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !proofFile}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Proof & Continue"}
        </button>
      </div>

      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <svg
          className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <div>
          <p className="font-semibold text-green-900">Secure Submission</p>
          <p className="text-sm text-green-700 mt-1">
            Your payment proof is uploaded securely and reviewed by admin.
          </p>
        </div>
      </div>
    </div>
  );
}
