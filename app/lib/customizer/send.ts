
/**
 * The designer's consent box, as a version string for the CRM's record of
 * the SMS opt-in. Bump it whenever `CONSENT_TEXT` in `./journey.ts` changes.
 */
export const CUSTOMIZER_CONSENT_VERSION = "2026-11-designer-v1";

/**
 * Send a finished build the same way the site's quote form sends a lead:
 * as JSON to LEAD_WEBHOOK_URL (the dealership's CRM hook), with the build
 * summary as `details`. With no hook set (local dev, a preview without the
 * variable) the lead is logged server-side rather than dropped. Returns
 * null when the lead got through, and the message to show when it did not.
 */
export async function forwardLead(
  lead: {
    name: string;
    phone: string;
    email?: string;
    source: "customizer" | "customizer-save";
    summary: string;
    tags: string[];
    submittedAt: string;
  },
  payload: Record<string, unknown>,
): Promise<string | null> {
  const body = {
    name: lead.name,
    phone: lead.phone,
    email: lead.email || undefined,
    buyerType: "Home designer",
    formSource: lead.source,
    details: lead.summary,
    tags: lead.tags,
    smsConsent: CUSTOMIZER_CONSENT_VERSION,
    source: "waynefrierhomesalbany.com",
    submittedAt: lead.submittedAt,
  };
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (!hook) {
    console.info(`[${lead.source}] LEAD_WEBHOOK_URL not set, logging instead:`, { ...body, payload });
    return null;
  }
  const res = await fetch(hook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  if (!res?.ok) {
    console.error(`[${lead.source}] lead delivery failed`, res?.status, payload);
    return "Something broke on our end.";
  }
  return null;
}
