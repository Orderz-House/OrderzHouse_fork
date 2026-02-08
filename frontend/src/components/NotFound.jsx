import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="h-2 w-20 rounded-full bg-gradient-to-b from-orange-400 to-red-500 mb-6" />
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 transition-colors"
        >
          Go Home
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
