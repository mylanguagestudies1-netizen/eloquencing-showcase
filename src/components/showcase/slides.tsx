'use client';

import Link from '@/lib/ExtLink';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ToolArt } from './ToolArt';
import { SHOWCASE_TOOLS, type ShowcaseTool } from './tools';

export interface SlideProps {
  sel: number;
  setSel: (i: number) => void;
  go: (slide: number) => void;
  /** Low-resources mode: cheaper effects, no continuous animation. */
  low?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const tools = SHOWCASE_TOOLS;

/** Soft glowing bubble with a label — the "Nate Jacobs" orbs of the reference. */
function OrbLabel({ children, size = 120, className = '', style }: { children: React.ReactNode; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`pointer-events-none absolute flex items-center justify-center ${className}`} style={{ width: size, height: size, ...style }}>
      <span className="sc-orb absolute inset-0 rounded-full" />
      <span className="sc-display relative text-center text-sm leading-tight text-white drop-shadow md:text-base">{children}</span>
    </div>
  );
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// ── 0 · Cover ─────────────────────────────────────────────────────────────
export function CoverSlide({ go }: SlideProps) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
      <Reveal delay={0.2}>
        <p className="sc-display mb-4 text-xs uppercase tracking-[0.5em] text-white/80 md:text-sm">Presentamos</p>
      </Reveal>
      <Reveal delay={0.45}>
        <h1 className="sc-thin text-[15vw] leading-none text-white md:text-[9rem]">eloquencing</h1>
      </Reveal>
      <Reveal delay={0.8}>
        <p className="sc-display mt-6 max-w-xl text-base text-white md:text-xl">
          Diez herramientas. Un solo idioma: el que quieres hablar.
        </p>
      </Reveal>
      <Reveal delay={1.1}>
        <button
          onClick={() => go(1)}
          className="sc-frame sc-display mt-10 rounded-sm px-10 py-3 text-sm uppercase tracking-[0.35em] text-white transition hover:bg-white/10"
        >
          Entrar
        </button>
      </Reveal>
      <motion.div
        className="absolute inset-x-0 bottom-6 overflow-hidden whitespace-nowrap text-white/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1.2 }}
      >
        <motion.div
          className="sc-thin inline-block text-4xl md:text-6xl"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          {[...tools, ...tools].map((t, i) => (
            <span key={i} className="mx-8">{t.name}</span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── 1 · Carousel ("Temporadas" / "Episodio") ──────────────────────────────
export function CarouselSlide({ sel, setSel, go, low }: SlideProps) {
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    if (low) return;
    const id = window.setInterval(() => setSel((sel + 1) % tools.length), 3800);
    return () => window.clearInterval(id);
  }, [auto, sel, setSel, low]);

  return (
    <div className="relative flex h-full flex-col justify-center">
      <Reveal className="mb-8 text-center md:mb-12">
        <h2 className="sc-display text-3xl text-white md:text-4xl">Herramientas</h2>
      </Reveal>
      <div
        className="relative h-[46vh] max-h-[440px] min-h-[280px] w-full [--cw:78vw] [--gap:18px] md:[--cw:min(36vw,560px)] md:[--gap:28px]"
        onPointerDown={() => setAuto(false)}
      >
        {tools.map((t, i) => {
          const offset = i - sel;
          const active = offset === 0;
          if (Math.abs(offset) > 3) return null;
          return (
            <button
              key={t.id}
              onClick={() => (active ? go(2) : setSel(i))}
              className="absolute left-1/2 top-0 flex w-[var(--cw)] flex-col items-center text-center"
              style={{
                transform: `translateX(calc(-50% + ${offset} * (var(--cw) + var(--gap)))) scale(${active ? 1 : 0.9})`,
                transition: 'transform 900ms cubic-bezier(.22,1,.36,1), opacity 900ms',
                opacity: Math.abs(offset) > 1 ? 0.45 : 1,
                zIndex: 10 - Math.abs(offset),
              }}
              aria-label={active ? `Ver ${t.name}` : `Seleccionar ${t.name}`}
            >
              <div className={`relative aspect-[16/9] w-full p-2 transition-shadow duration-700 ${active ? 'sc-frame' : ''}`}>
                <div className="relative h-full w-full overflow-hidden">
                  <ToolArt tool={t} />
                  <span className="sc-thin absolute inset-0 flex items-center justify-center text-[7rem] leading-none text-white drop-shadow-[0_6px_30px_rgba(0,0,0,.5)] md:text-[9rem]">
                    {i + 1}
                  </span>
                </div>
              </div>
              <p className="sc-display mt-5 text-2xl text-white md:text-3xl">{t.name}</p>
              <p className={`mx-auto mt-2 max-w-md text-xs leading-relaxed text-white transition-opacity duration-700 md:text-sm ${active ? 'opacity-100' : 'opacity-70'}`}>
                {t.description}
              </p>
            </button>
          );
        })}
      </div>
      <div className="mt-24 flex items-center justify-center gap-2 md:mt-28">
        {tools.map((t, i) => (
          <button
            key={t.id}
            onClick={() => { setAuto(false); setSel(i); }}
            className={`h-1 rounded-full transition-all duration-500 ${i === sel ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'}`}
            aria-label={t.name}
          />
        ))}
      </div>
    </div>
  );
}

// ── 2 · Focus (a single framed episode + orb) ─────────────────────────────
export function FocusSlide({ sel, setSel }: SlideProps) {
  const t = tools[sel];
  return (
    <div className="relative flex h-full items-center justify-center px-4">
      <motion.div
        key={t.id}
        className="sc-frame relative aspect-[16/10] w-full max-w-5xl p-2 md:aspect-[16/9] md:p-3"
        initial={{ scale: 0.8, opacity: 0, filter: 'blur(12px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <div className="relative h-full w-full overflow-hidden">
          <ToolArt tool={t} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-5 pt-24 md:p-10 md:pt-32">
            <Reveal delay={0.35}>
              <p className="sc-display text-xs uppercase tracking-[0.4em] text-white/80">Herramienta {String(sel + 1).padStart(2, '0')}</p>
              <h2 className="sc-display mt-2 text-3xl text-white md:text-5xl">{t.name}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white md:text-base">{t.description}</p>
              <Link
                href={t.href}
                className="sc-display mt-5 inline-flex items-center gap-3 border border-white/80 px-6 py-2.5 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-slate-900"
              >
                Abrir <span aria-hidden>→</span>
              </Link>
            </Reveal>
          </div>
        </div>
        <OrbLabel size={150} className="sc-float -right-6 top-[14%] hidden md:flex" key={`orb-${t.id}`}>
          {t.tagline}
        </OrbLabel>
      </motion.div>
      <button onClick={() => setSel((sel - 1 + tools.length) % tools.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-3xl text-white/70 transition hover:text-white md:left-8" aria-label="Anterior">‹</button>
      <button onClick={() => setSel((sel + 1) % tools.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-3xl text-white/70 transition hover:text-white md:right-8" aria-label="Siguiente">›</button>
    </div>
  );
}

// ── 3 · Portrait strips ("Personajes") ────────────────────────────────────
export function StripsSlide({ sel, setSel, go, low }: SlideProps) {
  const [hover, setHover] = useState<number | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const orbTops = [62, 78, 66, 84, 70, 86, 64, 80, 68, 82];
  return (
    <div className="relative flex h-full flex-col justify-center px-4 md:px-16">
      <Reveal className="mb-6 md:ml-24">
        <h2 className="sc-display text-3xl text-white md:text-4xl">Personajes</h2>
        <p className="mt-1 text-sm text-white">Cada herramienta tiene su propia historia.</p>
      </Reveal>
      <div className="flex items-stretch gap-4">
        <span className="hidden w-3 shrink-0 border border-white/80 md:block" />
        {/* Hover is resolved from the pointer's x over FIXED equal slots, never
            from the strips themselves — they change width while animating, and
            hit-testing them made the strip under the cursor shrink/grow in a
            feedback loop (the "retroceso"). */}
        <div
          ref={rowRef}
          className="flex h-[58vh] max-h-[520px] min-h-[320px] w-full gap-2 overflow-x-auto md:gap-3 md:overflow-visible"
          onPointerMove={(e) => {
            if (e.pointerType !== 'mouse') return;
            const r = rowRef.current?.getBoundingClientRect();
            if (!r) return;
            const i = Math.min(tools.length - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * tools.length)));
            setHover((h) => (h === i ? h : i));
          }}
          onPointerLeave={() => setHover(null)}
        >
          {tools.map((t, i) => {
            const active = hover === i || (hover === null && i === sel);
            const dim = hover !== null && hover !== i;
            const grow = low ? 1 : hover === null ? (i === sel ? 1.8 : 1) : hover === i ? 2.6 : 0.85;
            return (
              <motion.button
                key={t.id}
                onClick={() => { setSel(i); go(4); }}
                className={`sc-strip relative min-w-[120px] overflow-hidden text-left md:min-w-0 ${active ? '' : 'sc-still'}`}
                style={{ flexGrow: grow, flexBasis: 0, zIndex: active ? 2 : 1, transition: low ? undefined : 'flex-grow 800ms cubic-bezier(.22,1,.36,1)' }}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: i % 2 ? 8 : -8 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.07, ease: EASE }}
                aria-label={t.name}
              >
                {/* The scene has a FIXED size and is centered; the strip just crops
                    it more or less as its width animates, so the art is never
                    re-laid-out or repainted mid-animation (that was the lag). */}
                <div
                  className="absolute inset-y-0 left-1/2"
                  style={{
                    width: 'clamp(190px, 23vw, 360px)',
                    transform: low ? `translateX(-50%) scale(${active ? 1.06 : 1})` : 'translateX(-50%)',
                    filter: dim ? 'brightness(.72) saturate(.85)' : 'none',
                    transition: low ? 'transform 500ms cubic-bezier(.22,1,.36,1), filter 500ms ease' : 'filter 600ms ease',
                    willChange: 'transform',
                    contain: 'layout paint',
                  }}
                >
                  <ToolArt tool={t} />
                  <OrbLabel size={112} className="left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: `${orbTops[i]}%` }}>
                    {t.short}
                  </OrbLabel>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 4 · Spotlight ("Rue Bennett") ─────────────────────────────────────────
export function SpotlightSlide({ sel }: SlideProps) {
  const t = tools[sel];
  const [first, ...rest] = t.name.split(' ');
  return (
    <div className="relative flex h-full items-center px-4 md:px-16">
      <span className="absolute left-4 top-[18%] hidden h-[62%] w-3 border border-white/80 md:left-12 md:block" />
      <div className="relative w-full md:ml-16">
        <Reveal>
          <p className="sc-display mb-3 text-2xl text-white md:text-3xl">Herramienta</p>
        </Reveal>
        <motion.div
          key={t.id}
          className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[16/9] md:w-[78%]"
          initial={{ opacity: 0, x: -60, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: EASE }}
        >
          <ToolArt tool={t} />
          <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2 md:inset-x-6 md:bottom-6 md:w-[70%] md:gap-3">
            {t.features.map((f, i) => (
              <motion.div
                key={f}
                className="relative aspect-[16/10] overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.12, ease: EASE }}
              >
                <ToolArt tool={tools[(sel + i + 1) % tools.length]} detail={false} />
                <span className="absolute inset-0 flex items-center justify-center bg-black/25 px-2 text-center text-[11px] font-medium text-white md:text-sm">{f}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div className="pointer-events-none absolute right-0 top-[8%] max-w-[92%] text-right md:top-[16%] md:max-w-[46%] md:text-left">
          <OrbLabel size={170} className="sc-float -top-10 right-10 opacity-80">{' '}</OrbLabel>
          <Reveal delay={0.25}>
            <h2 className="sc-thin relative text-5xl leading-[0.95] text-white drop-shadow-[0_8px_40px_rgba(0,0,0,.5)] md:text-8xl">
              {first}
              {rest.length > 0 && <><br />{rest.join(' ')}</>}
            </h2>
          </Reveal>
          <Reveal delay={0.45}>
            <p className="relative mt-4 hidden max-w-sm text-sm leading-relaxed text-white md:block">{t.description}</p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

// ── 5 · Collage ("Rue / Jules · Maddy / Nate / Cassie") ───────────────────
export function CollageSlide({ setSel, go }: SlideProps) {
  const pick = (id: ShowcaseTool['id']) => tools.findIndex((t) => t.id === id);
  const combo = [
    { verb: 'Canta', id: 'lyrics' as const },
    { verb: 'Lee', id: 'stories' as const },
    { verb: 'Habla', id: 'livetalk' as const },
  ];
  return (
    <div className="relative flex h-full items-center px-4 md:px-16">
      <span className="absolute left-12 top-[22%] hidden h-[58%] w-3 border border-white/80 md:block" />
      <div className="relative w-full md:ml-16">
        <Reveal><h2 className="sc-display mb-3 text-2xl text-white md:text-3xl">Combínalas</h2></Reveal>
        <div className="flex h-[60vh] max-h-[540px] min-h-[340px] gap-2 md:gap-3">
          <motion.div className="relative w-1/4 overflow-hidden" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: EASE }}>
            <ToolArt tool={tools[pick('stories')]} />
          </motion.div>
          <motion.div className="relative flex-1 overflow-hidden" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.1, ease: EASE }}>
            <ToolArt tool={tools[pick('lyrics')]} detail={false} />
            <div className="absolute inset-0 flex flex-col items-end justify-center gap-1 pr-6 md:pr-14">
              {combo.map((c, i) => (
                <motion.button
                  key={c.id}
                  onClick={() => { setSel(pick(c.id)); go(4); }}
                  className="group flex items-baseline gap-3 text-right"
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.9, delay: 0.35 + i * 0.18, ease: EASE }}
                >
                  <span className="sc-display text-sm text-white md:text-lg">{tools[pick(c.id)].short}</span>
                  <span className="sc-thin text-6xl leading-none text-white transition group-hover:tracking-[0.08em] md:text-[8.5rem]">
                    {i > 0 && <span className="text-white/60">/</span>}
                    {c.verb}
                  </span>
                </motion.button>
              ))}
            </div>
            <OrbLabel size={140} className="sc-float bottom-[18%] left-[44%]">{' '}</OrbLabel>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ── 6 · Chat (Fez ↔ Lexi) ─────────────────────────────────────────────────
const CHAT = [
  { me: false, text: 'Ready for our call?' },
  { me: true, text: 'Yes, OMW' },
  { me: false, text: 'I kept you the best topic..' },
  { me: true, text: 'Travel?' },
  { me: true, text: '…' },
];

export function ChatSlide() {
  const lt = tools.find((t) => t.id === 'livetalk')!;
  const vc = tools.find((t) => t.id === 'vocabchat')!;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= CHAT.length) return;
    const id = window.setTimeout(() => setShown((n) => n + 1), shown === 0 ? 700 : 1100);
    return () => window.clearTimeout(id);
  }, [shown]);

  return (
    <div className="absolute inset-0 flex">
      <motion.div className="relative hidden w-[27%] overflow-hidden md:block" initial={{ x: '-100%' }} animate={{ x: 0 }} transition={{ duration: 1.1, ease: EASE }}>
        <ToolArt tool={lt} />
      </motion.div>
      <div className="relative flex flex-1 flex-col justify-center gap-6 px-6 md:px-14">
        <Reveal><p className="sc-display text-xs uppercase tracking-[0.4em] text-white/80">Live Talk AI · Vocab Chat</p></Reveal>
        {CHAT.slice(0, shown).map((m, i) => (
          <motion.div
            key={i}
            className={`sc-display max-w-[70%] rounded-lg px-8 py-3 text-center text-lg md:text-xl ${
              m.me
                ? 'self-end bg-gradient-to-b from-[#0b0620] to-[#5b21b6] text-white'
                : 'self-start bg-gradient-to-b from-slate-100 to-indigo-200 text-slate-700'
            }`}
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {m.text}
          </motion.div>
        ))}
        <motion.span
          className="absolute inset-x-6 bottom-[12%] h-2 border border-white/80 md:inset-x-14"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: shown / CHAT.length }}
          style={{ transformOrigin: 'left' }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </div>
      <motion.div className="relative hidden w-[25%] overflow-hidden md:block" initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ duration: 1.1, ease: EASE }}>
        <ToolArt tool={vc} />
      </motion.div>
    </div>
  );
}

// ── 7 · Circles (the whole cast) ──────────────────────────────────────────
export function CirclesSlide({ setSel, go }: SlideProps) {
  const sizes = [176, 132, 150, 112, 164, 124, 160, 144, 168, 138];
  const rows = [tools.slice(0, 5), tools.slice(5)];
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 px-4 md:gap-10">
      {rows.map((row, r) => (
        <div key={r} className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
          {row.map((t, j) => {
            const i = r * 5 + j;
            return (
              <motion.button
                key={t.id}
                onClick={() => { setSel(i); go(4); }}
                className="group relative shrink-0 overflow-hidden rounded-full"
                style={{ width: `clamp(64px, ${sizes[i] / 11}vw, ${sizes[i]}px)`, aspectRatio: '1' }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: EASE }}
                whileHover={{ scale: 1.08 }}
                aria-label={t.name}
              >
                <ToolArt tool={t} />
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 px-2 text-center text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 md:text-sm">
                  {t.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      ))}
      <Reveal delay={1.2} className="w-full max-w-5xl">
        <Link
          href="/dashboard"
          className="sc-frame sc-display mt-4 flex w-full items-center justify-center gap-4 py-4 text-sm uppercase tracking-[0.4em] text-white transition hover:bg-white/10 md:mt-8"
        >
          Empieza ahora <span aria-hidden>→</span>
        </Link>
      </Reveal>
    </div>
  );
}
