import decor from "./liveoak-decor.json";
import seriesMap from "./liveoak-series.json";
import type { FactoryFinish, FactoryLine } from "./factory";

/**
 * Live Oak's decor boards by series, for homes with no option sheet of their own.
 *
 * Source: two Live Oak "Décor Options Selection Board" PDFs (XT & Xtreme
 * Series, Oak Series) and a stock list sorting Live Oak models by series,
 * from Wayne Frier Waycross (Nov 20, 2026). Westgate and Waycross get their
 * homes from the same Live Oak plant, so both sites use one data set:
 * `liveoak-decor.json` (the boards) and `liveoak-series.json` (each Westgate
 * model's series and which board it takes). The same two files, with the
 * swatches, are kept in the project's shared folder for the Waycross site.
 *
 * Rules from the dealer's note: XT and Extreme homes take the XT & Extreme
 * board, Oak homes the Oak board. Suwannee Valley (SV) and Super Star homes
 * allow no or very few changes, so they get no decor choices, and a model
 * whose series is not known gets none either rather than a guess. Finishes
 * the board marks "XT only" are offered only on homes the stock list names
 * as XT. No prices: the boards carry none.
 */

type BoardFinish = {
  id: string;
  label: string;
  product: string;
  swatch: string;
  color: string;
  tag?: string;
  xtOnly?: boolean;
};
type Board = Record<string, BoardFinish[]>;

const SWATCHES = "/customizer/swatches/liveoak-series/";

export type DecorBoardId = "xt-extreme" | "oak";

type SeriesRow = {
  westgateSlug: string;
  model: string;
  westgateFiling: string | null;
  jaySeries: string | null;
  decorBoard: DecorBoardId | "none" | null;
  basis: string;
};

const ROWS = (seriesMap as { models: SeriesRow[] }).models;
const BOARDS = (decor as unknown as { boards: Record<DecorBoardId, Board> }).boards;

/** The board a home takes, or undefined when it takes none. */
export function seriesFor(slug: string): SeriesRow | undefined {
  return ROWS.find((r) => r.westgateSlug === slug);
}

const finishes = (board: Board, group: string, xt: boolean, more: Partial<FactoryFinish> = {}): FactoryFinish[] =>
  (board[group] ?? [])
    .filter((f) => xt || !f.xtOnly)
    .map((f) => ({
      id: `los-${f.id}`,
      label: f.label,
      product: f.product,
      tag: f.tag,
      color: f.color,
      swatch: SWATCHES + f.swatch.replace(/^swatches\//, ""),
      ...more,
    }));

function lineFor(id: DecorBoardId, xt: boolean, name: string): FactoryLine {
  const b = BOARDS[id];
  const walls = id === "oak" ? "wallPanels" : "paint";
  return {
    name,
    sources: [
      {
        label: `Live Oak Homes décor selection board (${id === "oak" ? "Oak Series" : "XT & Xtreme Series"}), from Wayne Frier Waycross, same plant as Westgate`,
        read: "2026-11",
      },
    ],
    materials: {
      siding: { finishes: finishes(b, "siding", xt, { cladding: "vinyl" }) },
      shutters: { finishes: finishes(b, "shutters", xt) },
      cabinets: { finishes: finishes(b, "cabinets", xt) },
      island: { note: "The island's top.", finishes: finishes(b, "island", xt) },
      counters: { finishes: finishes(b, "counters", xt) },
      flooring: { finishes: finishes(b, "flooring", xt) },
      walls: { finishes: finishes(b, walls, xt) },
      vanity: { finishes: finishes(b, "cabinets", xt) },
      vanitytop: { finishes: finishes(b, "counters", xt) },
      bathwalls: { finishes: finishes(b, walls, xt) },
    },
  };
}

const LINES = {
  oak: lineFor("oak", false, "Live Oak Oak Series"),
  xt: lineFor("xt-extreme", true, "Live Oak XT Series"),
  extreme: lineFor("xt-extreme", false, "Live Oak Xtreme Series"),
  /* Filed by Westgate as drywall but not on the stock list: XT or Xtreme, so no XT-only finishes. */
  xtOrExtreme: lineFor("xt-extreme", false, "Live Oak XT & Xtreme Series"),
};

/** The decor-board line for a home with no option sheet, or undefined if its series offers none. */
export function seriesLineFor(slug: string): FactoryLine | undefined {
  const r = seriesFor(slug);
  if (!r) return undefined;
  if (r.decorBoard === "oak") return LINES.oak;
  if (r.decorBoard !== "xt-extreme") return undefined;
  if (r.jaySeries === "XT") return LINES.xt;
  if (r.jaySeries === "EXTREME") return LINES.extreme;
  return LINES.xtOrExtreme;
}
