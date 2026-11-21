import type { Listing } from "@/app/lib/customizer/listing";
import type { DesignStepId } from "./journey";
import { factoryLineFor } from "./factory";

/**
 * Options that are not colours: the upgrades a plant publishes for the
 * home's product line (`./factory.ts` — the Titanium Series' Smart Panel
 * exterior, carpet in place of linoleum).
 *
 * Nothing here is invented. A line with no published upgrades shows none,
 * and the Options step is skipped. Prices come from the model's option
 * sheet and reach the page only as `CUSTOMIZER_PRICING` allows; while it is
 * "hide" (the default) every upgrade reads "priced with your quote".
 */

export type OptionChoice = {
  id: string;
  label: string;
  /** The plan's standard, shown as included. */
  standard?: boolean;
  /** Dollars over the base price, when the dealer has given one. */
  price?: number;
  /** "group:choice" pairs this choice cannot be ordered with. */
  excludes?: string[];
  /** "group:choice" pairs this choice needs. */
  requires?: string[];
};

export type OptionGroup = {
  id: string;
  label: string;
  /** Where the option came from, said on the page. */
  source: string;
  /** Which room it belongs to on the summary. */
  room: DesignStepId | "site";
  multi: boolean;
  note?: string;
  choices: OptionChoice[];
};

export type OptionPicks = Record<string, string[]>;

/* ── Sheet prices ─────────────────────────────────────────────────── */

/**
 * Whether the option sheets' retail prices (`sheetPrice` in `./factory.ts`)
 * reach the page. Westgate does not publish prices, so the default is
 * "hide": every upgrade reads as priced with the quote and no number leaves
 * the server; the prices go to the sales team in the lead's CRM note
 * instead. "sheet" would show them as printed. Set by
 * `NEXT_PUBLIC_CUSTOMIZER_OPTION_PRICES`; leave it unset.
 */
export type SheetPricing = "hide" | "sheet";
export const CUSTOMIZER_PRICING: SheetPricing =
  (["hide", "sheet"] as const).find((m) => m === process.env.NEXT_PUBLIC_CUSTOMIZER_OPTION_PRICES) ?? "hide";

/** What a buyer sees for a sheet price: nothing while prices are hidden. */
export function buyerPrice(sheet: number | undefined): number | undefined {
  return typeof sheet === "number" && CUSTOMIZER_PRICING === "sheet" ? sheet : undefined;
}

/** The upgrades on this home's option sheet, priced for the buyer (or not at all). */
export function optionGroupsFor(listing: Listing): OptionGroup[] {
  const line = factoryLineFor(listing);
  return (line?.options ?? []).map((g) => ({
    id: g.id,
    label: g.label,
    room: g.room,
    multi: g.multi,
    note: g.note,
    source: `From the ${line!.name} option sheet`,
    choices: g.choices.map(({ sheetPrice, ...c }) => ({ ...c, price: buyerPrice(sheetPrice) })),
  }));
}

/** Sheet prices by "group:choice", for the sales team's note only — never sent to the page. */
export function sheetPricesFor(listing: Listing): Record<string, number> {
  const out: Record<string, number> = {};
  for (const g of factoryLineFor(listing)?.options ?? [])
    for (const c of g.choices) if (typeof c.sheetPrice === "number") out[`${g.id}:${c.id}`] = c.sheetPrice;
  return out;
}

/** The plan's own standard for a group, for a single-choice group with one. */
export function defaultPicks(groups: OptionGroup[]): OptionPicks {
  const out: OptionPicks = {};
  for (const g of groups) {
    const std = g.choices.find((c) => c.standard);
    if (!g.multi && std) out[g.id] = [std.id];
  }
  return out;
}

/**
 * Apply a pick and keep the build consistent: a single-choice group holds
 * one; a choice's `excludes` drop what it conflicts with; a choice whose
 * `requires` are not met is not allowed. Returns the new picks and a line
 * saying what changed, for the page to show.
 */
export function applyOption(
  groups: OptionGroup[],
  picks: OptionPicks,
  groupId: string,
  choiceId: string,
): { picks: OptionPicks; note?: string } {
  const g = groups.find((x) => x.id === groupId);
  const c = g?.choices.find((x) => x.id === choiceId);
  if (!g || !c) return { picks };
  const cur = picks[g.id] ?? [];
  const on = cur.includes(c.id);
  const next: OptionPicks = { ...picks };

  if (on) {
    /* A single-choice group with a standard falls back to it rather than to nothing. */
    const std = g.choices.find((x) => x.standard);
    next[g.id] = g.multi ? cur.filter((x) => x !== c.id) : std ? [std.id] : [];
    return { picks: next };
  }
  const blocked = (c.requires ?? []).filter((r) => {
    const [gid, cid] = r.split(":");
    return !(picks[gid] ?? []).includes(cid);
  });
  if (blocked.length) {
    return { picks, note: `${c.label} needs ${blocked.map((r) => labelOf(groups, r)).join(" and ")} first.` };
  }
  next[g.id] = g.multi ? [...cur, c.id] : [c.id];
  const dropped: string[] = [];
  for (const ex of c.excludes ?? []) {
    const [gid, cid] = ex.split(":");
    if (gid === g.id && !g.multi) continue;
    if ((next[gid] ?? []).includes(cid)) {
      next[gid] = next[gid].filter((x) => x !== cid);
      dropped.push(labelOf(groups, ex));
    }
  }
  return { picks: next, note: dropped.length ? `Removed ${dropped.join(", ")} — it can't be ordered with ${c.label}.` : undefined };
}

export function labelOf(groups: OptionGroup[], pair: string) {
  const [gid, cid] = pair.split(":");
  return groups.find((g) => g.id === gid)?.choices.find((c) => c.id === cid)?.label ?? cid;
}

/** The picks a buyer actually changed: everything but a group's untouched standard. */
export function chosenOptions(groups: OptionGroup[], picks: OptionPicks) {
  return groups.flatMap((g) =>
    (picks[g.id] ?? [])
      .map((id) => g.choices.find((c) => c.id === id))
      .filter((c): c is OptionChoice => Boolean(c) && !c!.standard)
      .map((c) => ({ group: g, choice: c })),
  );
}

/** Upgrade total from priced options, and how many are still to be quoted. */
export function optionTotals(groups: OptionGroup[], picks: OptionPicks) {
  const chosen = chosenOptions(groups, picks);
  const priced = chosen.filter((x) => typeof x.choice.price === "number");
  return {
    upgrades: priced.reduce((s, x) => s + (x.choice.price ?? 0), 0),
    toQuote: chosen.length - priced.length,
    count: chosen.length,
  };
}

/** Options in the link: `windzone:zone-ii,factory:ice-dam+gas-option`. */
export function encodeOptions(picks: OptionPicks, groups: OptionGroup[]) {
  return groups
    .map((g) => {
      const ids = (picks[g.id] ?? []).filter((id) => !g.choices.find((c) => c.id === id)?.standard);
      return ids.length ? `${g.id}:${ids.join("+")}` : "";
    })
    .filter(Boolean)
    .join(",");
}

export function decodeOptions(code: string | null, groups: OptionGroup[]): OptionPicks {
  const raw: Record<string, string[]> = {};
  for (const part of (code ?? "").split(",")) {
    const [gid, list] = part.split(":");
    if (gid && list) raw[gid] = list.split("+");
  }
  return cleanPicks(groups, raw);
}

/* ── What is included ─────────────────────────────────────────────── */

export type StandardsStep = DesignStepId | "options";

/**
 * What the listing says comes with the home. The dealer's feed lists
 * features for the whole home rather than room by room, so every step
 * shows the same list.
 */
export function standardsFor(listing: Listing, _step: StandardsStep): { label: string; value: string }[] {
  void _step;
  return (listing.features ?? []).flatMap((g) => g.items.map((item) => ({ label: g.group, value: item })));
}

/**
 * Rebuild a set of picks from untrusted input — a link, a form post — one
 * pick at a time through `applyOption`, so whatever arrives obeys the same
 * rules the page enforces: unknown ids drop, one choice per single group,
 * excluded pairs cannot both stand.
 */
export function cleanPicks(groups: OptionGroup[], raw: Record<string, string[]>): OptionPicks {
  let picks = defaultPicks(groups);
  for (const g of groups) {
    for (const id of raw[g.id] ?? []) {
      if (!(picks[g.id] ?? []).includes(id)) picks = applyOption(groups, picks, g.id, id).picks;
    }
  }
  return picks;
}

/**
 * Make the options agree with the finishes: a finish that only comes with an
 * option (a Smart Panel color) turns that option on. Used by the page when a
 * finish is picked and by the server on every lead, so a build can never
 * ask for a Smart Panel color with vinyl siding on its option list.
 */
export function withImplied(groups: OptionGroup[], picks: OptionPicks, implies: (string | undefined)[]): { picks: OptionPicks; added: string[] } {
  let next = picks;
  const added: string[] = [];
  for (const pair of implies) {
    if (!pair) continue;
    const [gid, cid] = pair.split(":");
    if (!groups.some((g) => g.id === gid && g.choices.some((c) => c.id === cid))) continue;
    if ((next[gid] ?? []).includes(cid)) continue;
    next = applyOption(groups, next, gid, cid).picks;
    added.push(labelOf(groups, pair));
  }
  return { picks: next, added };
}

/** The chosen options as label → choices, for the lead and the summary. */
export function optionLines(groups: OptionGroup[], picks: OptionPicks): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const { group, choice } of chosenOptions(groups, picks)) (out[group.label] ??= []).push(choice.label);
  return out;
}

/* ── Pricing ──────────────────────────────────────────────────────── */

export type PriceMode = "none" | "total" | "monthly";

/**
 * How the customizer shows money. Westgate publishes no home prices, so
 * while option prices are hidden (`CUSTOMIZER_PRICING`) the default is
 * "none"; once they show, "total" adds up the priced upgrades. "monthly" adds an estimate on the home-only (chattel) terms the
 * site's own payment calculator uses, labelled as an estimate; "none" hides
 * money. Set by `NEXT_PUBLIC_CUSTOMIZER_PRICES`.
 */
export const PRICE_MODE: PriceMode =
  (["none", "total", "monthly"] as const).find((m) => m === process.env.NEXT_PUBLIC_CUSTOMIZER_PRICES) ??
  (CUSTOMIZER_PRICING === "hide" ? "none" : "total");

/** The payment calculator's home-only terms (`components/payment-calculator.tsx`), at its default 10% down. */
export const ESTIMATE = { rate: 8.95, years: 23, downPct: 10 };
