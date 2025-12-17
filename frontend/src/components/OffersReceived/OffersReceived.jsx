import { useToast } from "../toast/ToastProvider";
import axios from "axios";

const THEME = "#028090";

export default function OffersReceived({ item, offersForProject, setOffersForProject }) {
  const toast = useToast();

  return (
    <div className="mt-8 rounded-2xl border-2 border-teal-100 bg-gradient-to-br from-white to-teal-50/30 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800">
          Offers Received
          <span
            className="ml-2 inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full"
            style={{ backgroundColor: THEME }}
          >
            {offersForProject?.length || 0}
          </span>
        </h3>
      </div>

      {/* 24-Hour Rule Notice ONLY */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start">
          <span className="text-amber-500 mr-2">⚠️</span>
          <div className="text-sm">
            <span className="font-semibold text-amber-800">Important:</span>{" "}
            <span className="text-amber-700">
              Clients must accept or reject offers within 24 hours. After this
              period, offers will automatically expire.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
