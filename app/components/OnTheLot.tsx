import Link from "next/link";
import { lot, LOT_UPDATED } from "../lib/lot";
import { site } from "../lib/site";
import HomeCard from "./HomeCard";
import { ArrowRight } from "./Icons";
import Reveal from "./Reveal";

/** Home-page section with the models currently set up on the lot. */
export default function OnTheLot() {
  return (
    <section id="on-the-lot" className="scroll-mt-28 px-4 py-28 sm:px-6">
      <div className="mx-auto flex max-w-[1300px] flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Reveal as="p" className="kicker">
            {site.address.street} · Updated {LOT_UPDATED}
          </Reveal>
          <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(2.4rem,5vw,3.8rem)]">
            On our lot right now
          </Reveal>
          <Reveal as="p" delay={160} className="mt-4 max-w-2xl text-lg text-muted">
            {`Walk through these ${lot.length} homes in person`}, any day but Sunday (or Sunday by appointment). Don&rsquo;t
            see the one you want? We can order any Live Oak floor plan.
          </Reveal>
        </div>
        <Reveal delay={200}>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 font-[family-name:var(--font-oswald)] tracking-[0.06em] text-white uppercase transition-colors hover:bg-clay"
          >
            Schedule a walkthrough
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="mx-auto mt-14 grid max-w-[1300px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {lot.map((h, i) => (
          <Reveal key={h.slug} delay={(i % 4) * 90}>
            <HomeCard home={h} sizes="(min-width: 1024px) 310px, (min-width: 640px) 50vw, 100vw" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
