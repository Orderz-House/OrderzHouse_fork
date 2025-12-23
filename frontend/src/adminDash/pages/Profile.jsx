import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  User,
} from "lucide-react";
import { useToast } from "../../components/toast/ToastProvider";
import API from "../api/axios";


const ACCENT = "#C2410C";
const BORDER = "#E6EAEE";
const MUTED = "#7B8A97";
const dark = "#30353b";
const BG = "#F5F7FA";

export default function Profile() {
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      setFetchLoading(true);
      const res = await API.get("/users/getUserdata");
      const data = res.data;

      if (data?.success && data?.user) {
        setProfile(data.user);
      } else {
        showToast(data?.message || "Failed to load profile", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading profile", "error");
    } finally {
      setFetchLoading(false);
    }
  };

  const roleTitle = (role_id) => {
    // عدّل المسميات لو عندك Roles مختلفة
    if (role_id === 1) return "Admin";
    if (role_id === 2) return "Client";
    if (role_id === 3) return "Freelancer";
    return "User";
  };

  const vm = useMemo(() => {
    const p = profile || {};

    const fullName =
      [p.first_name, p.last_name].filter(Boolean).join(" ") ||
      p.username ||
      "—";

    const location = p.country || "—";
    const title = roleTitle(p.role_id);

    const rating5 = Number(p.rating || 0); // من الداتا بيس (1..5)
    const rating10 = Math.max(0, Math.min(10, rating5 * 2)); // للعرض مثل 8,6

    // بالصورة عندك Work/Skills: مو موجودين بجدول users، فخليتهم placeholders مثل التصميم
    const workItems = [];

    const skills = [];

    const phone = p.phone_number || "—";
    const email = p.email || "—";
    const address = p.country || "—";
    const site = "—"; // ما عندك عمود website بالusers

    const birthday = "—";
    const gender = "—";

    return {
      fullName,
      location,
      title,
      rating10,
      rating5,
      workItems,
      skills,
      phone,
      email,
      address,
      site,
      birthday,
      gender,
      profilePic: p.profile_pic_url || "",
    };
  }, [profile]);

  const formatRating = (n) => {
    const v = Number.isFinite(n) ? n : 0;
    return v.toFixed(1).replace(".", ",");
  };

  const StarRow = ({ value5 }) => {
    const v = Math.max(0, Math.min(5, Number(value5 || 0)));
    const full = Math.floor(v);
    const hasHalf = v - full >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const isFull = i < full;
          const isHalf = i === full && hasHalf;

          if (isHalf) {
            return (
              <span key={i} className="relative inline-block w-4 h-4">
                <Star
                  className="absolute inset-0 w-4 h-4"
                  style={{ stroke: "#C9D3DC" }}
                />
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: "50%" }}
                >
                  <Star
                    className="w-4 h-4"
                    style={{ stroke: ACCENT, fill: ACCENT }}
                  />
                </span>
              </span>
            );
          }

          return (
            <Star
              key={i}
              className="w-4 h-4"
              style={{
                stroke: isFull ? ACCENT : "#C9D3DC",
                fill: isFull ? ACCENT : "transparent",
              }}
            />
          );
        })}
      </div>
    );
  };

  const WorkItem = ({ item, fallbackLabel }) => {
    const title = item?.title || fallbackLabel;
    const tag = item?.tag || "";
    const line1 = item?.address || "";
    const line2 = item?.contact || "";

    return (
      <div className="py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 truncate">
              {title}
            </p>
            {line1 ? (
              <p className="text-[11.5px] mt-0.5" style={{ color: MUTED }}>
                {line1}
              </p>
            ) : null}
            {line2 ? (
              <p className="text-[11.5px]" style={{ color: MUTED }}>
                {line2}
              </p>
            ) : null}
          </div>

          {tag ? (
            <span
              className="shrink-0 rounded px-2 py-0.5 text-[11px] font-medium"
              style={{ background: "#C2410C", color: "#fffeffff" }}
            >
              {tag}
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  if (fetchLoading) {
    return (
      <div
        className="min-h-[420px] grid place-items-center"
        style={{ background: BG, color: MUTED }}
      >
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6" style={{ background: BG }}>
      <div
        className="mx-auto w-full  overflow-hidden rounded"
        style={{ border: `1px solid ${BORDER}`, background: "#fff" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          {/* LEFT */}
          <aside
            className="border-b md:border-b-0 "
            style={{ borderColor: BORDER }}
          >
            <div className="p-5">
              <div
                className="w-full h-[175px] overflow-hidden rounded-sm bg-slate-100 border"
                style={{ borderColor: BORDER }}
              >
                {vm.profilePic ? (
                  <img
                    src={vm.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center">
                    <User className="w-12 h-12" style={{ color: "#B7C3CE" }} />
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 pb-5">
              <p
                className="text-[11px] font-semibold tracking-wider"
                style={{ color: MUTED }}
              >
                WORK
              </p>

              <div className="mt-2 divide-y" style={{ borderColor: BORDER }}>
                <WorkItem
                  item={{
                    title: "—",
                    tag: "Primary",
                    address: "",
                    contact: "",
                  }}
                  fallbackLabel="—"
                />
                <div className="h-px" style={{ background: BORDER }} />
                <WorkItem
                  item={{
                    title: "—",
                    tag: "Secondary",
                    address: "",
                    contact: "",
                  }}
                  fallbackLabel="—"
                />
              </div>

              <div className="mt-5">
                <p
                  className="text-[11px] font-semibold tracking-wider"
                  style={{ color: MUTED }}
                >
                  SKILLS
                </p>

                <div className="mt-2">
                  <ul className="space-y-1">
                    {["—", "—", "—", "—", "—"].map((s, i) => (
                      <li
                        key={i}
                        className="text-[12px]"
                        style={{ color: MUTED }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT */}
          <main className="p-5 pl-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-[20px] font-semibold text-slate-800 truncate">
                    {vm.fullName}
                  </h1>
                  <span
                    className="flex items-center gap-1 text-[12px]"
                    style={{ color: MUTED }}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {vm.location}
                  </span>
                </div>

                <p
                  className="text-[12.5px] font-medium mt-0.5"
                  style={{ color: ACCENT }}
                >
                  {vm.title}
                </p>

                <div className="mt-8">
                  <p
                    className="text-[11px] font-semibold tracking-wider"
                    style={{ color: MUTED }}
                  >
                    RATING
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[18px] font-semibold text-slate-800">
                      {formatRating(vm.rating10)}
                    </span>
                    <StarRow value5={vm.rating5} />
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="h-9 px-3 rounded border text-[12px] font-medium flex items-center gap-2"
                    style={{
                      borderColor: BORDER,
                      color: "#4B5563",
                      background: "#fff",
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Send message
                  </button>

                  <button
                    type="button"
                    className="h-9 px-4 rounded border text-[12px] font-semibold flex items-center gap-2"
                    style={{
                      borderColor: "",
                      background: "#C2410C",
                      color: "#fffeffff",
                    }}
                  >
                    ✓ Contacts
                  </button>

                  <button
                    type="button"
                    className="h-9 px-2 text-[12px] font-medium"
                    style={{ color: MUTED }}
                  >
                    Report user
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="hidden sm:flex items-center gap-2 text-[12px] font-medium"
                style={{ color: MUTED }}
              >
                <Bookmark className="w-4 h-4" />
                Bookmark
              </button>
            </div>

            {/* Tabs */}
            <div
              className="mt-5 border-b flex items-center gap-6"
              style={{ borderColor: BORDER }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
                className="py-3 text-[12px] font-medium flex items-center gap-2"
                style={{
                  color: activeTab === "timeline" ? "#111827" : MUTED,
                  borderBottom:
                    activeTab === "timeline"
                      ? `2px solid ${ACCENT}`
                      : "2px solid transparent",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      activeTab === "timeline" ? ACCENT : "transparent",
                  }}
                />
                Timeline
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("about")}
                className="py-3 text-[12px] font-medium flex items-center gap-2"
                style={{
                  color: activeTab === "about" ? "#111827" : MUTED,
                  borderBottom:
                    activeTab === "about"
                      ? `2px solid ${ACCENT}`
                      : "2px solid transparent",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: activeTab === "about" ? ACCENT : "transparent",
                  }}
                />
                About
              </button>
            </div>

            {/* Content */}
            <div className="pt-10">
              {activeTab === "timeline" ? (
                <div className="text-[12.5px]" style={{ color: MUTED }}>
                  No timeline items yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <p
                      className="text-[11px] font-semibold tracking-wider"
                      style={{ color: dark }}
                    >
                      CONTACT INFORMATION
                    </p>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-y-3 text-[12.5px]">
                      <div
                        className="flex items-center gap-2"
                        style={{ color: MUTED }}
                      >
                        <Phone className="w-4 h-4" />
                        Phone:
                      </div>
                      <div className="font-medium" style={{ color: ACCENT }}>
                        {vm.phone}
                      </div>

                      <div
                        className="flex items-center gap-2"
                        style={{ color: MUTED }}
                      >
                        <MapPin className="w-4 h-4" />
                        Address:
                      </div>
                      <div className="text-slate-700">{vm.address}</div>

                      <div
                        className="flex items-center gap-2"
                        style={{ color: MUTED }}
                      >
                        <Mail className="w-4 h-4" />
                        E-mail:
                      </div>
                      <div className="font-medium" style={{ color: ACCENT }}>
                        {vm.email}
                      </div>

                      <div
                        className="flex items-center gap-2"
                        style={{ color: MUTED }}
                      >
                        <span
                          className="w-4 h-4 grid place-items-center text-[10px] font-bold border rounded"
                          style={{ borderColor: BORDER }}
                        >
                          @
                        </span>
                        Site:
                      </div>
                      <div className="font-medium" style={{ color: ACCENT }}>
                        {vm.site}
                      </div>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div>
                    <p
                      className="text-[11px] font-semibold tracking-wider"
                      style={{ color: dark }}
                    >
                      BASIC INFORMATION
                    </p>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-y-3 text-[12.5px]">
                      <div style={{ color: MUTED }}>Birthday:</div>
                      <div className="text-slate-700">{vm.birthday}</div>

                      <div style={{ color: MUTED }}>Gender:</div>
                      <div className="text-slate-700">{vm.gender}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
