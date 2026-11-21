import type { FactoryLine } from "./factory";
import { buyerPrice } from "./options";
import { customizerRegions } from "./regions.generated";
import type { CustomizerPhotos, Finish, Material, MaterialGroup } from "./types";

export type { CustomizerPhotos, Material, MaterialGroup } from "./types";

/**
 * What a buyer can pick, material by material. Shared by every home that
 * has a customizer; a home only shows the materials its photographs carry a
 * region for, so a plan photographed without a bathroom simply has no
 * vanity row.
 *
 * These are colour ideas, not a plant's selection sheet: they carry no
 * prices and go with a quote request so the sales center confirms what can
 * be built. They are offered only on homes whose plant publishes no
 * selections; a home in a line in `./factory.ts` offers that list instead.
 * The first finish of each group is the home as photographed.
 */
export const MATERIALS: MaterialGroup[] = [
  {
    material: "siding",
    short: "Siding",
    label: "Siding",
    section: "Exterior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "pebble", label: "Pebble Gray", color: "#A7AAA6" },
      { id: "coastal", label: "Coastal Blue", color: "#87A0B4" },
      { id: "sage", label: "Sage", color: "#97A68C" },
      { id: "arctic", label: "Arctic White", color: "#E4E5E1" },
      { id: "storm", label: "Storm", color: "#62686D" },
      { id: "clay", label: "Clay", color: "#B39577" },
    ],
  },
  {
    material: "accent",
    short: "Accent",
    label: "Accent siding",
    section: "Exterior",
    note: "The second color on a two-tone home — the gable section or the lower band.",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "pebble", label: "Pebble Gray", color: "#A7AAA6" },
      { id: "coastal", label: "Coastal Blue", color: "#87A0B4" },
      { id: "sage", label: "Sage", color: "#97A68C" },
      { id: "arctic", label: "Arctic White", color: "#E4E5E1" },
      { id: "storm", label: "Storm", color: "#62686D" },
      { id: "clay", label: "Clay", color: "#B39577" },
    ],
  },
  {
    material: "trim",
    short: "Trim",
    label: "Trim & fascia",
    section: "Exterior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "white", label: "White", color: "#EFEFEB" },
      { id: "black", label: "Black", color: "#202325" },
      { id: "bronze", label: "Bronze", color: "#4A3B2E" },
      { id: "almond", label: "Almond", color: "#E3D9C6" },
    ],
  },
  {
    material: "shutters",
    short: "Shutters",
    label: "Shutters",
    section: "Exterior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "black", label: "Black", color: "#1E2124" },
      { id: "navy", label: "Navy", color: "#26364A" },
      { id: "forest", label: "Forest", color: "#2F4A3A" },
      { id: "barn", label: "Barn Red", color: "#7A2E28" },
      { id: "white", label: "White", color: "#EEEEEA" },
    ],
  },
  {
    material: "door",
    short: "Door",
    label: "Front door",
    section: "Exterior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "black", label: "Black", color: "#1F2326" },
      { id: "red", label: "Barn Red", color: "#8A2B22" },
      { id: "navy", label: "Navy", color: "#25384F" },
      { id: "sage", label: "Sage", color: "#5E7A62" },
    ],
  },
  {
    material: "roof",
    short: "Roof",
    label: "Roof shingles",
    section: "Exterior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "charcoal", label: "Charcoal", color: "#36393B" },
      { id: "weathered", label: "Weathered Wood", color: "#6E6458" },
      { id: "slate", label: "Slate Gray", color: "#6A7075" },
    ],
  },
  {
    material: "skirting",
    short: "Skirting",
    label: "Skirting",
    section: "Exterior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "white", label: "White", color: "#E2E3E0" },
      { id: "pebble", label: "Pebble Gray", color: "#A7AAA6" },
      { id: "storm", label: "Storm", color: "#62686D" },
      { id: "black", label: "Black", color: "#2A2C2E" },
    ],
  },
  {
    material: "cabinets",
    short: "Cabinets",
    label: "Kitchen cabinets",
    section: "Interior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "white", label: "White", color: "#ECEBE6" },
      { id: "greige", label: "Greige", color: "#B6AC9D" },
      { id: "dove", label: "Dove Gray", color: "#9C9E9D" },
      { id: "sage", label: "Sage", color: "#8E9C86" },
      { id: "navy", label: "Navy", color: "#2F3E54" },
      { id: "espresso", label: "Espresso", color: "#4A3A2E" },
    ],
  },
  {
    material: "island",
    short: "Island",
    label: "Kitchen island",
    section: "Interior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "white", label: "White", color: "#ECEBE6" },
      { id: "navy", label: "Navy", color: "#2F3E54" },
      { id: "charcoal", label: "Charcoal", color: "#3B3E41" },
      { id: "oak", label: "Natural Oak", color: "#C2A584" },
    ],
  },
  {
    material: "counters",
    short: "Counters",
    label: "Countertops",
    section: "Interior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "calacatta", label: "Calacatta White", color: "#ECEAE5" },
      { id: "sand", label: "Sand", color: "#D4C6AE" },
      { id: "midnight", label: "Midnight", color: "#34363A" },
    ],
  },
  {
    material: "vanity",
    short: "Vanity",
    label: "Bathroom vanity",
    section: "Interior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "white", label: "White", color: "#ECEBE6" },
      { id: "greige", label: "Greige", color: "#B6AC9D" },
      { id: "dove", label: "Dove Gray", color: "#9C9E9D" },
      { id: "sage", label: "Sage", color: "#8E9C86" },
      { id: "navy", label: "Navy", color: "#2F3E54" },
      { id: "espresso", label: "Espresso", color: "#4A3A2E" },
    ],
  },
  {
    material: "vanitytop",
    short: "Vanity top",
    label: "Vanity top",
    section: "Interior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "calacatta", label: "Calacatta White", color: "#ECEAE5" },
      { id: "sand", label: "Sand", color: "#D4C6AE" },
      { id: "midnight", label: "Midnight", color: "#34363A" },
    ],
  },
  {
    material: "bathwalls",
    short: "Bath walls",
    label: "Bathroom walls",
    section: "Interior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "linen", label: "Linen", color: "#E9E4DA" },
      { id: "greige", label: "Soft Greige", color: "#D4CCBE" },
      { id: "mist", label: "Mist", color: "#CFD8D8" },
      { id: "sage", label: "Pale Sage", color: "#C9D1BF" },
      { id: "spa", label: "Spa Blue", color: "#C3D2D9" },
    ],
  },
  {
    material: "flooring",
    short: "Floor",
    label: "Flooring",
    section: "Interior",
    note: "One floor runs through every room shown.",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "warm-oak", label: "Warm Oak", color: "#8D6A4A" },
      { id: "honey", label: "Honey Pine", color: "#AE8A5C" },
      { id: "ash", label: "Ash Gray", color: "#908D87" },
      { id: "espresso", label: "Espresso", color: "#55412F" },
    ],
  },
  {
    material: "walls",
    short: "Walls",
    label: "Wall color",
    note: "Living areas and bedrooms.",
    section: "Interior",
    finishes: [
      { id: "as-built", label: "As photographed" },
      { id: "linen", label: "Linen", color: "#E9E4DA" },
      { id: "greige", label: "Soft Greige", color: "#D4CCBE" },
      { id: "mist", label: "Mist", color: "#CFD8D8" },
      { id: "sage", label: "Pale Sage", color: "#C9D1BF" },
    ],
  },
];

/** The photographs and masks for one home, or undefined if it has none. */
export function customizerFor(slug: string): CustomizerPhotos | undefined {
  return customizerRegions[slug];
}

export const customizerSlugs = (): string[] => Object.keys(customizerRegions);

/**
 * The material groups a home's photographs can actually show. With the
 * plant's own selections for the home's line (`lib/customizer/factory.ts`),
 * a group lists only those — the finish in the photographs named as what it
 * is — and a surface the plant does not list is not offered at all: every
 * colour a buyer can pick on such a home is one the plant builds. The
 * colour ideas in `MATERIALS` are for homes whose plant publishes nothing.
 */
export function materialsFor(
  photos: CustomizerPhotos,
  line?: FactoryLine,
  home: { multiSection?: boolean } = {},
): MaterialGroup[] {
  const present = new Set<Material>();
  for (const p of Object.values(photos))
    for (const m of Object.keys(p.regions) as Material[]) present.add(m);
  const cladding = Object.values(photos).find((p) => p.cladding)?.cladding;
  return MATERIALS.filter((g) => present.has(g.material)).flatMap((g) => {
    if (!line) return [g];
    const f = line.materials[g.material];
    const offered = (f?.finishes ?? []).filter(
      (x) => (!x.cladding || !cladding || x.cladding === cladding) && (!x.multiSectionOnly || home.multiSection),
    );
    if (!f || !offered.length) return [];
    const shot = offered.find((x) => x.photographed);
    const asBuilt: Finish = shot
      ? { id: "as-built", label: shot.label, source: "factory", tag: shot.tag, product: shot.product }
      : { id: "as-built", label: "As photographed" };
    const factory: Finish[] = offered
      .filter((x) => !x.photographed)
      .map((x) => ({
        id: x.id,
        label: x.label,
        color: x.color,
        source: "factory",
        tag: x.tag,
        product: x.product,
        code: x.code,
        implies: x.implies,
        swatch: x.swatch,
        price: buyerPrice(x.sheetPrice ?? x.price),
        goesWith: x.goesWith,
      }));
    return [{ ...g, factory: { line: line.name, note: f.note }, finishes: [asBuilt, ...factory] }];
  });
}

type Picks = Partial<Record<Material, string>>;

/**
 * A plant package kept whole, on the page and again on the server. The
 * finish just picked (`changed`) brings its partner with it: Promotional
 * dark cabinets bring Calacatta Lincoln counters. Any other packaged finish
 * whose partner is no longer picked goes back to the photograph's own, so
 * the page never shows half a package and the lead never sends one. With no
 * `changed` (a restored or submitted build), both halves of a broken
 * package are dropped rather than one guessed from the other.
 */
export function keepPackages(
  groups: MaterialGroup[],
  picks: Picks,
  changed?: Material,
): { picks: Picks; paired?: Material; dropped: Material[] } {
  const next: Picks = { ...picks };
  const finishOf = (m: Material) => groups.find((g) => g.material === m)?.finishes.find((f) => f.id === next[m]);
  let paired: Material | undefined;
  const pair = changed ? finishOf(changed)?.goesWith : undefined;
  if (pair) {
    const [m, id] = pair.split(":") as [Material, string];
    if (groups.some((g) => g.material === m && g.finishes.some((f) => f.id === id))) {
      if (next[m] !== id) paired = m;
      next[m] = id;
    }
  }
  const dropped = groups
    .map((g) => g.material)
    .filter((m) => {
      if (m === changed) return false;
      const p = finishOf(m)?.goesWith;
      if (!p) return false;
      const [pm, pid] = p.split(":") as [Material, string];
      /* A partner this home's photographs cannot show cannot be broken. */
      if (!groups.some((g) => g.material === pm && g.finishes.some((f) => f.id === pid))) return false;
      return next[pm] !== pid;
    });
  for (const m of dropped) delete next[m];
  return { picks: next, paired, dropped };
}
