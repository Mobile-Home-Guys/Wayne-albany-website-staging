import Link from "next/link";
import { ArrowRight } from "./Icons";
import Reveal from "./Reveal";

/** The six Live Oak Homes series, with the dealership's own descriptions. */
const series = [
  {
    name: "Plantation Series",
    body: "Spacious living from 1,500 to 2,600 square feet in doublewide and triplewide options, designed to be nearly indistinguishable from traditional site-built homes.",
  },
  {
    name: "XT Series",
    body: "A custom feel throughout your home while keeping your budget in check, with 8′ or 9′ ceilings and a wide selection of colors and finishes.",
  },
  {
    name: "Extreme Series",
    body: "Sheetrock homes with 8′ ceilings, elegant chair rail in the living and bedroom areas, and vibrant paint colors throughout.",
  },
  {
    name: "Oak Series",
    body: "The Classic Oak and Signature Oak Series: an affordable alternative to site-built homes with crown molding, porcelain sinks, upgraded insulation and low-E windows.",
  },
  {
    name: "Suwannee Valley Series",
    body: "The best price-per-square-foot floor plans we offer, with an array of upgrades to choose from that keep the home buyer’s budget in mind.",
  },
  {
    name: "Runner SS Series",
    body: "The Super Star line. Multiple models with all the basic necessities a homeowner needs, at the best price-per-square-foot on the market.",
  },
];

/** Home-page section describing the six home series. */
export default function Series() {
  return (
    <section id="series" className="scroll-mt-28 px-4 py-28 sm:px-6">
      <div className="mx-auto flex max-w-[1300px] flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Reveal as="p" className="kicker">
            Built by Live Oak Homes
          </Reveal>
          <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(2.4rem,5vw,3.8rem)]">
            Six home series to choose from
          </Reveal>
          <Reveal as="p" delay={120} className="mt-4 max-w-xl text-lg text-muted">
            Live Oak Homes builds singlewides, doublewides and triplewides, with over 100 unique floor plans to fit
            your budget and your family&rsquo;s lifestyle.
          </Reveal>
        </div>
        <Reveal delay={200}>
          <Link
            href="/homes"
            className="group inline-flex items-center gap-2 rounded-md border-2 border-ink bg-transparent px-6 py-3 text-[15px] font-medium text-clay transition-colors hover:bg-clay hover:text-white"
          >
            Browse all homes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="mx-auto mt-14 grid max-w-[1300px] gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {series.map((s, i) => (
          <Reveal key={s.name} delay={(i % 3) * 100} className="group h-full bg-card p-8 transition-colors hover:bg-cream">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="display text-[26px]">{s.name}</h3>
              <span className="display text-3xl text-line transition-colors group-hover:text-clay">0{i + 1}</span>
            </div>
            <p className="mt-3 leading-relaxed text-muted">{s.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
