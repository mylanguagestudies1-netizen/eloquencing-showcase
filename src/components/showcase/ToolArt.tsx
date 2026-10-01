'use client';

// Code-drawn "film stills" for each showcase tool. Everything is sized in
// container units (cqmin) so the same scene works as a wide carousel frame,
// a tall portrait strip or a small circle.

import type { CSSProperties, ReactNode } from 'react';
import type { ShowcaseTool } from './tools';

const u = (n: number) => `${n}cqmin`;

function Bokeh({ color }: { color: string }) {
  const dots = [
    [12, 18, 9], [78, 12, 6], [88, 64, 11], [22, 80, 7], [55, 30, 5], [66, 86, 8], [36, 8, 4],
  ];
  return (
    <>
      {dots.map(([x, y, s], i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: u(s * 2),
            height: u(s * 2),
            background: color,
            opacity: 0.18,
            filter: `blur(${u(s / 2.5)})`,
          }}
        />
      ))}
    </>
  );
}

function Glass({ children, style, className = '' }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div
      className={`absolute border border-white/25 bg-white/10 backdrop-blur-md ${className}`}
      style={{ borderRadius: u(3), boxShadow: '0 20px 60px rgba(0,0,0,.35)', ...style }}
    >
      {children}
    </div>
  );
}

function LyricsScene() {
  return (
    <>
      <div
        className="sc-spin absolute rounded-full"
        style={{
          left: '-12%', top: '50%', width: u(70), height: u(70), marginTop: u(-35),
          background:
            'repeating-radial-gradient(circle, #0b0b12 0 1.2cqmin, #1b1b28 1.2cqmin 1.6cqmin)',
          boxShadow: '0 0 60px rgba(0,0,0,.6)',
          opacity: 0.85,
        }}
      >
        <span className="absolute rounded-full" style={{ inset: '38%', background: 'linear-gradient(135deg,#f472b6,#7e22ce)' }} />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: u(2.6), paddingLeft: u(12) }}>
        <p className="text-white/35" style={{ fontSize: u(4.2) }}>I&apos;ve been reading books of old</p>
        <p className="text-white/55" style={{ fontSize: u(5) }}>The legends and the myths</p>
        <p className="sc-karaoke font-semibold" style={{ fontSize: u(7.2) }}>Achilles and his gold</p>
        <p className="text-white/35" style={{ fontSize: u(4.2) }}>Hercules and his gifts</p>
      </div>
      <div className="absolute flex items-end" style={{ left: '50%', bottom: u(7), transform: 'translateX(-40%)', gap: u(1.2), height: u(9) }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="sc-eq block rounded-full bg-white/80" style={{ width: u(1), height: '100%', animationDelay: `${(i * 0.13) % 1.1}s` }} />
        ))}
      </div>
    </>
  );
}

function QuestionsScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Glass style={{ width: u(64), height: u(38), transform: 'rotate(-9deg) translate(-8%, -6%)', opacity: 0.5 }}>{null}</Glass>
      <Glass style={{ width: u(64), height: u(38), transform: 'rotate(6deg) translate(8%, -3%)', opacity: 0.7 }}>{null}</Glass>
      <Glass className="flex flex-col justify-between" style={{ width: u(66), height: u(40), padding: u(4.5), background: 'rgba(255,255,255,.16)' }}>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-cyan-300/90 font-bold text-slate-900" style={{ fontSize: u(2.6), padding: `${u(0.6)} ${u(2)}` }}>B1 · TRAVEL</span>
          <span className="text-white/70" style={{ fontSize: u(2.6) }}>12 / 30</span>
        </div>
        <p className="font-medium leading-tight text-white" style={{ fontSize: u(5.4) }}>
          If you could live anywhere for a year, where would it be?
        </p>
        <div className="flex items-center" style={{ gap: u(2) }}>
          <span className="relative flex items-center justify-center rounded-full bg-white" style={{ width: u(7), height: u(7) }}>
            <span className="sc-ring absolute inset-0 rounded-full border-2 border-white" />
            <span className="rounded-sm bg-blue-600" style={{ width: u(1.8), height: u(3) }} />
          </span>
          <span className="text-white/80" style={{ fontSize: u(2.8) }}>Responde en voz alta…</span>
        </div>
      </Glass>
    </div>
  );
}

function StoriesScene() {
  const line = (w: number, key: number) => (
    <span key={key} className="block rounded-full bg-amber-950/25" style={{ height: u(1.4), width: `${w}%` }} />
  );
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '900px' }}>
      <div className="relative flex" style={{ width: u(84), height: u(54), transform: 'rotateX(14deg)' }}>
        <div className="flex-1 bg-amber-50" style={{ borderRadius: `${u(2)} 0 0 ${u(2)}`, padding: u(4), boxShadow: 'inset -20px 0 30px rgba(120,53,15,.25)' }}>
          <p className="font-serif font-bold text-amber-950" style={{ fontSize: u(4) }}>Die Reise nach Berlin</p>
          <p className="mt-[1cqmin] font-serif text-amber-900" style={{ fontSize: u(2.7), lineHeight: 1.55 }}>
            Anna packt ihren Koffer. Sie spürt eine tiefe{' '}
            <span className="relative rounded bg-amber-300 px-[0.6cqmin] font-semibold text-amber-950">
              Sehnsucht
              <span
                className="sc-pop absolute left-1/2 whitespace-nowrap rounded-lg bg-slate-900 font-sans font-medium text-white"
                style={{ bottom: '130%', transform: 'translateX(-50%)', fontSize: u(2.4), padding: `${u(0.8)} ${u(1.6)}` }}
              >
                die Sehnsucht → el anhelo
              </span>
            </span>{' '}
            nach dem Meer.
          </p>
        </div>
        <div className="flex flex-1 flex-col justify-center bg-amber-50" style={{ borderRadius: `0 ${u(2)} ${u(2)} 0`, padding: u(4), gap: u(1.8), boxShadow: 'inset 20px 0 30px rgba(120,53,15,.25)' }}>
          {[92, 80, 95, 70, 88, 60, 84].map(line)}
        </div>
        <span className="absolute rounded-full bg-amber-950 font-bold text-amber-200" style={{ right: u(-3), top: u(-3), fontSize: u(2.8), padding: `${u(0.8)} ${u(2)}` }}>A2</span>
      </div>
    </div>
  );
}

function VocabularyScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[-16, -6, 5].map((r, i) => (
        <div
          key={r}
          className="absolute flex flex-col items-center justify-center bg-white"
          style={{
            width: u(38), height: u(50), borderRadius: u(3),
            transform: `rotate(${r}deg) translateX(${(i - 1) * 14}cqmin)`,
            boxShadow: '0 25px 60px rgba(0,0,0,.4)',
            opacity: i === 2 ? 1 : 0.55 + i * 0.15,
          }}
        >
          {i === 2 && (
            <>
              <span className="text-emerald-700" style={{ fontSize: u(2.6) }}>der</span>
              <span className="font-bold text-slate-900" style={{ fontSize: u(5.2) }}>Schmetterling</span>
              <span className="mt-[2cqmin] rounded-full bg-emerald-100 font-medium text-emerald-800" style={{ fontSize: u(2.6), padding: `${u(0.6)} ${u(2)}` }}>la mariposa</span>
            </>
          )}
        </div>
      ))}
      <div className="absolute flex items-center justify-center rounded-full" style={{ right: u(8), top: u(8), width: u(16), height: u(16), background: 'conic-gradient(#bef264 0 87%, rgba(255,255,255,.15) 87%)' }}>
        <span className="flex items-center justify-center rounded-full bg-emerald-950 font-bold text-white" style={{ width: u(12.5), height: u(12.5), fontSize: u(3.4) }}>87%</span>
      </div>
    </div>
  );
}

function LiveTalkScene() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: u(5) }}>
      <div className="relative" style={{ width: u(30), height: u(30) }}>
        {[0, 0.8, 1.6].map((d) => (
          <span key={d} className="sc-ring absolute inset-0 rounded-full border border-fuchsia-200/70" style={{ animationDelay: `${d}s` }} />
        ))}
        <span className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, #f5d0fe, #a855f7 45%, #3b0764)' }} />
        <span className="absolute rounded-full bg-white/60" style={{ left: '28%', top: '22%', width: '16%', height: '10%', filter: 'blur(2px)' }} />
      </div>
      <div className="flex items-center" style={{ gap: u(0.9), height: u(8) }}>
        {Array.from({ length: 26 }).map((_, i) => (
          <span key={i} className="sc-eq block rounded-full bg-white" style={{ width: u(0.9), height: '100%', animationDelay: `${(i * 0.21) % 1.1}s` }} />
        ))}
      </div>
      <Glass className="relative" style={{ position: 'relative', padding: `${u(2)} ${u(3.5)}` }}>
        <p className="text-white" style={{ fontSize: u(3.2) }}>
          “So you <i>went</i> to the beach yesterday — nice! Who did you go with?”
        </p>
      </Glass>
    </div>
  );
}

function PictureScene() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#312e81 0%,#be185d 45%,#fb923c 62%,#7c2d12 63%,#1c1917 100%)' }} />
      <span className="absolute rounded-full" style={{ left: '58%', top: '38%', width: u(22), height: u(22), background: 'radial-gradient(circle,#fef3c7,#fbbf24 55%,rgba(251,191,36,0) 72%)' }} />
      <div className="absolute inset-x-0 bottom-[37%] h-[30%] bg-[#3b0a2a]" style={{ clipPath: 'polygon(0 100%,0 55%,14% 20%,26% 60%,40% 10%,55% 65%,68% 30%,82% 70%,100% 35%,100% 100%)' }} />
      <div className="absolute inset-x-0 bottom-0 h-[37%]" style={{ background: 'linear-gradient(180deg,rgba(251,146,60,.55),rgba(28,25,23,.95))' }} />
      <span className="sc-scan absolute inset-x-0 top-0 h-[10%]" style={{ background: 'linear-gradient(180deg,rgba(254,205,211,0),rgba(254,205,211,.35),rgba(254,205,211,0))' }} />
      {[
        ['the sunset', 62, 30],
        ['a mountain range', 22, 44],
        ['calm water', 44, 80],
      ].map(([label, x, y]) => (
        <span key={label as string} className="absolute flex items-center" style={{ left: `${x}%`, top: `${y}%`, gap: u(1) }}>
          <span className="rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,.35)]" style={{ width: u(1.8), height: u(1.8) }} />
          <span className="whitespace-nowrap rounded-md bg-black/55 font-medium text-white backdrop-blur" style={{ fontSize: u(2.8), padding: `${u(0.5)} ${u(1.4)}` }}>
            {label}
          </span>
        </span>
      ))}
    </>
  );
}

function TranslatorScene() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center" style={{ padding: `0 ${u(10)}`, gap: u(4) }}>
      <div className="flex items-end self-start" style={{ gap: u(1.5) }}>
        <span className="rounded-full bg-white font-bold text-sky-800" style={{ fontSize: u(2.4), padding: `${u(0.5)} ${u(1.3)}` }}>ES</span>
        <div className="rounded-2xl rounded-bl-sm bg-white/15 text-white backdrop-blur" style={{ fontSize: u(4), padding: `${u(1.8)} ${u(3)}` }}>
          ¿Dónde está la estación?
        </div>
      </div>
      <div className="flex items-center justify-center text-white/70" style={{ fontSize: u(5) }}>⇣</div>
      <div className="flex items-end self-end" style={{ gap: u(1.5) }}>
        <div className="rounded-2xl rounded-br-sm bg-white font-medium text-slate-900" style={{ fontSize: u(4.4), padding: `${u(1.8)} ${u(3)}` }}>
          Wo ist der Bahnhof?<span className="sc-caret ml-1 inline-block bg-sky-600 align-middle" style={{ width: u(0.6), height: u(4) }} />
        </div>
        <span className="rounded-full bg-indigo-300 font-bold text-indigo-950" style={{ fontSize: u(2.4), padding: `${u(0.5)} ${u(1.3)}` }}>DE</span>
      </div>
    </div>
  );
}

function DictationScene() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: u(4) }}>
      <div className="relative overflow-hidden bg-black" style={{ width: u(78), height: u(40), borderRadius: u(2.5), boxShadow: '0 30px 60px rgba(0,0,0,.5)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(80% 90% at 30% 40%, #134e4a, #020617)' }} />
        <span className="absolute rounded-full" style={{ left: '22%', top: '18%', width: u(16), height: u(22), background: 'radial-gradient(circle at 50% 35%, #fcd9b6, #b7794a 60%, transparent 62%)' }} />
        <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 backdrop-blur" style={{ width: u(9), height: u(9) }}>
          <span style={{ borderLeft: `${u(2.6)} solid white`, borderTop: `${u(1.6)} solid transparent`, borderBottom: `${u(1.6)} solid transparent`, marginLeft: u(0.6) }} />
        </span>
        <span className="absolute inset-x-0 bottom-[8%] text-center font-semibold text-yellow-200" style={{ fontSize: u(3.4), textShadow: '0 2px 6px #000' }}>
          Ich heiße Nico. Ich komme aus Spanien.
        </span>
      </div>
      <div className="flex items-center rounded-xl border border-white/30 bg-white/10 text-white backdrop-blur" style={{ width: u(78), fontSize: u(3.4), padding: `${u(1.6)} ${u(2.4)}` }}>
        Ich heiße Nico. Ich kom<span className="sc-caret inline-block bg-white" style={{ width: u(0.5), height: u(3.6) }} />
      </div>
    </div>
  );
}

function VocabChatScene() {
  const avatar = (bg: string, name: string) => (
    <div className="flex flex-col items-center" style={{ gap: u(1.5) }}>
      <div className="sc-float relative rounded-full" style={{ width: u(22), height: u(22), background: bg, boxShadow: '0 20px 40px rgba(0,0,0,.35)' }}>
        <span className="absolute rounded-full bg-slate-900" style={{ left: '32%', top: '42%', width: '9%', height: '12%' }} />
        <span className="absolute rounded-full bg-slate-900" style={{ right: '32%', top: '42%', width: '9%', height: '12%' }} />
        <span className="absolute left-1/2 -translate-x-1/2 rounded-b-full border-b-[0.8cqmin] border-slate-900" style={{ top: '60%', width: '26%', height: '10%' }} />
      </div>
      <span className="font-semibold text-white" style={{ fontSize: u(3.2) }}>{name}</span>
    </div>
  );
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: u(4) }}>
      <div className="flex" style={{ gap: u(16) }}>
        {avatar('radial-gradient(circle at 35% 30%,#fbcfe8,#ec4899)', 'Mia')}
        {avatar('radial-gradient(circle at 35% 30%,#ddd6fe,#7c3aed)', 'Leo')}
      </div>
      <Glass style={{ position: 'relative', padding: `${u(1.8)} ${u(3)}` }}>
        <p className="text-white" style={{ fontSize: u(3.2) }}>
          That was a <b className="text-pink-200">remarkable</b> decision — why did you make it?
        </p>
      </Glass>
    </div>
  );
}

function CancioneroScene() {
  const rows: [string, string][] = [
    ['G            Em', 'Here comes the sun, doo-doo-doo'],
    ['C             D', 'Here comes the sun, and I say'],
    ['G     Em    C', "It's all right"],
  ];
  return (
    <>
      <div className="absolute inset-y-0 right-[6%] flex flex-col justify-center opacity-40" style={{ gap: u(3) }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="block bg-amber-100" style={{ width: u(40), height: `${0.3 + i * 0.12}cqmin` }} />
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingLeft: u(10), gap: u(3) }}>
        <span className="self-start rounded-full bg-amber-300 font-bold text-amber-950" style={{ fontSize: u(2.6), padding: `${u(0.5)} ${u(1.8)}` }}>CAPO 7</span>
        {rows.map(([chords, words]) => (
          <div key={words} className="font-mono leading-tight">
            <p className="whitespace-pre font-bold text-amber-300" style={{ fontSize: u(3.6) }}>{chords}</p>
            <p className="text-white" style={{ fontSize: u(4.4) }}>{words}</p>
          </div>
        ))}
      </div>
    </>
  );
}

const SCENES: Record<ShowcaseTool['id'], () => ReactNode> = {
  lyrics: LyricsScene,
  questions: QuestionsScene,
  stories: StoriesScene,
  vocabulary: VocabularyScene,
  livetalk: LiveTalkScene,
  picture: PictureScene,
  translator: TranslatorScene,
  dictation: DictationScene,
  vocabchat: VocabChatScene,
  cancionero: CancioneroScene,
};

export function ToolArt({ tool, detail = true }: { tool: ShowcaseTool; detail?: boolean }) {
  const { from, via, to, glow } = tool.palette;
  const Scene = SCENES[tool.id];
  return (
    <div className="sc-art" aria-hidden>
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${from} 0%, ${via} 55%, ${to} 120%)` }} />
      <div className="sc-drift absolute inset-[-20%]" style={{ background: `radial-gradient(40% 40% at 70% 30%, ${glow}55, transparent 70%)` }} />
      <Bokeh color={glow} />
      {detail && <Scene />}
      <div className="sc-art-vignette absolute inset-0" />
      <div className="sc-grain absolute inset-0" />
    </div>
  );
}
