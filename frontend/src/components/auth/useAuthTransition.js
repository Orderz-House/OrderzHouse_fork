import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const BASE = "transition-all duration-300 ease-out will-change-transform";
const ENTER = "opacity-0 translate-y-2";
const IDLE = "opacity-100 translate-y-0";
const LEAVE = "opacity-0 translate-y-2";

function getPrefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Hook for auth page enter/leave transitions.
 * - containerClass: apply to card or right panel for fade+slide.
 * - go(path): trigger leave animation then navigate after ~180ms.
 * Respects prefers-reduced-motion (no animation, immediate navigate).
 */
export function useAuthTransition() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("enter");
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const reduced = getPrefersReducedMotion();
    setReducedMotion(reduced);
    if (reduced) {
      setPhase("idle");
      return;
    }
    const id = requestAnimationFrame(() => setPhase("idle"));
    return () => cancelAnimationFrame(id);
  }, []);

  const go = useCallback(
    (to) => {
      if (reducedMotion) {
        navigate(to);
        return;
      }
      setPhase("leave");
      const t = setTimeout(() => {
        navigate(to);
      }, 180);
      return () => clearTimeout(t);
    },
    [navigate, reducedMotion]
  );

  const containerClass =
    reducedMotion || phase === "idle"
      ? `${BASE} ${IDLE}`
      : phase === "enter"
        ? `${BASE} ${ENTER}`
        : `${BASE} ${LEAVE}`;

  return { containerClass, go };
}
