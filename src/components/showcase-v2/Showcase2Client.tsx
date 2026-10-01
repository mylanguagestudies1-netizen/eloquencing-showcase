'use client';

import '../showcase/showcase.css';
import Link from '@/lib/ExtLink';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Art, type ArtSpec } from './arts';
import { ELEMENTS, SLIDE_COUNT, railX, stripAt, type Ctx, type El, type Frame } from './timeline';
import { SHOWCASE_TOOLS } from '../showcase/tools';

const K = SHOWCASE_TOOLS.length;
// PowerPoint Morph ran at 2.0–2.25s on this deck.
const MORPH = { duration: 2, ease: [0.45, 0, 0.2, 1] as const };
// Used while the viewer is steering (hovering strips): follow the pointer, don't drift.
const FAST = { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const };
// 1pt on a 13.333in-wide slide, as a % of the stage width.
const PT = 100 / (13.333 * 72);
const cq = (pt: number) => `${(pt * PT).toFixed(3)}cqw`;
/** Slide 3 of the pptx was a second carousel step; the rail is live now, so it is skipped. */
const SKIPPED = 3;

// Words of the collage slides open their tool; "Protagonistas" goes back to the strips.
const WORD_LINKS: Record<string, string> = {
  w1: '/lyrics',
  w2: '/cancionero',
  w3: '/german-short-stories',
  w4: '/dictation',
  w5: '/live-translator',
  w6: '/vocab-chat',
  w7: '/vocab-chat',
};

// Slides 7-9 are one triptych; each slide is the same three panes with a different one open.
const PANES = [
  { id: 'duoMusic', slide: 7, label: 'Canta · Toca' },
  { id: 'trio', slide: 8, label: 'Lee · Escucha · Traduce' },
  { id: 'duoChat', slide: 9, label: 'Mia · Leo' },
] as const;

const PALE = '#DAE3F3'; // pptx accent1 lumMod 30% lumOff 70%
const PURPLE = '#7030A0';
const DISPLAY = "'Inter Tight', 'Aileron', var(--font-geist-sans), system-ui, sans-serif";
const BODY = "'Montserrat', 'Gotham', var(--font-geist-sans), system-ui, sans-serif";

function resolve(el: El, n: number, ctx: Ctx): { f: Frame; visible: boolean; near: number; art?: ArtSpec } {
  if (el.dyn) {
    const d = el.dyn(n, ctx);
    if (d) return { f: d.f, visible: d.v, near: d.live === false ? 9 : 0, art: d.art };
  }
  const keys = Object.keys(el.frames).map(Number);
  let best = keys[0];
  for (const k of keys) {
    const d = Math.abs(k - n);
    const bd = Math.abs(best - n);
    if (d < bd || (d === bd && k < best)) best = k;
  }
  return { f: el.frames[n] ?? el.frames[best], visible: n in el.frames, near: Math.abs(best - n) };
}

function Logo() {
  return (
    <svg viewBox="0 0 369 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
      <text x="184.5" y="74" textAnchor="middle" textLength="360" lengthAdjust="spacingAndGlyphs" fill="#fff" style={{ fontFamily: DISPLAY, fontWeight: 100, fontSize: 92 }}>
        eloquencing
      </text>
    </svg>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 580 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
      <text x="290" y="82" textAnchor="middle" textLength="570" lengthAdjust="spacingAndGlyphs" fill="#fff" style={{ fontFamily: BODY, fontSize: 104 }}>
        <tspan fontWeight={900}>ELQ</tspan>
        <tspan fontWeight={300}>studio</tspan>
      </text>
    </svg>
  );
}

function TextLayer({ f, wrap, href, onClick, color = '#fff' }: { f: Frame; wrap?: boolean; href?: string; onClick?: () => void; color?: string }) {
  const small = (f.pt ?? 18) <= 9;
  const align = f.align ?? 'center';
  return (
    <AnimatePresence initial={false}>
      <motion.span
        key={f.text}
        className="absolute inset-0 flex items-start"
        style={{
          justifyContent: align === 'left' ? 'flex-start' : 'center',
          textAlign: align,
          whiteSpace: wrap ? 'normal' : 'pre',
          fontFamily: small ? BODY : DISPLAY,
          fontWeight: small ? 400 : 200,
          lineHeight: wrap ? 1.35 : 1.1,
          letterSpacing: small ? '0.01em' : '0.02em',
          color,
          pointerEvents: 'none',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {href ? (
          <Link href={href} onClick={(e) => e.stopPropagation()} className="cursor-pointer underline-offset-[0.6cqw] transition-opacity hover:underline hover:opacity-80" style={{ pointerEvents: 'auto' }}>
            {f.text}
          </Link>
        ) : onClick ? (
          <span role="button" onClick={(e) => { e.stopPropagation(); onClick(); }} className="cursor-pointer transition-opacity hover:opacity-70" style={{ pointerEvents: 'auto' }}>
            {f.text}
          </span>
        ) : (
          f.text
        )}
      </motion.span>
    </AnimatePresence>
  );
}

function Element({ el, n, ctx, fast, onGo }: { el: El; n: number; ctx: Ctx; fast: boolean; onGo: (slide: number) => void }) {
  const { f, visible, near, art: artOverride } = resolve(el, n, ctx);
  const [x, y, w, h] = f.b;
  const live = near <= 1; // mount heavy art only around the current slide

  // The tool stills on slide 5 are strips that change width as you steer. Their
  // scene keeps a FIXED size and is centered; the strip just crops it more or
  // less, so nothing is re-laid-out or repainted while it grows (no lag).
  const toolK = el.id.startsWith('tool') ? Number(el.id.slice(4)) : -1;
  const stripMode = toolK >= 0 && n === 5;
  const stripActive = stripMode && (ctx.hover === toolK || (ctx.hover === null && ctx.rail === toolK));

  const animate: Record<string, string | number> = {
    left: `${x}%`,
    top: `${y}%`,
    width: `${w}%`,
    height: `${h}%`,
    opacity: visible ? 1 : 0,
  };
  if (f.pt) animate.fontSize = cq(f.pt);
  if (el.kind === 'art') animate.borderRadius = f.round ? '50%' : '0%';
  if (el.kind === 'discL' || el.kind === 'discR') animate.filter = f.soft ? 'blur(1.6cqw)' : 'blur(0cqw)';

  const style: CSSProperties = { position: 'absolute', pointerEvents: visible ? undefined : 'none' };
  let body: React.ReactNode = null;

  switch (el.kind) {
    case 'art': {
      style.overflow = 'hidden';
      style.isolation = 'isolate';
      const spec = artOverride ?? el.art;
      const node = live && spec ? <Art spec={spec} /> : null;
      const art =
        toolK >= 0 ? (
          <div
            className="absolute inset-y-0 left-1/2"
            style={{
              width: stripMode ? '15cqw' : '100%',
              transform: 'translateX(-50%)',
              transition: 'width 1.6s cubic-bezier(.45,0,.2,1)',
              contain: 'layout paint',
            }}
          >
            {node}
          </div>
        ) : (
          node
        );
      body = el.href && visible ? (
        <Link href={el.href} className="group absolute inset-0 block" title={el.label} onClick={(e) => e.stopPropagation()}>
          {art}
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 px-2 text-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ fontFamily: BODY, fontSize: '1.05cqw', fontWeight: 500 }}>
            {el.label}
          </span>
        </Link>
      ) : (
        art
      );
      break;
    }
    case 'text':
      body = (
        <TextLayer
          f={f}
          wrap={el.wrap}
          href={visible && n >= 7 ? WORD_LINKS[el.id] : undefined}
          onClick={el.id === 'title4' && visible && n >= 6 ? () => onGo(5) : undefined}
        />
      );
      break;
    case 'discL':
    case 'discR':
      style.background = el.kind === 'discL' ? `linear-gradient(180deg, ${PALE}, ${PURPLE})` : `linear-gradient(180deg, ${PURPLE}, ${PALE})`;
      style.borderRadius = el.kind === 'discL' ? '0 9999px 9999px 0' : '9999px 0 0 9999px';
      break;
    case 'orb':
      style.background = `linear-gradient(180deg, ${PURPLE}, ${PALE})`;
      style.borderRadius = '50%';
      style.maskImage = 'radial-gradient(closest-side, #000 38%, transparent 100%)';
      style.WebkitMaskImage = style.maskImage;
      break;
    case 'frame':
      style.border = 'max(1px, 0.1cqw) solid #fff';
      break;
    case 'bubbleLight':
    case 'bubbleDark':
      style.background = el.kind === 'bubbleLight' ? `linear-gradient(180deg, #E7E6E6, ${PALE})` : `linear-gradient(180deg, #000, ${PURPLE})`;
      style.borderRadius = `${(h * 0.1667).toFixed(2)}cqh`;
      body = (
        <span className="absolute inset-0 flex items-center justify-center px-[1cqw] text-center" style={{ fontFamily: DISPLAY, fontWeight: 300, whiteSpace: 'nowrap', color: el.kind === 'bubbleLight' ? '#4b4b55' : '#fff' }}>
          {f.text}
        </span>
      );
      break;
    case 'black':
      style.background = '#000';
      break;
    case 'logo':
      body = <Logo />;
      break;
    case 'mark':
      body = <Mark />;
      break;
    case 'cta':
      style.border = 'max(1px, 0.1cqw) solid #fff';
      body = (
        <Link
          href={el.href ?? '/dashboard'}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 flex items-center justify-center gap-[1cqw] uppercase text-white transition-colors hover:bg-white hover:text-black"
          style={{ fontFamily: BODY, fontWeight: 300, letterSpacing: '0.35em' }}
        >
          {f.text} <span aria-hidden>→</span>
        </Link>
      );
      break;
  }

  return (
    <motion.div
      style={style}
      className={stripMode ? `sc-strip ${stripActive ? '' : 'sc-still'}` : undefined}
      initial={false}
      animate={animate}
      transition={{
        default: fast && (n === 5 || n === 2 || n === 6) ? FAST : MORPH,
        opacity: visible ? { duration: 0.9, delay: fast ? 0 : 0.55 } : { duration: 0.6 },
      }}
      aria-hidden={!visible}
    >
      {body}
    </motion.div>
  );
}

export default function Showcase2Client() {
  const [n, setN] = useState(1);
  const [idle, setIdle] = useState(false);
  // What the viewer steers: tool in the rail / hero, strip under the pointer, tool opened as spotlight.
  const [rail, setRail] = useState(1);
  const [hover, setHover] = useState<number | null>(null);
  const [spotPick, setSpotPick] = useState<number | null>(null);
  const [fast, setFast] = useState(false);
  const lock = useRef(0);
  const railLock = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const idleTimer = useRef<number | undefined>(undefined);
  const fastTimer = useRef<number | undefined>(undefined);

  const ctx: Ctx = { rail, hover, spot: spotPick ?? rail };

  const boost = useCallback(() => {
    setFast(true);
    window.clearTimeout(fastTimer.current);
    fastTimer.current = window.setTimeout(() => setFast(false), 1100);
  }, []);
  // Steering the rail follows you quickly; only slide changes use the slow morph.
  const moveRail = useCallback((d: number) => { boost(); setRail((r) => Math.max(0, Math.min(K - 1, r + d))); }, [boost]);
  const pickRail = useCallback((k: number) => { boost(); setRail(k); }, [boost]);
  const moveSpot = useCallback((d: number) => { boost(); setSpotPick((cur) => Math.max(0, Math.min(K - 1, (cur ?? rail) + d))); }, [boost, rail]);
  const openSpot = useCallback((k: number) => { setSpotPick(k); setN(6); }, []);
  const go = useCallback((to: number) => {
    let t = Math.max(1, Math.min(SLIDE_COUNT, to));
    if (t === SKIPPED) t = 2;
    setN(t);
  }, []);
  const step = useCallback((d: number) => {
    const now = Date.now();
    if (now - lock.current < 700) return;
    lock.current = now;
    setN((cur) => {
      let t = Math.max(1, Math.min(SLIDE_COUNT, cur + d));
      if (t === SKIPPED) t = d > 0 ? SKIPPED + 1 : SKIPPED - 1;
      return t;
    });
  }, []);

  const wake = useCallback(() => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2600);
  }, []);

  // Coming back to the hero starts a fresh pick; hover only means something on the strips.
  useEffect(() => {
    if (n === 4) setSpotPick(null);
    if (n !== 5) setHover(null);
    setFast(false);
  }, [n]);

  const steer = useCallback((h: number | null) => {
    setHover((cur) => {
      if (cur === h) return cur;
      setFast(true);
      window.clearTimeout(fastTimer.current);
      fastTimer.current = window.setTimeout(() => setFast(false), 1100);
      return h;
    });
  }, []);

  useEffect(() => {
    wake();
    const onKey = (e: KeyboardEvent) => {
      // Rail (2) and strips (5): arrows move the selection. Spotlight (6): arrows change tool.
      // Up/Down/Space/Enter always move between slides.
      const onRail = n === 2 || n === 5;
      if (onRail && e.key === 'ArrowRight') { e.preventDefault(); moveRail(1); }
      else if (onRail && e.key === 'ArrowLeft') { e.preventDefault(); moveRail(-1); }
      else if (n === 6 && e.key === 'ArrowRight') { e.preventDefault(); moveSpot(1); }
      else if (n === 6 && e.key === 'ArrowLeft') { e.preventDefault(); moveSpot(-1); }
      else if (n === 5 && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openSpot(rail); }
      else if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); step(1); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); step(-1); }
      else if (e.key === 'Home') go(1);
      else if (e.key === 'End') go(SLIDE_COUNT);
      else if (e.key === 'f' || e.key === 'F') void toggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(idleTimer.current);
      window.clearTimeout(fastTimer.current);
    };
  }, [go, step, wake, moveRail, moveSpot, openSpot, rail, n]);

  const stagePct = (e: { clientX: number; clientY: number }) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return null;
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  const onWheel = (e: React.WheelEvent) => {
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if ((n === 2 || n === 5) && horizontal) {
      if (Math.abs(e.deltaX) < 12) return;
      const now = Date.now();
      if (now - railLock.current < 320) return;
      railLock.current = now;
      moveRail(e.deltaX > 0 ? 1 : -1);
      return;
    }
    const d = horizontal ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 24) return;
    step(d > 0 ? 1 : -1);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t0 = touch.current;
    touch.current = null;
    if (!t0) return;
    const dx = e.changedTouches[0].clientX - t0.x;
    const dy = e.changedTouches[0].clientY - t0.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 50) return;
    if ((n === 2 || n === 5) && Math.abs(dx) > Math.abs(dy)) { moveRail(dx < 0 ? 1 : -1); return; }
    if (n === 6 && Math.abs(dx) > Math.abs(dy)) { moveSpot(dx < 0 ? 1 : -1); return; }
    step((Math.abs(dx) > Math.abs(dy) ? dx : dy) < 0 ? 1 : -1);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    wake();
    if (n !== 5 || e.pointerType !== 'mouse') return;
    const p = stagePct(e);
    steer(p ? stripAt(p.x, p.y) : null);
  };
  const onClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a,button')) return;
    const p = stagePct(e);
    if (n === 2) {
      // On the rail you choose: click a card to center it, click the centered one to open it.
      if (!p) return;
      for (let k = 0; k < K; k++) {
        const x = railX(k, rail);
        if (p.x >= x && p.x <= x + 30.4 && p.y >= 34 && p.y <= 72) {
          if (k === rail) go(4);
          else pickRail(k);
          return;
        }
      }
      return;
    }
    if (n >= 7 && n <= 9 && p) {
      // Click a collapsed pane to open it.
      for (const pane of PANES) {
        if (pane.slide === n) continue;
        const el = ELEMENTS.find((x) => x.id === pane.id);
        const b = el && resolve(el, n, ctx).f.b;
        if (b && b[2] > 3 && p.x >= b[0] && p.x <= b[0] + b[2] && p.y >= b[1] && p.y <= b[1] + b[3]) {
          go(pane.slide);
          return;
        }
      }
    }
    if (n === 5 && p) {
      // On the strips the one you click becomes the spotlight.
      // First click pins (expands) a strip, a click on the pinned one opens it.
      const k = stripAt(p.x, p.y);
      if (k !== null) { if (k === rail) openSpot(k); else pickRail(k); return; }
    }
    step(e.clientX < window.innerWidth * 0.2 ? -1 : 1);
  };

  const dots = Array.from({ length: SLIDE_COUNT }, (_, i) => i + 1).filter((i) => i !== SKIPPED);

  return (
    <div
      className="fixed inset-0 z-[60] flex select-none items-center justify-center overflow-hidden bg-black"
      style={{ cursor: idle ? 'none' : 'default' }}
      onWheel={onWheel}
      onPointerMove={onPointerMove}
      onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; wake(); }}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@100;200;300&family=Montserrat:wght@300;400;500;900&display=swap"
        precedence="default"
      />

      {/* 16:9 stage, letterboxed like the pptx in slideshow mode. */}
      <motion.div
        ref={stageRef}
        className="relative overflow-hidden"
        style={{
          width: 'min(100vw, calc(100dvh * 16 / 9))',
          aspectRatio: '16 / 9',
          containerType: 'size',
          backgroundImage: 'url(/showcase/v2-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        role="region"
        aria-roledescription="presentación"
        aria-label={`Diapositiva ${n} de ${SLIDE_COUNT}`}
      >
        {ELEMENTS.map((el) => (
          <Element key={el.id} el={el} n={n} ctx={ctx} fast={fast} onGo={go} />
        ))}
        <div className="sc-grain pointer-events-none absolute inset-0" style={{ opacity: 0.08 }} />

        {/* Rail controls: you steer which tool comes forward. */}
        <AnimatePresence>
          {n === 2 && (
            <motion.div className="absolute inset-0 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <button
                onClick={() => moveRail(-1)}
                disabled={rail === 0}
                aria-label="Herramienta anterior"
                className="absolute left-[1.2%] top-[47%] flex h-[6cqw] w-[6cqw] items-center justify-center rounded-full border border-white/70 bg-black/20 text-[2.6cqw] text-white backdrop-blur transition hover:bg-white hover:text-black disabled:opacity-25"
              >
                ‹
              </button>
              <button
                onClick={() => moveRail(1)}
                disabled={rail === K - 1}
                aria-label="Herramienta siguiente"
                className="absolute right-[1.2%] top-[47%] flex h-[6cqw] w-[6cqw] items-center justify-center rounded-full border border-white/70 bg-black/20 text-[2.6cqw] text-white backdrop-blur transition hover:bg-white hover:text-black disabled:opacity-25"
              >
                ›
              </button>
              <div className="absolute inset-x-0 top-[79%] flex flex-col items-center gap-[1.2cqw]" style={{ fontFamily: BODY }}>
                <div className="flex gap-[0.7cqw]">
                  {SHOWCASE_TOOLS.map((t, k) => (
                    <button
                      key={t.id}
                      onClick={() => pickRail(k)}
                      aria-label={t.name}
                      className={`h-[0.45cqw] rounded-full transition-all duration-500 ${k === rail ? 'w-[2.6cqw] bg-white' : 'w-[0.9cqw] bg-white/40 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
                <p className="text-[0.9cqw] uppercase tracking-[0.3em] text-white/80">
                  ← → elige · clic en la central para abrirla
                </p>
                <button
                  onClick={() => go(4)}
                  className="border border-white/80 px-[2.4cqw] py-[0.7cqw] text-[1cqw] uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
                >
                  Abrir {SHOWCASE_TOOLS[rail].short} →
                </button>
              </div>
            </motion.div>
          )}
          {n >= 7 && n <= 9 && (
            <motion.div
              key="panes"
              className="absolute left-[40%] top-[8.6%] z-10 flex gap-[1.6cqw]"
              style={{ fontFamily: BODY }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {PANES.map((pane) => (
                <button
                  key={pane.id}
                  onClick={() => go(pane.slide)}
                  className={`whitespace-nowrap border px-[1.4cqw] py-[0.5cqw] text-[0.95cqw] uppercase tracking-[0.25em] transition ${
                    n === pane.slide ? 'border-white bg-white text-black' : 'border-white/60 text-white hover:border-white hover:bg-white/15'
                  }`}
                >
                  {pane.label}
                </button>
              ))}
            </motion.div>
          )}
          {(n === 5 || n === 6) && (
            <motion.div
              key={`nav${n}`}
              className="absolute inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              {(() => {
                const sel = n === 5 ? rail : (spotPick ?? rail);
                const prev = () => (n === 5 ? moveRail(-1) : moveSpot(-1));
                const next = () => (n === 5 ? moveRail(1) : moveSpot(1));
                const chev = 'absolute top-[47%] flex h-[4.4cqw] w-[4.4cqw] items-center justify-center rounded-full border border-white/70 bg-black/20 text-[2cqw] text-white backdrop-blur transition hover:bg-white hover:text-black disabled:opacity-25';
                return (
                  <>
                    <button onClick={prev} disabled={sel === 0} aria-label="Herramienta anterior" className={`${chev} ${n === 5 ? 'left-[0.6%]' : 'left-[0.6%] top-[30%]'}`}>‹</button>
                    <button onClick={next} disabled={sel === K - 1} aria-label="Herramienta siguiente" className={`${chev} ${n === 5 ? 'right-[0.6%]' : 'right-[0.6%] top-[30%]'}`}>›</button>
                    <div className={`absolute inset-x-0 flex items-center ${n === 5 ? 'top-[82%] flex-col gap-[1cqw]' : 'top-[91%] justify-center gap-[2cqw]'}`} style={{ fontFamily: BODY }}>
                      <p className="text-[0.9cqw] uppercase tracking-[0.3em] text-white/80">
                        {n === 5 ? '← → o mouse para expandir · clic para fijar · otro clic para abrir' : '← → cambia de herramienta'}
                      </p>
                      {n === 5 && (
                        <button
                          onClick={() => openSpot(rail)}
                          className="border border-white/80 px-[2.4cqw] py-[0.7cqw] text-[1cqw] uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
                        >
                          Abrir {SHOWCASE_TOOLS[rail].short} →
                        </button>
                      )}
                      {n === 6 && (
                        <Link
                          href={SHOWCASE_TOOLS[sel].href}
                          className="border border-white/80 px-[2.4cqw] py-[0.7cqw] text-[1cqw] uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
                        >
                          Ir a {SHOWCASE_TOOLS[sel].short} →
                        </Link>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Minimal player chrome: fades out while you watch. */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 flex items-center justify-center gap-5 pb-[calc(env(safe-area-inset-bottom)+14px)] transition-opacity duration-700"
        style={{ opacity: idle ? 0 : 1, fontFamily: BODY }}
      >
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/15 bg-black/45 px-4 py-1.5 text-white backdrop-blur-md">
          <button onClick={() => step(-1)} disabled={n === 1} className="px-1 text-lg leading-none disabled:opacity-30" aria-label="Anterior">‹</button>
          <div className="flex gap-1">
            {dots.map((i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === n ? 'w-5 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/70'}`}
                aria-label={`Ir a la diapositiva ${i}`}
              />
            ))}
          </div>
          <button onClick={() => step(1)} disabled={n === SLIDE_COUNT} className="px-1 text-lg leading-none disabled:opacity-30" aria-label="Siguiente">›</button>
          <span className="w-px self-stretch bg-white/20" />
          <button onClick={() => void toggleFullscreen()} className="text-xs tracking-widest text-white" aria-label="Pantalla completa">⛶</button>
        </div>
      </div>
    </div>
  );
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    /* fullscreen not allowed — ignore */
  }
}
