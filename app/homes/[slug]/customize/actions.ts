"use server";

import { getListing } from "@/app/lib/customizer/listing";
import { customizerFor, keepPackages, materialsFor, type Material, type MaterialGroup } from "@/app/lib/customizer";
import { factoryLineFor } from "@/app/lib/customizer/factory";
import {
  bareName,
  BEST_TIMES,
  CONSENT_TEXT,
  choiceLabel,
  DESIGN_STEPS,
  missingAnswers,
  QUESTIONS,
  questionsFor,
  scoreLead,
  STEP_LABELS,
  type Answers,
} from "@/app/lib/customizer/journey";
import { cleanPicks, encodeOptions, optionGroupsFor, optionLines, optionTotals, sheetPricesFor, withImplied, type OptionGroup } from "@/app/lib/customizer/options";
import {
  clean,
  digits,
  EMAIL_RE,
  isBot,
  type BuildField,
  type BuildState,
} from "@/app/lib/customizer/lead";
import { forwardLead } from "@/app/lib/customizer/send";
import { site } from "@/app/lib/customizer/bridge";

/**
 * Takes a finished build from the customizer and sends it to the CRM as a
 * qualified lead: the finishes, where the home is going, when, how it gets
 * paid for, the site work, a 0–100 score and tier, the ad that brought the
 * buyer in, and a link that reopens exactly what they built.
 *
 * Server Functions are reachable by direct POST, so every field is checked
 * against what the page could actually have sent — the home's own
 * materials and finishes, the published question choices — and the score
 * is worked out here, never taken from the browser. Exports one async
 * function and nothing else; see the note at the top of `lib/lead.ts`.
 */
export async function sendBuild(_prev: BuildState, formData: FormData): Promise<BuildState> {
  if (isBot(formData)) {
    return { status: "ok", message: "Thanks — we'll be in touch shortly." };
  }

  const req = {
    name: clean(formData.get("name"), 80),
    email: clean(formData.get("email"), 120),
    phone: clean(formData.get("phone"), 32),
    bestTime: clean(formData.get("bestTime"), 20),
    home: clean(formData.get("home"), 80),
    message: clean(formData.get("message"), 1000),
    consent: clean(formData.get("consent"), 10),
  };

  const fieldErrors: Partial<Record<BuildField, string>> = {};
  if (req.name.length < 2) fieldErrors.name = "Tell us what to call you.";
  if (digits(req.phone).length < 10) fieldErrors.phone = "A 10-digit number, so the sales center can call you.";
  if (req.email && !EMAIL_RE.test(req.email)) fieldErrors.email = "That email doesn't look right.";
  if (req.consent !== "yes") fieldErrors.consent = "Tick the box so we're allowed to call or text you.";
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Almost — fix the highlighted fields.", fieldErrors, values: req };
  }

  const listing = getListing(req.home);
  const photos = customizerFor(req.home);
  if (!listing || !photos) {
    return { status: "error", message: "That plan isn't in our catalogue any more.", values: req };
  }

  /* The finishes, grouped by room, checked against this home's own materials. */
  const groups = materialsFor(photos, factoryLineFor(listing), { multiSection: listing.sections !== undefined && listing.sections !== "single" });
  const picks = readPicks(formData, groups);
  const build: Record<string, Record<string, string>> = {};
  for (const g of groups) {
    const finish = g.finishes.find((f) => f.id === picks[g.material]);
    if (!finish) continue;
    const step = DESIGN_STEPS.find((s) => s.materials.includes(g.material));
    const room = step ? STEP_LABELS[step.id] : "Other";
    (build[room] ??= {})[g.label] = finishLine(g, finish);
  }

  /* Options, rebuilt through the same rules the page enforces — and made to
     agree with the finishes (a Smart Panel color brings the Smart Panel exterior). */
  const optionGroups = optionGroupsFor(listing);
  const implied = groups.flatMap((g) => g.finishes.filter((f) => f.id === picks[g.material]).map((f) => f.implies));
  const opts = readOptions(formData, optionGroups, implied, sheetPricesFor(listing));

  /* The answers, checked against the published choices. */
  const answers: Answers = {};
  for (const q of QUESTIONS) {
    if (q.text) {
      /* A typed answer: kept as words, capped, and only letters, digits and
         the punctuation a town or ZIP needs. */
      const v = clean(formData.get(`q:${q.id}`), q.text.max).replace(/[^\p{L}\p{N} ,.'#-]/gu, "");
      if (v) answers[q.id] = v;
      continue;
    }
    const raw = formData.getAll(`q:${q.id}`).map((v) => clean(v, 40));
    const ok = raw.filter((v) => q.choices.some((c) => c.id === v));
    if (ok.length) answers[q.id] = q.multi ? ok : ok[0];
  }
  if (missingAnswers(answers).length) {
    return {
      status: "error",
      message: "Go back to Your plans and answer the questions marked required.",
      values: req,
    };
  }
  const time = BEST_TIMES.find((t) => t.id === req.bestTime);

  const num = (k: string) => {
    const n = Number(clean(formData.get(k), 12));
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
  };
  /* Rooms the buyer actually changed, worked out from the finishes — never
     from a count the browser sends, since it feeds the score. */
  const rooms = DESIGN_STEPS.filter((s) => groups.some((g) => s.materials.includes(g.material)));
  const engagement = {
    changes: Object.keys(picks).length,
    options: opts.count,
    stepsDone: rooms.filter((s) => s.materials.some((m) => picks[m])).length,
    stepsTotal: rooms.length,
    seconds: num("seconds"),
  };
  const { score, tier, reasons } = scoreLead(answers, engagement);

  const attribution: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "landing"]) {
    const v = clean(formData.get(`a:${k}`), 300);
    if (v) attribution[k] = v;
  }

  const code = Object.entries(picks)
    .map(([m, id]) => `${m}:${id}`)
    .join(",");
  const buildUrl = buildLink(listing.slug, code, opts.code);
  const store = readStore(formData);
  const homeName = [listing.series, listing.name, listing.model].filter(Boolean).join(" ");

  const asked = questionsFor(answers);
  const answerLines = asked
    .filter((q) => answers[q.id])
    .map((q) => {
      const v = answers[q.id]!;
      const text = Array.isArray(v) ? v.map((x) => choiceLabel(q.id, x)).join(", ") : choiceLabel(q.id, v);
      return `${q.label} ${text}`;
    });
  const buildLines = Object.entries(build).flatMap(([room, items]) =>
    Object.entries(items).map(([what, finish]) => `${room} — ${what}: ${finish}`),
  );
  /* One block a salesperson can read on the phone, for the CRM's note field. */
  const summary = [
    `${tier.toUpperCase()} (${score}/100) · ${homeName}`,
    ...answerLines,
    time ? `Best time to call: ${time.label}` : null,
    store ? `In store${store.salesperson ? ` with ${store.salesperson}` : ""}` : null,
    "",
    buildLines.length ? "Their build:" : "Kept the home as photographed.",
    ...buildLines,
    ...(opts.lines.length ? ["", "Options to price:", ...opts.lines] : []),
    ...(opts.priced.length
      ? ["", "Retail from the option sheet (not shown to the buyer):", ...opts.priced, `Options total: ${usd(opts.sheetTotal)}`]
      : []),
    "",
    `Open their build: ${buildUrl}`,
    ...(req.message ? ["", `They wrote: ${req.message}`] : []),
  ]
    .filter((l) => l !== null)
    .join("\n");

  const tags = [
    "customizer-lead",
    `tier-${tier}`,
    `home-${listing.slug}`,
    ...(answers.where ? [`place-${answers.where}`] : []),
    ...(answers.timeline ? [`timeline-${answers.timeline}`] : []),
    ...(answers.pay ? [`pay-${answers.pay}`] : []),
    ...(answers.where === "need-land" ? ["needs-land"] : []),
    ...(opts.count ? ["picked-options"] : []),
    ...(store ? ["in-store"] : []),
  ];

  const submittedAt = new Date().toISOString();
  const failed = await forwardLead(
    { name: req.name, phone: req.phone, email: req.email, source: "customizer", summary, tags, submittedAt },
    {
      name: req.name,
      phone: req.phone,
      email: req.email,
      bestTime: time?.label ?? "",
      message: req.message,
      home: homeName,
      homeSlug: listing.slug,
      build,
      options: opts.byGroup,
      optionsToQuote: opts.toQuote,
      answers: Object.fromEntries(
        asked
          .filter((q) => answers[q.id])
          .map((q) => {
            const v = answers[q.id]!;
            return [q.id, Array.isArray(v) ? v.map((x) => choiceLabel(q.id, x)) : choiceLabel(q.id, v)];
          }),
      ),
      score,
      tier,
      scoreReasons: reasons,
      tags,
      buildUrl,
      summary,
      engagement,
      attribution,
      consent: {
        given: true,
        text: CONSENT_TEXT,
        at: new Date().toISOString(),
      },
      channel: store ? "in-store" : "online",
      salesperson: store?.salesperson ?? "",
      source: "customizer",
      submittedAt,
    },
  );

  if (failed) {
    return {
      status: "error",
      message: `${failed} Call us on ${site.phone} and we'll take your build over the phone.`,
      values: req,
    };
  }
  const first = req.name.split(/\s+/)[0];
  return {
    status: "ok",
    message: `Thanks, ${first}. Your ${bareName(listing.name)} is with the ${site.name} team${
      time && time.id !== "anytime" ? ` — expect a call in the ${time.label.toLowerCase()}` : ""
    }. They'll have your colors${opts.count ? " and options" : ""} in front of them.`,
  };
}

/**
 * Save my build: the buyer leaves a name and number partway through so the
 * build is not lost — and the sales center has a lead even if the buyer
 * never reaches the end. Same checks as a full send, fewer fields; sent
 * with `source: "customizer-save"` and tagged so the CRM can follow up on
 * the unfinished build rather than treat it as a quote request.
 */
export async function saveBuild(_prev: BuildState, formData: FormData): Promise<BuildState> {
  if (isBot(formData)) return { status: "ok", message: "Saved." };

  const req = {
    name: clean(formData.get("name"), 80),
    phone: clean(formData.get("phone"), 32),
    home: clean(formData.get("home"), 80),
    consent: clean(formData.get("consent"), 10),
  };
  const fieldErrors: Partial<Record<BuildField, string>> = {};
  if (req.name.length < 2) fieldErrors.name = "Tell us what to call you.";
  if (digits(req.phone).length < 10) fieldErrors.phone = "A 10-digit number, so we can find your build.";
  if (req.consent !== "yes") fieldErrors.consent = "Tick the box so we're allowed to call or text you.";
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Almost — fix the highlighted fields.", fieldErrors, values: req };
  }

  const listing = getListing(req.home);
  const photos = customizerFor(req.home);
  if (!listing || !photos) return { status: "error", message: "That plan isn't in our catalogue any more.", values: req };

  const build: Record<string, Record<string, string>> = {};
  const picks: string[] = [];
  const implied: (string | undefined)[] = [];
  const saveGroups = materialsFor(photos, factoryLineFor(listing), { multiSection: listing.sections !== undefined && listing.sections !== "single" });
  const savePicks = readPicks(formData, saveGroups);
  for (const g of saveGroups) {
    const finish = g.finishes.find((f) => f.id === savePicks[g.material]);
    if (!finish) continue;
    picks.push(`${g.material}:${finish.id}`);
    implied.push(finish.implies);
    const step = DESIGN_STEPS.find((s) => s.materials.includes(g.material));
    (build[step ? STEP_LABELS[step.id] : "Other"] ??= {})[g.label] = finishLine(g, finish);
  }
  const opts = readOptions(formData, optionGroupsFor(listing), implied, sheetPricesFor(listing));
  const buildUrl = buildLink(listing.slug, picks.join(","), opts.code);
  const homeName = [listing.series, listing.name, listing.model].filter(Boolean).join(" ");
  const attribution: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "landing"]) {
    const v = clean(formData.get(`a:${k}`), 300);
    if (v) attribution[k] = v;
  }
  const buildLines = Object.entries(build).flatMap(([room, items]) =>
    Object.entries(items).map(([what, finish]) => `${room} — ${what}: ${finish}`),
  );

  const summary = [
    `SAVED BUILD (not sent yet) · ${homeName}`,
    ...(buildLines.length ? ["", ...buildLines] : []),
    ...(opts.lines.length ? ["", "Options:", ...opts.lines] : []),
    ...(opts.priced.length
      ? ["", "Retail from the option sheet (not shown to the buyer):", ...opts.priced, `Options total: ${usd(opts.sheetTotal)}`]
      : []),
    "",
    `Open their build: ${buildUrl}`,
  ].join("\n");
  const tags = ["customizer-saved", `home-${listing.slug}`];
  const submittedAt = new Date().toISOString();
  const failed = await forwardLead(
    { name: req.name, phone: req.phone, source: "customizer-save", summary, tags, submittedAt },
    {
      name: req.name,
      phone: req.phone,
      home: homeName,
      homeSlug: listing.slug,
      build,
      options: opts.byGroup,
      buildUrl,
      summary,
      tags,
      attribution,
      consent: { given: true, text: CONSENT_TEXT, at: new Date().toISOString() },
      source: "customizer-save",
      submittedAt,
    },
  );
  if (failed) return { status: "error", message: `${failed} Try again, or call ${site.phone}.`, values: req };
  const first = req.name.split(/\s+/)[0];
  return {
    status: "ok",
    message: `Saved, ${first}. The ${site.name} team has your ${bareName(listing.name)} build on file, so you can pick it up with them any time.`,
  };
}

/* ── Shared by both actions (not exported: this file may export only async functions) ── */

function readOptions(
  formData: FormData,
  groups: OptionGroup[],
  implied: (string | undefined)[] = [],
  sheet: Record<string, number> = {},
) {
  const raw: Record<string, string[]> = {};
  for (const g of groups) raw[g.id] = formData.getAll(`o:${g.id}`).map((v) => clean(v, 60)).slice(0, 20);
  const picks = withImplied(groups, cleanPicks(groups, raw), implied).picks;
  const byGroup = optionLines(groups, picks);
  const totals = optionTotals(groups, picks);
  const code = encodeOptions(picks, groups);
  /* The sheet's retail price for each option picked, for the salesperson's
     note only: Westgate does not publish prices. */
  const priced: string[] = [];
  let sheetTotal = 0;
  for (const g of groups)
    for (const id of picks[g.id] ?? []) {
      const p = sheet[`${g.id}:${id}`];
      const c = g.choices.find((x) => x.id === id);
      if (typeof p !== "number" || !c) continue;
      priced.push(`${c.label}: ${usd(p)}`);
      sheetTotal += p;
    }
  return {
    priced,
    sheetTotal,
    byGroup,
    lines: Object.entries(byGroup).map(([g, list]) => `${g}: ${list.join(", ")}`),
    count: totals.count,
    toQuote: totals.toQuote,
    code,
  };
}

/**
 * A finish as the salesperson needs to read it: a factory finish by its
 * name and product, so it can be ordered; a colour idea marked as one, so
 * nobody orders a colour the plant does not make.
 */
/**
 * The finishes as sent, checked against this home's own, with the plant's
 * packages kept whole by the same rule the page uses (`keepPackages`): the
 * page never sends half a Promotional package, so one that arrives broken
 * is dropped rather than completed from a guess.
 */
function readPicks(formData: FormData, groups: MaterialGroup[]): Partial<Record<Material, string>> {
  const picks: Partial<Record<Material, string>> = {};
  for (const g of groups) {
    const id = clean(formData.get(`finish:${g.material}`), 40);
    if (id !== "as-built" && g.finishes.some((f) => f.id === id)) picks[g.material] = id;
  }
  return keepPackages(groups, picks).picks;
}

function finishLine(g: MaterialGroup, f: MaterialGroup["finishes"][number]) {
  if (f.source === "factory")
    return `${f.label}${f.code ? ` ${f.code}` : ""}${f.product ? ` (${f.product})` : ""} — ${g.factory?.line ?? "factory"} selection${
      f.tag && f.tag !== "Standard" ? `, ${f.tag.toLowerCase()}` : ""
    }`;
  if (f.source === "idea") return `${f.label} — color idea, not on the factory list`;
  return f.label;
}

function usd(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

function buildLink(slug: string, build: string, opts: string) {
  const q = new URLSearchParams();
  if (build) q.set("build", build);
  if (opts) q.set("opts", opts);
  const qs = q.toString();
  return `${site.url}/homes/${slug}/customize${qs ? `?${qs}` : ""}`;
}

function readStore(formData: FormData) {
  if (clean(formData.get("mode"), 10) !== "store") return null;
  return { salesperson: clean(formData.get("salesperson"), 60) };
}

