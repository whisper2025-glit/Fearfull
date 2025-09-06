import { supabase } from "./supabase";

// Lightweight analytics: pushes to dataLayer if present and tries Supabase insert (best-effort)
export type AnalyticsProps = Record<string, any>;

function safePushToDataLayer(event: string, props: AnalyticsProps) {
  try {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ event, ...props });
  } catch {}
}

async function supabaseInsert(event: string, props: AnalyticsProps) {
  try {
    await supabase.from("analytics_events").insert({
      event_name: event,
      properties: props || {},
      path: typeof window !== "undefined" ? window.location.pathname : null,
      url: typeof window !== "undefined" ? window.location.href : null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
      created_at: new Date().toISOString(),
    } as any);
  } catch {
    // ignore analytics failures
  }
}

export function trackEvent(event: string, props: AnalyticsProps = {}) {
  safePushToDataLayer(event, props);
  supabaseInsert(event, props);
}

export function trackPageview(path?: string, title?: string, props: AnalyticsProps = {}) {
  const payload = {
    path: path || (typeof window !== "undefined" ? window.location.pathname : undefined),
    title: title || (typeof document !== "undefined" ? document.title : undefined),
    ...props,
  };
  safePushToDataLayer("pageview", payload);
  supabaseInsert("pageview", payload);
}
