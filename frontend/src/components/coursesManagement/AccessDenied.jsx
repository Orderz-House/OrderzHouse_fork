import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/70 p-8 max-w-md w-full text-center">
        <div className="mb-4">
          <Lock className="w-16 h-16 text-orange-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-6">
          You don&apos;t have permission to access this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-b from-orange-400 to-red-500 text-white font-semibold hover:from-orange-500 hover:to-red-600 transition"
          >
            Go to Home
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
