import { AlertCircle } from "lucide-react";
import { GUIDELINES } from "../constants";

export const ProjectGuidelines = () => {
  return (
    <div
      className="flex-shrink-0 h-full"
      style={{ width: "300px", minWidth: "260px" }}
    >
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center mb-4">
          <AlertCircle className="w-6 h-6 text-teal-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">
            Project Guidelines
          </h3>
        </div>
        <div className="space-y-4 text-sm text-gray-700">
          {GUIDELINES.map(({ title, desc }, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-teal-900 mb-2">{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
          <div className="pt-4 border-t border-teal-200">
            <p className="text-xs text-teal-700">
              <strong>Tip:</strong> Projects with detailed descriptions receive
              3x more quality proposals!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};