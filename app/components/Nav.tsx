"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "../lib/site";
import { Logo, PhoneIcon, PinIcon } from "./Icons";

const links = [
  { href: "/homes", label: "Homes" },
  { href: "/#on-the-lot", label: "On the Lot" },
  { href: "/specials", label: "Specials" },
  { href: "/quality-construction", label: "Quality" },
  { href: "/used-repo", label: "Used & Repo" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Red utility strip with the lot's address and hours, over a solid white bar that gains a shadow on scroll. */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { street, city, region } = site.address;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`overflow-hidden bg-clay text-white transition-all duration-500 ${scrolled ? "max-h-0" : "max-h-12"}`}
      >
        <div className="mx-auto flex max-w-[1300px] items-center justify-between gap-4 px-4 py-2 text-[13px] font-medium sm:px-6">
          <span className="font-[family-name:var(--font-oswald)] tracking-[0.12em] uppercase">{site.tagline}</span>
          <a
            href={site.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 hover:underline sm:inline-flex"
          >
            <PinIcon className="h-4 w-4" />
            {street}, {city}, {region}
          </a>
          <span className="hidden lg:inline">Mon–Fri 8:30–5:30 · Sat 9–5 · Sun by appointment</span>
        </div>
      </div>

      <nav
        className={`border-b bg-white/95 backdrop-blur-md transition-shadow duration-500 ${
          scrolled ? "border-line shadow-[0_8px_30px_-16px_rgba(20,20,20,0.35)]" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1300px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" aria-label={`${site.fullName} home`}>
            <Logo className="h-8 sm:h-10" />
          </Link>
          <ul className="hidden items-center gap-6 font-[family-name:var(--font-oswald)] text-[15px] tracking-[0.06em] whitespace-nowrap text-ink uppercase lg:flex xl:gap-8">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`border-b-2 py-1 transition-colors hover:border-clay hover:text-clay ${
                    pathname === l.href ? "border-clay text-clay" : "border-transparent"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a
              href={site.prequalifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-md border-2 border-ink px-4 py-2 font-[family-name:var(--font-oswald)] text-sm tracking-[0.06em] text-ink uppercase transition-colors hover:bg-ink hover:text-white md:inline-block"
            >
              Get Prequalified
            </a>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-2 rounded-md bg-clay px-4 py-2.5 font-[family-name:var(--font-oswald)] text-sm tracking-[0.06em] whitespace-nowrap text-white uppercase transition-colors hover:bg-clay-dark"
            >
              <PhoneIcon className="h-4 w-4" />
              <span className="sm:hidden">Call</span>
              <span className="hidden sm:inline">{site.phone}</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-ink lg:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
        {/* Links hidden in the bar below lg; always in the DOM so crawlers see them */}
        <ul
          id="mobile-menu"
          className={`flex-col border-t border-line bg-white px-2 pb-3 font-[family-name:var(--font-oswald)] tracking-[0.06em] text-ink uppercase lg:hidden ${
            open ? "flex" : "hidden"
          }`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-4 py-3 hover:bg-band">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={site.prequalifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md px-4 py-3 text-clay hover:bg-band"
            >
              Get Prequalified
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
