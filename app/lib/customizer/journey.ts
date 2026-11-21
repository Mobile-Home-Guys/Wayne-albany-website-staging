import { market } from "@/app/lib/customizer/bridge";
import { site } from "@/app/lib/customizer/bridge";
import type { Material } from "./types";

/**
 * The customizer is a funnel, not a toy: a buyer who arrives from an ad
 * builds the whole house — outside, kitchen, baths, floors — and then tells
 * the sales center the four things a salesperson needs to know before the
 * first call. What comes out the other end is a lead with a build to talk
 * about, a place, a timeline and a way to pay.
 *
 * Everything a buyer can pick here is either a colour preview on the home's
 * own photographs, a finish the plant publishes (`./factory.ts`), or a
 * question about the buyer. The site-work question asks what the land
 * needs; it does not claim the dealership does that work. The county
 * question appears only once `lib/market.ts` lists counties served —
 * until then the buyer types a town or ZIP.
 */

export type DesignStepId = "exterior" | "kitchen" | "baths" | "rooms";
export type StepId = DesignStepId | "options" | "plans" | "send";

export type DesignStep = {
  id: DesignStepId;
  label: string;
  /** The heading over the options. */
  title: string;
  materials: Material[];
};

/** The rooms, in the order a buyer walks the house. A step a home's photos cannot show is skipped. */
export const DESIGN_STEPS: DesignStep[] = [
  {
    id: "exterior",
    label: "Exterior",
    title: "Start outside",
    materials: ["siding", "accent", "trim", "shutters", "door", "roof", "skirting"],
  },
  { id: "kitchen", label: "Kitchen", title: "The kitchen", materials: ["cabinets", "island", "counters"] },
  { id: "baths", label: "Bathrooms", title: "The bathrooms", materials: ["vanity", "vanitytop", "bathwalls"] },
  { id: "rooms", label: "Floors & walls", title: "Floors and walls", materials: ["flooring", "walls"] },
];

export const STEP_LABELS: Record<StepId, string> = {
  exterior: "Exterior",
  kitchen: "Kitchen",
  baths: "Bathrooms",
  rooms: "Floors & walls",
  options: "Options",
  plans: "Your plans",
  send: "Send",
};

/* ── The questions ─────────────────────────────────────────────────── */

export type Choice = { id: string; label: string; hint?: string };
export type Question = {
  id: "where" | "county" | "town" | "timeline" | "pay" | "sitework";
  label: string;
  /** Shown under the label. */
  help?: string;
  multi?: boolean;
  /** A short free-text answer instead of choices. */
  text?: { placeholder: string; max: number };
  required: boolean;
  choices: Choice[];
};

export const OTHER_COUNTY = "other";

export const QUESTIONS: Question[] = [
  {
    id: "where",
    label: "Where will the home go?",
    required: true,
    choices: [
      { id: "own-land", label: "On land I own" },
      { id: "buying-land", label: "On land I'm buying" },
      { id: "need-land", label: "I need help finding land" },
      { id: "community", label: "In a community or park" },
      { id: "unsure", label: "Not sure yet" },
    ],
  },
  ...(market.countiesServed?.length
    ? [
        {
          id: "county" as const,
          label: "Which county?",
          help: "The counties the sales center delivers to.",
          required: false,
          choices: [
            ...market.countiesServed.map((c) => ({ id: slugify(c), label: `${c} County` })),
            { id: OTHER_COUNTY, label: "Somewhere else" },
          ],
        },
      ]
    : [
        {
          id: "town" as const,
          label: "What town or ZIP is the land in?",
          help: "So the sales center can check delivery and site work there.",
          text: { placeholder: "e.g. Broken Arrow or 74012", max: 60 },
          required: false,
          choices: [],
        },
      ]),
  {
    id: "timeline",
    label: "When do you want to move in?",
    required: true,
    choices: [
      { id: "0-3", label: "Within 3 months" },
      { id: "3-6", label: "3 to 6 months" },
      { id: "6-12", label: "6 to 12 months" },
      { id: "looking", label: "Just looking" },
    ],
  },
  {
    id: "pay",
    label: "How do you plan to pay?",
    required: true,
    choices: [
      { id: "cash", label: "Cash" },
      { id: "approved", label: "Financing — already pre-approved" },
      { id: "need-financing", label: "Financing — I'll need help" },
      { id: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: "sitework",
    label: "What will the site need?",
    help: "Pick any that apply.",
    multi: true,
    required: false,
    choices: [
      { id: "clearing", label: "Clearing or a level pad" },
      { id: "foundation", label: "A foundation" },
      { id: "utilities", label: "Water, septic or power" },
      { id: "driveway", label: "A driveway" },
      { id: "steps-deck", label: "Steps, a porch or a deck" },
      { id: "unsure", label: "Not sure" },
    ],
  },
];

export const BEST_TIMES: Choice[] = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "anytime", label: "Any time" },
];

/** The consent the buyer ticks, shown on the page and stored with the lead word for word. */
export const CONSENT_TEXT = `I agree to receive calls and text messages from ${site.name}, including marketing messages, at the number above. They may be sent using automated technology. Consent isn't a condition of buying anything. Msg frequency varies; msg & data rates may apply. Reply STOP to opt out, HELP for help.`;

export type Answers = Partial<Record<Question["id"], string | string[]>>;

/** "The Hogan" reads as "your Hogan" and "the Hogan", never "your The Hogan". */
export const bareName = (name: string) => name.replace(/^the\s+/i, "");

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** The county question only matters once the buyer has land in mind. */
export function asksCounty(a: Answers) {
  return a.where === "own-land" || a.where === "buying-land" || a.where === "need-land";
}

export function questionsFor(a: Answers): Question[] {
  return QUESTIONS.filter((q) => (q.id !== "county" && q.id !== "town") || asksCounty(a));
}

export function missingAnswers(a: Answers): Question[] {
  return questionsFor(a).filter((q) => q.required && !a[q.id]);
}

export function choiceLabel(q: Question["id"], id: string): string {
  return QUESTIONS.find((x) => x.id === q)?.choices.find((c) => c.id === id)?.label ?? id;
}

/* ── Lead score ────────────────────────────────────────────────────── */

export type Engagement = { changes: number; options: number; stepsDone: number; stepsTotal: number; seconds: number };
export type Tier = "hot" | "warm" | "nurture";

/**
 * How ready this buyer is, 0–100, from what they told us and how far they
 * went. Run on the server, never shown to the buyer: it decides who the
 * sales center calls first, not whether they get called.
 */
export function scoreLead(a: Answers, e: Engagement): { score: number; tier: Tier; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const add = (n: number, why: string) => {
    score += n;
    if (n > 0) reasons.push(why);
  };

  add({ "0-3": 30, "3-6": 22, "6-12": 10, looking: 0 }[a.timeline as string] ?? 0, `timeline ${a.timeline}`);
  add(
    { cash: 25, approved: 25, "need-financing": 14, unsure: 4 }[a.pay as string] ?? 0,
    `pays ${a.pay}`,
  );
  add(
    { "own-land": 20, "buying-land": 16, community: 14, "need-land": 10, unsure: 2 }[a.where as string] ?? 0,
    `placement ${a.where}`,
  );
  if (a.county && a.county !== OTHER_COUNTY) add(5, "inside the delivery area");
  if (typeof a.town === "string" && a.town.trim().length >= 3) add(5, "named where the land is");
  const work = Array.isArray(a.sitework) ? a.sitework.filter((w) => w !== "unsure") : [];
  if (work.length) add(Math.min(6, work.length * 2), "named site work");
  if (e.changes >= 3) add(8, `${e.changes} finishes picked`);
  else if (e.changes > 0) add(4, `${e.changes} finishes picked`);
  if (e.options > 0) add(Math.min(6, e.options * 2), `${e.options} options picked`);
  if (e.stepsTotal && e.stepsDone >= e.stepsTotal) add(6, "built every room");

  score = Math.max(0, Math.min(100, score));
  const tier: Tier = score >= 70 ? "hot" : score >= 45 ? "warm" : "nurture";
  return { score, tier, reasons };
}
