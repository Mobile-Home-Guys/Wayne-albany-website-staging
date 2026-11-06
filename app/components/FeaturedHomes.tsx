import Link from "next/link";
import { getHome } from "../lib/homes";
import HomeCard from "./HomeCard";
import { ArrowRight } from "./Icons";
import Reveal from "./Reveal";

/** A spread of sizes and bedroom counts from the catalog. */
const featured = ["tswift", "ace", "gunner", "buckhead", "gametime", "cobblestone"];

/** Home-page section with a handful of popular models. */
export default function FeaturedHomes() {
  const homes = featured.flatMap((slug) => getHome(slug) ?? []);
  return (
    <section id="featured" className="scroll-mt-24 px-4 pt-28 pb-28 sm:px-6">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 text-center md:flex-row md:items-end md:text-left">
        <div>
          <Reveal as="h2" className="display text-[clamp(2.6rem,5.5vw,4rem)]">
            Popular floor plans
          </Reveal>
          <Reveal as="p" delay={120} className="mt-4 max-w-xl text-lg text-muted">
            From cozy two-bedroom singlewides to five-bedroom family homes. See photos, 3D tours and details for every
            model.
          </Reveal>
        </div>
        <Reveal delay={200}>
          <Link
            href="/homes"
            className="group inline-flex items-center gap-2 rounded-full border border-clay/30 bg-cream px-6 py-3 text-[15px] font-medium text-clay transition-colors hover:bg-clay hover:text-white"
          >
            See all homes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="mx-auto mt-14 grid max-w-[1200px] gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {homes.map((h, i) => (
          <Reveal key={h.slug} delay={(i % 3) * 100}>
            <HomeCard home={h} sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
