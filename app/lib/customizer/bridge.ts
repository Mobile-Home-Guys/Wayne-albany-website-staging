import { site as albany } from "@/app/lib/site";

/*
 * What the home designer (ported from the Westgate site) needs from the rest
 * of a site: its name and phone, the counties it serves, which optional pages
 * exist, and number formatting. Mapped here onto this site's own config.
 */

export const site = {
  ...albany,
  short: albany.name,
};

/** No county list is published for Albany, so the designer skips the county question. */
export const market: { countiesServed?: string[] } = {};

/** Pre-qualification is Cascade Loans' online form (`site.prequalifyUrl`). */
export const pages = { prequalify: true };

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US");

export function money(n: number): string {
  return usd.format(n);
}

export function num(n: number): string {
  return compact.format(n);
}

/** Standard amortising payment; `rate` is an annual percentage, `years` the term. */
export function monthlyPayment(principal: number, rate: number, years: number): number {
  if (principal <= 0) return 0;
  const r = rate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}
