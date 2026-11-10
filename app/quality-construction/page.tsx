import { CallToAction, Footer } from "../components/Closing";
import { Check } from "../components/Icons";
import JsonLd, { breadcrumbSchema } from "../components/JsonLd";
import Nav from "../components/Nav";
import Reveal from "../components/Reveal";
import Image from "next/image";
import YouTube from "../components/YouTube";
import { pageMetadata } from "../lib/seo";
import { site } from "../lib/site";

export const metadata = pageMetadata({
  title: `Quality & Construction: Live Oak Homes | ${site.fullName}`,
  description: `How Live Oak Homes are built, plus available kitchen, bathroom, exterior and energy-efficiency upgrades at ${site.fullName} in ${site.city}.`,
  path: "/quality-construction",
});

const groups = [
  {
    title: "Kitchen",
    items: [
      "High-Arch Metal Faucets",
      "Oversized Kitchen Farm Sink",
      "Wall Ovens and Microwaves",
      "Over-the-Range Built-in Microwave",
      "Smooth-Top Kitchen Ranges",
      "Stainless Steel Range Hood",
      "Spacious Granite Island Countertops",
      "Real Hardwood Cabinet Doors",
    ],
  },
  {
    title: "Bathroom",
    items: [
      "Wood-Plank Ceramic Tile",
      "Glass Subway Tile Backsplash",
      "Stone Step Entry for Garden Tub",
      "Customized Cabinetry",
      "Porcelain Sinks with Metal Faucets",
      "Ceramic Tile Sit-Down Showers",
      "Rainforest Shower Head",
    ],
  },
  {
    title: "Around the home",
    items: [
      "Recessed LED Lighting",
      "Knockdown Textured Ceilings",
      "Tape and Texture Walls",
      "Nine-Foot Ceilings",
      "Atrium Doors",
      "Shiplap Accent Walls",
      "Dining Room and Kitchen Tray Ceilings",
    ],
  },
  {
    title: "Windows and insulation",
    items: [
      "Low-E Insulated Windows",
      "Transom Windows",
      "R-30 Blown Insulation",
      "R-19 Sidewall Insulation",
      "R-22 Floor Insulation",
    ],
  },
  {
    title: "Exterior features",
    items: ["Deluxe Exterior Siding Packages", "Galvanized Metal Roof", "Sliding Glass Doors", "Southern-Style Porches"],
  },
];

const construction = [
  { img: "c-channel", title: "C-channel cross members", body: "C-channel cross members give extra support for a stronger home." },
  { img: "osb-floor", title: "Thicker floors", body: "With ¾” tongue and groove OSB floor decking, our floors are 25% thicker than the competition." },
  { img: "side-wall-studs", title: "Stronger side walls", body: "Our sidewalls average just 10” between each stud (Wind Zone 2), stronger than the competition." },
  { img: "double-triple-studs", title: "Double & triple studding", body: "Double and triple studding around all windows and doors." },
  { img: "stud-mounted-receptacles", title: "Stud-mounted wiring", body: "In most cases, we stud mount our receptacles, switches and lights for better durability." },
  { img: "ridge-beam", title: "Strongest ridge beam", body: "The backbone of your home. This stronger design is more durable and allows more floor plan flexibility. We have the strongest ridge beam in the industry." },
  { img: "blown-insulation", title: "R-21 blown ceiling insulation", body: "R-21 blown ceiling insulation is standard on all Live Oak Homes, so you get lower utility bills." },
  { img: "r6-ducts", title: "R-6 ducts", body: "Our R-6 ducts exceed all state efficiency ratings." },
  { img: "vented-eaves", title: "Residential vented eaves", body: "We know the roof is one of the most important parts of your home, so we make sure you get maximum performance. Shingles are nailed so they last longer and stay better fastened." },
  { img: "roof-vent", title: "Front and rear roof vents", body: "Along with fully ventilated eaves, standard front and rear roof vents keep air flowing through the roof cavity: a reduced chance of mold and more fresh air for your family." },
  { img: "carpet-pad", title: "Solution-dyed carpet", body: "Color runs all the way through the fiber, so it can be cleaned and disinfected with a diluted bleach solution, laid over a premium rebound pad on residential tack strips, never stapled." },
  { img: "factory-floor", title: "Built in a controlled factory", body: "Materials and skilled employees are protected from the elements, preventing damage and costly weather delays. Each home is inspected by a third-party inspector as required by HUD." },
];

const videos = [
  { id: "pbV591zFIcc", title: "Live Oak Homes Factory Tour" },
  { id: "YOGRrC_OnwA", title: "Live Oak Homes Kitchen Upgrades" },
  { id: "PmDanPw-Mqw", title: "Live Oak Homes Bathroom Upgrades" },
];

export default function QualityPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Quality & Construction", path: "/quality-construction" }])} />
      <Nav />
      <main>
        <section id="top" className="relative overflow-hidden bg-steel px-4 pt-44 pb-24 text-white sm:px-6">
          <Image src="/site/exterior-wide.jpg" alt="" fill preload sizes="100vw" className="object-cover opacity-35" />
          <div className="relative mx-auto max-w-[1200px]">
            <p className="kicker !text-gold">Quality &amp; construction</p>
            <h1 className="display hero-in mt-4 max-w-3xl text-[clamp(3rem,7vw,5.5rem)]">Built better, built to last</h1>
            <p className="hero-in mt-5 max-w-xl text-lg text-white/85 [animation-delay:150ms]">
              Live Oak Homes has been, and will continue to be, an industry leader in producing quality homes at
              affordable prices. The value, quality, price and selection are unmatched, with over 100 unique floor
              plans within six home series.
            </p>
          </div>
        </section>

        <section className="px-4 pt-20 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <Reveal variant="reveal-window">
              <YouTube id={videos[0].id} title={videos[0].title} />
            </Reveal>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="display text-[clamp(2.2rem,4vw,3rem)]">How every home is built</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {construction.map((c, i) => (
                <Reveal key={c.title} delay={(i % 3) * 80} className="h-full overflow-hidden rounded-lg border border-line bg-card">
                  <div className="relative aspect-[3/2] bg-band">
                    <Image
                      src={`/construction/${c.img}.jpg`}
                      alt={`${c.title} in a Live Oak home`}
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-7">
                    <h3 className="display text-[24px]">{c.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted">{c.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-band px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="display text-[clamp(2.2rem,4vw,3rem)]">Available upgrades</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {videos.slice(1).map((v) => (
                <YouTube key={v.id} id={v.id} title={v.title} />
              ))}
            </div>
          </div>
          <div className="mx-auto mt-10 grid max-w-[1200px] gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((g, i) => (
              <Reveal key={g.title} delay={i * 80} className="rounded-lg border border-line bg-cream p-8">
                <h3 className="display text-[28px]">{g.title}</h3>
                <ul className="mt-5 space-y-3">
                  {g.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-muted">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-clay" />
                      {it}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-[1200px] items-center gap-10 rounded-lg border border-line bg-card p-8 sm:grid-cols-[160px_1fr] sm:p-12">
            <Image src="/construction/energy-star.jpg" alt="Energy Star logo" width={160} height={164} className="mx-auto" />
            <div>
              <h2 className="display text-[clamp(1.8rem,3vw,2.4rem)]">Energy Star certified</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted">
                Live Oak Homes also saves you money by being extremely energy efficient, as certified and approved with
                the Energy Star label. Ask us for the details on how your home can be constructed to Energy Star
                specifications.
              </p>
            </div>
          </div>
        </section>

        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
