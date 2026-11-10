import Image from "next/image";
import Link from "next/link";
import { cover, homeAlt, specs, type Home } from "../lib/homes";
import { isOnLot } from "../lib/lot";
import { usd } from "../lib/site";
import { ArrowRight } from "./Icons";

/**
 * Photo card for a single home model; `large` fills a taller grid slot.
 * `heading` keeps the outline valid: h3 under a section's h2, h2 when the grid sits straight under the page's h1.
 */
export default function HomeCard({
  home,
  large = false,
  sizes,
  heading: Heading = "h3",
}: {
  home: Home;
  large?: boolean;
  sizes: string;
  heading?: "h2" | "h3";
}) {
  const onLot = isOnLot(home.slug);
  const isDrawing = home.images[0] === home.floorPlan;
  return (
    <Link
      href={`/homes/${home.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-card transition-all duration-500 ease-out hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_24px_50px_-24px_rgba(20,20,20,0.4)]"
    >
      <div className={`relative aspect-[4/3] overflow-hidden ${isDrawing ? "bg-white" : "bg-band"} ${large ? "lg:aspect-auto lg:flex-1" : ""}`}>
        <Image
          src={cover(home)}
          alt={homeAlt(home)}
          fill
          sizes={sizes}
          className={`transition-transform duration-700 ease-out group-hover:scale-[1.04] ${isDrawing ? "object-contain p-3" : "object-cover"}`}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {onLot && (
            <span className="rounded-sm bg-ink px-2.5 py-1 font-[family-name:var(--font-oswald)] text-xs tracking-[0.1em] text-white uppercase shadow">
              On the lot
            </span>
          )}
          {home.price && (
            <span className="rounded-sm bg-clay px-2.5 py-1 font-[family-name:var(--font-oswald)] text-xs tracking-[0.1em] text-white uppercase shadow">
              Now {usd(home.price)}
            </span>
          )}
        </div>
        {home.tour && (
          <span className="absolute right-3 bottom-3 rounded-sm bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink shadow">
            3D tour
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3 border-t-4 border-clay/0 p-5 transition-colors group-hover:border-clay">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-clay uppercase">
            {home.section ?? home.series[0] ?? "Manufactured home"}
          </p>
          <Heading className={`display mt-1 ${large ? "text-[34px]" : "text-[26px]"}`}>The {home.name}</Heading>
          <p className="mt-1 text-[15px] text-muted">{specs(home)}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-band text-ink transition-colors group-hover:bg-clay group-hover:text-white">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
