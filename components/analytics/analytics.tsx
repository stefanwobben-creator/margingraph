import Script from "next/script";

import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { GA_MEASUREMENT_ID, analyticsEnabled } from "@/lib/analytics/config";

/**
 * Google Analytics 4 — initialisation only.
 *
 * Renders nothing at all unless a measurement ID is configured *and* this is a
 * production deploy, so local development and preview deployments never load
 * the script or open a connection to Google.
 *
 * Two things happen here and nowhere else:
 *
 * 1. Consent Mode v2 defaults are declared *before* the config call, which is
 *    the order Google requires. Everything is denied, so no cookie is set
 *    until a consent banner calls setAnalyticsConsent(true).
 * 2. `send_page_view: false` — page views are sent explicitly by
 *    PageViewTracker. Leaving it on would fire one view here and another on
 *    every client-side navigation.
 */
export function Analytics() {
  if (!analyticsEnabled || !GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        id="ga-init"
        strategy="afterInteractive"
        // Consent defaults must be queued before the library loads, so this
        // runs inline rather than in an effect.
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
`.trim(),
        }}
      />
      <Script
        id="ga-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <PageViewTracker />
    </>
  );
}
