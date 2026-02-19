import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle, MessageCircle, Calendar, DollarSign, CreditCard, Clock, Tag, FileText } from "lucide-react";
import API from "../../api/client.js";
import { useToast } from "../../components/toast/ToastProvider";

const WHATSAPP_NUMBER = "971522857808";
/** Default CliQ alias shown when not set in backend/frontend env */
const DEFAULT_CLIQ_ALIAS = "Batman0";

function DetailRow({ icon: Icon, label, value, valueBold, clamp }) {
  const valueContent =
    typeof value === "string" ? (
      <span className={valueBold ? "font-bold text-slate-900" : "text-slate-700"}>
        {value}
      </span>
    ) : (
      value
    );
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-4 border-t border-slate-100 first:border-t-0">
      <div className="flex items-center gap-2 sm:w-40 shrink-0">
        {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className={`sm:flex-1 min-w-0 ${clamp ? "line-clamp-2" : ""}`}>
        {valueContent}
      </div>
    </div>
  );
}

/** خلية مدمجة للبيانات القصيرة (يدخل عدة عناصر في صف واحد) */
function CompactDetail({ icon: Icon, label, value }) {
  const valueContent =
    typeof value === "string" ? (
      <span className="font-bold text-slate-900 text-sm">{value}</span>
    ) : (
      value
    );
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="min-w-0">{valueContent}</div>
    </div>
  );
}

export default function ProjectSuccess() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = useSelector((state) => state.auth);
  const lang = searchParams.get("lang") || "en";
  const isArabic = lang === "ar";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      toast.error(isArabic ? "معرف المشروع مفقود" : "Project ID is missing");
      navigate("/", { replace: true });
      return;
    }

    fetchProject();
  }, [id]);

  const fetchProject = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const { data } = await API.get(`/projects/success/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setProject(data.project);
      } else {
        toast.error(data.message || (isArabic ? "فشل تحميل المشروع" : "Failed to load project"));
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || (isArabic ? "فشل تحميل المشروع" : "Failed to load project"));
      navigate("/", { replace: true });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const formatJD = (value, { noDecimals = false } = {}) => {
    if (value == null || value === undefined || value === "") return "—";
    const num = Number(value);
    if (isNaN(num)) return "—";
    
    if (noDecimals) {
      const rounded = Math.round(num);
      return `${rounded} JD`;
    }
    
    const formatted = num.toFixed(2);
    const cleaned = formatted.replace(/\.?0+$/, "");
    return `${cleaned} JD`;
  };

  const formatBudget = (project, { forWhatsApp = false } = {}) => {
    if (!project) return "—";
    const noDecimals = !forWhatsApp; // WhatsApp can show decimals, cards should not
    if (project.project_type === "fixed") {
      return formatJD(project.budget, { noDecimals });
    }
    if (project.project_type === "hourly") {
      const rate = project.hourly_rate || 0;
      return `${formatJD(rate, { noDecimals })}/hr`;
    }
    if (project.project_type === "bidding") {
      const min = project.budget_min || 0;
      const max = project.budget_max || 0;
      if (min > 0 && max > 0) {
        return `${formatJD(min, { noDecimals })} - ${formatJD(max, { noDecimals })}`;
      }
      return "—";
    }
    return "—";
  };

  const formatDuration = (project) => {
    if (!project) return null;
    if (project.duration_days && project.duration_days > 0) {
      return isArabic 
        ? `المدة: ${project.duration_days} ${project.duration_days !== 1 ? "أيام" : "يوم"}`
        : `Duration: ${project.duration_days} day${project.duration_days !== 1 ? "s" : ""}`;
    }
    if (project.duration_hours && project.duration_hours > 0) {
      return isArabic
        ? `المدة: ${project.duration_hours} ${project.duration_hours !== 1 ? "ساعات" : "ساعة"}`
        : `Duration: ${project.duration_hours} hour${project.duration_hours !== 1 ? "s" : ""}`;
    }
    return null;
  };

  const formatPaymentMethod = (method) => {
    if (!method) return "—";
    const methodMap = {
      cliq: isArabic ? "CliQ" : "CliQ",
      cash: isArabic ? "نقدي" : "Cash",
      skipped: isArabic ? "تم التخطي" : "Skipped",
      stripe: isArabic ? "Stripe" : "Stripe",
    };
    return methodMap[method] || method.charAt(0).toUpperCase() + method.slice(1);
  };

  const formatApprovalStatus = (status) => {
    if (!status || status === "none") return null;
    const statusMap = {
      pending: isArabic ? "قيد الانتظار" : "Pending",
      approved: isArabic ? "موافق عليه" : "Approved",
      rejected: isArabic ? "مرفوض" : "Rejected",
    };
    return statusMap[status] || status;
  };

  const handleWhatsApp = () => {
    if (!project) return;

    const budgetFormatted =
      project.project_type === "bidding" && project.accepted_offer_amount != null
        ? formatJD(project.accepted_offer_amount)
        : formatBudget(project, { forWhatsApp: true });
    const durationText = formatDuration(project) || (isArabic ? "غير محدد" : "Not specified");
    const skillsJoined = project.preferred_skills && Array.isArray(project.preferred_skills) && project.preferred_skills.length > 0
      ? project.preferred_skills.join(", ")
      : (isArabic ? "لا توجد" : "None");
    const shortDescription = project.description
      ? (project.description.length > 200 ? project.description.substring(0, 200) + "..." : project.description)
      : (isArabic ? "لا يوجد وصف" : "No description");
    const approvalStatus = formatApprovalStatus(project.admin_approval_status) || (isArabic ? "لا يوجد" : "None");
    const categoryInfo = project.category_name
      ? (project.sub_sub_category_name ? `${project.category_name} / ${project.sub_sub_category_name}` : project.category_name)
      : (isArabic ? "غير محدد" : "Not specified");

    let message = "";

    if (isArabic) {
      message = `تم إنشاء مشروع جديد بنجاح:

رقم المشروع: #${project.id}
العنوان: ${project.title}
الميزانية: ${budgetFormatted}
طريقة الدفع: ${formatPaymentMethod(project.payment_method)}
حالة موافقة الإدارة: ${approvalStatus}
التصنيف: ${categoryInfo}
المدة: ${durationText}
المهارات: ${skillsJoined}

الوصف: ${shortDescription}`;

      if (project.payment_method === "cliq") {
        message += "\n\nتم اختيار الدفع عبر CliQ — يرجى إرسال صورة (Screenshot) من الدفعة لتأكيد الدفع.";
      } else if (project.payment_method === "cash") {
        message += "\n\nتم اختيار الدفع نقديًا — يرجى التحقق.";
      } else if (project.payment_method === "skipped") {
        message += "\n\nتم تخطي الدفع (التدفق القديم).";
      }
    } else {
      message = `New project created successfully:

Project ID: #${project.id}
Title: ${project.title}
Budget: ${budgetFormatted}
Payment Method: ${formatPaymentMethod(project.payment_method)}
Admin Approval: ${approvalStatus}
Category: ${categoryInfo}
Duration: ${durationText}
Skills: ${skillsJoined}

Description: ${shortDescription}`;

      if (project.payment_method === "cliq") {
        message += "\n\nCliQ payment selected — please send a screenshot of your CliQ payment to confirm.";
      } else if (project.payment_method === "cash") {
        message += "\n\nCash payment selected — please verify.";
      } else if (project.payment_method === "skipped") {
        message += "\n\nPayment skipped (old flow).";
      }
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">{isArabic ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const showPaymentChooser =
    project.project_type === "bidding" &&
    (project.status === "pending_admin_approval" || project.admin_approval_status === "pending") &&
    (!project.payment_method || project.payment_method === "skipped");

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4" dir={isArabic ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header Card */}
        <div className="bg-gradient-to-b from-orange-400 to-red-500 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isArabic ? "تم إنشاء المشروع بنجاح!" : "Project Created Successfully!"}
              </h1>
              <p className="text-white/90 text-lg">
                {isArabic
                  ? "تم إنشاء مشروعك وتم إرساله للمراجعة."
                  : "Your project has been created and submitted for review."}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Approval Banner */}
        {project.admin_approval_status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="text-amber-800 text-sm font-medium">
              {isArabic
                ? "⏳ في انتظار موافقة الإدارة — لن يكون المشروع مرئيًا حتى يتم الموافقة عليه."
                : "⏳ Pending admin approval — project will not be visible until approved."}
            </p>
            {project.project_type === "bidding" && (
              <p className="text-amber-700 text-sm">
                {isArabic
                  ? "اختر طريقة الدفع (CliQ أو نقدي). بعد الدفع ستتم مراجعة الطلب من الإدارة."
                  : "Choose payment method (CliQ or Cash). After payment, admin will review your request."}
              </p>
            )}
          </div>
        )}

        {/* Payment method chooser for bidding (pending_admin_approval, no method set yet) */}
        {project.project_type === "bidding" &&
          (project.status === "pending_admin_approval" || project.admin_approval_status === "pending") &&
          (!project.payment_method || project.payment_method === "skipped") && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {isArabic ? "الدفع" : "Payment"}
              </h2>
              <p className="text-slate-600 mb-6">
                {isArabic
                  ? "اختر طريقة الدفع لإكمال الموافقة على العرض المقبول."
                  : "Choose your payment method to complete the project posting."}
              </p>
              <div className="rounded-xl border border-slate-200 p-4 mb-6">
                <p className="font-semibold text-slate-900">{isArabic ? "المشروع" : "Project"}</p>
                <p className="text-slate-700">{project.title || "—"}</p>
                <p className="mt-2 font-bold text-orange-600">
                  {isArabic ? "المبلغ: " : "Amount: "}
                  {project.accepted_offer_amount != null ? formatJD(project.accepted_offer_amount) : formatBudget(project)}
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    if (paymentSubmitting) return;
                    setPaymentSubmitting(true);
                    try {
                      await API.post(`/projects/${id}/offline-payment`, { method: "cliq" }, { headers: { Authorization: `Bearer ${token}` } });
                      toast.success(isArabic ? "تم اختيار CliQ. في انتظار موافقة الإدارة." : "CliQ selected. Waiting for admin approval.");
                      await fetchProject(false);
                    } catch (err) {
                      toast.error(err?.response?.data?.message || (isArabic ? "فشل تعيين طريقة الدفع" : "Failed to set payment method"));
                    } finally {
                      setPaymentSubmitting(false);
                    }
                  }}
                  disabled={paymentSubmitting}
                  className="w-full p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-orange-300 hover:shadow-md transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-slate-900">Pay via CliQ</p>
                    <span className="text-2xl shrink-0">📱</span>
                  </div>
                </button>
                <button
                  onClick={async () => {
                    if (paymentSubmitting) return;
                    setPaymentSubmitting(true);
                    try {
                      await API.post(`/projects/${id}/offline-payment`, { method: "cash" }, { headers: { Authorization: `Bearer ${token}` } });
                      toast.success(isArabic ? "تم اختيار الدفع نقدي. في انتظار موافقة الإدارة." : "Cash selected. Waiting for admin approval.");
                      await fetchProject(false);
                    } catch (err) {
                      toast.error(err?.response?.data?.message || (isArabic ? "فشل تعيين طريقة الدفع" : "Failed to set payment method"));
                    } finally {
                      setPaymentSubmitting(false);
                    }
                  }}
                  disabled={paymentSubmitting}
                  className="w-full p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-orange-300 hover:shadow-md transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-slate-900">Pay Cash</p>
                    <span className="text-2xl shrink-0">💵</span>
                  </div>
                </button>
              </div>
            </div>
          )}

        {/* Project details + CliQ banner + WhatsApp: only when NOT in payment chooser step */}
        {!showPaymentChooser && (
        <>
        {/* لوحة واحدة — تفاصيل المشروع */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              {isArabic ? "تفاصيل المشروع" : "Project details"}
            </h2>
          </div>
          <div className="p-6 space-y-0">
            {/* صف مدمج: Project ID, Budget, Payment Method, Duration, Created Date */}
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                <CompactDetail
                  icon={Tag}
                  label={isArabic ? "رقم المشروع" : "Project ID"}
                  value={`#${project.id}`}
                />
                <CompactDetail
                  icon={DollarSign}
                  label={isArabic ? "الميزانية" : "Budget"}
                  value={project.project_type === "bidding" && project.accepted_offer_amount != null ? formatJD(project.accepted_offer_amount) : formatBudget(project)}
                />
                <CompactDetail
                  icon={CreditCard}
                  label={isArabic ? "طريقة الدفع" : "Payment Method"}
                  value={
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formatPaymentMethod(project.payment_method)}
                    </span>
                  }
                />
                {project.payment_method === "cliq" && (
                  <CompactDetail
                    icon={CreditCard}
                    label={isArabic ? "التحويل إلى CliQ" : "CliQ transfer to"}
                    value={
                      <span className="text-base font-bold text-orange-600 tracking-wide">
                        {project.cliq_alias || project.cliq_number || import.meta.env.VITE_CLIQ_ALIAS || import.meta.env.VITE_CLIQ_NUMBER || DEFAULT_CLIQ_ALIAS}
                      </span>
                    }
                  />
                )}
                {formatDuration(project) && (
                  <CompactDetail
                    icon={Clock}
                    label={isArabic ? "المدة" : "Duration"}
                    value={formatDuration(project)}
                  />
                )}
                <CompactDetail
                  icon={Calendar}
                  label={isArabic ? "تاريخ الإنشاء" : "Created Date"}
                  value={
                    project.created_at
                      ? new Date(project.created_at).toLocaleDateString(isArabic ? "ar" : "en")
                      : "—"
                  }
                />
              </div>
            </div>
            {/* العنوان — صف كامل لأنه قد يكون طويلاً */}
            <DetailRow
              icon={FileText}
              label={isArabic ? "العنوان" : "Title"}
              value={project.title}
              valueBold
              clamp
            />
            {(project.category_name || project.sub_sub_category_name) && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 py-4 border-t border-slate-100 first:border-t-0">
                <div className="flex items-center gap-2 sm:w-40 shrink-0">
                  <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {isArabic ? "التصنيف" : "Category"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-1">
                  {project.category_name && (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {project.category_name}
                    </span>
                  )}
                  {project.sub_sub_category_name && (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                      {project.sub_sub_category_name}
                    </span>
                  )}
                </div>
              </div>
            )}
            {project.preferred_skills && Array.isArray(project.preferred_skills) && project.preferred_skills.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 py-4 border-t border-slate-100">
                <div className="flex items-center gap-2 sm:w-40 shrink-0">
                  <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {isArabic ? "المهارات المفضلة" : "Preferred Skills"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-1">
                  {project.preferred_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CliQ Payment Instruction Banner */}
        {project.payment_method === "cliq" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
            <p className="text-blue-900 text-sm font-semibold">
              {isArabic ? "التحويل إلى: " : "Transfer to: "}
              <span className="text-base font-bold text-orange-600 tracking-wide">
                {project.cliq_alias || project.cliq_number || import.meta.env.VITE_CLIQ_ALIAS || import.meta.env.VITE_CLIQ_NUMBER || DEFAULT_CLIQ_ALIAS}
              </span>
            </p>
            <p className="text-blue-800 text-sm font-medium">
              {isArabic
                ? "مهم: الرجاء إرسال صورة (Screenshot) من دفعة CliQ عبر واتساب لتأكيد الدفع."
                : "Important: Please send a screenshot of your CliQ payment on WhatsApp to confirm your payment."}
            </p>
          </div>
        )}

        {/* WhatsApp Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-b from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{isArabic ? "إرسال على واتساب" : "Send on WhatsApp"}</span>
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
