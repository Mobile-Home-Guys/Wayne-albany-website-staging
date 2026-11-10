import { CallToAction, Footer } from "../components/Closing";
import JsonLd, { breadcrumbSchema } from "../components/JsonLd";
import Nav from "../components/Nav";
import { pageMetadata } from "../lib/seo";
import { site } from "../lib/site";

export const metadata = pageMetadata({
  title: `Contact ${site.fullName} | Mobile Homes in Albany, GA`,
  description: `Visit ${site.fullName} at ${site.address.street}, ${site.city} ${site.address.postalCode}, call ${site.phone} or email ${site.email}.`,
  path: "/contact",
});

export default function ContactPage() {
  const { street, city, region, postalCode } = site.address;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(`${street}, ${city}, ${region} ${postalCode}`)}&output=embed`;
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Contact", path: "/contact" }])} />
      <Nav />
      <main>
        <section id="top" className="bg-band px-4 pt-40 pb-16 text-center sm:px-6">
          <p className="kicker">Contact us</p>
          <h1 className="display hero-in mt-4 text-[clamp(3rem,7vw,5.5rem)]">Come see us in Albany</h1>
          <p className="hero-in mx-auto mt-5 max-w-xl text-lg text-muted [animation-delay:150ms]">
            Call, email or stop by. Our team is here to answer your questions and help you find the right home. Sunday
            visits are by appointment.
          </p>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-2">
            <div>
              <h2 className="display text-[clamp(2.2rem,4vw,3rem)]">Visit us</h2>
              <address className="mt-6 space-y-4 text-lg not-italic text-muted">
                <p>
                  <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-clay">
                    {street}, {city}, {region} {postalCode}
                  </a>
                </p>
                <p>
                  <a href={site.phoneHref} className="font-medium text-clay hover:text-clay-dark">
                    {site.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${site.email}`} className="hover:text-clay">
                    {site.email}
                  </a>
                </p>
                <dl className="grid max-w-xs grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                  {site.hoursText.map(([d, t]) => (
                    <div key={d} className="contents">
                      <dt className="font-medium text-ink">{d}</dt>
                      <dd>{t}</dd>
                    </div>
                  ))}
                </dl>
              </address>
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-line bg-band">
              <iframe
                src={mapSrc}
                title={`Map to ${site.fullName}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </section>

        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
