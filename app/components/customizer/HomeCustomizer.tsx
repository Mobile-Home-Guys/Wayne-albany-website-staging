"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sendBuild } from "@/app/homes/[slug]/customize/actions";
import { keepPackages, type CustomizerPhotos, type Material, type MaterialGroup } from "@/app/lib/customizer";
import type { Finish, Layer } from "@/app/lib/customizer/types";
import {
  asksCounty,
  CONSENT_TEXT,
  DESIGN_STEPS,
  missingAnswers,
  questionsFor,
  type Answers,
  type Question,
} from "@/app/lib/customizer/journey";
import {
  applyOption,
  chosenOptions,
  decodeOptions,
  defaultPicks,
  encodeOptions,
  ESTIMATE,
  optionTotals,
  PRICE_MODE,
  withImplied,
  type OptionGroup,
  type OptionPicks,
} from "@/app/lib/customizer/options";
import { money, monthlyPayment } from "@/app/lib/customizer/bridge";
import { EMPTY_BUILD_STATE, type BuildState } from "@/app/lib/customizer/lead";
import { pages } from "@/app/lib/customizer/bridge";
import { site } from "@/app/lib/customizer/bridge";
import { buttonStyles, cx, Icon } from "@/app/components/customizer/ui";

/**
 * The home designer, one question at a time: "Pick the siding color", the
 * surface lit up on the photo, the colours to tap, one Next button. Then a
 * look at the whole home, a few questions about the buyer's plans, and a
 * name and number. Nothing on a screen asks for more than one decision.
 * See `lib/customizer/journey.ts` for why it ends in a lead.
 *
 * Each photograph comes with a greyscale mask per material. Where a finish
 * has been rendered for a surface (`scripts/bake-customizer.py`: the
 * surface repainted in the room's own light, kept only inside its mask),
 * that render is laid in. Otherwise the new colour is relit into the masked
 * pixels from the photograph's own lightness — the ratio of each pixel to
 * the material's median — so shadows, grain and the light from the windows
 * stay the photograph's. Nothing leaves the page but the picks themselves,
 * which go to the sales center with a quote request.
 */

type Loaded = {
  base: Uint8ClampedArray;
  lum: Float32Array;
  masks: Partial<Record<Material, Uint8Array>>;
  w: number;
  h: number;
};

/** A rendered finish, decoded: RGBA over `x, y` of the photograph, its alpha the surface grown a little. */
type LayerPixels = { x: number; y: number; w: number; h: number; data: Uint8ClampedArray };

/* Decoded renders, newest last; a handful at a time, since each is megabytes. */
const layerCache = new Map<string, Promise<LayerPixels | null>>();
function loadLayer(l: Layer): Promise<LayerPixels | null> {
  let p = layerCache.get(l.src);
  if (p) {
    layerCache.delete(l.src);
    layerCache.set(l.src, p);
    return p;
  }
  p = loadImage(l.src)
    .then((img) => ({ x: l.x, y: l.y, w: img.naturalWidth, h: img.naturalHeight, data: readPixels(img) }))
    .catch(() => null);
  layerCache.set(l.src, p);
  while (layerCache.size > 8) layerCache.delete(layerCache.keys().next().value!);
  return p;
}

/** The renders a build needs on one photograph, decoded, by material. A render that fails to load is left out: that surface is recoloured instead. */
async function layersFor(
  regions: CustomizerPhotos[string]["regions"],
  picks: Partial<Record<Material, string>>,
): Promise<Partial<Record<Material, LayerPixels>>> {
  const want = (Object.entries(picks) as [Material, string][]).flatMap(([m, id]) => {
    const l = regions[m]?.layers?.[id];
    return l ? [[m, l] as const] : [];
  });
  const got = await Promise.all(want.map(async ([m, l]) => [m, await loadLayer(l)] as const));
  return Object.fromEntries(got.filter(([, v]) => v)) as Partial<Record<Material, LayerPixels>>;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });

function readPixels(img: HTMLImageElement): Uint8ClampedArray {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, c.width, c.height).data;
}

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const PAINTED = new Set<Material>(["cabinets", "island", "vanity", "walls", "bathwalls", "trim", "door", "shutters", "accent"]);

const NO_PREVIEW = "repeating-linear-gradient(135deg, rgb(0 0 0 / 0.2) 0 2px, transparent 2px 7px)";

/**
 * The home with a build's finishes laid into one photograph, as RGBA. Each
 * new colour is relit from the photograph: the pixel's lightness against
 * the material's median carries the shadow, grain and window light. A dark
 * finish multiplied down loses that detail, so it is added back instead;
 * the two blend by the finish's own lightness so there is no seam.
 */
function paintBuild(
  P: Loaded,
  regions: CustomizerPhotos[string]["regions"],
  groups: MaterialGroup[],
  picks: Partial<Record<Material, string>>,
  layers: Partial<Record<Material, LayerPixels>> = {},
): Uint8ClampedArray {
  const b = P.base;
  const L = P.lum;
  const o = new Uint8ClampedArray(b);
  const changed = (m: Material) => !!picks[m] && picks[m] !== "as-built";
  for (const g of groups) {
    const finish = g.finishes.find((f) => f.id === picks[g.material]);
    const mask = P.masks[g.material];
    const region = regions[g.material];
    const lp = layers[g.material];
    if (lp && mask && finish && finish.id !== "as-built") {
      /* A rendered finish, its alpha the surface as the render repainted it
         — the render, not the mask, decides exactly where a white cabinet
         meets a white wall. Outside this surface's own mask it gives way to
         a neighbouring surface that has a new finish of its own. */
      /* Walls give way: their outline is rough, and what is mounted on them wins. */
      const others = groups
        .filter((x) => x !== g && changed(x.material) && x.material !== "walls" && x.material !== "bathwalls")
        .flatMap((x) => (P.masks[x.material] ? [P.masks[x.material]!] : []));
      const W = P.w;
      for (let yy = 0; yy < lp.h; yy++) {
        const y = lp.y + yy;
        if (y < 0 || y >= P.h) continue;
        for (let xx = 0; xx < lp.w; xx++) {
          const x = lp.x + xx;
          if (x < 0 || x >= W) continue;
          const k = (yy * lp.w + xx) * 4;
          const i = y * W + x;
          let a = lp.data[k + 3] / 255;
          if (a <= 0) continue;
          if (mask[i] < 255) {
            let claimed = 0;
            for (const m of others) if (m[i] > claimed) claimed = m[i];
            a *= 1 - (claimed / 255) * (1 - mask[i] / 255);
          }
          const j = i * 4;
          o[j] = o[j] * (1 - a) + lp.data[k] * a;
          o[j + 1] = o[j + 1] * (1 - a) + lp.data[k + 1] * a;
          o[j + 2] = o[j + 2] * (1 - a) + lp.data[k + 2] * a;
        }
      }
      continue;
    }
    if (!finish?.color || !mask || !region) continue;
    const t = hexToRgb(finish.color);
    const ref = region.ref;
    const tl = 0.299 * t[0] + 0.587 * t[1] + 0.114 * t[2];
    const w = tl < 0.18 ? 1 : tl > 0.42 ? 0 : (0.42 - tl) / 0.24;
    /* A near-black surface (shutters, a dark door) carries mostly sensor
       noise in its lightness; turned light, that noise would read as
       speckle, so its shading is kept at reduced strength. */
    let k = ref >= 0.35 ? 1 : Math.max(0.3, ref / 0.35);
    /* Paint covers grain: a painted surface turned lighter than it was —
       dark-stained cabinets to white — keeps the photograph's light and
       shadow but loses most of the old wood's figure. Floors and counters
       keep their pattern; that is the material. */
    if (PAINTED.has(g.material) && tl > ref) k *= Math.max(0.35, Math.sqrt(ref / tl));
    for (let i = 0, j = 0; i < mask.length; i++, j += 4) {
      const a = mask[i];
      if (!a) continue;
      const f = a / 255;
      const l = L[i];
      let q = 1 + (l / ref - 1) * k;
      q = q < 0.3 ? 0.3 : q > 1.5 ? 1.5 : q;
      const d = (l - ref) * 0.85;
      const r = t[0] * q * (1 - w) + (t[0] + d) * w;
      const gg = t[1] * q * (1 - w) + (t[1] + d) * w;
      const bb = t[2] * q * (1 - w) + (t[2] + d) * w;
      o[j] = b[j] * (1 - f) + clamp01(r) * 255 * f;
      o[j + 1] = b[j + 1] * (1 - f) + clamp01(gg) * 255 * f;
      o[j + 2] = b[j + 2] * (1 - f) + clamp01(bb) * 255 * f;
    }
  }
  return o;
}

/** Each surface in plain words: the question, a line saying what it is, and its name on the summary. */
const ASK: Record<Material, { title: string; help?: string; name: string }> = {
  siding: { title: "Pick the siding color", help: "The main color of the outside.", name: "Siding" },
  accent: {
    title: "Pick the second siding color",
    help: "Two-tone homes have a second color on some panels.",
    name: "Second siding color",
  },
  trim: { title: "Pick the trim color", help: "The edging around the windows, doors and roof.", name: "Trim" },
  shutters: { title: "Pick the shutter color", help: "The panels beside the windows.", name: "Shutters" },
  door: { title: "Pick the front door color", name: "Front door" },
  roof: { title: "Pick the roof color", name: "Roof" },
  skirting: { title: "Pick the skirting color", help: "The panels that close in the bottom of the home.", name: "Skirting" },
  cabinets: { title: "Pick the kitchen cabinets", name: "Kitchen cabinets" },
  island: { title: "Pick the island color", help: "The cabinets in the middle of the kitchen.", name: "Island" },
  counters: { title: "Pick the kitchen countertop", name: "Kitchen countertop" },
  vanity: { title: "Pick the bathroom cabinets", name: "Bathroom cabinets" },
  vanitytop: { title: "Pick the bathroom countertop", name: "Bathroom countertop" },
  bathwalls: { title: "Pick the bathroom wall color", name: "Bathroom walls" },
  flooring: { title: "Pick the floor", name: "Floor" },
  walls: { title: "Pick the wall color", name: "Walls" },
};

/** One screen of the designer. */
type Screen =
  | { kind: "design"; id: string; group: MaterialGroup }
  | { kind: "option"; id: string; option: OptionGroup }
  | { kind: "review"; id: string }
  | { kind: "question"; id: string; q: Question }
  | { kind: "contact"; id: string };

const TITLE = "font-display text-[1.5rem] leading-[1.15] text-ink lg:text-[2rem]";
const HELP = "mt-1.5 font-sans text-[0.9375rem] leading-snug text-muted";

export function HomeCustomizer({
  slug,
  name,
  photos,
  groups,
  options,
  basePrice,
}: {
  slug: string;
  name: string;
  photos: CustomizerPhotos;
  groups: MaterialGroup[];
  /** Factory and dealer options for this plan, from `optionGroupsFor`. */
  options: OptionGroup[];
  basePrice?: number;
}) {
  const photoKeys = useMemo(() => Object.keys(photos), [photos]);
  const [active, setActive] = useState(photoKeys[0]);
  const [picks, setPicks] = useState<Partial<Record<Material, string>>>({});
  const [optPicks, setOptPicks] = useState<OptionPicks>(() => defaultPicks(options));
  const buildKey = JSON.stringify(picks);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevRef = useRef<HTMLCanvasElement>(null);
  const spotRef = useRef<HTMLCanvasElement>(null);
  const lastKey = useRef("");
  const painted = useRef<{ key: string; data: Uint8ClampedArray } | null>(null);
  const frame = useRef<ImageData | null>(null);
  const cache = useRef<Record<string, Promise<Loaded>>>({});

  /* The surfaces asked about, in the order a buyer walks the house. A
     surface with nothing to choose between is not asked. */
  const designGroups = useMemo(
    () =>
      DESIGN_STEPS.flatMap((s) =>
        s.materials.flatMap((m) => groups.filter((g) => g.material === m && g.finishes.length > 1)),
      ),
    [groups],
  );
  /* An option a finish already decides (Charcoal is carpet; Hickory is
     linoleum) is not asked twice: it follows the finish. */
  const coveredOptions = useMemo(
    () =>
      new Set(
        options
          .filter((o) =>
            o.choices.every(
              (c) => c.standard || groups.some((g) => g.finishes.some((f) => f.implies === `${o.id}:${c.id}`)),
            ),
          )
          .map((o) => o.id),
      ),
    [options, groups],
  );
  const openOptions = useMemo(() => options.filter((o) => !coveredOptions.has(o.id)), [options, coveredOptions]);

  /** Options made to agree with the finishes: the covered ones follow what is picked. */
  const settle = useCallback(
    (p: Partial<Record<Material, string>>, base: OptionPicks) => {
      const start: OptionPicks = { ...base };
      const std = defaultPicks(options);
      for (const id of coveredOptions) start[id] = std[id] ?? [];
      const implied = groups.map((g) => g.finishes.find((f) => f.id === p[g.material])?.implies);
      return withImplied(options, start, implied);
    },
    [options, coveredOptions, groups],
  );

  const storageKey = `customizer:${slug}`;
  /* Restore a build once on mount: a shared link (`?build=cabinets:navy,…`)
     wins over the visitor's own last build, which is a convenience only. */
  useEffect(() => {
    let saved: Record<string, string> | null = null;
    try {
      const code = new URL(window.location.href).searchParams.get("build");
      if (code)
        saved = Object.fromEntries(
          code.split(",").map((pair) => pair.split(":") as [string, string]),
        );
    } catch {
      /* no usable link */
    }
    if (!saved) {
      try {
        saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      } catch {
        /* private window or blocked storage: start from the photographs */
      }
    }
    const valid: Partial<Record<Material, string>> = {};
    if (saved && typeof saved === "object")
      for (const g of groups) {
        const id = saved[g.material];
        if (g.finishes.some((f) => f.id === id)) valid[g.material] = id;
      }
    /* The same rules as a pick made here: packages whole, and the options
       made to agree with the finishes (a Charcoal floor is carpet). */
    const kept = keepPackages(groups, valid).picks;
    let opts = defaultPicks(options);
    try {
      opts = decodeOptions(new URL(window.location.href).searchParams.get("opts"), options);
    } catch {
      /* no usable link */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a saved build once on mount
    setPicks(kept);
    setOptPicks(settle(kept, opts).picks);
  }, [storageKey, groups, options, settle]);

  const load = useCallback(
    (key: string) => {
      if (!cache.current[key]) {
        const p = photos[key];
        cache.current[key] = (async () => {
          const img = await loadImage(p.src);
          const base = readPixels(img);
          const n = img.naturalWidth * img.naturalHeight;
          const lum = new Float32Array(n);
          for (let i = 0, j = 0; i < n; i++, j += 4)
            lum[i] = (0.299 * base[j] + 0.587 * base[j + 1] + 0.114 * base[j + 2]) / 255;
          const masks: Loaded["masks"] = {};
          await Promise.all(
            (Object.entries(p.regions) as [Material, { mask: string }][]).map(async ([m, r]) => {
              const d = readPixels(await loadImage(r.mask));
              const a = new Uint8Array(n);
              for (let i = 0, j = 0; i < n; i++, j += 4) a[i] = d[j];
              masks[m] = a;
            }),
          );
          return { base, lum, masks, w: img.naturalWidth, h: img.naturalHeight };
        })();
        cache.current[key].catch(() => delete cache.current[key]);
      }
      return cache.current[key];
    },
    [photos],
  );

  /* Warm the other photographs after the first one is on screen. */
  useEffect(() => {
    const t = window.setTimeout(() => photoKeys.forEach((k) => load(k).catch(() => {})), 800);
    return () => window.clearTimeout(t);
  }, [photoKeys, load]);

  const [answers, setAnswers] = useState<Answers>({});
  const [toast, setToast] = useState<string | null>(null);
  /* The photograph as it was taken, in place of the buyer's colours. */
  const [original, setOriginal] = useState(false);
  /* The full-screen viewer: a still of the photo as built, to pinch and pan. */
  const [viewer, setViewer] = useState<string | null>(null);
  /* Bumped to light the surface up on the photo again. */
  const [spotTick, setSpotTick] = useState(0);
  /* In-store mode (`?mode=store`): a tablet on the lot. No exits to the
     rest of the site, a salesperson field, and a reset for the next buyer. */
  const [storeMode, setStoreMode] = useState(false);
  const [state, action, pending] = useActionState(sendBuild, EMPTY_BUILD_STATE);
  const sent = state.status === "ok";

  /* Where the buyer came from — the ad, the campaign — kept for the lead.
     First touch wins for the session, so a reload does not lose it. */
  const [attribution, setAttribution] = useState<Record<string, string>>({});
  const startedAt = useRef<number>(0);
  useEffect(() => {
    startedAt.current = Date.now();
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
    let saved: Record<string, string> = {};
    try {
      saved = JSON.parse(sessionStorage.getItem("cz:attribution") ?? "{}");
    } catch {
      /* storage blocked */
    }
    if (!Object.keys(saved).length) {
      const q = new URL(window.location.href).searchParams;
      for (const k of keys) {
        const v = q.get(k);
        if (v) saved[k] = v.slice(0, 300);
      }
      saved.landing = window.location.pathname;
      try {
        sessionStorage.setItem("cz:attribution", JSON.stringify(saved));
      } catch {
        /* storage blocked */
      }
    }
    let a: Answers = {};
    try {
      a = JSON.parse(localStorage.getItem("cz:answers") ?? "{}");
    } catch {
      /* storage blocked */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once on mount from the browser
    setAttribution(saved);
    setAnswers(a && typeof a === "object" ? a : {});
    setStoreMode(new URL(window.location.href).searchParams.get("mode") === "store");
  }, []);

  /* ── The screens ──────────────────────────────────────────────────
     One surface per screen, then any option no finish decides, then the
     whole home, then one question per screen, then a name and number. */
  const screens: Screen[] = useMemo(
    () => [
      ...designGroups.map((g): Screen => ({ kind: "design", id: `d:${g.material}`, group: g })),
      ...openOptions.map((o): Screen => ({ kind: "option", id: `o:${o.id}`, option: o })),
      { kind: "review", id: "review" },
      ...questionsFor(answers).map((q): Screen => ({ kind: "question", id: `q:${q.id}`, q })),
      { kind: "contact", id: "contact" },
    ],
    [designGroups, openOptions, answers],
  );
  const [idx, setIdx] = useState(0);
  const [reached, setReached] = useState(0);
  const at = Math.min(idx, screens.length - 1);
  const screen = screens[at];
  const latest = useRef({ screens, idx: at });
  useEffect(() => {
    latest.current = { screens, idx: at };
  });

  /* The renders for the surface in hand and the next one, fetched while the buyer looks, so a tap lands at once. */
  const focus = screen.kind === "design" ? screen.group.material : undefined;
  const nextFocus = screens[at + 1]?.kind === "design" ? (screens[at + 1] as { group: MaterialGroup }).group.material : undefined;
  useEffect(() => {
    const t = window.setTimeout(() => {
      for (const m of [focus, nextFocus]) {
        if (!m) continue;
        for (const p of Object.values(photos)) {
          for (const l of Object.values(p.regions[m]?.layers ?? {})) fetch(l.src).catch(() => {});
        }
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [focus, nextFocus, photos]);

  /**
   * The build as one picture the buyer keeps: every room with their
   * finishes, what they picked, and who to call. Shared with the link, or
   * saved where sharing a file is not supported.
   */
  async function makeBuildImage(): Promise<File | null> {
    try {
      const shots = await Promise.all(
        photoKeys.map(async (k) => {
          const [P, layers] = await Promise.all([load(k), layersFor(photos[k].regions, picks)]);
          const c = document.createElement("canvas");
          c.width = P.w;
          c.height = P.h;
          const ctx = c.getContext("2d")!;
          const img = ctx.createImageData(P.w, P.h);
          img.data.set(paintBuild(P, photos[k].regions, groups, picks, layers));
          ctx.putImageData(img, 0, 0);
          return { c, caption: photos[k].caption };
        }),
      );
      const W = 1080;
      const pad = 48;
      const lines = changed.map((g) => `${ASK[g.material].name}: ${finishOf(g).label}`);
      const picked = chosenOptions(openOptions, optPicks).map((x) => x.choice.label);
      const inner = W - pad * 2;
      const rooms = shots.map((s) => ({ ...s, h: Math.round((s.c.height * inner) / s.c.width) }));
      const listH = (lines.length + (picked.length ? 1 : 0)) * 38 + (lines.length || picked.length ? 24 : 0);
      const H = pad + 120 + rooms.reduce((a, r) => a + r.h + 44, 0) + listH + 110;
      const out = document.createElement("canvas");
      out.width = W;
      out.height = H;
      const x = out.getContext("2d")!;
      x.fillStyle = "#ffffff";
      x.fillRect(0, 0, W, H);
      const sans = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
      x.fillStyle = "#0f172a";
      x.font = `700 54px ${sans}`;
      x.fillText(`My ${name}`, pad, pad + 52);
      x.fillStyle = "#64748b";
      x.font = `400 26px ${sans}`;
      x.fillText(`Designed on its real photos at ${site.name}`, pad, pad + 96);
      let y = pad + 128;
      for (const r of rooms) {
        x.drawImage(r.c, pad, y, inner, r.h);
        x.fillStyle = "#334155";
        x.font = `600 24px ${sans}`;
        x.fillText(r.caption, pad, y + r.h + 32);
        y += r.h + 44;
      }
      x.font = `400 28px ${sans}`;
      x.fillStyle = "#0f172a";
      for (const l of lines) {
        y += 38;
        x.fillText(l, pad, y);
      }
      if (picked.length) {
        y += 38;
        x.fillText(`Options: ${picked.join(", ")}`, pad, y);
      }
      y += 64;
      x.fillStyle = "#0f172a";
      x.font = `700 30px ${sans}`;
      x.fillText(`${site.name}, ${site.phone}`, pad, y);
      x.fillStyle = "#64748b";
      x.font = `400 22px ${sans}`;
      x.fillText("Colors are previews on this home's photos; the sales center confirms them with your price.", pad, y + 34);
      const blob = await new Promise<Blob | null>((res) => out.toBlob(res, "image/jpeg", 0.9));
      return blob ? new File([blob], `my-${slug}.jpg`, { type: "image/jpeg" }) : null;
    } catch {
      return null;
    }
  }

  function openViewer() {
    try {
      setViewer(canvasRef.current?.toDataURL("image/jpeg", 0.92) ?? null);
    } catch {
      /* a tainted canvas: no viewer */
    }
  }

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  function chooseOption(groupId: string, choiceId: string) {
    const r = applyOption(options, optPicks, groupId, choiceId);
    setOptPicks(r.picks);
    /* A finish that only comes with an option goes back to the photo's own
       when that option is turned off. */
    const holds = (pair?: string) => {
      if (!pair) return true;
      const [gid, cid] = pair.split(":");
      return !options.some((o) => o.id === gid) || (r.picks[gid] ?? []).includes(cid);
    };
    const orphaned = groups.filter((g) => !holds(g.finishes.find((f) => f.id === picks[g.material])?.implies));
    if (orphaned.length) {
      const next = { ...picks };
      const said: string[] = [];
      for (const g of orphaned) {
        const fits = g.finishes.filter((f) => f.implies && holds(f.implies));
        if (fits.length === 1) {
          next[g.material] = fits[0].id;
          said.push(`${ASK[g.material].name} changed to ${fits[0].label} to match.`);
        } else {
          delete next[g.material];
          said.push(`${ASK[g.material].name} changed back to the original to match.`);
        }
      }
      setPicks(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage is a convenience */
      }
      setToast(said.join(" "));
    } else if (r.note) setToast(r.note);
  }

  /* Options ride in the link beside the colors. */
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const code = encodeOptions(optPicks, options);
      if (code) url.searchParams.set("opts", code);
      else url.searchParams.delete("opts");
      window.history.replaceState(window.history.state, "", url);
    } catch {
      /* the link just stays plain */
    }
  }, [optPicks, options]);

  function answer(q: Question, id: string) {
    setAnswers((prev) => {
      let next: Answers;
      if (q.text) {
        next = { ...prev };
        if (id.trim()) next[q.id] = id.slice(0, q.text.max);
        else delete next[q.id];
      } else if (q.multi) {
        const cur = Array.isArray(prev[q.id]) ? (prev[q.id] as string[]) : [];
        const on = cur.includes(id);
        let list = on ? cur.filter((x) => x !== id) : [...cur, id];
        /* "Not sure" and a named job do not go together. */
        list = id === "unsure" && !on ? ["unsure"] : list.filter((x) => x !== "unsure" || id === "unsure");
        next = { ...prev, [q.id]: list };
      } else {
        next = { ...prev, [q.id]: id };
      }
      if (!asksCounty(next)) {
        delete next.county;
        delete next.town;
      }
      try {
        localStorage.setItem("cz:answers", JSON.stringify(next));
      } catch {
        /* storage is a convenience */
      }
      return next;
    });
    /* One tap answers a one-answer question: on to the next, after a beat
       so the buyer sees their answer land. */
    if (!q.text && !q.multi) {
      const from = latest.current.idx;
      window.setTimeout(() => {
        if (latest.current.idx === from) go(from + 1);
      }, 280);
    }
  }

  const missing = missingAnswers(answers);

  useEffect(() => {
    let cancelled = false;
    const regions = photos[active].regions;
    Promise.all([load(active), layersFor(regions, picks)])
      .then(([P, layers]) => {
        if (cancelled || !canvasRef.current) return;
        const cv = canvasRef.current;
        const key = `${active}|${buildKey}|${original}`;
        /* Keep the frame on screen as it was, to fade from. */
        const prev = prevRef.current;
        const fade = lastKey.current !== key && lastKey.current !== "";
        if (prev && fade) {
          if (prev.width !== cv.width || prev.height !== cv.height) {
            prev.width = cv.width;
            prev.height = cv.height;
          }
          prev.getContext("2d")!.drawImage(cv, 0, 0);
        }
        lastKey.current = key;
        if (cv.width !== P.w || cv.height !== P.h) {
          cv.width = P.w;
          cv.height = P.h;
        }
        const ctx = cv.getContext("2d")!;
        const built = `${active}|${buildKey}`;
        if (painted.current?.key !== built) painted.current = { key: built, data: paintBuild(P, regions, groups, picks, layers) };
        let out = frame.current;
        if (!out || out.width !== P.w || out.height !== P.h) out = frame.current = ctx.createImageData(P.w, P.h);
        out.data.set(original ? P.base : painted.current.data);
        ctx.putImageData(out, 0, 0);
        /* The old frame fades out over the new one. An animation, not a
           style change: two opacity writes in one frame never transition. */
        if (prev && fade) prev.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: "ease-out" });
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [active, picks, original, photos, groups, load, buildKey]);

  /* The surface being asked about, lit up on the photo for a moment: the
     rest of the photo dims, so "trim" or "second siding color" needs no
     explaining. On arriving at a question, on a new photo, and on "Show me". */
  const ready = status === "ready";
  useEffect(() => {
    if (!focus || !ready) return;
    let gone = false;
    let anim: Animation | undefined;
    load(active)
      .then((P) => {
        const mask = P.masks[focus];
        const cv = spotRef.current;
        if (gone || !mask || !cv) return;
        if (cv.width !== P.w || cv.height !== P.h) {
          cv.width = P.w;
          cv.height = P.h;
        }
        const ctx = cv.getContext("2d")!;
        const img = ctx.createImageData(P.w, P.h);
        const d = img.data;
        for (let i = 0, j = 0; i < mask.length; i++, j += 4) {
          d[j] = d[j + 1] = d[j + 2] = 6;
          d[j + 3] = 165 - ((165 * mask[i]) / 255) | 0;
        }
        ctx.putImageData(img, 0, 0);
        anim = cv.animate?.(
          [
            { opacity: 0 },
            { opacity: 1, offset: 0.18 },
            { opacity: 1, offset: 0.7 },
            { opacity: 0 },
          ],
          { duration: 2200, easing: "ease-in-out" },
        );
      })
      .catch(() => {});
    return () => {
      gone = true;
      anim?.cancel();
    };
  }, [focus, active, ready, spotTick, load]);

  /* The build lives in the link, so "send this to my wife" sends the build. */
  useEffect(() => {
    const code = Object.entries(picks)
      .filter(([, id]) => id && id !== "as-built")
      .map(([m, id]) => `${m}:${id}`)
      .join(",");
    try {
      const url = new URL(window.location.href);
      if (code) url.searchParams.set("build", code);
      else url.searchParams.delete("build");
      window.history.replaceState(window.history.state, "", url);
    } catch {
      /* an embedded or sandboxed view: the link just stays plain */
    }
  }, [picks]);

  /* The phone studio covers the page; the page behind it should not scroll.
     In the store it covers the page at every width. */
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 1023px)");
    const root = document.documentElement;
    const apply = () => (root.style.overflow = phone.matches || storeMode ? "hidden" : "");
    apply();
    phone.addEventListener("change", apply);
    return () => {
      phone.removeEventListener("change", apply);
      root.style.overflow = "";
    };
  }, [storeMode]);

  /* Switching photographs shows the loading note until the new one is drawn. */
  function show(key: string) {
    if (key === active) return;
    setStatus("loading");
    setActive(key);
  }

  /** The photograph that shows a material: this one if it can, else the first that does. */
  function photoFor(material: Material) {
    if (photos[active].regions[material]) return active;
    return photoKeys.find((k) => photos[k].regions[material]) ?? active;
  }

  const panelRef = useRef<HTMLDivElement>(null);
  function go(i: number) {
    const list = latest.current.screens;
    const next = Math.max(0, Math.min(list.length - 1, i));
    const s = list[next];
    setIdx(next);
    setReached((r) => Math.max(r, next));
    setOriginal(false);
    if (s.kind === "design") show(photoFor(s.group.material));
    else if (s.kind === "review") show(photoKeys[0]);
    panelRef.current?.scrollTo({ top: 0 });
    /* On a wide screen the designer is part of the page: bring its top back into view. */
    const top = rootRef.current?.getBoundingClientRect().top ?? 0;
    if (window.matchMedia("(min-width: 1024px)").matches && !storeMode && top < 0)
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function choose(material: Material, id: string) {
    const grp = groups.find((g) => g.material === material);
    const finish = grp?.finishes.find((f) => f.id === id);
    if (!grp || !finish) return;
    let note: string | null = null;
    /* A plant package stays whole: Promotional dark cabinets come with
       Calacatta Lincoln counters, and a different counter undoes the package. */
    const kept = keepPackages(groups, { ...picks, [material]: id }, material);
    const nameOf = (m: Material) => ASK[m].name.toLowerCase();
    if (kept.paired) {
      const partner = groups.find((g) => g.material === kept.paired)?.finishes.find((f) => f.id === kept.picks[kept.paired!]);
      note = `${finish.label} comes with the ${partner?.label} ${nameOf(kept.paired)}, so both are set.`;
    } else if (kept.dropped.length) {
      const was = kept.dropped.map((m) => groups.find((g) => g.material === m)?.finishes.find((f) => f.id === picks[m])?.label);
      note = `The ${kept.dropped.map(nameOf).join(" and ")} went back to the original. ${was.join(" and ")} only comes as a set.`;
    }
    const settled = settle(kept.picks, optPicks);
    setOptPicks(settled.picks);
    if (!note && settled.added.length && finish.implies && !coveredOptions.has(finish.implies.split(":")[0]))
      note = `Added to your options: ${settled.added.join(", ")}.`;
    if (note) setToast(note);
    setPicks(kept.picks);
    try {
      localStorage.setItem(storageKey, JSON.stringify(kept.picks));
    } catch {
      /* storage is a convenience */
    }
    show(photoFor(material));
    try {
      navigator.vibrate?.(8);
    } catch {
      /* no haptics here */
    }
  }

  /** In the store: wipe this buyer's build and hand the tablet to the next one. */
  function nextCustomer() {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem("cz:answers");
      sessionStorage.removeItem("cz:attribution");
    } catch {
      /* storage blocked: the reload still starts clean */
    }
    window.location.assign(`/homes/${slug}/customize?mode=store`);
  }

  const finishOf = (g: MaterialGroup) => g.finishes.find((f) => f.id === picks[g.material]) ?? g.finishes[0];
  /* The plant's own swatch where there is one; otherwise the paint colour. A
     factory finish with no published colour is drawn hatched. */
  const swatchOf = (g: MaterialGroup, f: Finish): React.CSSProperties => {
    if (f.swatch)
      return { backgroundColor: f.color ?? "#d8d4cc", backgroundImage: `url(${f.swatch})`, backgroundSize: "cover", backgroundPosition: "center" };
    const color =
      f.color ?? (f.id === "as-built" ? Object.values(photos).find((p) => p.regions[g.material])?.regions[g.material]?.asBuilt : undefined);
    if (!color) return { backgroundColor: "#d8d4cc", backgroundImage: NO_PREVIEW };
    return { backgroundColor: color };
  };
  const changed = groups.filter((g) => finishOf(g).id !== "as-built");
  const activePhoto = photos[active];

  /* The photos this screen can show: for a surface, the ones it is in. */
  const roomKeys = focus ? photoKeys.filter((k) => photos[k].regions[focus]) : photoKeys;
  const roomAt = Math.max(0, roomKeys.indexOf(active));
  const flip = (d: number) => show(roomKeys[(roomAt + d + roomKeys.length) % roomKeys.length]);
  const group = screen.kind === "design" ? screen.group : undefined;
  const current = group ? finishOf(group) : undefined;
  /* A pick the photo cannot show (carpet over a plank floor, a finish with no published colour) is said so on the photo. */
  const unseen =
    group && current && current.id !== "as-built" && !current.color && !activePhoto.regions[group.material]?.layers?.[current.id]
      ? current.product === "Carpet"
        ? "Carpet can't be shown on this photo. It's saved with your design."
        : `${current.label} can't be shown on the photo yet. It's saved with your design.`
      : null;

  const totals = optionTotals(options, optPicks);
  /* Finishes the plant prices (White Smart Panel, +$995) count toward the
     total like options, once per finish: White siding and White accent are
     one White exterior. */
  const finishUpgrades = [...new Map(groups.map((g) => finishOf(g)).filter((f) => f.price).map((f) => [f.id, f.price!])).values()].reduce(
    (a, b) => a + b,
    0,
  );
  const priceLine =
    PRICE_MODE === "none" || basePrice === undefined
      ? null
      : PRICE_MODE === "monthly"
        ? `${money(monthlyPayment((basePrice + totals.upgrades + finishUpgrades) * (1 - ESTIMATE.downPct / 100), ESTIMATE.rate, ESTIMATE.years))} a month`
        : money(basePrice + totals.upgrades + finishUpgrades);
  const buildCode = JSON.stringify([picks, optPicks]);

  /* The build picture is made ahead, once the buyer is looking at the
     whole home, so Share hands a phone its file straight from the tap:
     Safari refuses a share that starts after the work of drawing it. */
  const picture = useRef<{ key: string; file: File | null }>({ key: "", file: null });
  const makePicture = useRef(makeBuildImage);
  useEffect(() => {
    makePicture.current = makeBuildImage;
  });
  const pastDesign = screen.kind !== "design" && screen.kind !== "option";
  useEffect(() => {
    if (!ready || storeMode || !pastDesign) return;
    let gone = false;
    const t = window.setTimeout(() => {
      makePicture.current().then((file) => {
        if (!gone && file) picture.current = { key: buildCode, file };
      });
    }, 700);
    return () => {
      gone = true;
      window.clearTimeout(t);
    };
  }, [buildCode, ready, storeMode, pastDesign]);
  const readyPicture = () => (picture.current.key === buildCode ? picture.current.file : null);

  /* How far the buyer got, for the lead score: the rooms whose every question they reached. */
  const rooms = DESIGN_STEPS.map((s) => designGroups.filter((g) => s.materials.includes(g.material))).filter((r) => r.length);
  const roomsDone = rooms.filter((r) =>
    r.every((g) => screens.findIndex((x) => x.id === `d:${g.material}`) <= reached),
  ).length;

  const q = screen.kind === "question" ? screen.q : undefined;
  const qVal = q ? answers[q.id] : undefined;
  const answered = q ? (Array.isArray(qVal) ? qVal.length > 0 : Boolean(qVal)) : true;
  const primary: { label: string; disabled?: boolean; onClick?: () => void; submit?: boolean } =
    screen.kind === "contact"
      ? { label: pending ? "Sending…" : "Send my design", submit: true, disabled: pending }
      : screen.kind === "review"
        ? { label: "Looks good", onClick: () => go(at + 1) }
        : q && !q.required && !answered
          ? { label: "Skip", onClick: () => go(at + 1) }
          : answered
            ? { label: "Next", onClick: () => go(at + 1) }
            : { label: q?.multi ? "Pick at least one" : "Pick an answer", disabled: true };
  const progress = sent ? 1 : (at + 1) / screens.length;

  /* The photo is the point while picking; afterwards it steps back. */
  const big = screen.kind === "design" || screen.kind === "review";

  return (
    /* On a phone the designer is a full-screen studio: the photo, the one
       question, and Back and Next along the bottom. On a wide screen it is
       part of the page: the photo beside the question. */
    <div
      ref={rootRef}
      className={cx(
        "fixed inset-0 z-[55] flex flex-col bg-paper lg:grid lg:scroll-mt-40 lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-10",
        storeMode ? "lg:overflow-y-auto lg:p-8" : "lg:static lg:z-auto lg:bg-transparent",
      )}
    >
      {/* ------------------------- PHONE TOP BAR ------------------------- */}
      <div className="shrink-0 bg-paper pt-[env(safe-area-inset-top)] lg:hidden">
        <div className="flex h-12 items-center gap-1 px-1.5">
          {storeMode ? (
            <span aria-hidden className="size-10 shrink-0" />
          ) : (
            <Link href={`/homes/${slug}`} aria-label={`Close and go back to the ${name}`} className="grid size-10 shrink-0 place-items-center text-ink">
              <Icon.Close className="size-5" />
            </Link>
          )}
          <p className="min-w-0 flex-1 truncate text-center font-sans text-[0.9375rem] font-bold text-ink">
            {sent ? `Your ${name}` : `Design your ${name}`}
          </p>
          {storeMode ? (
            <button
              type="button"
              onClick={nextCustomer}
              className="h-10 shrink-0 rounded-full px-3 font-sans text-[0.8125rem] font-bold text-ember"
            >
              Start over
            </button>
          ) : (
            <span aria-hidden className="size-10 shrink-0" />
          )}
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* ------------------------------ PHOTO ------------------------------
          Everything drawn over the photo uses fixed colours, not theme
          tokens: it sits on a photograph in either theme. */}
      <div className={cx("relative z-10 min-w-0 shrink-0 bg-[#10151c] lg:sticky lg:overflow-hidden lg:rounded-lg", storeMode ? "lg:top-0" : "lg:top-32")}>
        <PhotoStage
          onFlip={roomKeys.length > 1 ? flip : undefined}
          onTap={() => ready && openViewer()}
        >
          <canvas
            ref={canvasRef}
            width={activePhoto.width}
            height={activePhoto.height}
            role="img"
            aria-label={`${name}, ${activePhoto.caption.toLowerCase()}, ${original ? "as photographed" : "with your colors"}`}
            className={cx(
              "block h-auto w-full max-w-full cursor-zoom-in object-cover transition-[max-height] duration-300 lg:max-h-none",
              big && !sent ? "max-h-[38svh]" : "max-h-[24svh]",
            )}
            style={{ aspectRatio: `${activePhoto.width} / ${activePhoto.height}` }}
          />
          {/* The last frame, faded out over the new one so a pick dissolves in rather than snapping. */}
          <canvas ref={prevRef} aria-hidden className="pointer-events-none absolute inset-0 size-full object-cover" style={{ opacity: 0 }} />
          {/* The surface in question, lit up: everything else dimmed for a moment. */}
          <canvas ref={spotRef} aria-hidden className="pointer-events-none absolute inset-0 size-full object-cover" style={{ opacity: 0 }} />
        </PhotoStage>

        {status !== "ready" ? (
          <Badge className="left-3 top-3">{status === "error" ? "This photo didn't load. Refresh the page to try again." : "Loading the photo…"}</Badge>
        ) : original ? (
          <Badge className="left-3 top-3">The original photo</Badge>
        ) : (
          unseen && <Badge className="left-3 top-3 max-w-[62%]">{unseen}</Badge>
        )}

        {big && !sent && changed.length > 0 && (
          <button
            type="button"
            aria-pressed={original}
            onClick={() => setOriginal((o) => !o)}
            className={cx(
              "absolute right-3 top-3 rounded-full px-3.5 py-2 font-sans text-[0.8125rem] font-bold shadow-sm transition-colors",
              original ? "bg-white text-[#0f172a]" : "bg-black/65 text-white hover:bg-black/80",
            )}
          >
            {original ? "Show my colors" : "See the original"}
          </button>
        )}

        {roomKeys.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => flip(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#0f172a] shadow-md transition-colors hover:bg-white"
            >
              <Icon.Chevron className="size-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => flip(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#0f172a] shadow-md transition-colors hover:bg-white"
            >
              <Icon.Chevron className="size-5" />
            </button>
          </>
        )}

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          {roomKeys.length > 1 ? (
            <span className="rounded-full bg-black/65 px-3 py-1.5 font-sans text-[0.8125rem] font-bold text-white">
              {activePhoto.caption}
              <span className="ml-1.5 font-normal text-white/75">
                {roomAt + 1} of {roomKeys.length}
              </span>
            </span>
          ) : (
            <span />
          )}
          {/* Not the dealer's own photograph (the plant's photos of the same model): said so, on the photo. */}
          {activePhoto.credit && (
            <span className="rounded bg-black/45 px-2 py-0.5 font-sans text-[0.6875rem] text-white/90">Photo: {activePhoto.credit}</span>
          )}
        </div>
      </div>

      {/* ----------------------------- PANEL ----------------------------- */}
      <div
        ref={panelRef}
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-6 pt-5 lg:flex-none lg:overflow-visible lg:p-0 lg:pt-1"
      >
        {!sent && (
          <div className="mb-7 hidden items-center gap-4 lg:flex">
            <Progress value={progress} className="h-2 flex-1 rounded-full" />
            {storeMode && (
              <button type="button" onClick={nextCustomer} className="font-sans text-[0.875rem] font-bold text-ember">
                Start over
              </button>
            )}
          </div>
        )}

        {sent ? (
          <Thanks
            slug={slug}
            name={name}
            message={state.message}
            storeMode={storeMode}
            needsLender={pages.prequalify && (answers.pay === "need-financing" || answers.pay === "unsure")}
            onNextCustomer={nextCustomer}
            makeImage={makeBuildImage}
            picture={readyPicture}
          />
        ) : screen.kind === "design" && group && current ? (
          <section aria-labelledby="cz-q">
            <h2 id="cz-q" className={TITLE}>
              {ASK[group.material].title}
            </h2>
            <p className={HELP}>
              {ASK[group.material].help ?? group.factory?.note ?? group.note}{" "}
              <button
                type="button"
                onClick={() => setSpotTick((t) => t + 1)}
                className="whitespace-nowrap font-bold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
              >
                Show me where
              </button>
            </p>
            <Swatches group={group} current={current} onChoose={(id) => choose(group.material, id)} swatchOf={swatchOf} />
          </section>
        ) : screen.kind === "option" ? (
          <ChoiceList
            title={`Pick the ${screen.option.label.toLowerCase()}`}
            help={screen.option.note}
            multi={screen.option.multi}
            choices={screen.option.choices.map((c) => ({
              id: c.id,
              label: c.label,
              hint: c.standard ? "Standard" : typeof c.price === "number" && PRICE_MODE !== "none" ? `+${money(c.price)}` : undefined,
            }))}
            isOn={(id) => (optPicks[screen.option.id] ?? []).includes(id)}
            onPick={(id) => chooseOption(screen.option.id, id)}
          />
        ) : screen.kind === "review" ? (
          <Review
            name={name}
            items={designGroups.map((g) => ({
              key: g.material,
              label: ASK[g.material].name,
              value: finishOf(g).id === "as-built" ? "Original" : finishOf(g).label,
              swatch: swatchOf(g, finishOf(g)),
              onChange: () => go(screens.findIndex((s) => s.id === `d:${g.material}`)),
            }))}
            options={chosenOptions(openOptions, optPicks).map((x) => ({
              key: `${x.group.id}:${x.choice.id}`,
              label: x.group.label,
              value: x.choice.label,
              onChange: () => go(screens.findIndex((s) => s.id === `o:${x.group.id}`)),
            }))}
            priceLine={priceLine}
            toQuote={totals.toQuote}
            share={
              storeMode ? null : (
                <ShareBuild
                  title={`My ${name}`}
                  text={`The ${name} with my colors: ${changed.map((g) => `${ASK[g.material].name.toLowerCase()} ${finishOf(g).label}`).join(", ") || "as photographed"}`}
                  picture={readyPicture}
                />
              )
            }
            manyPhotos={photoKeys.length > 1}
          />
        ) : screen.kind === "question" ? (
          q?.text ? (
            <section aria-labelledby="cz-q">
              <h2 id="cz-q" className={TITLE}>
                {q.label}
              </h2>
              {q.help && <p className={HELP}>{q.help}</p>}
              <input
                type="text"
                aria-labelledby="cz-q"
                value={typeof qVal === "string" ? qVal : ""}
                maxLength={q.text.max}
                autoComplete="address-level2"
                placeholder={q.text.placeholder}
                onChange={(e) => answer(q, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go(at + 1)}
                className={cx(INPUT, "mt-5")}
              />
            </section>
          ) : (
            q && (
              <ChoiceList
                title={q.label}
                help={q.multi ? "Pick all that apply." : q.help}
                multi={q.multi}
                choices={q.choices}
                isOn={(id) => (Array.isArray(qVal) ? qVal.includes(id) : qVal === id)}
                onPick={(id) => answer(q, id)}
              />
            )
          )
        ) : (
          <Contact
            slug={slug}
            name={name}
            groups={groups}
            finishOf={finishOf}
            options={options}
            optPicks={optPicks}
            storeMode={storeMode}
            answers={answers}
            missing={missing}
            onFix={(id) => go(screens.findIndex((s) => s.id === `q:${id}`))}
            attribution={attribution}
            engagement={{ stepsDone: roomsDone, stepsTotal: rooms.length, startedAt }}
            state={state}
            action={action}
          />
        )}

        {/* Back and Next, under the question on a wide screen (the phone has them along the bottom). */}
        {!sent && (
          <div className="mt-8 hidden items-center justify-between gap-3 lg:flex">
            {at > 0 ? (
              <button
                type="button"
                onClick={() => go(at - 1)}
                className="inline-flex h-12 items-center gap-2 rounded-button px-2 font-sans text-[0.9375rem] font-bold text-ink hover:bg-surface-2"
              >
                <Icon.Arrow className="size-4 rotate-180" />
                Back
              </button>
            ) : (
              <span />
            )}
            <PrimaryButton key={screen.id} primary={primary} className="h-12 min-w-40 text-[1rem]" />
          </div>
        )}
      </div>

      {/* --------------------------- PHONE BAR --------------------------- */}
      {!sent && (
        <div className="flex shrink-0 gap-3 border-t border-line bg-paper px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
          {at > 0 && (
            <button
              type="button"
              onClick={() => go(at - 1)}
              className={cx(buttonStyles.outline, "h-12 shrink-0 px-5 text-[1rem]")}
            >
              Back
            </button>
          )}
          <PrimaryButton key={screen.id} primary={primary} className="h-12 flex-1 text-[1rem]" />
        </div>
      )}

      {/* What a rule just did. Announced, then gone. */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex justify-center lg:bottom-8">
        {toast && (
          <p className="max-w-md rounded-lg bg-ink px-4 py-3 font-sans text-[0.9375rem] font-bold leading-snug text-paper shadow-lg">
            {toast}
          </p>
        )}
      </div>

      {viewer && (
        <PhotoViewer src={viewer} alt={`${name}, ${activePhoto.caption.toLowerCase()}, with your colors`} onClose={() => setViewer(null)} />
      )}
    </div>
  );
}

function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-label="How far along you are"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className={cx("overflow-hidden bg-line", className)}
    >
      <div className="h-full rounded-[inherit] bg-ember transition-[width] duration-500 ease-out" style={{ width: `${Math.max(4, value * 100)}%` }} />
    </div>
  );
}

/** A note laid over the photograph. */
function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cx(
        "pointer-events-none absolute rounded-md bg-black/70 px-2.5 py-1.5 font-sans text-[0.8125rem] leading-snug text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** The photo's touch surface: a sideways swipe moves between photos, a tap opens it full screen. */
function PhotoStage({
  children,
  onFlip,
  onTap,
}: {
  children: React.ReactNode;
  onFlip?: (d: number) => void;
  onTap: () => void;
}) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  return (
    <div
      className="relative select-none"
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY, id: e.pointerId })}
      onPointerCancel={() => (start.current = null)}
      onPointerUp={(e) => {
        const s = start.current;
        start.current = null;
        if (!s || s.id !== e.pointerId) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) onTap();
        else if (onFlip && Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy)) onFlip(dx < 0 ? 1 : -1);
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  primary,
  className,
}: {
  primary: { label: string; disabled?: boolean; onClick?: () => void; submit?: boolean };
  className?: string;
}) {
  return (
    <button
      type={primary.submit ? "submit" : "button"}
      form={primary.submit ? "cz-form" : undefined}
      onClick={primary.onClick}
      disabled={primary.disabled}
      className={cx(buttonStyles.primary, "px-6 font-bold disabled:opacity-40", className)}
    >
      {primary.label}
    </button>
  );
}

/**
 * The colours for one surface, all on screen at once: big samples with
 * their names, the one picked ringed and ticked. The first is the home as
 * photographed.
 */
function Swatches({
  group,
  current,
  onChoose,
  swatchOf,
}: {
  group: MaterialGroup;
  current: Finish;
  onChoose: (id: string) => void;
  swatchOf: (g: MaterialGroup, f: Finish) => React.CSSProperties;
}) {
  return (
    <div role="radiogroup" aria-labelledby="cz-q" className="mt-5 grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6">
      {group.finishes.map((f) => {
        const on = f.id === current.id;
        const label = f.id === "as-built" ? "Original" : f.label;
        const sub = f.id === "as-built" ? (f.source === "factory" ? f.label : undefined) : f.price ? `+${money(f.price)}` : undefined;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={[label, sub].filter(Boolean).join(", ")}
            onClick={() => onChoose(f.id)}
            className="group flex min-w-0 flex-col text-left"
          >
            <span
              className={cx(
                "relative block aspect-square w-full rounded-lg border transition-shadow",
                on
                  ? "border-transparent shadow-[0_0_0_3px_var(--paper),0_0_0_6px_var(--ink)]"
                  : "border-black/15 group-hover:shadow-[0_0_0_3px_var(--paper),0_0_0_5px_var(--line-strong)] dark:border-white/25",
              )}
              style={swatchOf(group, f)}
            >
              {on && (
                <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-ink text-paper shadow-md">
                  <Icon.Check className="size-3.5" />
                </span>
              )}
            </span>
            <span className={cx("mt-2 block font-sans text-[0.875rem] leading-tight text-ink", on && "font-bold")}>{label}</span>
            {sub && <span className="mt-0.5 block font-sans text-[0.75rem] leading-tight text-muted">{sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** One question, its answers as big buttons. A one-answer question moves on by itself. */
function ChoiceList({
  title,
  help,
  multi,
  choices,
  isOn,
  onPick,
}: {
  title: string;
  help?: string;
  multi?: boolean;
  choices: { id: string; label: string; hint?: string }[];
  isOn: (id: string) => boolean;
  onPick: (id: string) => void;
}) {
  return (
    <section aria-labelledby="cz-q">
      <h2 id="cz-q" className={TITLE}>
        {title}
      </h2>
      {help && <p className={HELP}>{help}</p>}
      <div role={multi ? "group" : "radiogroup"} aria-labelledby="cz-q" className="mt-5 flex flex-col gap-2.5">
        {choices.map((c) => {
          const on = isOn(c.id);
          return (
            <button
              key={c.id}
              type="button"
              role={multi ? "checkbox" : "radio"}
              aria-checked={on}
              onClick={() => onPick(c.id)}
              className={cx(
                "flex min-h-14 w-full items-center gap-3.5 rounded-lg border-2 px-4 py-3 text-left font-sans text-[1rem] transition-colors",
                on ? "border-ember bg-ember/[0.07] font-bold text-ink" : "border-line-strong text-ink hover:border-ink",
              )}
            >
              <span
                aria-hidden
                className={cx(
                  "grid size-6 shrink-0 place-items-center border-2 transition-colors",
                  multi ? "rounded-md" : "rounded-full",
                  on ? "border-ember bg-ember text-on-ember" : "border-line-strong",
                )}
              >
                {on && <Icon.Check className="size-3.5" />}
              </span>
              <span className="min-w-0 flex-1">{c.label}</span>
              {c.hint && <span className="shrink-0 text-[0.8125rem] font-normal text-muted">{c.hint}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** The whole home on one screen: every pick, one tap from being changed, and the price. */
function Review({
  name,
  items,
  options,
  priceLine,
  toQuote,
  share,
  manyPhotos,
}: {
  name: string;
  items: { key: string; label: string; value: string; swatch: React.CSSProperties; onChange: () => void }[];
  options: { key: string; label: string; value: string; onChange: () => void }[];
  priceLine: string | null;
  toQuote: number;
  share: React.ReactNode;
  manyPhotos: boolean;
}) {
  return (
    <section aria-labelledby="cz-q">
      <h2 id="cz-q" className={TITLE}>
        Here&rsquo;s your {name}
      </h2>
      <p className={HELP}>
        {manyPhotos ? "Use the arrows on the photo to see every room. " : ""}Tap any choice to change it.
      </p>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {[...items, ...options.map((o) => ({ ...o, swatch: undefined }))].map((it) => (
          <li key={it.key} className="min-w-0">
            <button
              type="button"
              onClick={it.onChange}
              aria-label={`${it.label}: ${it.value}. Change it`}
              className="flex w-full items-center gap-3 rounded-lg border border-line-strong p-2 text-left transition-colors hover:border-ink"
            >
              {it.swatch ? (
                <span aria-hidden className="size-10 shrink-0 rounded-md border border-black/15 dark:border-white/25" style={it.swatch} />
              ) : (
                <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-md bg-surface-2 text-ink">
                  <Icon.Check className="size-4" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-sans text-[0.8125rem] leading-tight text-muted">{it.label}</span>
                <span className="block truncate font-sans text-[0.9375rem] font-bold leading-snug text-ink">{it.value}</span>
              </span>
              <Icon.Chevron className="mr-1 size-4 shrink-0 text-muted" />
            </button>
          </li>
        ))}
      </ul>
      {priceLine && (
        <p className="mt-5 font-sans text-[1rem] text-ink">
          Price with your choices: <b className="text-[1.25rem]">{priceLine}</b>
          {toQuote > 0 && <span className="mt-1 block text-[0.875rem] text-muted">Your upgrades are priced with your quote.</span>}
        </p>
      )}
      {share && <div className="mt-5">{share}</div>}
    </section>
  );
}

const BAD = "border-[#c81e1e] dark:border-[#f98080]";
const INPUT =
  "block w-full rounded-lg border-2 border-line-strong bg-paper px-4 py-3.5 font-sans text-[1.0625rem] text-ink placeholder:text-muted transition-colors focus:border-ink focus:outline-none";

/** Name and number, and the permission to call. Everything else about the build rides along hidden. */
function Contact({
  slug,
  name,
  groups,
  finishOf,
  options,
  optPicks,
  storeMode,
  answers,
  missing,
  onFix,
  attribution,
  engagement,
  state,
  action,
}: {
  slug: string;
  name: string;
  groups: MaterialGroup[];
  finishOf: (g: MaterialGroup) => { id: string };
  options: OptionGroup[];
  optPicks: OptionPicks;
  storeMode: boolean;
  answers: Answers;
  missing: Question[];
  onFix: (id: Question["id"]) => void;
  attribution: Record<string, string>;
  engagement: { stepsDone: number; stepsTotal: number; startedAt: React.RefObject<number> };
  state: BuildState;
  action: (fd: FormData) => void;
}) {
  const errors = state.fieldErrors ?? {};
  const was = state.values ?? {};
  const secondsRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  /* A rejected send puts the cursor in the first field that needs fixing. */
  useEffect(() => {
    if (state.status !== "error") return;
    const bad = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (bad ?? formRef.current?.querySelector<HTMLElement>('[role="alert"]'))?.scrollIntoView({ behavior: "smooth", block: "center" });
    bad?.focus({ preventScroll: true });
  }, [state]);
  const err = (m?: string) => m && <span className="mt-1.5 block font-sans text-[0.875rem] font-bold text-[#c81e1e] dark:text-[#f98080]">{m}</span>;

  return (
    <form
      ref={formRef}
      id="cz-form"
      action={action}
      noValidate
      onSubmit={() => {
        /* Time spent building, filled in at the moment of sending. */
        const t0 = engagement.startedAt.current;
        if (secondsRef.current && t0) secondsRef.current.value = String(Math.round((Date.now() - t0) / 1000));
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <h2 className={TITLE}>Who should we call with your price?</h2>
        <p className={HELP}>
          {site.name} gets your {name} and calls you back.
        </p>
      </div>

      {missing.length > 0 && (
        <button
          type="button"
          onClick={() => onFix(missing[0].id)}
          className="rounded-lg border-2 border-ember px-4 py-3 text-left font-sans text-[0.9375rem] text-ink"
        >
          One question is still open: <b>{missing[0].label}</b> <span className="font-bold text-ember">Answer it</span>
        </button>
      )}

      {/* What the server checks; nothing here is trusted on its own. */}
      <BuildInputs slug={slug} groups={groups} finishOf={finishOf} options={options} optPicks={optPicks} attribution={attribution} />
      {Object.entries(answers).flatMap(([qid, v]) =>
        (Array.isArray(v) ? v : [v]).map((id) => <input key={`${qid}:${id}`} type="hidden" name={`q:${qid}`} value={id} />),
      )}
      {storeMode && <input type="hidden" name="mode" value="store" />}
      <input ref={secondsRef} type="hidden" name="seconds" defaultValue="0" />

      <label className="block">
        <span className="font-sans text-[0.9375rem] font-bold text-ink">Your name</span>
        <input
          name="name"
          autoComplete="name"
          placeholder="First and last name"
          defaultValue={was.name}
          aria-invalid={Boolean(errors.name)}
          className={cx(INPUT, "mt-1.5", errors.name && BAD)}
        />
        {err(errors.name)}
      </label>
      <label className="block">
        <span className="font-sans text-[0.9375rem] font-bold text-ink">Mobile number</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(918) 555-0142"
          defaultValue={was.phone}
          aria-invalid={Boolean(errors.phone)}
          className={cx(INPUT, "mt-1.5", errors.phone && BAD)}
        />
        {err(errors.phone)}
      </label>
      <label className="block">
        <span className="font-sans text-[0.9375rem] font-bold text-ink">
          Email <span className="font-normal text-muted">(if you like)</span>
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={was.email}
          aria-invalid={Boolean(errors.email)}
          className={cx(INPUT, "mt-1.5", errors.email && BAD)}
        />
        {err(errors.email)}
      </label>
      {storeMode && (
        <label className="block">
          <span className="font-sans text-[0.9375rem] font-bold text-ink">Salesperson</span>
          <input name="salesperson" autoComplete="off" placeholder="Who helped this buyer" defaultValue={was.salesperson} className={cx(INPUT, "mt-1.5")} />
        </label>
      )}

      <div>
        <label
          className={cx(
            "flex cursor-pointer items-start gap-3.5 rounded-lg border-2 p-4",
            errors.consent ? BAD : "border-line-strong",
          )}
        >
          <input
            type="checkbox"
            name="consent"
            value="yes"
            defaultChecked={was.consent === "yes"}
            className="mt-0.5 size-6 shrink-0 accent-[var(--color-ember)]"
            aria-invalid={Boolean(errors.consent)}
          />
          <span className="font-sans text-[0.8125rem] leading-[1.5] text-muted">
            <b className="mb-1 block text-[0.9375rem] text-ink">Yes, you can call or text me.</b>
            {CONSENT_TEXT} See our{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {err(errors.consent)}
      </div>

      {state.status === "error" && !Object.keys(errors).length && (
        <p role="alert" className="font-sans text-[0.9375rem] font-bold text-[#c81e1e] dark:text-[#f98080]">
          {state.message}
        </p>
      )}

      <p className="font-sans text-[0.8125rem] leading-[1.5] text-muted">
        The colors are shown on photos of this model, so real samples look a little different. The sales center goes
        over every choice with you.
      </p>
    </form>
  );
}

/** After the send: what happens next, a picture to keep, and the way on. */
function Thanks({
  slug,
  name,
  message,
  storeMode,
  needsLender,
  onNextCustomer,
  makeImage,
  picture,
}: {
  slug: string;
  name: string;
  message?: string;
  storeMode: boolean;
  needsLender: boolean;
  onNextCustomer: () => void;
  makeImage: () => Promise<File | null>;
  picture: () => File | null;
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      <span className="grid size-14 place-items-center rounded-full bg-moss text-white">
        <Icon.Check className="size-7" />
      </span>
      <h2 className={TITLE}>Sent. We have your {name}.</h2>
      {message && <p className="font-sans text-[1rem] leading-relaxed text-muted">{message}</p>}
      <KeepPicture name={name} makeImage={makeImage} picture={picture} />
      {!storeMode && (
        <p className="font-sans text-[0.9375rem] text-muted">
          Can&rsquo;t wait? Call{" "}
          <a href={site.phoneHref} className="font-bold text-ink underline underline-offset-4">
            {site.phone}
          </a>
          .
        </p>
      )}
      {needsLender && (
        <section className="w-full rounded-lg border border-line bg-surface p-4">
          <h3 className="font-sans text-[1rem] font-bold text-ink">Get pre-qualified while you wait</h3>
          <p className="mt-1 font-sans text-[0.9375rem] text-muted">
            It takes a few minutes, and the sales center will have your range when they call about the {name}.
          </p>
          <a href={site.prequalifyUrl} target="_blank" rel="noopener noreferrer" className={cx(buttonStyles.outline, "mt-3 h-12 px-5 text-[1rem]")}>
            Start a pre-qualification
          </a>
        </section>
      )}
      {storeMode ? (
        <button type="button" onClick={onNextCustomer} className={cx(buttonStyles.primary, "h-12 px-6 text-[1rem] font-bold")}>
          Start the next customer
        </button>
      ) : (
        <Link href={`/homes/${slug}`} className="font-sans text-[0.9375rem] font-bold text-ember">
          Back to the {name}
        </Link>
      )}
    </div>
  );
}

/** The build as form fields — the same set for a save and a send; the server re-checks all of it. */
function BuildInputs({
  slug,
  groups,
  finishOf,
  options,
  optPicks,
  attribution,
}: {
  slug: string;
  groups: MaterialGroup[];
  finishOf: (g: MaterialGroup) => { id: string };
  options: OptionGroup[];
  optPicks: OptionPicks;
  attribution: Record<string, string>;
}) {
  return (
    <>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <input type="hidden" name="home" value={slug} />
      {groups.map((g) => (
        <input key={g.material} type="hidden" name={`finish:${g.material}`} value={finishOf(g).id} />
      ))}
      {options.flatMap((g) =>
        (optPicks[g.id] ?? []).map((id) => <input key={`${g.id}:${id}`} type="hidden" name={`o:${g.id}`} value={id} />),
      )}
      {Object.entries(attribution).map(([k, v]) => (
        <input key={k} type="hidden" name={`a:${k}`} value={v} />
      ))}
    </>
  );
}

/** "Save a picture of my build" — shared to the phone's photos, or downloaded on a computer. */
function KeepPicture({
  name,
  makeImage,
  picture,
}: {
  name: string;
  makeImage: () => Promise<File | null>;
  /** The picture made ahead of the tap, when it is ready. */
  picture?: () => File | null;
}) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  async function onClick() {
    setFailed(false);
    /* Ready already: straight to the share sheet, inside the tap. */
    let file = picture?.() ?? null;
    if (!file) {
      setBusy(true);
      file = await makeImage();
      setBusy(false);
    }
    if (!file) {
      setFailed(true);
      return;
    }
    if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: `My ${name}` });
        return;
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
      }
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    const a = document.createElement("a");
    a.href = u;
    a.download = file.name;
    a.click();
  }
  return (
    <div className="flex flex-col items-start gap-1.5">
      <button type="button" onClick={onClick} disabled={busy} className={cx(buttonStyles.outline, "mt-1 px-5 disabled:opacity-60")}>
        {busy ? "Making your picture…" : `Save a picture of my ${name}`}
      </button>
      {failed && (
        <p role="status" className="font-sans text-[0.8125rem] text-muted">
          The picture didn&rsquo;t come out — check your connection and tap again.
        </p>
      )}
    </div>
  );
}

/**
 * Send the build to someone. The link carries the picks (`?build=…`), so
 * whoever opens it sees the same colors; a phone sends the picture with it.
 * Elsewhere the link is copied.
 */
function ShareBuild({ title, text, picture }: { title: string; text: string; picture?: () => File | null }) {
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), 2600);
    return () => window.clearTimeout(t);
  }, [note]);

  async function onClick() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        /* With the picture where the phone can share a file — the buyer
           texts their house, not a link. Only a picture already made: no
           await before the share, or Safari refuses it. */
        const file = picture?.() ?? null;
        if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ title, text: `${text}\n${url}`, files: [file] });
        else await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setNote("Link copied. Paste it in a text or email.");
    } catch {
      setNote("Copy the address at the top of the page to share it.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={onClick} className={cx(buttonStyles.outline, "h-12 px-5 text-[1rem]")}>
        <Icon.Share className="size-5" />
        Send it to someone
      </button>
      {note && (
        <span role="status" className="font-sans text-[0.875rem] font-bold text-ink">
          {note}
        </span>
      )}
    </div>
  );
}

/**
 * The photo as built, full screen: pinch or double-tap to zoom, drag to
 * look around. Its own pointer handling, so it works the same on a phone
 * and with a trackpad, and the page behind never scrolls.
 */
type View = { s: number; x: number; y: number };
/** Zoom between 1× and 4×, panned no further than the zoomed photo reaches. */
function clampView(n: View): View {
  const s = Math.min(4, Math.max(1, n.s));
  const lim = ((s - 1) / 2) * Math.max(window.innerWidth, window.innerHeight);
  return { s, x: s === 1 ? 0 : Math.max(-lim, Math.min(lim, n.x)), y: s === 1 ? 0 : Math.max(-lim, Math.min(lim, n.y)) };
}

function PhotoViewer({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [t, setT] = useState<View>({ s: 1, x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const [touching, setTouching] = useState(false);
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ d: number; s: number; x: number; y: number; cx: number; cy: number } | null>(null);
  const lastTap = useRef(0);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  /* The wheel, and a trackpad pinch (a wheel with ctrlKey), zoom the photo
     rather than the page: a native listener, because React's is passive. */
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const k = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025));
      setT((v) => clampView({ ...v, s: v.s * k }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  function begin() {
    const p = [...pts.current.values()];
    const cx = p.reduce((a, b) => a + b.x, 0) / p.length;
    const cy = p.reduce((a, b) => a + b.y, 0) / p.length;
    const d = p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
    start.current = { d, s: t.s, x: t.x, y: t.y, cx, cy };
  }
  return (
    <div
      ref={boxRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[80] flex touch-none select-none items-center justify-center overflow-hidden bg-black"
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        begin();
        setTouching(true);
        const now = Date.now();
        if (pts.current.size === 1 && now - lastTap.current < 300) {
          const n = t.s > 1 ? { s: 1, x: 0, y: 0 } : clampView({ s: 2.2, x: 0, y: 0 });
          setT(n);
          /* The gesture now starts from the new zoom, so the finger's first
             small movement does not undo it. */
          if (start.current) start.current = { ...start.current, s: n.s, x: n.x, y: n.y };
          lastTap.current = 0;
        } else lastTap.current = now;
      }}
      onPointerMove={(e) => {
        if (!pts.current.has(e.pointerId) || !start.current) return;
        pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const p = [...pts.current.values()];
        const st = start.current;
        const cx = p.reduce((a, b) => a + b.x, 0) / p.length;
        const cy = p.reduce((a, b) => a + b.y, 0) / p.length;
        const s = p.length > 1 && st.d ? st.s * (Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) / st.d) : st.s;
        setT(clampView({ s, x: st.x + (cx - st.cx), y: st.y + (cy - st.cy) }));
      }}
      onPointerUp={(e) => {
        pts.current.delete(e.pointerId);
        if (pts.current.size) begin();
        else {
          start.current = null;
          setTouching(false);
        }
      }}
      onPointerCancel={(e) => {
        pts.current.delete(e.pointerId);
        start.current = null;
        setTouching(false);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a data URL of the canvas, not a site photograph */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="max-h-full max-w-full object-contain"
        style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, transition: touching ? "none" : "transform 160ms ease-out" }}
      />
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm"
      >
        <Icon.Close className="size-5" />
      </button>
      <p className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] text-center font-sans text-[0.75rem] text-white/70">
        Pinch or double-tap to zoom
      </p>
    </div>
  );
}
