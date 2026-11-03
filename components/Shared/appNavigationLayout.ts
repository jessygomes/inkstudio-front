// Keep these queries aligned with HeaderApp.module.css.
export const DESKTOP_NAVIGATION_QUERY = "(min-width: 1280px), (min-width: 1024px) and (min-height: 600px) and (orientation: landscape)";
const WIDE_NAVIGATION_QUERY = "(min-width: 1280px)";

export function getNavigationLayout(): "mobile" | "compact" | "desktop" {
  if (window.matchMedia(WIDE_NAVIGATION_QUERY).matches) return "desktop";
  return window.matchMedia(DESKTOP_NAVIGATION_QUERY).matches ? "compact" : "mobile";
}

export function subscribeNavigationLayout(onChange: () => void) {
  const queries = [DESKTOP_NAVIGATION_QUERY, WIDE_NAVIGATION_QUERY].map(query => window.matchMedia(query));
  queries.forEach(query => query.addEventListener("change", onChange));
  return () => queries.forEach(query => query.removeEventListener("change", onChange));
}

export function getServerNavigationLayout() {
  return "mobile" as const;
}
