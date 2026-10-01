// The v2 deck is a straight port of the Euphoria.pptx Morph timeline
// (PARAREFERENCIA/diseño grafico pro/Euphoria.pptx). Every element keeps one
// identity across slides and gets a box per slide, in % of the 16:9 stage,
// copied from the pptx xfrm values. Slides are numbered 1..14 like the pptx
// (its slide 15 — the template credits — is left out).
// An element without a box on a slide fades out where it last was, the same
// way PowerPoint's Morph handles objects that don't exist on the next slide.

import { SHOWCASE_TOOLS, type ToolArtKind } from '../showcase/tools';
import type { ArtSpec } from './arts';

export const SLIDE_COUNT = 14;

export interface Frame {
  /** [x, y, w, h] in % of stage width / height. */
  b: [number, number, number, number];
  /** Font size in points of the 13.333in pptx slide. */
  pt?: number;
  text?: string;
  /** PowerPoint "soft edges" on the half-discs. */
  soft?: boolean;
  round?: boolean;
  align?: 'left' | 'center';
}

export type Kind =
  | 'art'
  | 'text'
  | 'discL'
  | 'discR'
  | 'orb'
  | 'frame'
  | 'bubbleLight'
  | 'bubbleDark'
  | 'logo'
  | 'mark'
  | 'black'
  | 'cta';

/** What the viewer has chosen; drives `dyn` frames. */
export interface Ctx {
  /** Tool centred in the rail / expanded as the hero (0..K-1). */
  rail: number;
  /** Strip under the pointer on slide 5. */
  hover: number | null;
  /** Tool opened as spotlight on slide 6 (already resolved). */
  spot: number;
}
export interface Dyn {
  f: Frame;
  v: boolean;
  /** false = unmount the heavy art (off-screen / hidden). */
  live?: boolean;
  art?: ArtSpec;
}

export interface El {
  dyn?: (n: number, c: Ctx) => Dyn | undefined;
  id: string;
  kind: Kind;
  art?: ArtSpec;
  /** Text boxes that wrap inside their width (descriptions). */
  wrap?: boolean;
  href?: string;
  label?: string;
  frames: Record<number, Frame>;
}

const F = (x: number, y: number, w: number, h: number, o: Omit<Frame, 'b'> = {}): Frame => ({ b: [x, y, w, h], ...o });
const on = (slides: number[], f: Frame) => Object.fromEntries(slides.map((s) => [s, f]));
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const tool = (id: ToolArtKind) => SHOWCASE_TOOLS.find((t) => t.id === id)!;

// ── User-driven part: the tools rail (slide 2), the hero (4), the strips (5)
// and the spotlight (6). Frames here depend on what the viewer picked, so
// they come from `dyn` (see Ctx) instead of the static `frames` table.
const TOOLS = SHOWCASE_TOOLS;
const K = TOOLS.length;
const two = (s: string) => (s.includes(' ') ? s.replace(' ', '\n') : s);

export const railX = (k: number, rail: number) => 32.8 + (k - rail) * 31.6;
const STRIP = { x0: 8, w: 86, gap: 1, y: 19.5, h: 59 };
const weight = (k: number, c: Ctx) => (k === (c.hover ?? c.rail) ? 2.6 : 0.85);
/** [x, w] of strip k in %, given which one is hovered (same weights as v1). */
export function stripSpan(k: number, c: Ctx): [number, number] {
  const ws = TOOLS.map((_, i) => weight(i, c));
  const sum = ws.reduce((a, b) => a + b, 0);
  const avail = STRIP.w - STRIP.gap * (K - 1);
  let x = STRIP.x0;
  for (let i = 0; i < k; i++) x += (avail * ws[i]) / sum + STRIP.gap;
  return [x, (avail * ws[k]) / sum];
}
/** Which strip is under the pointer (stage %), using fixed equal slots. */
export function stripAt(xPct: number, yPct: number): number | null {
  if (xPct < STRIP.x0 || xPct > STRIP.x0 + STRIP.w || yPct < 12 || yPct > 90) return null;
  return Math.min(K - 1, Math.floor(((xPct - STRIP.x0) / STRIP.w) * K));
}

const HERO = F(20.5, 20.8, 55.9, 55.9);
const SPOT = F(7.2, 17.4, 73.7, 74.9);
const N1 = F(0, 0, 1, 1);
// Slide 3 was a second carousel step in the pptx; it is skipped now (the rail is live).
const slide = (n: number) => (n === 3 ? 2 : n);

const toolEls: El[] = TOOLS.flatMap((t, k) => {
  const art: El = {
    id: `tool${k}`,
    kind: 'art',
    art: { tool: t.id },
    frames: { 2: N1 },
    dyn: (n, c) => {
      const m = slide(n);
      const rx = railX(k, c.rail);
      const railF = F(rx, 34.4, 30.4, 30.4);
      const [sx, sw] = stripSpan(k, c);
      const stripF = F(sx, STRIP.y, sw, STRIP.h);
      if (m < 2) return { f: railF, v: false, live: false };
      if (m === 2) return { f: railF, v: true, live: rx > -35 && rx < 135 };
      if (m === 4) return k === c.rail ? { f: HERO, v: true, live: true } : { f: railF, v: false, live: false };
      if (m === 5) return { f: stripF, v: true, live: true };
      if (m === 6) return k === c.spot ? { f: SPOT, v: true, live: true } : { f: stripF, v: false, live: false };
      return k === c.spot ? { f: SPOT, v: false, live: n === 7 } : { f: stripF, v: false, live: false };
    },
  };
  const name: El = {
    id: `lbl${k}`,
    kind: 'text',
    frames: { 2: N1 },
    dyn: (n, c) => {
      const m = slide(n);
      const rx = railX(k, c.rail);
      const [sx, sw] = stripSpan(k, c);
      const strip = F(sx + sw / 2 - 5.5, STRIP.y + STRIP.h * 0.62, 11, 8.5, { pt: 14, text: two(t.name) });
      const railF = F(rx, 65.9, 30.4, 4.9, { pt: 16, text: t.name });
      if (m < 2) return { f: railF, v: false };
      if (m === 2) return { f: railF, v: true };
      if (m === 4) return k === c.rail ? { f: F(70.9, 32.3, 11, 8.5, { pt: 16, text: two(t.name) }), v: true } : { f: railF, v: false };
      if (m === 5) return { f: strip, v: true };
      return { f: strip, v: false };
    },
  };
  const orb: El = {
    id: `orb${k}`,
    kind: 'orb',
    frames: { 2: N1 },
    dyn: (n, c) => {
      const m = slide(n);
      const [sx, sw] = stripSpan(k, c);
      const ly = STRIP.y + STRIP.h * 0.62;
      if (m === 4 && k === c.rail) return { f: F(68.6, 21.7, 16.7, 29.8), v: true };
      return { f: F(sx + sw / 2 - 8.35, ly - 10.6, 16.7, 29.8), v: m === 5 };
    },
  };
  const num: El = {
    id: `num${k}`,
    kind: 'text',
    frames: { 2: N1 },
    dyn: (n, c) => ({ f: F(railX(k, c.rail) + 9.3, 39.4, 11, 16.2, { pt: 66, text: String(k + 1) }), v: slide(n) === 2 }),
  };
  const dsc: El = {
    id: `dsc${k}`,
    kind: 'text',
    wrap: true,
    frames: { 2: N1 },
    dyn: (n, c) => {
      const m = slide(n);
      if (m === 4 && k === c.rail) return { f: F(25.5, 64.3, 38.5, 5.4, { pt: 9, text: t.description, align: 'left' }), v: true };
      return { f: F(railX(k, c.rail) + 3.6, 71.8, 23.2, 5.4, { pt: 6, text: t.description }), v: m === 2 };
    },
  };
  return [art, name, orb, num, dsc];
});

const label = (id: string, frames: Record<number, Frame>): El => ({ id, kind: 'text', frames });
const orbBig = (x: number, y: number) => F(x, y, 16.7, 29.8);

/** Heading of the rail, the hero's title and the "Protagonistas" heading. */
const headings: El[] = [
  label('heading', { 2: F(44.2, 21.8, 11, 4.9, { pt: 16, text: 'Herramientas' }), 3: F(44.2, 21.8, 11, 4.9, { pt: 16, text: 'Herramientas' }) }),
  {
    id: 'title4',
    kind: 'text',
    frames: {
      4: F(23.7, 56.0, 15.3, 6.7, { pt: 24, text: 'Herramienta' }),
      ...on(range(5, 9), F(17.9, 10.0, 15.3, 6.7, { pt: 24, text: 'Protagonistas' })),
      10: F(17.9, -53.1, 15.3, 6.7, { pt: 24, text: 'Protagonistas' }),
    },
    dyn: (n, c) => (n === 4 ? { f: F(23.7, 56.0, 15.3, 6.7, { pt: 24, text: `Herramienta ${c.rail + 1}` }), v: true } : undefined),
  },
];

// Decorative orbs that live on from slide 6 (they sat under the strips in the pptx).
const decorOrbs: El[] = [
  { id: 'orb14', kind: 'orb', frames: { ...on(range(6, 9), F(18.6, 48.9, 7.6, 13.5)), 10: F(18.6, -227.2, 7.6, 13.5) } },
  {
    id: 'orb19',
    kind: 'orb',
    frames: { 6: orbBig(70.4, 13.4), 7: orbBig(70.4, 13.4), 8: orbBig(56.3, 40.8), 9: orbBig(46.6, 19.5), 10: orbBig(16.1, 68.6), 11: orbBig(16.1, 68.6) },
  },
  {
    id: 'orb21',
    kind: 'orb',
    frames: { 6: F(2.2, 92.3, 7.4, 13.2), 7: F(91.0, 79.5, 7.4, 13.2), 8: F(2.2, 92.3, 7.4, 13.2), 9: F(2.2, 92.3, 7.4, 13.2), 10: F(71.8, 26.1, 7.4, 13.2), 11: F(71.8, 26.1, 7.4, 13.2) },
  },
];

// ── Spotlight: the tool the viewer picked on the strips ────────────────────
const firstWord = (s: string) => s.split(' ')[0];
const restWords = (s: string) => s.split(' ').slice(1).join(' ') || ' ';
const withText = (el: El, fn: (c: Ctx) => string): El => {
  el.dyn = (n, c) => (n === 5 || n === 6 ? { f: { ...el.frames[n], text: fn(c) }, v: true } : undefined);
  return el;
};
const thumb = (id: string, i: number, f5: Frame, f6: Frame): El => {
  const el: El = { id, kind: 'art', art: { tool: TOOLS[(i + 1) % K].id }, frames: { 5: f5, 6: f6 } };
  el.dyn = (n, c) => (n === 5 || n === 6 ? { f: el.frames[n], v: true, live: true, art: { tool: TOOLS[(c.spot + 1 + i) % K].id } } : undefined);
  return el;
};
const spotlight: El[] = [
  withText(
    label('w1', {
      5: F(133.1, 23.8, 43.5, 17.5, { pt: 72, text: '' }),
      6: F(51.0, 23.8, 43.5, 17.5, { pt: 72, text: '' }),
      7: F(51.0, 23.8, 43.5, 17.5, { pt: 72, text: 'Canta' }),
      8: F(34.5, 23.8, 43.5, 7.6, { pt: 28, text: 'Canta' }),
      9: F(-10.2, 23.8, 43.5, 5.8, { pt: 20, text: 'Canta' }),
      10: F(-10.2, -60.0, 43.5, 5.8, { pt: 20, text: 'Canta' }),
    }),
    (c) => firstWord(TOOLS[c.spot].name),
  ),
  withText(
    label('w1b', {
      5: F(211.2, 36.4, 43.5, 17.5, { pt: 72, text: '' }),
      6: F(54.5, 36.4, 43.5, 17.5, { pt: 72, text: '' }),
    }),
    (c) => restWords(TOLS_NAME(c)),
  ),
  withText(
    {
      id: 'spotDesc',
      kind: 'text',
      wrap: true,
      frames: {
        5: F(285.2, 53.9, 31.8, 11.4, { pt: 9, text: '', align: 'left' }),
        6: F(66.2, 53.9, 31.8, 11.4, { pt: 9, text: '', align: 'left' }),
      },
    },
    (c) => TOOLS[c.spot].description,
  ),
  thumb('thumb1', 0, F(9.4, 122.0, 15.4, 15.6), F(9.4, 72.9, 15.4, 15.6)),
  thumb('thumb2', 1, F(26.2, 206.7, 16.7, 16.7), F(26.2, 71.7, 16.7, 16.7)),
  thumb('thumb3', 2, F(43.8, 296.1, 16.7, 16.7), F(43.8, 72.0, 16.7, 16.7)),
];
function TOLS_NAME(c: Ctx) {
  return TOOLS[c.spot].name;
}

// ── Duo / trio / duo collage (Rue·Jules → Maddy·Nate·Cassie → Fez·Lexie) ───
const collage: El[] = [
  {
    id: 'duoMusic',
    kind: 'art',
    art: { combo: ['lyrics', 'cancionero'] },
    frames: { 6: F(7.2, 17.4, 78.1, 0.7), 7: F(10.4, 16.7, 78.1, 78.1), 8: F(10.4, 16.7, 13.5, 78.1), 9: F(8.6, 16.7, 6.3, 78.1), 10: F(8.6, -426.3, 6.3, 78.1) },
  },
  label('slash', {
    6: F(129.2, 36.4, 15.3, 16.2, { pt: 66, text: '/' }),
    ...on([7, 8, 9], F(61.2, 36.4, 15.3, 16.2, { pt: 66, text: '/' })),
    10: F(61.2, -279.3, 15.3, 16.2, { pt: 66, text: '/' }),
  }),
  label('w2', {
    6: F(199.6, 50.9, 22.4, 16.2, { pt: 66, text: 'Toca' }),
    7: F(61.8, 50.9, 22.4, 16.2, { pt: 66, text: 'Toca' }),
    8: F(45.3, 50.9, 22.4, 6.7, { pt: 24, text: 'Toca' }),
    9: F(0.6, 50.9, 22.4, 5.4, { pt: 18, text: 'Toca' }),
    10: F(0.6, -46.4, 22.4, 5.4, { pt: 18, text: 'Toca' }),
  }),
  {
    id: 'trio',
    kind: 'art',
    art: { combo: ['stories', 'dictation', 'translator'] },
    frames: { 7: F(91.0, 16.7, 0.4, 78.1), 8: F(24.7, 16.7, 66.7, 78.1), 9: F(15.7, 16.7, 8.3, 78.1), 10: F(15.7, -373.7, 8.3, 78.1) },
  },
  label('w3', {
    7: F(231.5, 35.5, 43.5, 17.5, { pt: 72, text: 'Lee' }),
    8: F(57.7, 35.5, 43.5, 17.5, { pt: 72, text: 'Lee' }),
    9: F(-0.4, 35.5, 43.5, 5.4, { pt: 18, text: 'Lee' }),
    10: F(-0.4, -271.3, 43.5, 5.4, { pt: 18, text: 'Lee' }),
  }),
  label('w4', {
    7: F(158.9, 19.9, 43.5, 17.5, { pt: 72, text: 'Escucha' }),
    8: F(49.0, 19.9, 43.5, 17.5, { pt: 72, text: 'Escucha' }),
    9: F(-0.7, 19.9, 43.5, 5.4, { pt: 18, text: 'Escucha' }),
    10: F(-0.7, -267.7, 43.5, 5.4, { pt: 18, text: 'Escucha' }),
  }),
  label('w5', {
    7: F(313.6, 49.1, 43.5, 17.5, { pt: 72, text: 'Traduce' }),
    8: F(49.6, 49.1, 43.5, 17.5, { pt: 72, text: 'Traduce' }),
    9: F(-0.7, 49.1, 43.5, 5.4, { pt: 18, text: 'Traduce' }),
    10: F(-0.7, -387.1, 43.5, 5.4, { pt: 18, text: 'Traduce' }),
  }),
  {
    id: 'duoChat',
    kind: 'art',
    art: { tool: 'vocabchat' },
    frames: { 8: F(91.0, 16.7, 0.4, 78.1), 9: F(25.8, 16.7, 62.4, 78.1), 10: F(25.8, -348.7, 62.4, 78.1) },
  },
  label('w6', {
    8: F(222.2, 22.5, 43.5, 17.5, { pt: 72, text: 'Mia' }),
    9: F(40.9, 22.5, 43.5, 17.5, { pt: 72, text: 'Mia' }),
    10: F(40.9, -170.3, 43.5, 17.5, { pt: 72, text: 'Mia' }),
  }),
  label('w7', {
    8: F(291.7, 48.5, 43.5, 17.5, { pt: 72, text: 'Leo' }),
    9: F(48.9, 48.5, 43.5, 17.5, { pt: 72, text: 'Leo' }),
    10: F(48.9, -288.1, 43.5, 17.5, { pt: 72, text: 'Leo' }),
  }),
];

// ── Chat (the two portraits become circles on slide 12) ────────────────────
const chat: El[] = [
  {
    id: 'portraitMia',
    kind: 'art',
    art: { portrait: 'mia' },
    href: '/vocab-chat',
    label: 'Mia · Vocab Chat',
    frames: { 9: F(-156.2, 0, 26.5, 100), 10: F(-0.3, 0, 26.5, 100), 11: F(-0.3, 0, 26.5, 100), 12: F(25.8, 25.9, 11.2, 19.8, { round: true }) },
  },
  {
    id: 'portraitLeo',
    kind: 'art',
    art: { portrait: 'leo' },
    href: '/vocab-chat',
    label: 'Leo · Vocab Chat',
    frames: { 9: F(280.8, -0.3, 24.8, 100), 10: F(75.2, -0.3, 24.8, 100), 11: F(75.2, -0.3, 24.8, 100), 12: F(40.2, 25.1, 12.8, 22.8, { round: true }) },
  },
  { id: 'b1', kind: 'bubbleLight', frames: { 9: F(29.7, 162.8, 26.5, 7.5, { pt: 18, text: 'Are you coming?' }), ...on([10, 11], F(29.7, 9.1, 26.5, 7.5, { pt: 18, text: 'Are you coming?' })) } },
  { id: 'b2', kind: 'bubbleDark', frames: { 9: F(44.1, 215.4, 26.5, 7.5, { pt: 18, text: 'Yes, OMW' }), ...on([10, 11], F(44.1, 25.1, 26.5, 7.5, { pt: 18, text: 'Yes, OMW' })) } },
  { id: 'b3', kind: 'bubbleLight', frames: { 9: F(29.7, 283.1, 26.5, 7.5, { pt: 18, text: 'I kept you the best seat..' }), ...on([10, 11], F(29.7, 40.1, 26.5, 7.5, { pt: 18, text: 'I kept you the best seat..' })) } },
  { id: 'b4', kind: 'bubbleDark', frames: { 10: F(59.7, 263.0, 10.7, 7.5, { pt: 18, text: 'Mia?' }), 11: F(59.7, 61.1, 10.7, 7.5, { pt: 18, text: 'Mia?' }) } },
  { id: 'b5', kind: 'bubbleDark', frames: { 10: F(63.5, 277.8, 7.2, 7.5, { pt: 18, text: '…' }), 11: F(63.5, 75.9, 7.2, 7.5, { pt: 18, text: '…' }) } },
];

// ── The whole cast as circles ──────────────────────────────────────────────
const circle = (id: ToolArtKind, off: [number, number, number, number], at: [number, number, number, number]): El => ({
  id: `circle-${id}`,
  kind: 'art',
  art: { tool: id },
  href: tool(id).href,
  label: tool(id).name,
  frames: { 11: F(...off, { round: true }), 12: F(...at, { round: true }) },
});
const circles: El[] = [
  circle('vocabulary', [-274.7, 22.2, 14.8, 26.3], [8.7, 22.2, 14.8, 26.3]),
  circle('lyrics', [-228.0, 26.8, 9.6, 18.4], [55.3, 26.8, 9.6, 18.4]),
  circle('picture', [-216.6, 21.3, 13.9, 24.7], [66.7, 21.3, 13.9, 24.7]),
  circle('translator', [-200.5, 22.7, 11.6, 20.6], [82.8, 22.7, 11.6, 20.6]),
  circle('livetalk', [345.1, 50.7, 12.8, 22.8], [76.4, 50.7, 12.8, 22.8]),
  circle('stories', [330.9, 49.6, 12.8, 22.8], [62.2, 49.6, 12.8, 22.8]),
  circle('dictation', [300.9, 51.8, 12.3, 21.9], [32.2, 51.8, 12.3, 21.9]),
  circle('cancionero', [287.9, 54.6, 10.6, 18.9], [19.2, 54.6, 10.6, 18.9]),
  circle('questions', [316.2, 49.6, 13.3, 25.0], [47.5, 49.6, 13.3, 25.0]),
];

// ── Finale ("Ashtray" → end card) ──────────────────────────────────────────
const FINALE_TEXT =
  'Diez herramientas, un mismo objetivo: que hables con confianza. Escucha, lee, canta, pregunta y conversa en un solo lugar.';
const finale: El[] = [
  { id: 'black', kind: 'black', frames: { 12: F(101.1, 0, 6.6, 100), 13: F(-1.8, 0, 109.5, 100), 14: F(-1.8, 0, 109.5, 100) } },
  { id: 'orb32', kind: 'orb', frames: { 12: orbBig(10.8, 112.9), 13: orbBig(41.6, 32.5) } },
  { id: 'bigCircle', kind: 'art', art: { tool: 'livetalk' }, frames: { 13: F(12.9, 14.6, 37.1, 66.0, { round: true }) } },
  { id: 'smallCircle', kind: 'art', art: { tool: 'picture' }, frames: { 13: F(35.9, 62.8, 13.3, 23.7, { round: true }) } },
  label('w8', { 12: F(121.0, 38.6, 43.5, 17.5, { pt: 72, text: 'Tu turno' }), 13: F(43.0, 38.6, 43.5, 17.5, { pt: 72, text: 'Tu turno' }) }),
  {
    id: 'finaleDesc',
    kind: 'text',
    wrap: true,
    frames: {
      12: F(249.1, 57.2, 32.7, 13.9, { pt: 14, text: FINALE_TEXT }),
      13: F(52.9, 57.2, 32.7, 13.9, { pt: 14, text: FINALE_TEXT }),
    },
  },
  { id: 'cta', kind: 'cta', href: '/dashboard', frames: { 14: F(41.0, 76.0, 18.0, 6.4, { pt: 14, text: 'Entrar' }) } },
];

// ── Chrome / decoration ────────────────────────────────────────────────────
const decor: El[] = [
  {
    id: 'discL',
    kind: 'discL',
    frames: { 2: F(0, 22.6, 14.9, 52.7), 3: F(0, 22.6, 14.9, 52.7), 4: F(9.1, 12.8, 20.8, 73.3, { soft: true }), ...on(range(5, 11), F(-6.3, 12.8, 20.8, 73.3, { soft: true })) },
  },
  {
    id: 'discR',
    kind: 'discR',
    frames: {
      2: F(85.1, 25.2, 14.9, 52.7),
      3: F(85.1, 25.2, 14.9, 52.7),
      ...on([4, 5, 6], F(94.8, 74.3, 5.2, 18.4)),
      7: F(94.8, 37.4, 5.2, 18.4),
      ...on([8, 9, 10, 11], F(94.8, 74.3, 5.2, 18.4)),
    },
  },
  {
    id: 'frame',
    kind: 'frame',
    frames: {
      2: F(32.1, 33.0, 31.7, 32.9),
      3: F(32.1, 33.0, 31.7, 32.9),
      4: F(19.9, 19.5, 57.5, 58.9),
      ...on(range(5, 10), F(3.7, 19.5, 0.8, 58.9)),
      // pptx rotates the bar 90°; this is its on-screen box after rotation.
      ...on([11, 12], F(5.15, 88.66, 91.8, 0.9)),
    },
  },
];

const chrome: El[] = [
  {
    id: 'logo',
    kind: 'logo',
    frames: { 1: F(19.5, 35.4, 60.9, 29.3), ...on(range(2, 12), F(4.2, 3.5, 6.6, 3.2)), 13: F(54.0, 26.7, 21.3, 10.2), 14: F(27.0, 46.0, 51.9, 24.9) },
  },
  { id: 'mark', kind: 'mark', frames: { 1: F(45.0, 28.9, 10.1, 3.1), ...on(range(2, 13), F(92.5, 4.7, 4.4, 1.3)), 14: F(46.6, 35.9, 12.5, 3.9) } },
];

// Paint order (back → front), following the pptx z-order where it matters:
// the big collage stills sit behind the half-discs, portraits behind bubbles,
// the black curtain above the circles, logo on top of everything.
export const ELEMENTS: El[] = [
  ...chat.filter((e) => e.kind === 'art'),
  collage.find((e) => e.id === 'duoChat')!,
  collage.find((e) => e.id === 'trio')!,
  ...decor,
  collage.find((e) => e.id === 'duoMusic')!,
  ...toolEls.filter((e) => e.kind === 'art'),
  ...spotlight.filter((e) => e.kind === 'art'),
  ...decorOrbs,
  ...toolEls.filter((e) => e.kind === 'orb'),
  ...spotlight.filter((e) => e.kind !== 'art'),
  ...headings,
  ...toolEls.filter((e) => e.kind === 'text'),
  ...collage.filter((e) => !['duoChat', 'trio', 'duoMusic'].includes(e.id)),
  ...chat.filter((e) => e.kind !== 'art'),
  ...circles,
  ...finale,
  ...chrome,
];
