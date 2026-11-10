import Image from "next/image";
import Link from "next/link";
import { site } from "../lib/site";
import Reveal from "./Reveal";
import { ArrowRight, Check, Logo, PhoneIcon } from "./Icons";
import QuoteForm from "./QuoteForm";

export function CallToAction() {
  const trust = [site.tagline, "Live Oak Homes, built in Georgia", "Locally owned & operated"];
  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden px-4 py-24 md:py-32">
      <Image src="/site/exterior-wide.jpg" alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-steel/85" />
      <div className="absolute inset-x-0 top-0 h-1.5 bg-clay" />

      <div className="relative mx-auto grid max-w-[1300px] items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="text-white">
          <Reveal as="p" className="kicker !text-gold">
            Let&rsquo;s get you home
          </Reveal>
          <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(2.6rem,6vw,4.5rem)]">
            Ready to buy?
          </Reveal>
          <Reveal as="p" delay={160} className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
            Tell us what you&rsquo;re looking for and we&rsquo;ll put together a free quote, or come see us at{" "}
            {site.address.street} in {site.city}. Call {site.phone} and ask for {site.contactName.split(" ")[0]}.
          </Reveal>
          <Reveal delay={240} className="mt-9 flex flex-wrap gap-4">
            <a
              href={site.prequalifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-md bg-clay px-8 py-4 font-[family-name:var(--font-oswald)] text-lg tracking-[0.06em] text-white uppercase transition-colors hover:bg-clay-dark"
            >
              Get prequalified
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-2.5 rounded-md border-2 border-white/70 px-8 py-4 font-[family-name:var(--font-oswald)] text-lg tracking-[0.06em] text-white uppercase transition-colors hover:bg-white hover:text-ink"
            >
              <PhoneIcon className="h-5 w-5" />
              {site.phone}
            </a>
          </Reveal>
          <Reveal as="ul" delay={360} className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-white/90">
            {trust.map((t) => (
              <li key={t} className="inline-flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-clay text-white">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal
          delay={200}
          className="rounded-lg border border-white/15 bg-white/[0.06] p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-md sm:p-10"
        >
          <h3 className="display text-[clamp(1.8rem,3vw,2.4rem)] text-white">Get a free quote</h3>
          <div className="mt-7">
            <QuoteForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const shop = [
    { href: "/homes", label: "All homes" },
    { href: "/#on-the-lot", label: "On the lot" },
    { href: "/#phenomenal-five", label: "Phenomenal Five" },
    { href: "/specials", label: "Specials" },
    { href: "/used-repo", label: "Used & repo" },
  ];
  const company = [
    { href: "/about", label: "About us" },
    { href: "/quality-construction", label: "Quality & construction" },
    { href: "/hiring", label: "We\u2019re hiring" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy policy" },
  ];
  const { street, city, region, postalCode } = site.address;
  const col = "font-[family-name:var(--font-oswald)] text-sm tracking-[0.14em] text-white uppercase";
  return (
    <footer className="bg-ink px-4 pt-16 pb-8 text-white/70 sm:px-6">
      <div className="mx-auto grid max-w-[1300px] gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <span className="inline-block rounded-md bg-white p-3">
            <Logo className="h-10" />
          </span>
          <p className="mt-5 max-w-xs leading-relaxed">
            Locally owned and operated. Selling Live Oak Homes to families across southwest Georgia. {site.tagline}
          </p>
          <div className="mt-5 flex gap-3">
            <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="rounded-md border border-white/20 px-3 py-1.5 text-sm transition-colors hover:border-white hover:text-white">
              Facebook
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="rounded-md border border-white/20 px-3 py-1.5 text-sm transition-colors hover:border-white hover:text-white">
              Instagram
            </a>
          </div>
        </div>
        <nav aria-label="Shop">
          <p className={col}>Shop homes</p>
          <ul className="mt-4 space-y-2.5">
            {shop.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={site.prequalifyUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                Get prequalified
              </a>
            </li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <p className={col}>Company</p>
          <ul className="mt-4 space-y-2.5">
            {company.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <address className="not-italic">
          <p className={col}>Visit the lot</p>
          <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block transition-colors hover:text-white">
            {street}
            <br />
            {city}, {region} {postalCode}
          </a>
          <a href={site.phoneHref} className="mt-3 block text-lg font-semibold text-white">
            {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="mt-1 block break-all transition-colors hover:text-white">
            {site.email}
          </a>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {site.hoursText.map(([d, t]) => (
              <div key={d} className="contents">
                <dt className="text-white">{d}</dt>
                <dd>{t}</dd>
              </div>
            ))}
          </dl>
        </address>
      </div>
      <div className="mx-auto mt-14 flex max-w-[1300px] flex-col justify-between gap-2 border-t border-white/10 pt-6 text-sm sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.fullName}. All rights reserved.
        </p>
        <p>Proudly selling Live Oak Homes</p>
      </div>
    </footer>
  );
}
