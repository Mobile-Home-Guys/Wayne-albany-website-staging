import { absoluteUrl } from "../lib/seo";
import { site } from "../lib/site";

/** Renders schema.org structured data. `<` is escaped so the payload can't close the script tag. */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const businessId = `${site.url}/#business`;

/** The dealership itself, shown on every page. */
export const businessSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MobileHomeDealer",
      "@id": businessId,
      name: site.fullName,
      alternateName: site.name,
      url: absoluteUrl("/"),
      telephone: "+1-229-446-0771",
      email: site.email,
      image: absoluteUrl("/og-image.jpg"),
      logo: absoluteUrl("/wayne-frier-albany-logo.png"),
      description:
        "Locally owned mobile and manufactured home dealer in Albany, Georgia, selling singlewide, doublewide and triplewide Live Oak Homes at the best prices.",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressRegion: site.address.region,
        postalCode: site.address.postalCode,
        addressCountry: "US",
      },
      hasMap: site.mapUrl,
      openingHoursSpecification: site.hours.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes,
      })),
      areaServed: [
        ...site.serviceArea.map((name) => ({ "@type": "City", name: `${name}, GA` })),
        { "@type": "AdministrativeArea", name: "Southwest Georgia" },
      ],
      slogan: site.tagline,
      sameAs: [site.facebook, site.instagram],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: absoluteUrl("/"),
      name: site.fullName,
      publisher: { "@id": businessId },
      inLanguage: "en-US",
    },
  ],
};

/** Breadcrumb trail; the home page is always the first crumb. */
export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}
