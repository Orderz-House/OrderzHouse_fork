import { useEffect, useMemo, useState } from "react";
import AuroraHeader, { useThemeLang } from "../AuroraHeader";
import { CalendarDays, MapPin, Video, Check } from "lucide-react";

const THEME_PRIMARY = "#028090";

const I18N = {
  en: {
    title: "Book an Appointment",
    subtitle: "Choose an available time that works for you.",
    typeLabel: "Meeting type",
    online: "Online",
    offline: "Offline (In person)",
    available: "Available slots",
    noSlots: "No available slots for this type. Try another day/type.",
    confirm: "Confirm Appointment",
    selecting: "Booking...",
    booked: "Booked!",
    location: "Location",
    onlineNote: "You’ll receive a meeting link in your email.",
    offlineNote: "Please arrive 10 minutes early.",
    pickSlot: "Please pick a time slot first.",
    successMsg: "Your appointment is confirmed. Check your email for details.",
  },
  ar: {
    title: "حجز موعد",
    subtitle: "اختر وقتًا متاحًا يناسبك.",
    typeLabel: "نوع الموعد",
    online: "أونلاين",
    offline: "حضوري (في المقر)",
    available: "المواعيد المتاحة",
    noSlots: "لا توجد مواعيد متاحة لهذا النوع. جرّب يومًا/نوعًا آخر.",
    confirm: "تأكيد الحجز",
    selecting: "جاري الحجز...",
    booked: "تم الحجز!",
    location: "الموقع",
    onlineNote: "سيصلك رابط الاجتماع على بريدك الإلكتروني.",
    offlineNote: "يُفضّل الحضور قبل 10 دقائق.",
    pickSlot: "يرجى اختيار موعد أولًا.",
    successMsg: "تم تأكيد موعدك. تفقد بريدك للتفاصيل.",
  },
};
const t = (lang, k) => I18N[lang]?.[k] ?? I18N.en[k];

export default function Appointment() {
  const { isDark, setIsDark, lang, setLang } = useThemeLang();

  const [type, setType] = useState("online");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState(null);
  const [booking, setBooking] = useState(false);
  const [done, setDone] = useState(false);

  const fetchSlots = async (tp) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/slots?type=${tp}`);
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(type);
  }, [type]);

  const onBook = async () => {
    if (!sel) return;
    setBooking(true);
    try {
      await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: sel.id,
          type,
        }),
      });
      setDone(true);
    } catch {
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className={`min-h-[100dvh] ${isDark ? "bg-[#0b1220] text-slate-100" : "bg-white text-slate-800"}`}>
      <AuroraHeader
        title={t(lang, "title")}
        subtitle={t(lang, "subtitle")}
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-12 gap-6">
        {/* Left: options and notes */}
        <aside className="lg:col-span-4 space-y-4">
          <div className={`rounded-2xl border p-5 ${isDark ? "border-slate-800 bg-slate-900/70" : "border-slate-100 bg-white/80"}`}>
            <div className="font-semibold mb-3">{t(lang, "typeLabel")}</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("online")}
                className={`rounded-xl border px-4 py-3 flex items-center justify-center gap-2 ${type==="online" ? "text-white" : (isDark?"border-slate-700":"border-slate-200")}`}
                style={{ background: type==="online" ? THEME_PRIMARY : undefined }}
              >
                <Video size={18} />
                {t(lang, "online")}
              </button>
              <button
                onClick={() => setType("offline")}
                className={`rounded-xl border px-4 py-3 flex items-center justify-center gap-2 ${type==="offline" ? "text-white" : (isDark?"border-slate-700":"border-slate-200")}`}
                style={{ background: type==="offline" ? THEME_PRIMARY : undefined }}
              >
                <MapPin size={18} />
                {t(lang, "offline")}
              </button>
            </div>

            <div className={`mt-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {type === "online" ? t(lang, "onlineNote") : t(lang, "offlineNote")}
            </div>
          </div>

          {sel && (
            <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-800 bg-slate-900/70" : "border-slate-100 bg-white/80"}`}>
              <div className="font-semibold mb-1">{t(lang, "location")}</div>
              <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {type === "online" ? "—" : (sel.location || "HQ Office")}
              </div>
            </div>
          )}
        </aside>

        {/* Right: slots */}
        <main className="lg:col-span-8">
          <div className={`rounded-2xl border p-5 ${isDark ? "border-slate-800 bg-slate-900/70" : "border-slate-100 bg-white/80"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-semibold">
                <CalendarDays size={18} />
                {t(lang, "available")}
              </div>
              {done && (
                <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold">
                  <Check size={16}/> {t(lang, "booked")}
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-40 rounded-xl border animate-pulse" />
            ) : slots.length === 0 ? (
              <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t(lang, "noSlots")}</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {slots.map((s) => {
                  const active = sel?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSel(s)}
                      className={`rounded-xl border px-4 py-3 text-left ${active ? "text-white" : (isDark?"border-slate-700":"border-slate-200")}`}
                      style={{ background: active ? THEME_PRIMARY : undefined }}
                    >
                      <div className="font-medium">{s.label ?? new Date(s.dateISO).toLocaleString()}</div>
                      {s.location && type === "offline" && (
                        <div className={`text-xs mt-1 ${isDark ? "text-slate-300" : "text-slate-500"}`}>{s.location}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={onBook}
                disabled={!sel || booking || done}
                className={`px-5 py-3 rounded-xl text-white font-semibold ${(!sel || booking || done) ? "opacity-60 pointer-events-none" : ""}`}
                style={{ background: THEME_PRIMARY }}
                title={!sel ? I18N[lang].pickSlot : ""}
              >
                {booking ? I18N[lang].selecting : I18N[lang].confirm}
              </button>
            </div>

            {done && (
              <div className={`mt-4 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {I18N[lang].successMsg}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
