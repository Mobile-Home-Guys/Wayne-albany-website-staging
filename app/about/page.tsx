import Image from "next/image";
import JsonLd, { breadcrumbSchema } from "../components/JsonLd";
import { CallToAction, Footer } from "../components/Closing";
import { Check, HouseIcon, KeyIcon, ShieldIcon, TreeIcon } from "../components/Icons";
import Nav from "../components/Nav";
import OurPromise from "../components/OurPromise";
import Reveal from "../components/Reveal";
import { pageMetadata } from "../lib/seo";
import { site } from "../lib/site";

export const metadata = pageMetadata({
  title: `About ${site.fullName}: Mobile Home Dealer in Albany, GA`,
  description:
    "Wayne Frier Home Center of Albany is a locally owned and operated manufactured home dealer in Albany, GA, selling Live Oak Homes with best prices guaranteed.",
  path: "/about",
});

const stats = [
  { value: "100+", label: "Unique Live Oak floor plans to choose from" },
  { value: "6", label: "Home series, from budget-friendly to site-built looks" },
  { value: "3", label: "Home sizes: singlewide, doublewide and triplewide" },
];

const services = [
  {
    icon: HouseIcon,
    title: "Floor plans",
    body: "From single-wide homes to spacious double- and triple-wide options, with smart layouts and designs built to support everyday life.",
  },
  {
    icon: KeyIcon,
    title: "Custom design options",
    body: "Customize finishes such as flooring, cabinetry, lighting and colors, along with select structural options.",
  },
  {
    icon: TreeIcon,
    title: "Pricing & upgrades",
    body: "Special pricing and premium upgrades, with a team that helps you from your first question to the day your home is set.",
  },
  {
    icon: ShieldIcon,
    title: "Quality you can rely on",
    body: "Live Oak Homes meet and exceed the federal HUD code, and each home is inspected by a third-party inspector.",
  },
];

const covered = [
  "Best prices. Guaranteed.",
  "Energy Star certified homes",
  "Locally owned and operated",
  "Honest guidance, start to finish",
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "About Us", path: "/about" }])} />
      <Nav />
      <main>
        <section id="top" className="bg-band px-4 pt-40 pb-16 text-center sm:px-6">
          <p className="kicker">About us</p>
          <h1 className="display hero-in mt-4 text-[clamp(3rem,7vw,5.5rem)]">Best prices. Guaranteed.</h1>
          <p className="hero-in mx-auto mt-5 max-w-xl text-lg text-muted [animation-delay:150ms]">
            Unbeatable selection, reduced prices, premium upgrades and quality construction, from a locally owned dealership in Albany, Georgia.
          </p>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-2">
            <Reveal variant="reveal-window" className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/homes/buckhead/0.jpg"
                alt="Inside a Live Oak home at Wayne Frier Home Center of Albany"
                fill
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
              />
            </Reveal>
            <div>
              <Reveal as="h2" className="display text-[clamp(2.4rem,4.5vw,3.5rem)]">
                Who we are
              </Reveal>
              <Reveal delay={100} className="mt-6 space-y-5 text-lg leading-relaxed text-muted">
                <p>
                  Wayne Frier Homes of Albany is locally owned and operated and is one of the fastest growing
                  manufactured housing dealers in the Southeast. From our lot on Sylvester Road, we help families across
                  southwest Georgia find a home that fits their needs, lifestyle and budget.
                </p>
                <p>
                  We sell Live Oak Homes, an industry leader in producing quality homes at affordable prices. Live Oak
                  builds singlewides, doublewides and triplewides, with over 100 unique floor plans within six
                  different home series, so there is a size and style for nearly every budget.
                </p>
                <p>
                  Our team is here to answer questions, explain your options, and make the home-buying experience clear
                  and comfortable. Call {site.phone} or stop by and see for yourself.
                </p>
              </Reveal>
            </div>
          </div>

          <Reveal as="dl" delay={150} className="mx-auto mt-20 grid max-w-[1200px] gap-5 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-line bg-card px-6 py-8 text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd className="display text-5xl text-clay">{s.value}</dd>
                <dd className="mt-2 text-sm text-muted">{s.label}</dd>
              </div>
            ))}
          </Reveal>
        </section>

        <section className="bg-band px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <Reveal as="h2" className="display text-center text-[clamp(2.4rem,4.5vw,3.5rem)]">
              What we offer
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s, i) => (
                <Reveal key={s.title} delay={i * 90} className="rounded-lg border border-line bg-cream p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-blush text-clay">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-medium text-ink">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={200} className="mt-14 text-center">
              <p className="display text-[clamp(1.8rem,3vw,2.4rem)]">Why Wayne Frier Homes Albany</p>
              <ul className="mt-6 flex flex-wrap justify-center gap-3">
                {covered.map((c) => (
                  <li
                    key={c}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-ink/85"
                  >
                    <Check className="h-4 w-4 text-clay" />
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <OurPromise />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
