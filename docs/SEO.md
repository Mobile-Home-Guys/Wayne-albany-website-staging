# SEO notes

## What the code handles

- **Indexing**: every page sends `index, follow`. Nothing in the app emits `noindex` except Next's built-in 404 page.
- **Metadata**: each page has a unique title, meta description, canonical URL, Open Graph and Twitter tags (`app/lib/seo.ts`).
- **Canonical domain**: `https://waynefrierhomesalbany.com`. If the live site uses `www.`, set `NEXT_PUBLIC_SITE_URL=https://www.waynefrierhomesalbany.com` in the host's environment variables and redeploy.
- **`/sitemap.xml`** lists every page plus listing photos. **`/robots.txt`** allows everything except `/api/` and points to the sitemap.
- **Structured data**: `MobileHomeDealer` with address, phone, email and hours, plus `WebSite` on every page and `BreadcrumbList` on inner pages (`app/components/JsonLd.tsx`).
- **HTTPS**: an HSTS header is sent on every response. The host must also redirect `http://` to `https://`. Vercel does this automatically; other hosts need it turned on.

## Google Search Console (one-time, needs the owner's Google login)

1. Go to <https://search.google.com/search-console> and add a **Domain** property for `waynefrierhomesalbany.com`. Verify it with the DNS TXT record Google gives you, at your domain registrar. This covers `www`, non-`www`, `http` and `https`.
   - Alternative: add a **URL prefix** property, choose **HTML tag**, copy only the `content="..."` value, set it as `GOOGLE_SITE_VERIFICATION` in the host's environment variables, redeploy, then click **Verify**.
2. **Sitemaps** → submit `sitemap.xml`.
3. **URL Inspection** → enter the home page URL → **Request indexing**. Do the same for `/homes` and `/about`.
4. Check **Pages** after a few days for anything listed as "Excluded" and why.

Also claim and update the **Google Business Profile** so its website link points to this domain. For local searches this matters more than anything on the site itself.

## Hosting checklist

- Make sure Google is looking at the **production** domain. Vercel *preview* URLs (`*-git-*.vercel.app`) send `X-Robots-Tag: noindex` on purpose and will never rank.
- Pick a single host (`www` or apex), and have the other one 301-redirect to it in the host's domain settings.
- The previous WordPress site on `waynefrierhomesalbany.com` is replaced by this one. `next.config.ts` 301-redirects its old URLs (`/new-homes`, `/project/<home>`, `/contact-us`, `/were-hiring`, `/phenomenal-five-survey`) to their new equivalents so existing rankings and backlinks carry over. The four "Phenomenal Five" models were lead-form gated on the old site and are not listed here.

## Backlink strategy

Local businesses rank on relevance, proximity and prominence. Backlinks and citations build prominence. In priority order:

1. **Consistent NAP citations.** List the exact same name, address and phone (Wayne Frier Home Center of Albany, 3006 Sylvester Rd, Albany, GA 31705 · (229) 446-0771) with a link to this site on Google Business Profile, Bing Places, Apple Business Connect, Facebook, Yelp, BBB, Nextdoor, YellowPages, Manta and Foursquare. Fix any listings that show old details.
2. **Industry directories.** Ask Live Oak Homes for a link from their dealer locator, and get listed with the Georgia Manufactured Housing Association, the Manufactured Housing Institute (MHI), and sites such as ManufacturedHomes.com and MHVillage.
3. **Local organizations.** Join the Albany Area Chamber of Commerce, which publishes member links, and sponsor local youth sports or school events, which usually come with a sponsor link.
4. **Reviews.** Keep asking happy buyers for Google reviews. Review count and freshness are strong local ranking signals.

Avoid paid link schemes, private blog networks and bulk directory submissions. Google penalizes them.
