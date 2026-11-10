import Link from "next/link";
import { CallToAction, Footer } from "../components/Closing";
import { ArrowRight, PhoneIcon } from "../components/Icons";
import JsonLd, { breadcrumbSchema } from "../components/JsonLd";
import Nav from "../components/Nav";
import { pageMetadata } from "../lib/seo";
import { site } from "../lib/site";

export const metadata = pageMetadata({
  title: `Used & Repo Mobile Homes | ${site.fullName}`,
  description: `Preowned and repo mobile homes in ${site.city}. Call ${site.fullName} at ${site.phone} for current availability.`,
  path: "/used-repo",
});

export default function UsedRepoPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Used & Repo", path: "/used-repo" }])} />
      <Nav />
      <main>
        <section id="top" className="bg-band px-4 pt-40 pb-16 text-center sm:px-6">
          <p className="kicker">Preowned homes</p>
          <h1 className="display hero-in mt-4 text-[clamp(3rem,7vw,5.5rem)]">Used &amp; repo homes</h1>
          <p className="hero-in mx-auto mt-5 max-w-xl text-lg text-muted [animation-delay:150ms]">
            For more information on our preowned and repo homes, please call us at {site.phone}.
          </p>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={site.phoneHref}
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-clay px-8 py-4 text-[17px] font-medium text-white transition-colors hover:bg-clay-dark"
            >
              <PhoneIcon className="h-5 w-5" />
              Call {site.phone}
            </a>
            <Link
              href="/homes"
              className="group inline-flex items-center justify-center gap-2.5 rounded-md border-2 border-ink bg-transparent px-8 py-4 text-[17px] font-medium text-ink transition-colors hover:border-clay/40 hover:text-clay"
            >
              Browse new homes
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
