import { useEffect, useState } from "react";
import API from "../../api/client.js";
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
    noSlots: "No available slots for this date. Try another day.",
    confirm: "Confirm Appointment",
    selecting: "Booking...",
    booked: "Booked!",
    location: "Location",
    onlineNote: "You’ll receive the meeting link once confirmed.",
    offlineNote: "Please arrive 10 minutes early.",
    pickSlot: "Please pick a time slot first.",
    successMsg: "Your appointment is confirmed.",
  },
  ar: {
    title: "حجز موعد",
    subtitle: "اختر وقتًا متاحًا يناسبك.",
    typeLabel: "نوع الموعد",
    online: "أونلاين",
    offline: "حضوري (في المقر)",
    available: "المواعيد المتاحة",
    noSlots: "لا توجد مواعيد متاحة لهذا اليوم. جرّب يومًا آخر.",
    confirm: "تأكيد الحجز",
    selecting: "جاري الحجز...",
    booked: "تم الحجز!",
    location: "الموقع",
    onlineNote: "سيتم إرسال رابط الاجتماع بعد التأكيد.",
    offlineNote: "يُفضل الحضور قبل 10 دقائق.",
    pickSlot: "يرجى اختيار موعد أولًا.",
    successMsg: "تم تأكيد موعدك بنجاح.",
  },
};
const t = (lang, k) => I18N[lang]?.[k] ?? I18N.en[k];

export default function Appointment() {
  const { isDark, setIsDark, lang, setLang } = useThemeLang();

  const [type, setType] = useState("online");
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [done, setDone] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

 // Generate 15-min intervals from 9:00 to 18:00
const generateTimeSlots = () => {
  const slots = [];
  let hour = 9;
  let minute = 0;

  while (hour < 18 || (hour === 18 && minute === 0)) {
    const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    slots.push(label);
    minute += 15;
    if (minute >= 60) {
      minute = 0;
      hour++;
    }
  }

  return slots;
};


  // Fetch booked times from DB
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await API.get("/applicants-appointments/booked", {
        params: { date },
      });
      const booked = res.data?.bookedTimes || [];
      const available = generateTimeSlots()
        .filter((t) => !booked.includes(t))
        .map((time, idx) => ({
          id: idx,
          label: time,
          time,
          dateISO: `${date}T${time}`,
          location: type === "offline" ? "HQ Office" : null,
        }));
      setSlots(available);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [date, type]);

  // Handle booking
  const onBook = async () => {
    if (!selected) return;
    setBooking(true);
    try {
      await API.post("/applicants-appointments/public", {
        survey_id: 1, // if you have a survey_id from form context
        appointment_date: date,
        appointment_time: selected.time,
        appointment_type: type,
        interviewer_name: "AutoScheduler",
      });
      setDone(true);
    } catch (err) {
      console.error("Error booking appointment:", err);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div
      className={`min-h-[100dvh] ${
        isDark ? "bg-[#0b1220] text-slate-100" : "bg-white text-slate-800"
      }`}
    >
      <AuroraHeader
        title={t(lang, "title")}
        subtitle={t(lang, "subtitle")}
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-12 gap-6">
        {/* Left: Options */}
        <aside className="lg:col-span-4 space-y-4">
          <div
            className={`rounded-2xl border p-5 ${
              isDark
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-100 bg-white/80"
            }`}
          >
            <div className="font-semibold mb-3">{t(lang, "typeLabel")}</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("online")}
                className={`rounded-xl border px-4 py-3 flex items-center justify-center gap-2 ${
                  type === "online"
                    ? "text-white"
                    : isDark
                    ? "border-slate-700"
                    : "border-slate-200"
                }`}
                style={{
                  background: type === "online" ? THEME_PRIMARY : undefined,
                }}
              >
                <Video size={18} />
                {t(lang, "online")}
              </button>
              <button
                onClick={() => setType("offline")}
                className={`rounded-xl border px-4 py-3 flex items-center justify-center gap-2 ${
                  type === "offline"
                    ? "text-white"
                    : isDark
                    ? "border-slate-700"
                    : "border-slate-200"
                }`}
                style={{
                  background: type === "offline" ? THEME_PRIMARY : undefined,
                }}
              >
                <MapPin size={18} />
                {t(lang, "offline")}
              </button>
            </div>

            <div
              className={`mt-4 text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {type === "online"
                ? t(lang, "onlineNote")
                : t(lang, "offlineNote")}
            </div>

            <div className="mt-4">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-100"
                    : "border-slate-200"
                }`}
              />
            </div>
          </div>

          {selected && (
            <div
              className={`rounded-2xl border p-4 ${
                isDark
                  ? "border-slate-800 bg-slate-900/70"
                  : "border-slate-100 bg-white/80"
              }`}
            >
              <div className="font-semibold mb-1">{t(lang, "location")}</div>
              <div
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {type === "online" ? "—" : selected.location || "HQ Office"}
              </div>
            </div>
          )}
        </aside>

        {/* Right: Time slots */}
        <main className="lg:col-span-8">
          <div
            className={`rounded-2xl border p-5 ${
              isDark
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-100 bg-white/80"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-semibold">
                <CalendarDays size={18} />
                {t(lang, "available")}
              </div>
              {done && (
                <span className="inline-flex items-center gap-2 text-emerald-600 font-semibold">
                  <Check size={16} /> {t(lang, "booked")}
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-40 rounded-xl border animate-pulse" />
            ) : slots.length === 0 ? (
              <div
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {t(lang, "noSlots")}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {slots.map((slot) => {
                  const active = selected?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelected(slot)}
                      className={`rounded-xl border px-4 py-3 text-left ${
                        active
                          ? "text-white"
                          : isDark
                          ? "border-slate-700"
                          : "border-slate-200"
                      }`}
                      style={{
                        background: active ? THEME_PRIMARY : undefined,
                      }}
                    >
                      <div className="font-medium">{slot.label}</div>
                      {slot.location && type === "offline" && (
                        <div
                          className={`text-xs mt-1 ${
                            isDark ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {slot.location}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={onBook}
                disabled={!selected || booking || done}
                className={`px-5 py-3 rounded-xl text-white font-semibold ${
                  !selected || booking || done
                    ? "opacity-60 pointer-events-none"
                    : ""
                }`}
                style={{ background: THEME_PRIMARY }}
                title={!selected ? I18N[lang].pickSlot : ""}
              >
                {booking ? I18N[lang].selecting : I18N[lang].confirm}
              </button>
            </div>

            {done && (
              <div
                className={`mt-4 text-sm ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {I18N[lang].successMsg}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
