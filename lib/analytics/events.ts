/**
 * The event catalogue.
 *
 * Adding an event means adding one line here. The type of its parameters is
 * enforced at every call site, so an event cannot be sent with a misspelled
 * name or a missing property.
 *
 * Naming follows GA4 conventions: snake_case, under 40 characters, and where
 * Google defines a recommended event (`login`) its name and parameters are
 * used rather than invented.
 */
export type AnalyticsEvents = {
  /** A visitor pressed a call to action for a report. */
  generate_report_clicked: {
    report_slug: string;
    /** Where on the page or site the click happened, e.g. "hero", "footer_cta". */
    location?: string;
    price?: number;
  };

  /** A report finished generating and was delivered. */
  report_generated: {
    report_slug: string;
    duration_ms?: number;
  };

  signup_started: { method?: string };
  signup_completed: { method?: string };

  /** GA4 recommended event. Keep the `method` parameter name. */
  login: { method?: string };

  pricing_viewed: { report_slug?: string };

  contact_clicked: { channel?: "email" | "form" | "phone" };

  outbound_link_clicked: {
    url: string;
    label?: string;
  };

  waitlist_joined: { source?: string };

  error_occurred: {
    message: string;
    /** Next's error digest, when the error came from a boundary. */
    digest?: string;
    path?: string;
  };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

/** Events whose parameters are all optional, so the object may be omitted. */
export type OptionalParamEvent = {
  [K in AnalyticsEventName]: Record<string, never> extends AnalyticsEvents[K]
    ? K
    : never;
}[AnalyticsEventName];

/** Events with at least one required parameter. */
export type RequiredParamEvent = Exclude<AnalyticsEventName, OptionalParamEvent>;
