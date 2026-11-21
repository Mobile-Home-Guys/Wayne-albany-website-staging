import { getHome } from "@/app/lib/homes";

/**
 * A home as the designer reads it. The designer was built on the Westgate
 * site's listing shape; this maps one of Albany's homes onto the fields it
 * uses. No price: the designer never shows one.
 */
export type Listing = {
  slug: string;
  name: string;
  beds: number;
  baths: number;
  sqft: number;
  series?: string;
  model?: string;
  price?: number;
  sections?: "single" | "double" | "triple";
  features?: { group: string; items: string[] }[];
};

const SECTIONS = { "Single wide": "single", "Double wide": "double", "Triple wide": "triple" } as const;

export function getListing(slug: string): Listing | undefined {
  const h = getHome(slug);
  if (!h) return undefined;
  return {
    slug: h.slug,
    name: h.name,
    beds: h.beds,
    baths: h.baths,
    sqft: h.sqft,
    series: h.series[0],
    sections: h.section ? SECTIONS[h.section] : undefined,
  };
}
