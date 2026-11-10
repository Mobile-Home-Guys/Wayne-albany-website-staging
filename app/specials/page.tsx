import { CallToAction, Footer } from "../components/Closing";
import HomeCard from "../components/HomeCard";
import JsonLd, { breadcrumbSchema } from "../components/JsonLd";
import Nav from "../components/Nav";
import YouTube from "../components/YouTube";
import { clearance, specs } from "../lib/homes";
import { pageMetadata } from "../lib/seo";
import { site, usd } from "../lib/site";

export const metadata = pageMetadata({
  title: `Mobile Home Specials & Clearance Homes | ${site.fullName}`,
  description: `Monthly mobile home specials and the clearance home of the month at ${site.fullName} in ${site.city}. Call ${site.phone} for current specials.`,
  path: "/specials",
});

const perks = ["Unbeatable selection", "Reduced prices", "Premium upgrades", "Quality construction"];

export default function SpecialsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Specials", path: "/specials" }])} />
      <Nav />
      <main>
        <section id="top" className="bg-band px-4 pt-40 pb-16 text-center sm:px-6">
          <p className="kicker">Browse our monthly specials</p>
          <h1 className="display hero-in mt-4 text-[clamp(3rem,7vw,5.5rem)]">Quality homes at special pricing</h1>
          <p className="hero-in mx-auto mt-5 max-w-xl text-lg text-muted [animation-delay:150ms]">
            Enjoy special pricing without compromising on craftsmanship. Call {site.phone} for current specials.
          </p>
        </section>

        <section className="px-4 pt-16 sm:px-6">
          <ul className="mx-auto grid max-w-[1200px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p) => (
              <li key={p} className="rounded-2xl border border-line bg-card px-6 py-5 text-center font-medium tracking-wide text-ink uppercase">
                {p}
              </li>
            ))}
          </ul>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="display text-[clamp(2.2rem,4vw,3rem)]">Clearance home of the month</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {clearance.map((h) => (
                <div key={h.slug}>
                  <HomeCard home={h} heading="h3" sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" />
                  <p className="sr-only">
                    {specs(h)}, now {usd(h.price!)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-band px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <YouTube id="wYEFp2tG1Jw" title="Why Wait for Black Friday? | Wayne Frier of Albany" />
            <div>
              <p className="kicker">On TV in southwest Georgia</p>
              <h2 className="display mt-3 text-[clamp(2.2rem,4vw,3rem)]">Why wait for Black Friday?</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Specials change every month. Call {site.phone} for current pricing, or stop by {site.address.street} and
                we&rsquo;ll show you everything that&rsquo;s marked down on the lot.
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
