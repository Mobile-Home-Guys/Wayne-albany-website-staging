import { site } from "../lib/site";
import { ArrowRight, Check, PhoneIcon } from "./Icons";
import Reveal from "./Reveal";
import YouTube from "./YouTube";

/** The dealership's own TV spot, a personal "ask for Leon" note, financing, and the towns we deliver to. */
export default function MeetUs() {
  const steps = [
    "Prequalify online in a few minutes",
    "Walk through homes on the lot",
    "Pick your floor plan and finishes",
    "We deliver and set up your home",
  ];
  return (
    <section className="px-4 py-28 sm:px-6">
      <div className="mx-auto grid max-w-[1300px] items-center gap-14 lg:grid-cols-[1.2fr_1fr]">
        <Reveal variant="reveal-window">
          <YouTube id="wYEFp2tG1Jw" title="Why Wait for Black Friday? | Wayne Frier of Albany" />
        </Reveal>
        <div>
          <Reveal as="p" className="kicker">
            Straight from Sylvester Road
          </Reveal>
          <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(2.2rem,4.5vw,3.4rem)]">
            Come by. Ask for {site.contactName.split(" ")[0]}.
          </Reveal>
          <Reveal as="p" delay={160} className="mt-5 text-lg leading-relaxed text-muted">
            We&rsquo;re a locally owned and operated dealership, and one of the fastest growing in the Southeast. No
            pressure, no runaround: {site.contactName} and the team will walk the lot with you, talk through what you
            can afford, and help you from the first question to the day your home is set.
          </Reveal>
          <Reveal as="ol" delay={220} className="mt-7 grid gap-3 sm:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-3 rounded-md border border-line bg-card p-4">
                <span className="display grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-clay text-white">{i + 1}</span>
                <span className="leading-snug text-ink">{s}</span>
              </li>
            ))}
          </Reveal>
          <Reveal delay={280} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={site.prequalifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-clay px-7 py-3.5 font-[family-name:var(--font-oswald)] tracking-[0.06em] text-white uppercase transition-colors hover:bg-clay-dark"
            >
              Get prequalified
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={site.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-ink px-7 py-3 font-[family-name:var(--font-oswald)] tracking-[0.06em] text-ink uppercase transition-colors hover:bg-ink hover:text-white"
            >
              <PhoneIcon className="h-4 w-4" />
              {site.phone}
            </a>
          </Reveal>
        </div>
      </div>

      <Reveal delay={100} className="mx-auto mt-24 max-w-[1300px] rounded-lg bg-ink px-6 py-10 text-white sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="kicker !text-gold">Delivered &amp; set up across southwest Georgia</p>
            <p className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)]">From our lot to your land</p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-white/85 lg:max-w-[60%] lg:justify-end">
            {site.serviceArea.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-clay" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
