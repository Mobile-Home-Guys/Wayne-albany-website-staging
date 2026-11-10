import Image from "next/image";
import Link from "next/link";
import { clearance, cover, homeAlt, specs } from "../lib/homes";
import { usd } from "../lib/site";
import { ArrowRight } from "./Icons";
import Reveal from "./Reveal";

/** Clearance Home of the Month, from the dealership's Specials page, shown with its floor plan. */
export default function Specials() {
  const home = clearance[0];
  if (!home) return null;
  return (
    <section id="specials" className="scroll-mt-28 bg-band px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-[1300px]">
        <Reveal as="p" className="kicker">
          Clearance home of the month
        </Reveal>
        <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(2.4rem,5vw,3.8rem)]">
          The {home.name}. Now {usd(home.price!)}.
        </Reveal>

        <Reveal variant="reveal-window" delay={120} className="mt-12 grid overflow-hidden rounded-lg border border-line bg-card lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto">
            <Image src={cover(home)} alt={homeAlt(home)} fill sizes="(min-width: 1024px) 650px, 100vw" className="object-cover" />
            <span className="absolute top-4 left-4 rounded-sm bg-clay px-3 py-1.5 font-[family-name:var(--font-oswald)] tracking-[0.1em] text-white uppercase shadow">
              Clearance
            </span>
          </div>
          <div className="flex flex-col p-8 sm:p-10">
            <p className="text-sm font-semibold tracking-[0.12em] text-clay uppercase">{[home.section, ...home.series].filter(Boolean).join(" · ")}</p>
            <p className="mt-2 text-lg text-muted">{specs(home)}</p>
            <p className="display mt-4 text-6xl text-ink">{usd(home.price!)}</p>
            {home.floorPlan && (
              <div className="relative mt-6 aspect-[4/3] w-full flex-1 bg-white">
                <Image src={home.floorPlan} alt={`Floor plan of the ${home.name}`} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-contain" />
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/homes/${home.slug}`}
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-clay px-7 py-3.5 font-[family-name:var(--font-oswald)] tracking-[0.06em] text-white uppercase transition-colors hover:bg-clay-dark"
              >
                See the {home.name}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/specials"
                className="inline-flex items-center justify-center rounded-md border-2 border-ink px-7 py-3 font-[family-name:var(--font-oswald)] tracking-[0.06em] text-ink uppercase transition-colors hover:bg-ink hover:text-white"
              >
                All specials
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
