import type { Metadata } from "next";
import { Barlow, Oswald } from "next/font/google";
import JsonLd, { businessSchema } from "./components/JsonLd";
import { ogImage } from "./lib/seo";
import { site } from "./lib/site";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;

/** Site-wide defaults; each page adds its own title, description and canonical via `pageMetadata`. */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `Mobile Homes for Sale in Albany, GA | ${site.fullName}`,
  description:
    "Singlewide, doublewide and triplewide Live Oak Homes built right here in Georgia. Browse floor plans and 3D tours at Wayne Frier Home Center of Albany. Best prices. Guaranteed.",
  applicationName: site.fullName,
  openGraph: { type: "website", siteName: site.fullName, locale: "en_US", images: [ogImage] },
  twitter: { card: "summary_large_image", images: [ogImage] },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Paste the content value of Search Console's HTML-tag verification into GOOGLE_SITE_VERIFICATION
  ...(googleVerification && { verification: { google: googleVerification } }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${oswald.variable} antialiased`}
    >
      <body className="min-h-full">
        <JsonLd data={businessSchema} />
        {children}
      </body>
    </html>
  );
}
