"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { getStoredConsent, trackPageView } from "@/lib/analytics";
import { updateConsent } from "@/lib/analytics/gtag";

/**
 * The single source of page_view events.
 *
 * Fires once on mount and once per client-side navigation. The gtag config
 * sets `send_page_view: false`, so nothing else emits one — which is what
 * makes duplicates impossible from the application side.
 *
 * The `lastPath` guard covers React's development double-invoke and any
 * re-render that does not actually change the URL.
 */
function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  // Re-apply a stored consent decision before anything is sent.
  useEffect(() => {
    const stored = getStoredConsent();
    if (stored !== null) updateConsent(stored);
  }, []);

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    if (lastPath.current === path) return;
    lastPath.current = path;
    trackPageView(path);
  }, [pathname, searchParams]);

  return null;
}

/**
 * useSearchParams opts a route into client rendering unless it sits behind a
 * Suspense boundary. Without this wrapper every page in the app would stop
 * being statically generated.
 */
export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
