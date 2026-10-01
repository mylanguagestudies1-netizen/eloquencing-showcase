'use client';

import './showcase.css';
import Link from '@/lib/ExtLink';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CarouselSlide,
  ChatSlide,
  CirclesSlide,
  CollageSlide,
  CoverSlide,
  FocusSlide,
  SpotlightSlide,
  StripsSlide,
  type SlideProps,
} from './slides';
import { SHOWCASE_TOOLS } from './tools';

const SLIDES: { name: string; Component: (p: SlideProps) => React.ReactNode }[] = [
  { name: 'Portada', Component: CoverSlide },
  { name: 'Herramientas', Component: CarouselSlide },
  { name: 'Enfoque', Component: FocusSlide },
  { name: 'Personajes', Component: StripsSlide },
  { name: 'Herramienta', Component: SpotlightSlide },
  { name: 'Combínalas', Component: CollageSlide },
  { name: 'Conversación', Component: ChatSlide },
  { name: 'Todas', Component: CirclesSlide },
];

// Background decoration per slide: where the half-discs sit, like the
// reference moving them around between slides.
const DISCS: { left: string; top: string; size: string; right: string; rTop: string; rSize: string }[] = [
  { left: '-18vw', top: '20vh', size: '42vw', right: '-22vw', rTop: '30vh', rSize: '40vw' },
  { left: '-16vw', top: '25vh', size: '32vw', right: '-14vw', rTop: '28vh', rSize: '30vw' },
  { left: '-30vw', top: '10vh', size: '20vw', right: '-4vw', rTop: '76vh', rSize: '12vw' },
  { left: '-24vw', top: '30vh', size: '26vw', right: '-4vw', rTop: '74vh', rSize: '12vw' },
  { left: '-24vw', top: '30vh', size: '26vw', right: '-4vw', rTop: '74vh', rSize: '12vw' },
  { left: '-26vw', top: '30vh', size: '26vw', right: '-4vw', rTop: '74vh', rSize: '12vw' },
  { left: '-30vw', top: '30vh', size: '20vw', right: '-4vw', rTop: '72vh', rSize: '12vw' },
  { left: '-30vw', top: '30vh', size: '20vw', right: '-30vw', rTop: '72vh', rSize: '12vw' },
];

export default function ShowcaseClient() {
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const [sel, setSelRaw] = useState(0);
  const [low, setLow] = useState(false);
  const lock = useRef(0);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback((next: number) => {
    setSlide((cur) => {
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
      setDir(clamped >= cur ? 1 : -1);
      return clamped;
    });
  }, []);
  const step = useCallback((d: number) => {
    const now = Date.now();
    if (now - lock.current < 850) return;
    lock.current = now;
    setSlide((cur) => {
      const next = Math.max(0, Math.min(SLIDES.length - 1, cur + d));
      setDir(d);
      return next;
    });
  }, []);
  const setSel = useCallback((i: number) => setSelRaw(((i % SHOWCASE_TOOLS.length) + SHOWCASE_TOOLS.length) % SHOWCASE_TOOLS.length), []);

  // Off by default. Only restores what the viewer chose themselves last time.
  useEffect(() => {
    try {
      if (localStorage.getItem('showcase-low') === '1') setLow(true);
    } catch { /* storage blocked */ }
  }, []);
  const toggleLow = () => setLow((v) => {
    try { localStorage.setItem('showcase-low', v ? '0' : '1'); } catch { /* ignore */ }
    return !v;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input,textarea,[contenteditable="true"]')) return;
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); step(1); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSelRaw((s) => (s + 1) % SHOWCASE_TOOLS.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelRaw((s) => (s - 1 + SHOWCASE_TOOLS.length) % SHOWCASE_TOOLS.length); }
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(SLIDES.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, step]);

  const onWheel = (e: React.WheelEvent) => {
    // Let horizontally scrollable strips (mobile) keep their own scroll.
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : 0;
    if (Math.abs(delta) < 24) return;
    step(delta > 0 ? 1 : -1);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t0 = touch.current;
    touch.current = null;
    if (!t0) return;
    const dx = e.changedTouches[0].clientX - t0.x;
    const dy = e.changedTouches[0].clientY - t0.y;
    // Vertical swipes change slides; horizontal ones are left to carousels/strips.
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.3) step(dy < 0 ? 1 : -1);
  };

  const { Component } = SLIDES[slide];
  const disc = DISCS[slide];
  const cover = slide === 0;

  return (
    <div
      className={`sc-root ${low ? 'sc-lowres' : ''} fixed inset-0 z-[60] select-none overflow-hidden bg-[#1e1b4b]`}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Backdrop */}
      <div className="sc-backdrop sc-drift absolute inset-[-8%]" />
      <motion.span
        className="sc-disc absolute rounded-full"
        animate={{ left: disc.left, top: disc.top, width: disc.size, height: disc.size }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.span
        className="sc-disc absolute rounded-full"
        style={{ rotate: 180 }}
        animate={{ right: disc.right, top: disc.rTop, width: disc.rSize, height: disc.rSize }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="sc-grain absolute inset-0" />

      {/* Cinematic letterbox — closes in on the cover, opens once you enter. */}
      <motion.div className="absolute inset-x-0 top-0 z-10 bg-black" animate={{ height: cover ? '6vh' : 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
      <motion.div className="absolute inset-x-0 bottom-0 z-10 bg-black" animate={{ height: cover ? '6vh' : 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />

      {/* Chrome */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] md:px-16 md:pt-[calc(env(safe-area-inset-top)+2.5rem)]">
        <button onClick={() => go(0)} className="sc-thin text-2xl text-white/90 transition hover:text-white md:text-3xl" aria-label="Volver a la portada">
          eloquencing
        </button>
        <Link href="/dashboard" className="text-sm font-black tracking-tight text-white md:text-base">
          ELQ<span className="font-light">studio</span>
        </Link>
      </header>

      {/* Slides */}
      <main className="absolute inset-0 z-20">
        <AnimatePresence initial custom={dir}>
          <motion.section
            key={slide}
            custom={dir}
            className="absolute inset-0 pb-20 pt-20 md:pb-24 md:pt-28"
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 80, scale: 1.04, filter: 'blur(14px)' }),
              center: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
              exit: (d: number) => ({ opacity: 0, x: d * -80, scale: 0.97, filter: 'blur(14px)' }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            aria-roledescription="diapositiva"
            aria-label={`${slide + 1} de ${SLIDES.length}: ${SLIDES[slide].name}`}
          >
            <Component sel={sel} setSel={setSel} go={go} low={low} />
          </motion.section>
        </AnimatePresence>
      </main>

      {/* Footer: progress + controls */}
      <footer className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-4 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:px-16 md:pb-[calc(env(safe-area-inset-bottom)+1.75rem)]">
        <span className="sc-display w-14 text-xs tabular-nums text-white md:text-sm">
          {String(slide + 1).padStart(2, '0')} <span className="text-white/50">/ {String(SLIDES.length).padStart(2, '0')}</span>
        </span>
        <div className="flex flex-1 gap-1.5">
          {SLIDES.map((s, i) => (
            <button key={s.name} onClick={() => go(i)} className="group flex-1 py-2" aria-label={s.name}>
              <span className="block h-[2px] overflow-hidden bg-white/25">
                <motion.span className="block h-full bg-white" animate={{ width: i <= slide ? '100%' : '0%' }} transition={{ duration: 0.8 }} />
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={toggleLow}
          aria-pressed={low}
          title="Bajos recursos: menos efectos y animaciones, más fluido en equipos lentos"
          className={`hidden shrink-0 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition sm:block ${low ? 'border-white bg-white text-slate-900' : 'border-white/50 text-white hover:border-white'}`}
        >
          Bajos recursos
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => step(-1)} disabled={slide === 0} className="px-3 py-1 text-2xl text-white transition hover:scale-110 disabled:opacity-30" aria-label="Anterior">‹</button>
          <button onClick={() => step(1)} disabled={slide === SLIDES.length - 1} className="px-3 py-1 text-2xl text-white transition hover:scale-110 disabled:opacity-30" aria-label="Siguiente">›</button>
        </div>
      </footer>
      <p className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+3.6rem)] left-1/2 z-30 hidden -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-white/60 md:block">
        ← → diapositivas · ↑ ↓ herramientas
      </p>
    </div>
  );
}
