import { CallToAction, Footer } from "../components/Closing";
import { Check } from "../components/Icons";
import JsonLd, { breadcrumbSchema } from "../components/JsonLd";
import Nav from "../components/Nav";
import Reveal from "../components/Reveal";
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
  { title: "C-channel cross members", body: "Extra support for a stronger home." },
  { title: "Thicker floors", body: "¾” tongue and groove OSB floor decking makes our floors 25% thicker than the competition." },
  { title: "Stronger side walls", body: "Averaging just 10” between each stud (Wind Zone 2), with double and triple studding around all windows and doors." },
  { title: "Engineered trusses and ridge beam", body: "State-of-the-art trusses give you a sturdy roof, and the strongest ridge beam in the industry is the backbone of your home." },
  { title: "Energy efficient", body: "R-21 blown ceiling insulation is standard on all Live Oak Homes, with R-6 ducts that exceed state efficiency ratings and Energy Star certified options." },
  { title: "Ventilated roof", body: "Fully ventilated eaves plus front and rear roof vents are standard, for fresh air and a reduced chance of mold. Shingles are nailed, not stapled, to last longer." },
  { title: "Solution-dyed carpet", body: "Color runs through the whole fiber, so carpet can be cleaned and disinfected with a diluted bleach solution, over a premium rebound pad and tack strips." },
  { title: "Built in a controlled factory", body: "Materials and skilled employees are protected from the elements, preventing damage and costly weather delays. Each home is inspected by a third-party inspector as required by HUD, and meets and exceeds the federal HUD code." },
  { title: "Customizable", body: "Each home is engineered to maximize space and minimize waste, so floor plans can be customized any way you want, including for special-needs accessibility." },
];

export default function QualityPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Quality & Construction", path: "/quality-construction" }])} />
      <Nav />
      <main>
        <section id="top" className="bg-band px-4 pt-40 pb-16 text-center sm:px-6">
          <p className="text-sm font-medium tracking-wide text-clay uppercase">Quality & construction</p>
          <h1 className="display hero-in mt-4 text-[clamp(3rem,7vw,5.5rem)]">Built better, built to last</h1>
          <p className="hero-in mx-auto mt-5 max-w-xl text-lg text-muted [animation-delay:150ms]">
            Live Oak Homes has been an industry leader in producing quality homes at affordable prices. Value, quality,
            price and selection are unmatched, with over 100 unique floor plans within six home series.
          </p>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="display text-[clamp(2.2rem,4vw,3rem)]">How every home is built</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {construction.map((c, i) => (
                <Reveal key={c.title} delay={(i % 3) * 80} className="rounded-3xl border border-line bg-card p-7">
                  <h3 className="display text-[24px]">{c.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{c.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-band px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="display text-[clamp(2.2rem,4vw,3rem)]">Available upgrades</h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-[1200px] gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((g, i) => (
              <Reveal key={g.title} delay={i * 80} className="rounded-3xl border border-line bg-cream p-8">
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

        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
