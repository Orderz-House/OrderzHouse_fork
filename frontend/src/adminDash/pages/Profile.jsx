import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Settings,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  User,
} from "lucide-react";
import { useToast } from "../../components/toast/ToastProvider";
import API from "../api/axios";

const THEME = {
  BG: "#F6F7FB",
  CARD_SHADOW: "0 10px 30px rgba(15,23,42,0.06)",
  RING: "rgba(15,23,42,0.10)",
  PRIMARY: "#6366F1",
  PRIMARY_DARK: "#4F46E5",
  MUTED: "#64748B",
};

const ringStyle = { border: `1px solid ${THEME.RING}` };

export default function Profile() {
  const { showToast } = useToast();

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const roleBase = useMemo(() => {
    const seg = (pathname.split("/")[1] || "").toLowerCase();
    return ["admin", "client", "freelancer", "partner"].includes(seg)
      ? `/${seg}`
      : "/admin";
  }, [pathname]);

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

    const rating5 = Number(p.rating || 0);
    const rating10 = Math.max(0, Math.min(10, rating5 * 2));

    const phone = p.phone_number || "—";
    const email = p.email || "—";
    const address = p.country || "—";
    const site = "—";

    return {
      fullName,
      location,
      title,
      rating10,
      rating5,
      phone,
      email,
      address,
      site,
      birthday: "—",
      gender: "—",
      profilePic: p.profile_pic_url || "",
    };
  }, [profile]);

  const formatRating = (n) => {
    const v = Number.isFinite(n) ? n : 0;
    return v.toFixed(1).replace(".", ",");
  };

  const Card = ({ className = "", children }) => (
    <div
      className={`rounded-[26px] bg-white ${className}`}
      style={{ boxShadow: THEME.CARD_SHADOW }}
    >
      {children}
    </div>
  );

  const SectionTitle = ({ children }) => (
    <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">
      {children}
    </p>
  );

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
                  style={{ stroke: "#CBD5E1" }}
                />
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: "50%" }}
                >
                  <Star
                    className="w-4 h-4"
                    style={{
                      stroke: THEME.PRIMARY,
                      fill: THEME.PRIMARY,
                    }}
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
                stroke: isFull ? THEME.PRIMARY : "#CBD5E1",
                fill: isFull ? THEME.PRIMARY : "transparent",
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
              <p className="text-[11.5px] mt-0.5 text-slate-500">{line1}</p>
            ) : null}
            {line2 ? (
              <p className="text-[11.5px] text-slate-500">{line2}</p>
            ) : null}
          </div>

          {tag ? (
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
              style={{ background: THEME.PRIMARY_DARK }}
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
        style={{ background: THEME.BG, color: THEME.MUTED }}
      >
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen py-5 sm:py-6" style={{ background: THEME.BG }}>
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* Hero مثل الداشبورد */}
        <div className="rounded-[26px] overflow-hidden mb-5 sm:mb-6">
          <div className="relative bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 px-5 sm:px-6 py-5 sm:py-6 text-white">
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/80">
              PROFILE
            </div>

            <div className="mt-2 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[18px] sm:text-2xl font-extrabold leading-tight truncate">
                  {vm.fullName}
                </h1>

                <div className="mt-1 flex items-center gap-2 text-[12px] text-white/85">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{vm.location}</span>
                  <span className="opacity-70">•</span>
                  <span className="font-semibold">{vm.title}</span>
                </div>
              </div>

              {/* ✅ Settings -> editprofile (نفس منطقك) */}
              <button
                type="button"
                onClick={() => navigate(`${roleBase}/editprofile`)}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/20 px-3 py-2 text-xs font-semibold text-white"
                title="Edit profile"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-[18px] font-extrabold">{formatRating(vm.rating10)}</span>
              <StarRow value5={vm.rating5} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 sm:gap-6">
          {/* LEFT */}
          <Card className="p-4 sm:p-5">
            <div
              className="w-full h-[210px] overflow-hidden rounded-[22px] bg-slate-100"
              style={ringStyle}
            >
              {vm.profilePic ? (
                <img
                  src={vm.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <User className="w-12 h-12 text-slate-300" />
                </div>
              )}
            </div>

            <div className="mt-5">
              <SectionTitle>Work</SectionTitle>
              <div className="mt-2 divide-y divide-slate-100">
                <WorkItem
                  item={{ title: "—", tag: "Primary", address: "", contact: "" }}
                  fallbackLabel="—"
                />
                <WorkItem
                  item={{ title: "—", tag: "Secondary", address: "", contact: "" }}
                  fallbackLabel="—"
                />
              </div>
            </div>

            <div className="mt-5">
              <SectionTitle>Skills</SectionTitle>
              <ul className="mt-2 space-y-1 text-[12px] text-slate-500">
                {["—", "—", "—", "—", "—"].map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </Card>

          {/* RIGHT */}
          <Card className="p-4 sm:p-6">
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="h-10 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Send message
              </button>

              <button
                type="button"
                className="h-10 px-4 rounded-2xl text-xs font-semibold text-white inline-flex items-center gap-2"
                style={{ background: THEME.PRIMARY_DARK }}
              >
                ✓ Contacts
              </button>

              <button
                type="button"
                className="h-10 px-3 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-50"
              >
                Report user
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-5 flex items-center gap-3 border-b border-slate-100">
              {[
                { key: "timeline", label: "Timeline" },
                { key: "about", label: "About" },
              ].map((t) => {
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`py-3 text-xs font-extrabold transition-colors ${
                      active ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                    }`}
                    style={{
                      borderBottom: active ? `2px solid ${THEME.PRIMARY_DARK}` : "2px solid transparent",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="pt-6">
              {activeTab === "timeline" ? (
                <div className="text-[13px] text-slate-500">
                  No timeline items yet.
                </div>
              ) : (
                <div className="space-y-7">
                  {/* Contact */}
                  <div>
                    <SectionTitle>Contact information</SectionTitle>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-y-3 text-[13px]">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="w-4 h-4" />
                        Phone:
                      </div>
                      <div className="font-semibold text-slate-900">{vm.phone}</div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-4 h-4" />
                        Address:
                      </div>
                      <div className="text-slate-700">{vm.address}</div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <Mail className="w-4 h-4" />
                        E-mail:
                      </div>
                      <div className="font-semibold text-slate-900">{vm.email}</div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <span
                          className="w-4 h-4 grid place-items-center text-[10px] font-extrabold border border-slate-200 rounded"
                        >
                          @
                        </span>
                        Site:
                      </div>
                      <div className="font-semibold text-slate-900">{vm.site}</div>
                    </div>
                  </div>

                  {/* Basic */}
                  <div>
                    <SectionTitle>Basic information</SectionTitle>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-y-3 text-[13px]">
                      <div className="text-slate-500">Birthday:</div>
                      <div className="text-slate-700">{vm.birthday}</div>

                      <div className="text-slate-500">Gender:</div>
                      <div className="text-slate-700">{vm.gender}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
