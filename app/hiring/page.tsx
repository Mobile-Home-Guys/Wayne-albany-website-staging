import { CallToAction, Footer } from "../components/Closing";
import { PhoneIcon } from "../components/Icons";
import JsonLd, { breadcrumbSchema } from "../components/JsonLd";
import Nav from "../components/Nav";
import { pageMetadata } from "../lib/seo";
import { site } from "../lib/site";

export const metadata = pageMetadata({
  title: `Careers: We're Hiring | ${site.fullName}`,
  description: `Start a career with a fast-growing, debt-free manufactured housing dealer. ${site.fullName} offers commission-based pay and company advancement. Call ${site.phone}.`,
  path: "/hiring",
});

export default function HiringPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "We're Hiring", path: "/hiring" }])} />
      <Nav />
      <main>
        <section id="top" className="bg-band px-4 pt-40 pb-16 text-center sm:px-6">
          <p className="text-sm font-medium tracking-wide text-clay uppercase">Careers</p>
          <h1 className="display hero-in mt-4 text-[clamp(3rem,7vw,5.5rem)]">We&rsquo;re hiring</h1>
          <p className="hero-in mx-auto mt-5 max-w-xl text-lg text-muted [animation-delay:150ms]">
            Looking for a rewarding career?
          </p>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl space-y-6 text-lg leading-relaxed text-muted">
            <p>
              Have you been thinking about starting a career with a fast-growing, debt-free company that offers
              competitive pay and great benefits?
            </p>
            <p>
              Wayne Frier Homes of Albany is locally owned and operated and is one of the fastest growing manufactured
              housing dealers in the Southeast. We offer commission-based pay and company advancement for qualified and
              dedicated employees.
            </p>
            <p>For more information, please contact Leon Holden at {site.phone}. We look forward to hearing from you!</p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <a
                href={site.phoneHref}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-clay px-8 py-4 text-[17px] font-medium text-white transition-colors hover:bg-clay-dark"
              >
                <PhoneIcon className="h-5 w-5" />
                Call {site.phone}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center justify-center rounded-full border border-line bg-card px-8 py-4 text-[17px] font-medium text-ink transition-colors hover:border-clay/40 hover:text-clay"
              >
                Email us
              </a>
            </div>
          </div>
        </section>

        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
