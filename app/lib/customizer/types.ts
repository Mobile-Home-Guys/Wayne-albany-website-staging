/**
 * The shapes behind /homes/<slug>/customize.
 *
 * A customizer is two halves. The *regions* are generated from
 * `scripts/customizer/<slug>.json` by `scripts/build-customizer.py`: for
 * each photograph already on the site, a mask per material (siding,
 * cabinets, flooring) and the two numbers the browser needs to relight a
 * new colour into it. The *materials* — what a buyer can pick for each —
 * are hand-written in `lib/customizer/index.ts` and shared by every home.
 */

/** A paintable surface. One name per thing a buyer would choose. */
export type Material =
  | "siding"
  | "accent"
  | "trim"
  | "shutters"
  | "door"
  | "roof"
  | "skirting"
  | "cabinets"
  | "island"
  | "counters"
  | "vanity"
  | "vanitytop"
  | "bathwalls"
  | "flooring"
  | "walls";

export type Region = {
  /** Greyscale PNG under `public/`, white where the material is. */
  mask: string;
  /** Median lightness of the material in this photograph, 0–1. */
  ref: number;
  /** Its median colour as photographed, for the as-built swatch. */
  asBuilt: string;
  /**
   * Renders of this surface in a finish, by finish id, from
   * `scripts/bake-customizer.py`: the surface repainted in the room's own
   * light, cropped to `x, y, w, h` of the photograph, its alpha the
   * surface grown a few pixels. Drawn instead of the recolour when present.
   */
  layers?: Record<string, Layer>;
};

export type Layer = { src: string; x: number; y: number; w: number; h: number };

export type CustomizerPhoto = {
  /** The site photograph, as a path under `public/`. */
  src: string;
  caption: string;
  width: number;
  height: number;
  /** What an exterior photograph shows the home clad in, so only that cladding's colours are offered. */
  cladding?: "smart-panel" | "vinyl";
  /** Whose photograph it is when not the dealer's own — "Jessup Housing" for the plant's photos of the same model. */
  credit?: string;
  regions: Partial<Record<Material, Region>>;
};

/** Keyed by the photograph's scene key — `exterior`, `kitchen`, `bedroom-2`. */
export type CustomizerPhotos = Record<string, CustomizerPhoto>;

export type Finish = {
  id: string;
  label: string;
  /**
   * Absent on the as-built finish, which leaves the photograph alone — and
   * on a factory finish with no published colour, which is recorded with
   * the build but has no photo preview yet.
   */
  color?: string;
  /** "factory" — on the plant's selection list; "idea" — a colour to talk through. */
  source?: "factory" | "idea";
  tag?: string;
  product?: string;
  code?: string;
  /** An option ("group:choice") this finish only comes with — Charcoal carpet needs the carpet option. */
  implies?: string;
  /** The plant's swatch image, as a path under `public/`. */
  swatch?: string;
  /** Dollars over standard, where the plant prices it (White Smart Panel: +$995). */
  price?: number;
  /** Another finish ("material:id") it is sold with as a package. */
  goesWith?: string;
};

export type MaterialGroup = {
  material: Material;
  label: string;
  /** One word for the summary line: "Cabinets", "Floor". */
  short: string;
  section: "Exterior" | "Interior";
  note?: string;
  /** Set when the plant's own selections are known for this home's line. */
  factory?: { line: string; note?: string };
  finishes: Finish[];
};
