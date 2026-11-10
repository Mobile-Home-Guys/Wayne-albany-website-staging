"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { homes } from "../lib/homes";
import { lot } from "../lib/lot";
import { site } from "../lib/site";
import { ArrowRight, PhoneIcon } from "./Icons";

/** Full-bleed dusk photo of a Live Oak home, headline on the left, with a quick-facts bar along the bottom. */
export default function Hero() {
  const bg = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight);
        if (bg.current) bg.current.style.transform = `translate3d(0, ${y * 0.3}px, 0) scale(${1.04 + y * 0.0001})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const facts = [
    { value: "100+", label: "Live Oak floor plans to choose from" },
    { value: `${homes.length}`, label: "Models with photos & tours online" },
    { value: `${lot.length}`, label: "Homes on our lot to walk through" },
    { value: "6", label: "Days a week, Sunday by appointment" },
  ];

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-steel pt-28 text-white">
      <div ref={bg} className="absolute inset-0 origin-top will-change-transform">
        <Image
          src="/site/exterior-porch.jpg"
          alt="A Live Oak home lit up at dusk with a covered front porch and landscaped beds"
          fill
          preload
          sizes="100vw"
          className="object-cover object-[60%_center]"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-steel/95 via-steel/70 to-steel/10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-steel to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1300px] flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <p className="kicker hero-in !text-gold">Albany, Georgia · Locally owned &amp; operated</p>
        <h1 className="display hero-in mt-5 max-w-3xl text-[clamp(3rem,8vw,6.5rem)] [animation-delay:100ms]">
          Your home is
          <br />
          <span className="text-clay">on Sylvester Road</span>
        </h1>
        <p className="hero-in mt-6 max-w-xl text-lg leading-relaxed text-white/85 [animation-delay:200ms] sm:text-xl">
          Wayne Frier Home Center of Albany sells singlewide, doublewide and triplewide Live Oak Homes, built in
          Georgia and set up across the southwest corner of the state. Best prices. Guaranteed.
        </p>
        <div className="hero-in mt-9 flex flex-col gap-3 [animation-delay:300ms] sm:flex-row">
          <Link
            href="/#on-the-lot"
            className="group inline-flex items-center justify-center gap-2.5 rounded-md bg-clay px-8 py-4 font-[family-name:var(--font-oswald)] text-lg tracking-[0.06em] uppercase transition-colors hover:bg-clay-dark"
          >
            See what&rsquo;s on the lot
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href={site.prequalifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border-2 border-white/80 px-8 py-4 font-[family-name:var(--font-oswald)] text-lg tracking-[0.06em] uppercase transition-colors hover:bg-white hover:text-ink"
          >
            Get prequalified
          </a>
        </div>
        <a
          href={site.phoneHref}
          className="hero-in mt-6 inline-flex items-center gap-2 self-start text-white/85 [animation-delay:400ms] hover:text-white"
        >
          <PhoneIcon className="h-5 w-5 text-gold" />
          Ask for {site.contactName.split(" ")[0]}: <span className="font-semibold">{site.phone}</span>
        </a>
      </div>

      <dl className="relative z-10 border-t border-white/15 bg-steel/80 backdrop-blur">
        <div className="mx-auto grid max-w-[1300px] grid-cols-2 divide-white/15 px-4 sm:px-6 md:grid-cols-4 md:divide-x">
          {facts.map((f) => (
            <div key={f.label} className="flex flex-col gap-1 py-5 md:flex-row md:items-baseline md:justify-center md:gap-3">
              <dd className="display text-4xl text-gold">{f.value}</dd>
              <dt className="text-sm leading-tight text-white/75">{f.label}</dt>
            </div>
          ))}
        </div>
      </dl>
    </section>
  );
}
