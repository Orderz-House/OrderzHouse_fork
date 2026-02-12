import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FileText, CheckCircle } from "lucide-react";
import API from "../../api/client.js";
import { useToast } from "../toast/ToastProvider";

const getDashboardPath = (roleId) => {
  switch (Number(roleId)) {
    case 1: return "/admin/dashboard";
    case 2: return "/client/dashboard";
    case 3: return "/freelancer/dashboard";
    case 4: return "/apm";
    case 5: return "/partner";
    default: return "/dashboard";
  }
};

export default function AcceptTerms() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { token, roleId } = useSelector((state) => state.auth);

  const handleAccept = async () => {
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/login", { replace: true });
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/accept-terms");
      toast.success("تم قبول الشروط والأحكام بنجاح");
      const path = getDashboardPath(roleId);
      navigate(path, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "فشل في حفظ القبول. حاول مرة أخرى.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          قبول الشروط والأحكام
        </h1>
        <p className="text-slate-600 mb-6">
          يجب الموافقة على الشروط والأحكام لاستخدام المنصة. يمكنك قراءة النص الكامل من الرابط أدناه.
        </p>
        <Link
          to="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-orange-600 hover:text-orange-700 font-medium mb-6 underline"
        >
          عرض الشروط والأحكام
        </Link>
        <button
          type="button"
          onClick={handleAccept}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold transition-colors"
        >
          {loading ? (
            <span className="animate-pulse">جاري الحفظ...</span>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              أوافق على الشروط والأحكام
            </>
          )}
        </button>
      </div>
    </main>
  );
}
