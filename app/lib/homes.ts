/**
 * Home models offered by Wayne Frier Home Center of Albany, transferred from the New Homes listings on
 * waynefrierhomesalbany.com. Photos are self-hosted under /public/homes/<slug>/.
 */
import raw from "./homes.json";

export type Section = "Single wide" | "Double wide" | "Triple wide";

/** Series and finish categories, as the dealership groups its New Homes listings. */
export const SERIES = [
  "Plantation Series",
  "Signature Oak Series",
  "Classic Oak Series",
  "Suwannee Valley",
  "Runner SS",
  "Runner Series",
  "Deluxe Drywall",
  "Painted Sheetrock",
] as const;

export type Series = (typeof SERIES)[number];

export type Home = {
  slug: string;
  name: string;
  beds: number;
  baths: number;
  sqft: number;
  section: Section | null;
  series: Series[];
  /** Listing photos; the first is the cover. */
  images: string[];
  /** Matterport 3D tour id, when the dealership has one for this model. */
  tour: string | null;
  /** Clearance price in dollars, from the dealership's Specials page. */
  price?: number;
};

/** Current "Clearance Home of the Month" prices from the Specials page. */
const CLEARANCE_PRICES: Record<string, number> = { gunner: 119900 };

export const homes: Home[] = (raw as Omit<Home, "price">[]).map((h) => ({
  ...h,
  price: CLEARANCE_PRICES[h.slug],
}));

/** Homes featured on the Specials page. */
export const clearance = homes.filter((h) => h.price);

export const getHome = (slug: string) => homes.find((h) => h.slug === slug);

export const cover = (h: Home) => h.images[0];

export const specs = (h: Home) => `${h.beds} bed · ${h.baths} bath · ${h.sqft.toLocaleString("en-US")} sq ft`;

/** Descriptive alt text for a home's listing photo. */
export const homeAlt = (h: Home) =>
  `The ${h.name}, a ${h.beds}-bedroom, ${h.baths}-bath, ${h.sqft.toLocaleString("en-US")} sq ft manufactured home`;
