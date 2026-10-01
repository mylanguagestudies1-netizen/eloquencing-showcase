'use client';

// Extra "photos" for the v2 deck, on top of v1's ToolArt scenes:
// - ComboArt: several tools blended into one still (the duo/trio shots).
// - PortraitArt: the two chat characters (Mia & Leo from Vocab Chat).
// All sizes are container units so the art survives the morph from a
// full-height portrait to a small circle.

import { ToolArt } from '../showcase/ToolArt';
import { SHOWCASE_TOOLS, type ToolArtKind } from '../showcase/tools';

const u = (n: number) => `${n}cqmin`;
const byId = (id: ToolArtKind) => SHOWCASE_TOOLS.find((t) => t.id === id)!;

export type ArtSpec =
  | { tool: ToolArtKind }
  | { combo: ToolArtKind[] }
  | { portrait: 'mia' | 'leo' };

export function ComboArt({ ids }: { ids: ToolArtKind[] }) {
  return (
    <div className="absolute inset-0 flex bg-black">
      {ids.map((id) => (
        <div key={id} className="relative h-full flex-1 overflow-hidden">
          <ToolArt tool={byId(id)} />
        </div>
      ))}
      {/* One grade over everything so the panels read as a single frame. */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(76,29,149,.18), rgba(15,10,40,.35))', mixBlendMode: 'multiply' }} />
    </div>
  );
}

export function PortraitArt({ who }: { who: 'mia' | 'leo' }) {
  const mia = who === 'mia';
  return (
    <div className="sc-art" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: mia
            ? 'radial-gradient(90% 70% at 50% 35%, #7a3b2e 0%, #3b1414 55%, #120606 100%)'
            : 'radial-gradient(90% 70% at 50% 35%, #2b3a44 0%, #10181f 60%, #05080b 100%)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: u(78), height: u(110) }}>
          {/* shoulders */}
          <span
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: u(-8), width: u(92), height: u(34), borderRadius: `${u(40)} ${u(40)} 0 0`,
              background: mia ? 'linear-gradient(180deg,#d4843c,#8a3b16)' : 'linear-gradient(180deg,#0e7490,#0b3b4a)',
            }}
          />
          {/* neck */}
          <span className="absolute left-1/2 -translate-x-1/2" style={{ top: u(62), width: u(16), height: u(20), background: mia ? '#c98763' : '#e0ad8c', borderRadius: u(4) }} />
          {/* hair behind */}
          {mia && (
            <span className="absolute left-1/2 -translate-x-1/2" style={{ top: u(4), width: u(64), height: u(76), borderRadius: '48% 48% 40% 40%', background: 'radial-gradient(circle at 50% 30%, #4a2a1c, #22110a)' }} />
          )}
          {/* head */}
          <span
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: u(10), width: u(48), height: u(58), borderRadius: '46% 46% 48% 48%',
              background: mia ? 'radial-gradient(circle at 45% 38%, #f6c9a4, #c9865f 75%)' : 'radial-gradient(circle at 45% 38%, #f7d3bb, #cf9776 75%)',
              boxShadow: 'inset -2cqmin -3cqmin 6cqmin rgba(0,0,0,.25)',
            }}
          >
            {/* eyes */}
            {[32, 68].map((x) => (
              <span key={x} className="absolute rounded-full" style={{ left: `${x}%`, top: '44%', width: u(6), height: u(4.4), transform: 'translate(-50%,-50%)', background: mia ? '#2a160c' : '#4f7f8f' }}>
                <span className="absolute rounded-full bg-white/80" style={{ right: '20%', top: '18%', width: u(1.4), height: u(1.4) }} />
              </span>
            ))}
            {/* brows */}
            {[32, 68].map((x) => (
              <span key={`b${x}`} className="absolute" style={{ left: `${x}%`, top: '33%', width: u(9), height: u(1.4), transform: 'translateX(-50%)', borderRadius: u(1), background: mia ? '#2a160c' : '#8a5a3a' }} />
            ))}
            {/* smile / mouth */}
            <span
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: mia ? '66%' : '70%', width: mia ? u(16) : u(10), height: mia ? u(6) : u(2),
                borderRadius: mia ? `0 0 ${u(10)} ${u(10)}` : u(2),
                background: mia ? '#a3303a' : '#9a5a4a',
              }}
            />
            {mia && [22, 78].map((x) => (
              <span key={`c${x}`} className="absolute rounded-full" style={{ left: `${x}%`, top: '60%', width: u(8), height: u(4), transform: 'translateX(-50%)', background: 'rgba(236,72,153,.28)', filter: 'blur(1cqmin)' }} />
            ))}
            {/* beard for Leo */}
            {!mia && (
              <span className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '-4%', width: '96%', height: '46%', borderRadius: '0 0 50% 50%', background: 'radial-gradient(circle at 50% 20%, rgba(150,78,40,.0) 30%, rgba(150,78,40,.85) 55%)' }} />
            )}
          </span>
          {/* hair on top */}
          {mia ? (
            <span className="absolute left-1/2 -translate-x-1/2" style={{ top: u(6), width: u(52), height: u(22), borderRadius: '50% 50% 30% 30%', background: 'linear-gradient(180deg,#3a2014,#5a3320)' }} />
          ) : (
            <span className="absolute left-1/2 -translate-x-1/2" style={{ top: u(8.5), width: u(46), height: u(14), borderRadius: '50% 50% 20% 20%', background: 'repeating-linear-gradient(90deg,#6b4a33 0 0.6cqmin,#8a6448 0.6cqmin 1.2cqmin)', opacity: 0.9 }} />
          )}
        </div>
      </div>
      <div className="sc-art-vignette absolute inset-0" />
      <div className="sc-grain absolute inset-0" />
    </div>
  );
}

export function Art({ spec }: { spec: ArtSpec }) {
  if ('tool' in spec) return <ToolArt tool={byId(spec.tool)} />;
  if ('combo' in spec) return <ComboArt ids={spec.combo} />;
  return <PortraitArt who={spec.portrait} />;
}
