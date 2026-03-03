/**
 * Partner referral tracking: capture ref/UTM params, store 30 days, log visit once per session, attach to signup.
 */

const STORAGE_KEY = "oh_partner_attribution";
const STORAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const VISIT_LOGGED_KEY = "oh_visit_logged_sid";

/**
 * Read ref + UTM from URL (window.location or passed search string).
 * @param {string} [search] - Optional search string (e.g. location.search)
 * @returns {{ source: string|null, medium: string|null, campaign: string|null, ref: string|null, landing_path: string }}
 */
export function getAttributionFromUrl(search = typeof window !== "undefined" ? window.location.search : "") {
  const params = new URLSearchParams(search);
  const ref = params.get("ref")?.trim() || null;
  const source = params.get("utm_source")?.trim() || ref || null;
  const medium = params.get("utm_medium")?.trim() || null;
  const campaign = params.get("utm_campaign")?.trim() || null;
  const landing_path =
    typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
  return { source, medium, campaign, ref, landing_path };
}

/**
 * Persist attribution in localStorage with 30-day expiry. Only stores if source or ref present.
 */
export function storeAttribution(attribution) {
  if (typeof window === "undefined") return;
  const { source, ref } = attribution;
  if (!source && !ref) return;
  try {
    const payload = {
      ...attribution,
      storedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("partnerReferral: storeAttribution failed", e);
  }
}

/**
 * Get stored attribution if still valid (within 30 days). Returns null if expired or missing.
 */
export function getStoredAttribution() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const age = Date.now() - (data.storedAt || 0);
    if (age > STORAGE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return {
      signup_source: data.source ?? null,
      signup_medium: data.medium ?? null,
      signup_campaign: data.campaign ?? null,
      signup_ref: data.ref ?? null,
      signup_landing_path: data.landing_path ?? null,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Whether we already logged a visit for this session (by session_id from backend).
 */
function getVisitLoggedSid() {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(VISIT_LOGGED_KEY);
  } catch (e) {
    return null;
  }
}

function setVisitLoggedSid(sid) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(VISIT_LOGGED_KEY, sid || "1");
  } catch (e) {}
}

/**
 * Call POST /referrals/visit once per session. Call this on app load or register page mount.
 * Uses getApiBaseURL from api/client for base URL; pass API instance if you have it to avoid circular deps.
 */
export function logPartnerVisitIfNeeded(attribution, apiPost) {
  if (typeof window === "undefined") return;
  const { source, ref } = attribution;
  if (!source && !ref) return;
  if (getVisitLoggedSid()) return; // already logged this session

  let baseURL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") baseURL = "http://localhost:5000";
    else if (h === "orderzhouse.com" || h === "www.orderzhouse.com") baseURL = "https://orderzhouse-backend.onrender.com";
  }
  const post =
    apiPost ||
    (async (url, body) => {
      const res = await fetch(baseURL + url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      return res.json();
    });

  const payload = {
    source: attribution.source || attribution.ref || "unknown",
    medium: attribution.medium ?? undefined,
    campaign: attribution.campaign ?? undefined,
    ref: attribution.ref ?? undefined,
    landing_path: attribution.landing_path || (window.location?.pathname + window.location?.search) || "",
  };

  post("/referrals/visit", payload)
    .then((res) => {
      if (res?.session_id) setVisitLoggedSid(res.session_id);
      else setVisitLoggedSid("1");
    })
    .catch(() => {});
}

/**
 * One-shot: read URL params, store attribution, and log visit once per session.
 * Call on app init or when Register (or any landing) mounts.
 * @param {string} [search] - Optional location.search
 * @param {(url: string, body: object) => Promise<any>} [apiPost] - Optional fetch/post for visit (e.g. API.post)
 */
export function captureAndLogReferral(search, apiPost) {
  const attribution = getAttributionFromUrl(search);
  if (attribution.source || attribution.ref) {
    storeAttribution(attribution);
    logPartnerVisitIfNeeded(attribution, apiPost);
  }
}
