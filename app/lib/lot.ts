/**
 * Models shown as "On our lot" across the site.
 *
 * PLACEHOLDER: these were picked at random from the catalog as examples for the first walkthrough with the
 * dealership. Replace them with the homes actually sitting on the lot at 3006 Sylvester Rd (and update
 * LOT_UPDATED) once the team confirms current inventory.
 */
import { getHome, type Home } from "./homes";

export const LOT_UPDATED = "November 2026";

const LOT_SLUGS = ["cobblestone", "tremor", "messi", "mj", "southern-charm", "fatboy", "dart", "augustine"];

export const lot: Home[] = LOT_SLUGS.flatMap((slug) => getHome(slug) ?? []);

export const isOnLot = (slug: string) => LOT_SLUGS.includes(slug);
