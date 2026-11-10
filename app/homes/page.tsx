import { CallToAction, Footer } from "../components/Closing";
import JsonLd, { breadcrumbSchema } from "../components/JsonLd";
import HomesBrowser from "../components/HomesBrowser";
import Nav from "../components/Nav";
import { homes } from "../lib/homes";
import { pageMetadata } from "../lib/seo";
import { site } from "../lib/site";

export const metadata = pageMetadata({
  title: `Mobile Home Floor Plans for Sale | ${site.fullName}`,
  description: `Browse ${homes.length} singlewide, doublewide and triplewide Live Oak Homes floor plans, from 2 to 5 bedrooms, at ${site.fullName} in ${site.city}.`,
  path: "/homes",
});

export default function HomesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Homes", path: "/homes" }])} />
      <Nav />
      <main>
        <section id="top" className="bg-band px-4 pt-40 pb-16 text-center sm:px-6">
          <p className="kicker">Our homes</p>
          <h1 className="display hero-in mt-4 text-[clamp(3rem,7vw,5.5rem)]">Find your floor plan</h1>
          <p className="hero-in mx-auto mt-5 max-w-xl text-lg text-muted [animation-delay:150ms]">
            {homes.length} floor plans across six home series, from cozy two-bedrooms to five-bedroom family homes. Come
            see them at our lot in {site.city}.
          </p>
        </section>

        <section className="px-4 pt-10 pb-8 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <HomesBrowser />
          </div>
        </section>

        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
