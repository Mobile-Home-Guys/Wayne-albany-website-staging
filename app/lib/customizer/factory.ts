import type { OptionChoice } from "./options";
import type { Material } from "./types";
import { seriesLineFor } from "./series";

/**
 * What Live Oak Homes builds for a model: the finishes a buyer can pick
 * and, where a dealer has the plant's per-model option sheet, its upgrades.
 *
 * Albany has no per-model option sheets yet, so every home takes its
 * series' Live Oak decor board (`./series.ts`), the same data the Westgate
 * and Waycross sites use. No prices: the boards carry none.
 */

export type FactoryFinish = {
  id: string;
  label: string;
  /** What it is: "Cabinets", "Laminate". */
  product?: string;
  tag?: string;
  /** The preview colour. */
  color?: string;
  /** The plant's swatch, as a path under `public/`. */
  swatch?: string;
  code?: string;
  /** The option sheet's price for this finish over the photographed one. */
  sheetPrice?: number;
  /** Filled in by `./options.ts` from `sheetPrice` when prices are shown. */
  price?: number;
  photographed?: boolean;
  /** An option ("group:choice") this finish only comes with. */
  implies?: string;
  /** Another finish ("material:id") it is sold with as a package. */
  goesWith?: string;
  /** Only on multi-section homes. */
  multiSectionOnly?: boolean;
  cladding?: "smart-panel" | "vinyl";
};

export type SheetChoice = OptionChoice & { sheetPrice?: number };

export type FactoryOption = {
  id: string;
  label: string;
  room: "exterior" | "kitchen" | "baths" | "rooms" | "site";
  multi: boolean;
  note?: string;
  choices: SheetChoice[];
};

export type FactoryLine = {
  /** "Live Oak Suwannee Valley" — shown as "From the … option sheet". */
  name: string;
  sources: { label: string; url?: string; read: string }[];
  materials: Partial<
    Record<Material, { note?: string; finishes: FactoryFinish[] }>
  >;
  /** Upgrades the model's option sheet lists, for the Options step. */
  options?: FactoryOption[];
};

/** A home's series decor board, or nothing for a series that takes no changes. */
export function factoryLineFor(listing: { slug: string }): FactoryLine | undefined {
  return seriesLineFor(listing.slug);
}
