/**
 * Analytics wrapper - centralized event tracking
 * Can be swapped to Segment/Mixpanel later without changing call sites
 */

type EventName =
  | "cta_click"
  | "page_view"
  | "form_submit"
  | "error"
  | "dash_view"
  | "dash_filter_applied"
  | "dash_export"
  | "dash_period_changed"
  | "dash_brand_switched";

interface CTAClickEvent {
  source: "hero" | "sticky" | "footer" | "header";
  auth_state: "anon" | "authed";
}

interface AnalyticsEvent {
  cta_click: CTAClickEvent;
  page_view: { page: string };
  form_submit: { form: string; success: boolean };
  error: { message: string; code?: string };
  dash_view: { dashboardId: string; brandId?: string; userId?: string };
  dash_filter_applied: { dashboardId: string; filterType: string; filterValue: string };
  dash_export: { dashboardId: string; format: "csv" | "pdf" };
  dash_period_changed: { dashboardId: string; period: string };
  dash_brand_switched: { dashboardId: string; fromBrand: string; toBrand: string };
}

class Analytics {
  track<T extends EventName>(eventName: T, properties: AnalyticsEvent[T]) {
    // Add demo_mode context to all events
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    const enrichedProps = {
      ...properties,
      demo_mode: isDemoMode,
    };

    // For now, log to console
    console.log(`[Analytics] ${eventName}:`, enrichedProps);

    // TODO: Replace with real analytics provider
    // Example: segment.track(eventName, enrichedProps);
  }
}

export const analytics = new Analytics();
