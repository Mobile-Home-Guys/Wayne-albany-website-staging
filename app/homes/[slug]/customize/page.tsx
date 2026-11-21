import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeCustomizer } from "@/app/components/customizer/HomeCustomizer";
import { Container, Icon } from "@/app/components/customizer/ui";
import { customizerFor, customizerSlugs, materialsFor } from "@/app/lib/customizer";
import { factoryLineFor } from "@/app/lib/customizer/factory";
import { bareName } from "@/app/lib/customizer/journey";
import { optionGroupsFor } from "@/app/lib/customizer/options";
import { num } from "@/app/lib/customizer/bridge";
import { getListing } from "@/app/lib/customizer/listing";
import { site } from "@/app/lib/customizer/bridge";
import Nav from "@/app/components/Nav";
import { Footer } from "@/app/components/Closing";

/*
 * /homes/<slug>/customize — only for the Live Oak homes with masks in
 * `app/lib/customizer/regions.generated.ts`. Every other slug is a 404,
 * which is why `dynamicParams` is off.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return customizerSlugs()
    .filter((slug) => getListing(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/homes/[slug]/customize">): Promise<Metadata> {
  const { slug } = await props.params;
  const listing = getListing(slug);
  if (!listing || !customizerFor(slug)) return { title: "Home not found" };
  const title = `Design your ${bareName(listing.name)}`;
  const description = `Pick the colors for the ${bareName(listing.name)} on its real photographs — ${listing.beds} bed, ${listing.baths} bath, ${num(listing.sqft)} sq ft — then send the build to ${site.name} for a quote.`;
  return {
    title,
    description,
    alternates: { canonical: `/homes/${slug}/customize` },
    openGraph: { title: `${title} · ${site.short}`, description, url: `/homes/${slug}/customize` },
  };
}

export default async function CustomizePage(props: PageProps<"/homes/[slug]/customize">) {
  const { slug } = await props.params;
  const listing = getListing(slug);
  const photos = customizerFor(slug);
  if (!listing || !photos) notFound();

  const groups = materialsFor(photos, factoryLineFor(listing), { multiSection: listing.sections !== undefined && listing.sections !== "single" });
  const name = bareName(listing.name);

  return (
    <>
      <Nav />
      <main className="pt-24 lg:pt-28">
      {/* On a phone the designer covers the screen and says its own name; this band only shows on a wide screen. */}
      <h1 className="sr-only lg:hidden">Design your {name}</h1>
      <Container className="hidden pb-6 pt-6 lg:block">
        <Link
          href={`/homes/${listing.slug}`}
          className="inline-flex items-center gap-1.5 font-sans text-[0.9375rem] font-bold text-muted transition-colors hover:text-ink"
        >
          <Icon.Arrow className="size-4 rotate-180" />
          Back to the {name}
        </Link>
        <h2 className="display mt-3 text-[2.4rem] text-ink">Design your {name}</h2>
        <p className="mt-2 max-w-2xl font-sans text-[1rem] leading-relaxed text-muted">
          Pick your colors on real photos of this home. When you&rsquo;re done, {site.name} calls you with a price.
        </p>
      </Container>

      <Container className="pb-12 lg:pb-16">
        <HomeCustomizer
          slug={listing.slug}
          name={name}
          photos={photos}
          groups={groups}
          options={optionGroupsFor(listing)}
          basePrice={listing.price}
        />
      </Container>
      </main>
      <Footer />
    </>
  );
}
