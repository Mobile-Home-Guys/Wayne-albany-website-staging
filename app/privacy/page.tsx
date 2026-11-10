import { Footer } from "../components/Closing";
import JsonLd, { breadcrumbSchema } from "../components/JsonLd";
import Nav from "../components/Nav";
import { pageMetadata } from "../lib/seo";
import { site } from "../lib/site";

export const metadata = pageMetadata({
  title: `Privacy Policy | ${site.fullName}`,
  description: `How ${site.fullName} collects and uses information submitted through this website, including SMS consent.`,
  path: "/privacy",
});

/** Carried over from the old site's privacy policy, minus the WordPress comment and login sections that no longer apply. */
const sections: { title: string; body: (string | string[])[] }[] = [
  {
    title: "Who we are",
    body: [`Our website address is ${site.url}. This site is operated by ${site.fullName}, ${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}.`],
  },
  {
    title: "Contact forms",
    body: [
      "When you submit information through our contact forms, we collect the information you provide so we can respond to your inquiry and communicate with you regarding our products or services.",
    ],
  },
  {
    title: "SMS communications & consent",
    body: [
      "If you provide your mobile phone number through our website, contact forms, or other communication methods, you consent to receive SMS (text message) communications from Wayne Frier Homes of Albany. These messages may include responses to inquiries, appointment confirmations, customer service messages, promotional offers, marketing messages, and information related to our homes, products, or services.",
      ["Message frequency may vary.", "Message and data rates may apply.", "Consent is not a condition of purchase.", "You may opt out at any time by replying STOP to any message. For help, reply HELP."],
      "We do not sell, rent, or share your mobile phone number with third parties for their marketing purposes. SMS messages may be sent using automated technology. By providing your phone number, you confirm you are the authorized user of the number provided.",
    ],
  },
  {
    title: "Embedded content from other websites",
    body: [
      "Pages on this site may include embedded content (for example videos, 3D tours and maps). Embedded content from other websites behaves in the exact same way as if you visited the other website directly.",
      "These websites may collect data about you, use cookies, embed third-party tracking, and monitor your interaction with the embedded content, especially if you are logged in to that website.",
    ],
  },
  {
    title: "Financing",
    body: [
      "Our “Get prequalified” links take you to our financing partner’s website. Information you enter there is collected and handled under that partner’s own privacy policy.",
    ],
  },
  {
    title: "Analytics",
    body: ["We may use analytics tools to understand how visitors interact with our website and to improve our content and user experience."],
  },
  {
    title: "What rights you have over your data",
    body: [
      "You may request an exported file of the personal data we hold about you, including any data you have provided. You may also request that we erase your personal data, except for data we are required to retain for administrative, legal, or security purposes.",
      `To make a request, call ${site.phone} or email ${site.email}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Privacy Policy", path: "/privacy" }])} />
      <Nav />
      <main id="top" className="px-4 pt-44 pb-24 sm:px-6">
        <article className="mx-auto max-w-3xl">
          <p className="kicker">Legal</p>
          <h1 className="display mt-4 text-[clamp(2.6rem,6vw,4.5rem)]">Privacy policy</h1>
          {sections.map((s) => (
            <section key={s.title} className="mt-12">
              <h2 className="display text-2xl">{s.title}</h2>
              {s.body.map((b, i) =>
                Array.isArray(b) ? (
                  <ul key={i} className="mt-4 list-disc space-y-1.5 pl-6 text-muted">
                    {b.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={i} className="mt-4 leading-relaxed text-muted">
                    {b}
                  </p>
                ),
              )}
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}
