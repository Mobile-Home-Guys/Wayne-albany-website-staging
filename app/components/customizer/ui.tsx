import type { ReactNode } from "react";

/*
 * The few shared UI pieces the home designer uses, ported from the Westgate
 * site's component kit and themed with this site's tokens (see the
 * designer tokens in app/globals.css).
 */

export function cx(...parts: Array<string | false | null | undefined | 0>) {
  return parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(" ");
}

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-[0.9rem] font-medium tracking-tight transition-all duration-300 disabled:pointer-events-none disabled:opacity-45";

export const buttonStyles = {
  primary: cx(base, "bg-clay px-6 py-3 text-white hover:bg-clay-dark active:scale-[0.98]"),
  outline: cx(base, "border border-line-strong px-6 py-3 text-ink hover:border-ink hover:bg-ink hover:text-paper active:scale-[0.98]"),
  ghost: cx(base, "px-4 py-2 text-ink hover:text-ember"),
  small: cx(base, "border border-line-strong px-4 py-2 text-[0.8rem] text-ink hover:border-ink"),
};

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mx-auto w-full max-w-[80rem] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Icon = {
  Share: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" />
    </svg>
  ),
  Arrow: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  Close: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  Chevron: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  ),
  Check: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  ),
};
