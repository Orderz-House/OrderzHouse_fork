import React from "react";

export default function DevelopmentNoticeModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Development Projects Notice
        </h2>

        <p className="text-gray-600 mb-4">
          For <strong>Development projects</strong>, direct communication is
          required before proceeding.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2">
          <p className="text-sm text-gray-800">
            📞 <strong>+962 791433341</strong>
          </p>
          <p className="text-sm text-gray-800">
            ✉️ <strong>info@battechno.com</strong>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl bg-gradient-to-b from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold focus-visible:ring-2 focus-visible:ring-orange-200/70"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
