// ======================================================
// 📌 TestUIComponents.jsx — Ultra Clean SaaS Version
// مكوّنات الواجهة الجاهزة للاستخدام
// ======================================================

import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

// ======================================================
// 🟩 واجهة النتيجة عند النجاح
// ======================================================
export const SuccessResult = ({ evaluation }) => (
  <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <FiCheckCircle className="text-green-600 text-3xl" />
      <h2 className="text-2xl font-bold text-green-700">✔ نجاح — أحسنت!</h2>
    </div>

    <p className="text-green-700 mt-2">
      لقد قمت بإنجاز المهمة المطلوبة بنجاح. أداؤك كان جيدًا بما فيه الكفاية لاجتياز هذا الاختبار.
    </p>

    <p className="text-xl font-semibold text-green-800 mt-4">
      تقييم المهمة: <span className="font-bold">{evaluation.overall}/10</span>
    </p>
  </div>
);

// ======================================================
// 🟥 واجهة الفشل
// ======================================================
export const FailResult = ({ evaluation }) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <FiXCircle className="text-red-600 text-3xl" />
      <h2 className="text-2xl font-bold text-red-700">✘ لم تنجح هذه المرة</h2>
    </div>

    <p className="text-red-700 mt-2">
      للأسف، لم يحقق المحتوى الحد الأدنى المطلوب من الجودة. حاول التركيز أكثر على التعليمات وإعادة المحاولة غدًا.
    </p>

    <p className="text-xl font-semibold text-red-800 mt-4">
      تقييم المهمة: <span className="font-bold">{evaluation.overall}/10</span>
    </p>
  </div>
);

// ======================================================
// 🟨 واجهة كشف الغش
// ======================================================
export const CheatingResult = () => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm text-center">
    <FiAlertTriangle className="text-red-600 text-4xl mx-auto mb-2" />

    <h2 className="text-2xl font-bold text-red-700">⚠️ تم اكتشاف غش</h2>

    <p className="text-red-600 mt-3">
      يبدو أن النص مكتوب بطريقة غير بشرية أو مأخوذ من مصدر مُعد مسبقًا.  
      لن يتم احتساب هذا الاختبار، ويمكنك المحاولة غدًا مرة أخرى.
    </p>
  </div>
);

// ======================================================
// 🟦 بطاقة التحليل (نقاط القوة / الضعف / التحسين)
// ======================================================
export const AnalysisCard = ({ title, items, color = "slate" }) => (
  <div className={`border rounded-xl p-5 bg-${color}-50 border-${color}-200`}>
    <h3 className={`text-lg font-semibold text-${color}-800 mb-3`}>{title}</h3>

    <ul className="list-disc pr-6 space-y-1 text-slate-700">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

// ======================================================
// ⏳ واجهة الCooldown
// ======================================================
export const CooldownView = ({ remaining }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center shadow-sm">
    <FiClock className="text-yellow-600 text-4xl mx-auto mb-2" />

    <h2 className="text-2xl font-bold text-yellow-700">⏳ قد أكملت اختبار اليوم</h2>

    <p className="text-yellow-700 mt-2">
      يمكنك المحاولة مرة أخرى بعد انتهاء العد التنازلي.
    </p>

    <p className="text-3xl font-bold text-yellow-800 mt-4">
      {remaining}
    </p>

    <p className="text-sm text-yellow-600 mt-2">
      نراك غدًا! 👋
    </p>
  </div>
);
