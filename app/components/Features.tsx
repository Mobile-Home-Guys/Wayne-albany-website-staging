import Image from "next/image";
import Reveal from "./Reveal";

/** The four promises from the old home page and Specials page, in the dealership's own words. */
const perks = [
  { n: "01", title: "Current deals", body: "Special pricing without compromising on craftsmanship, with a clearance home every month." },
  { n: "02", title: "Unbeatable selection", body: "Singlewides, doublewides and triplewides across six Live Oak series and over 100 floor plans." },
  { n: "03", title: "Reduced prices", body: "Live Oak buys materials in bulk and builds efficiently in the factory, and we pass the savings to you." },
  { n: "04", title: "Quality construction", body: "Built to meet and exceed the federal HUD code, third-party inspected, with Energy Star options." },
];

/** Dark band right under the hero: the dealership's four promises next to a daytime exterior. */
export default function Features() {
  return (
    <section className="relative bg-steel px-4 py-24 text-white sm:px-6">
      <div className="mx-auto grid max-w-[1300px] items-center gap-14 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <Reveal as="p" className="kicker !text-gold">
            Why Wayne Frier Albany
          </Reveal>
          <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(2.4rem,5vw,3.8rem)]">
            Best prices.
            <br />
            <span className="text-clay">Guaranteed.</span>
          </Reveal>
          <Reveal as="p" delay={160} className="mt-5 max-w-lg text-lg leading-relaxed text-white/75">
            From Wayne Frier Homes of Albany, you can enjoy special pricing without compromising on craftsmanship.
          </Reveal>
          <Reveal variant="reveal-window" delay={200} className="relative mt-10 aspect-[3/2] overflow-hidden rounded-lg">
            <Image
              src="/site/georgia-giant.jpg"
              alt="A dark-sided Live Oak home with cedar shutters, a front porch and an American flag"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
        <div className="grid gap-px overflow-hidden rounded-lg bg-white/10 sm:grid-cols-2">
          {perks.map((p, i) => (
            <Reveal key={p.title} delay={120 + i * 100} className="h-full bg-steel-2 p-8">
              <p className="display text-5xl text-clay">{p.n}</p>
              <h3 className="display mt-4 text-2xl">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-white/70">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
