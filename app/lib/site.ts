export const site = {
  name: "Wayne Frier Homes Albany",
  fullName: "Wayne Frier Home Center of Albany",
  phone: "(229) 446-0771",
  phoneHref: "tel:+12294460771",
  email: "leon.waynefrier@gmail.com",
  facebook: "https://www.facebook.com/Wayne-Frier-Home-Center-of-Albany-239188109456327/",
  instagram: "https://www.instagram.com/waynefrieralbany/",
  city: "Albany, GA",
  /** Leon Holden is the dealership's point of contact on the old site's hiring page. */
  contactName: "Leon Holden",
  /** Cascade Loans online prequalification, linked from the old site's header. */
  prequalifyUrl: "https://askcade.cascadeloans.com/dealer/229-446-0771/applyprocess/prequalify",
  tagline: "Best prices. Guaranteed.",
  /** Nearby communities the lot serves, for copy and structured data. */
  serviceArea: ["Albany", "Leesburg", "Sylvester", "Camilla", "Dawson", "Americus", "Moultrie", "Tifton", "Cordele", "Pelham"],
  /** Canonical origin used for metadata, the sitemap and structured data. Set NEXT_PUBLIC_SITE_URL to override (e.g. a staging host). */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://waynefrierhomesalbany.com").replace(/\/+$/, ""),
  address: {
    street: "3006 Sylvester Rd",
    city: "Albany",
    region: "GA",
    postalCode: "31705",
  },
  /** Google Maps search for the lot, used for the "get directions" links. */
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Wayne Frier Home Center of Albany, 3006 Sylvester Rd, Albany, GA 31705")}`,
  hours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:30", closes: "17:30" },
    { days: ["Saturday"], opens: "09:00", closes: "17:00" },
  ],
  /** Human-readable hours for the footer and contact page. */
  hoursText: [
    ["Mon–Fri", "8:30 am – 5:30 pm"],
    ["Sat", "9:00 am – 5:00 pm"],
    ["Sun", "By appointment"],
  ] as const,
};

export const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
