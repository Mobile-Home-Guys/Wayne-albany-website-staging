/**
 * The customizer's form state and the helpers its two server actions share.
 *
 * Outside `app/homes/[slug]/customize/actions.ts` on purpose: a
 * `"use server"` module may export only async functions, so a constant
 * declared beside an action takes the whole module down when somebody
 * presses Send.
 */

export type BuildField = "name" | "email" | "phone" | "consent";

export type BuildState = {
  status: "idle" | "ok" | "error";
  message: string;
  fieldErrors?: Partial<Record<BuildField, string>>;
  /** Echoed back so a rejected submission does not wipe what was typed. */
  values?: Record<string, string>;
};

export const EMPTY_BUILD_STATE: BuildState = { status: "idle", message: "" };

/** Digits only, for counting a phone number without caring how it is set. */
export const digits = (s: string) => s.replace(/\D/g, "");

/** A trimmed, length-capped string, or "" for anything that is not one. */
export const clean = (v: FormDataEntryValue | null, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

/** True when the hidden field a real person never sees has been filled in. */
export const isBot = (formData: FormData) => Boolean(clean(formData.get("company")));
