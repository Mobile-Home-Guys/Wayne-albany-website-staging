import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallToAction, Footer } from "../../components/Closing";
import JsonLd, { breadcrumbSchema } from "../../components/JsonLd";
import HomeCard from "../../components/HomeCard";
import Gallery from "../../components/Gallery";
import { ArrowRight } from "../../components/Icons";
import Nav from "../../components/Nav";
import { cover, getHome, homes, homeAlt } from "../../lib/homes";
import { isOnLot } from "../../lib/lot";
import Image from "next/image";
import { pageMetadata } from "../../lib/seo";
import { site, usd } from "../../lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return homes.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const home = getHome((await params).slug);
  if (!home) return {};
  return pageMetadata({
    title: `The ${home.name}: ${home.beds} Bed, ${home.baths} Bath Mobile Home | ${site.fullName}`,
    description: `See the ${home.name}, a ${home.beds}-bedroom, ${home.baths}-bath, ${home.sqft.toLocaleString("en-US")} sq ft manufactured home at ${site.fullName} in ${site.city}. Call ${site.phone} for pricing and delivery.`,
    path: `/homes/${home.slug}`,
    image: { url: cover(home), alt: homeAlt(home) },
  });
}

export default async function HomePage({ params }: Props) {
  const home = getHome((await params).slug);
  if (!home) notFound();

  const similar = homes
    .filter((h) => h.slug !== home.slug && h.beds === home.beds)
    .sort((a, b) => Math.abs(a.sqft - home.sqft) - Math.abs(b.sqft - home.sqft))
    .slice(0, 3);

  const stats = [
    { label: "Bedrooms", value: home.beds },
    { label: "Bathrooms", value: home.baths },
    { label: "Square feet", value: home.sqft.toLocaleString("en-US") },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Homes", path: "/homes" },
          { name: `The ${home.name}`, path: `/homes/${home.slug}` },
        ])}
      />
      <Nav />
      <main>
        <section id="top" className="px-4 pt-32 pb-20 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <Link href="/homes" className="text-sm font-medium text-clay hover:text-clay-dark">
              ← All homes
            </Link>
            <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
              <Gallery images={home.images} alt={homeAlt(home)} />
              <div>
                <p className="kicker">
                  {[home.section, ...home.series].filter(Boolean).join(" · ") || "Manufactured home"}
                </p>
                <h1 className="display mt-3 text-[clamp(3rem,6vw,4.8rem)]">The {home.name}</h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  {isOnLot(home.slug) && (
                    <p className="rounded-sm bg-ink px-3 py-1.5 font-[family-name:var(--font-oswald)] text-sm tracking-[0.1em] text-white uppercase">
                      On our lot: walk through it today
                    </p>
                  )}
                  {home.price && (
                    <p className="rounded-sm bg-clay px-3 py-1.5 font-[family-name:var(--font-oswald)] text-sm tracking-[0.1em] text-white uppercase">
                      Clearance: now {usd(home.price)}
                    </p>
                  )}
                </div>
                <dl className="mt-8 grid grid-cols-3 gap-3">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-line bg-card p-4">
                      <dt className="text-xs text-muted">{s.label}</dt>
                      <dd className="display mt-1 text-3xl">{s.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-8 leading-relaxed text-muted">
                  {isOnLot(home.slug)
                    ? `The ${home.name} is set up at ${site.address.street}. Stop by and walk through it, and we'll go over finishes, financing, delivery and setup.`
                    : `Come see the ${home.name} in person or order it built for you. We'll walk you through floor plan options, customization, financing, delivery and setup.`}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={site.phoneHref}
                    className="group inline-flex items-center justify-center gap-2 rounded-md bg-clay px-7 py-3.5 font-medium text-white transition-colors hover:bg-clay-dark"
                  >
                    Call {site.phone}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                  <a
                    href={site.prequalifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md border-2 border-ink px-7 py-3 font-[family-name:var(--font-oswald)] tracking-[0.06em] text-ink uppercase transition-colors hover:bg-ink hover:text-white"
                  >
                    Get prequalified
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {home.floorPlan && (
          <section id="floor-plan" className="px-4 pb-20 sm:px-6">
            <div className="mx-auto max-w-[1200px]">
              <p className="kicker">{home.beds} bed · {home.baths} bath · {home.sqft.toLocaleString("en-US")} sq ft</p>
              <h2 className="display mt-3 text-[clamp(2.2rem,4vw,3rem)]">Floor plan</h2>
              <a
                href={home.floorPlan}
                target="_blank"
                rel="noopener noreferrer"
                className="relative mt-8 block aspect-[4/3] overflow-hidden rounded-lg border border-line bg-white sm:aspect-[16/10]"
              >
                <Image
                  src={home.floorPlan}
                  alt={`Floor plan and front elevation of the ${home.name}`}
                  fill
                  sizes="(min-width: 1200px) 1200px, 100vw"
                  className="object-contain p-2"
                />
                <span className="absolute right-3 bottom-3 rounded-sm bg-ink px-3 py-1.5 text-sm text-white">Open full size</span>
              </a>
              <p className="mt-3 text-sm text-muted">
                Room dimensions and square footage are approximate. Live Oak Homes reserves the right to modify product
                offering at any time.
              </p>
            </div>
          </section>
        )}

        {home.tour && (
          <section className="px-4 pb-20 sm:px-6">
            <div className="mx-auto max-w-[1200px]">
              <h2 className="display text-[clamp(2.2rem,4vw,3rem)]">Take a 3D tour</h2>
              <div className="relative mt-8 aspect-video overflow-hidden rounded-lg border border-line bg-band">
                <iframe
                  src={`https://my.matterport.com/show/?m=${home.tour}`}
                  title={`${home.name} 3D tour`}
                  loading="lazy"
                  allowFullScreen
                  allow="fullscreen; xr-spatial-tracking"
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <section className="bg-band px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-[1200px]">
              <h2 className="display text-[clamp(2.2rem,4vw,3rem)]">Similar homes</h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((h) => (
                  <HomeCard key={h.slug} home={h} sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" />
                ))}
              </div>
            </div>
          </section>
        )}

        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
