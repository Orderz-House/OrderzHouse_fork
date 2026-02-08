import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import API from "../../api/client.js";
import {
  Shield,
  Loader,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  UserX,
  Calendar,
} from "lucide-react";

const PRIMARY = "#028090";
const DARK = "#05668D";

export default function AccountSettings() {
  const { token, userData } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  // ============= STATES =============
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("2fa");

  // Password tab
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPass] = useState("");
  const [confirmPassword, setConfirmPass] = useState("");

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Deactivation
  const [deactPass, setDeactPass] = useState("");
  const [showDeact, setShowDeact] = useState(false);
  const [confirmDeactCheck, setConfirmDeactCheck] = useState(false);
  const [deactReason, setDeactReason] = useState(""); // 👈 سبب التعطيل

  // Escape button
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const [isEscaping, setEscaping] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const is2faEnabled = userData?.is_two_factor_enabled || false;

  const resetAll = () => {
    setError("");
    setSuccess("");
    setQrCodeUrl("");
    setVerificationCode("");
    setCurrentPassword("");
    setNewPass("");
    setConfirmPass("");
    setDeactPass("");
    setDeactReason("");           // 👈 reset للسبب
    setConfirmDeactCheck(false);
    setEscaping(false);
    setPos({ x: 0, y: 0 });
  };

  // Escape button handler
  const isReadyToDeactivate =
    confirmDeactCheck && deactPass && deactReason.trim(); // 👈 السبب صار جزء من الشرط

  useEffect(() => {
    setEscaping(!isReadyToDeactivate);
    if (isReadyToDeactivate) setPos({ x: 0, y: 0 });
  }, [isReadyToDeactivate]);

  const handleMove = (e) => {
    if (!isEscaping || !buttonRef.current || !containerRef.current) return;

    const btn = buttonRef.current.getBoundingClientRect();
    const cont = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const bx = btn.left + btn.width / 2;
    const by = btn.top + btn.height / 2;

    const dist = Math.hypot(mouseX - bx, mouseY - by);
    if (dist < 120) {
      const angle = Math.atan2(mouseY - by, mouseX - bx);
      let newX = -Math.cos(angle) * 140;
      let newY = -Math.sin(angle) * 140;

      const maxX = cont.width / 2 - 40;
      const maxY = cont.height / 2 - 40;

      newX = Math.max(-maxX, Math.min(maxX, newX));
      newY = Math.max(-maxY, Math.min(maxY, newY));

      setPos({ x: newX, y: newY });
    }
  };

  // ===================== 2FA =====================
  const generateSecret = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post(
        "/auth/2fa/generate",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQrCodeUrl(res.data.qrCodeUrl);
      setSuccess("Scan the QR code with your authenticator app.");
    } catch (err) {
      setError("Failed to generate secret.");
    } finally {
      setLoading(false);
    }
  };

  const verify2fa = async () => {
    if (!verificationCode) {
      setError("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await API.post(
        "/auth/2fa/verify",
        { token: verificationCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("2FA enabled successfully!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError("Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const disable2fa = async () => {
    if (!currentPassword) return setError("Enter your password first.");
    if (!confirm("Disable 2FA?")) return;

    setLoading(true);
    setError("");

    try {
      const res = await API.post(
        "/users/verify-password",
        { password: currentPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data.success) return setError("Incorrect password.");

      await API.post(
        "/auth/2fa/disable",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("2FA disabled.");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setError("Failed to disable 2FA.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== Password Update =====================
  const updatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword)
      return setError("All fields are required.");

    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");

    if (newPassword.length < 8)
      return setError("Password must be at least 8 characters.");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await API.put(
        "/users/update-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Password updated!");
      resetAll();
    } catch {
      setError("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== Deactivate =====================
  const deactivate = async () => {
    if (!confirmDeactCheck) {
      return setError("Please confirm you understand the consequences.");
    }

    if (!deactPass) {
      return setError("Please enter your password.");
    }

    if (!deactReason.trim()) {
      return setError("Please provide a reason for deactivation.");
    }

    if (
      !confirm(
        "Deactivate account? This will start a 30-day deletion countdown."
      )
    )
      return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1) Verify password
      const verifyRes = await API.post(
        "/users/verify-password",
        { password: deactPass },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!verifyRes.data.success) {
        setLoading(false);
        return setError("Incorrect password. Please try again.");
      }

      // 2) Deactivate + send reason
      await API.put(
        "/users/deactivate",
        { reason: deactReason.trim() }, // 👈 سبب التعطيل يُرسل للباك
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Account deactivated. You have 30 days to reactivate.");
      setTimeout(() => {
        dispatch({ type: "auth/logout" });
        window.location.href = "/login";
      }, 1500);
    } catch {
      setError("Failed to deactivate account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
      {/* HEADER */}
      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6" style={{ color: PRIMARY }} />
        Account Security
      </h2>

      {/* TABS */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {[
          { id: "2fa", label: "Two-Factor Auth" },
          { id: "password", label: "Change Password" },
          { id: "deactivate", label: "Deactivate Account" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              resetAll();
            }}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              activeTab === t.id
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            style={{ "--primary": PRIMARY }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ALERTS */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">
          {success}
        </div>
      )}

      {/* ============================
          TAB: 2FA
      ============================ */}
      {activeTab === "2fa" && (
        <div>
          {!is2faEnabled ? (
            <>
              {!qrCodeUrl ? (
                <button
                  onClick={generateSecret}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl text-white font-semibold shadow-sm disabled:opacity-60"
                  style={{ background: PRIMARY }}
                >
                  {isLoading ? "Loading…" : "Enable 2FA"}
                </button>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">
                      Scan this QR with your authenticator app:
                    </p>
                    <div className="p-3 border rounded-xl bg-slate-50 inline-block">
                      <img src={qrCodeUrl} className="w-48" alt="2FA QR" />
                    </div>
                  </div>

                  <div className="flex gap-3 items-center">
                    <input
                      className="border rounded-lg px-3 py-2 text-sm w-32"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                    />
                    <button
                      onClick={verify2fa}
                      disabled={
                        isLoading || verificationCode.trim().length !== 6
                      }
                      className="px-4 py-2 rounded-lg text-white font-semibold shadow-sm disabled:opacity-60"
                      style={{ background: DARK }}
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4 max-w-md">
              <p className="text-sm text-slate-600">
                Two-factor authentication is currently enabled on your account.
              </p>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Confirm Password to Disable 2FA
                </label>
                <div className="relative mt-1">
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full border rounded-lg px-3 py-2"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={disable2fa}
                disabled={isLoading || !currentPassword}
                className="px-5 py-2.5 rounded-xl text-white font-semibold shadow-sm disabled:opacity-60"
                style={{ background: "#c0392b" }}
              >
                Disable 2FA
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================
          TAB: PASSWORD
      ============================ */}
      {activeTab === "password" && (
        <div className="space-y-4 max-w-md">
          {/* Current */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Current Password
            </label>
            <div className="relative mt-1">
              <input
                type={showCurrent ? "text" : "password"}
                className="w-full border rounded-lg px-3 py-2"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showNew ? "text" : "password"}
                className="w-full border rounded-lg px-3 py-2"
                value={newPassword}
                onChange={(e) => setNewPass(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Must be at least 8 characters.
            </p>
          </div>

          {/* Confirm */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full border rounded-lg px-3 py-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={updatePassword}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-white font-semibold shadow-sm disabled:opacity-60"
            style={{ background: PRIMARY }}
          >
            {isLoading ? "Saving…" : "Update Password"}
          </button>
        </div>
      )}

      {/* ============================
          TAB: DEACTIVATE
      ============================ */}
      {activeTab === "deactivate" && (
        <div
          ref={containerRef}
          onMouseMove={handleMove}
          className="relative min-h-[320px] space-y-5"
        >
          <div className="p-4 border rounded-xl bg-rose-50 border-rose-200 flex gap-3">
            <UserX className="w-5 h-5 text-rose-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-rose-700">
                Account Deactivation
              </h3>
              <ul className="text-sm mt-2 text-rose-600 list-disc pl-5 space-y-1">
                <li>Your profile becomes hidden immediately.</li>
                <li>Your account enters a 30-day deletion countdown.</li>
                <li>You can reactivate anytime by logging in within 30 days.</li>
              </ul>
            </div>
          </div>

          <label className="flex gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={confirmDeactCheck}
              onChange={(e) => setConfirmDeactCheck(e.target.checked)}
            />
            <span>
              I understand that my account will be deactivated and permanently
              deleted after 30 days if I don&apos;t log in again.
            </span>
          </label>

          {/* Password field */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Password (required)
            </label>
            <div className="relative mt-1">
              <input
                type={showDeact ? "text" : "password"}
                placeholder="Enter your password"
                className="border rounded-lg px-3 py-2 w-full"
                value={deactPass}
                onChange={(e) => setDeactPass(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowDeact(!showDeact)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showDeact ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Reason field */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Reason for deactivation (required)
            </label>
            <textarea
              rows={3}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="Tell us why you are deactivating your account..."
              value={deactReason}
              onChange={(e) => setDeactReason(e.target.value)}
            />
          </div>

          <div className="relative h-20 flex justify-center items-center">
            <button
              ref={buttonRef}
              onClick={deactivate}
              disabled={!isReadyToDeactivate || isLoading}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
              }}
              className={`px-6 py-2.5 text-white rounded-xl font-semibold shadow-sm absolute transition-all ${
                isReadyToDeactivate
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-300 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Processing…" : "Deactivate Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
