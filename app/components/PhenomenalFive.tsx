import Image from "next/image";
import Link from "next/link";
import { cover, getHome, homeAlt, PHENOMENAL_FIVE, specs } from "../lib/homes";
import { ArrowRight } from "./Icons";
import Reveal from "./Reveal";

/** The Plantation Series showcase homes, one large feature and the rest stacked beside it. */
export default function PhenomenalFive() {
  const [lead, ...rest] = PHENOMENAL_FIVE.flatMap((s) => getHome(s) ?? []);
  if (!lead) return null;
  return (
    <section id="phenomenal-five" className="scroll-mt-28 bg-band px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-[1300px]">
        <Reveal as="p" className="kicker">
          Plantation Series showcase
        </Reveal>
        <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(2.4rem,5vw,3.8rem)]">
          The Phenomenal Five
        </Reveal>
        <Reveal as="p" delay={160} className="mt-4 max-w-2xl text-lg text-muted">
          Our biggest, best-dressed doublewides: up to 2,500+ square feet, built to be nearly indistinguishable from a
          site-built home.
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal variant="reveal-window">
            <Link href={`/homes/${lead.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-lg lg:aspect-auto lg:h-full">
              <Image
                src={cover(lead)}
                alt={homeAlt(lead)}
                fill
                sizes="(min-width: 1024px) 740px, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-steel/90 via-steel/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7 text-white">
                <div>
                  <h3 className="display text-[clamp(2rem,4vw,3rem)]">The {lead.name}</h3>
                  <p className="mt-1 text-white/85">{specs(lead)}</p>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-clay">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </Link>
          </Reveal>
          <div className="grid gap-6">
            {rest.map((h, i) => (
              <Reveal key={h.slug} delay={120 + i * 100}>
                <Link
                  href={`/homes/${h.slug}`}
                  className="group grid grid-cols-[150px_1fr] overflow-hidden rounded-lg border border-line bg-card transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(20,20,20,0.4)] sm:grid-cols-[200px_1fr]"
                >
                  <div className={`relative min-h-[130px] ${h.images[0] === h.floorPlan ? "bg-white" : ""}`}>
                    <Image
                      src={cover(h)}
                      alt={homeAlt(h)}
                      fill
                      sizes="200px"
                      className={h.images[0] === h.floorPlan ? "object-contain p-2" : "object-cover"}
                    />
                  </div>
                  <div className="flex flex-col justify-center p-5">
                    <h3 className="display text-2xl transition-colors group-hover:text-clay">The {h.name}</h3>
                    <p className="mt-1 text-[15px] text-muted">{specs(h)}</p>
                    <p className="mt-2 text-sm font-semibold text-clay">{h.tour ? "Photos · 3D tour · Floor plan" : "Floor plan & details"}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
