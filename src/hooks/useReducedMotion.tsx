import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the user's `prefers-reduced-motion: reduce` preference.
 *
 * Returns a boolean that is `true` when the user has requested reduced motion.
 * The value updates live by listening to media-query changes and cleans up the
 * listener on unmount.
 *
 * Requirements: 15.4
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Sync immediately in case the preference changed before this effect ran.
    setPrefersReducedMotion(mql.matches);
    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
