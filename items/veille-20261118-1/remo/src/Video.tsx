import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';
import timing from './timing.json';

const {fontFamily} = loadFont('normal', {weights: ['700']});
const FPS = 30;
const VOICE_END = timing[timing.length - 1][1];
export const TOTAL = Math.round((VOICE_END + 2.0) * FPS);
const Y = '#FFD628', PINK = '#FF5FA2', BLUE = '#5ECBFF', DARK = '#281450';

const LINES = [
  'Savais-tu que ce jeu gratuit', 'est déjà numéro trois sur Steam ?', "Il s'appelle Rob Run.", 'Sorti le quatre novembre,',
  'en accès anticipé.', 'Il vient du studio Kefir.', 'Seize jours plus tard,', 'quatre cent quarante-huit mille joueurs en même temps !',
  'Son record du jour : presque cinq cent mille !', 'Un départ de folie pour un jeu tout neuf !', 'Jusqu\'à cinq mille joueurs se croisent dans le même monde.',
  'Seuls Counter-Strike 2 et Dota 2 font mieux.', 'Le numéro un dépasse le million de joueurs.', 'Mais Rob Run dépasse déjà PUBG,',
  'qui en compte trois cent quarante-quatre mille.', 'Tout ça en seize jours seulement !', 'Et il est gratuit !', "Jusqu'où va-t-il monter ?",
  'Abonne-toi à Pixel Facts pour le prochain fait !',
];

type Plan = {bg: string; zoom: number; pan: number; el: React.FC<{p: number; f: number}>; mascot?: string; big?: boolean};
const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const stroke: React.CSSProperties = {fontFamily, fontWeight: 700, color: '#fff', WebkitTextStroke: `14px ${DARK}`, paintOrder: 'stroke fill', textAlign: 'center', lineHeight: 1.0, textShadow: `0 12px 0 ${DARK}`};

const Bounce: React.FC<{children: React.ReactNode; delay?: number; style?: React.CSSProperties}> = ({children, delay = 0, style}) => {
  const f = useCurrentFrame();
  const s = spring({frame: f - delay, fps: FPS, config: {damping: 7, stiffness: 160, mass: 0.7}});
  return <div style={{transform: `scale(${s})`, ...style}}>{children}</div>;
};
const Txt: React.FC<{t: string; size?: number; color?: string; delay?: number; style?: React.CSSProperties}> = ({t, size = 150, color = '#fff', delay = 0, style}) => (
  <Bounce delay={delay} style={style}><div style={{...stroke, fontSize: size, color}}>{t}</div></Bounce>
);
const Col: React.FC<{children: React.ReactNode; top?: number; gap?: number}> = ({children, top = 260, gap = 30}) => (
  <div style={{position: 'absolute', left: 40, right: 40, top: top + 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap}}>{children}</div>
);
const Count: React.FC<{to: number; f: number; dur?: number; max?: number; color?: string; suffix?: string}> = ({to, f, dur = 24, max = 260, color = Y, suffix = ''}) => {
  const v = to * (1 - Math.pow(1 - Math.min(1, f / dur), 3));
  const s = fmt(v) + suffix; const full = fmt(to) + suffix;
  const size = Math.min(max, 960 / (full.length * 0.62));
  return <Bounce><div style={{...stroke, fontSize: size, color, whiteSpace: 'nowrap'}}>{s}</div></Bounce>;
};
const Card: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = PINK}) => (
  <Bounce delay={2}><div style={{background: color, border: `12px solid ${DARK}`, borderRadius: 60, padding: '20px 50px', boxShadow: `0 16px 0 ${DARK}`}}>{children}</div></Bounce>
);
const Bars: React.FC<{items: {n: string; v: number; c: string}[]; f: number; max: number}> = ({items, f, max}) => (
  <div style={{width: 980, display: 'flex', flexDirection: 'column', gap: 34}}>
    {items.map((it, i) => {
      const g = spring({frame: f - i * 5, fps: FPS, config: {damping: 14, stiffness: 90}});
      const w = Math.max(0.28, it.v / max) * 980 * g;
      return (
        <div key={i} style={{width: w, height: items.length > 2 ? 250 : 300, background: it.c, border: `12px solid ${DARK}`, borderRadius: 50, boxShadow: `0 14px 0 ${DARK}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 36, overflow: 'hidden', whiteSpace: 'nowrap'}}>
          <div style={{...stroke, fontSize: 92, WebkitTextStroke: `9px ${DARK}`, textAlign: 'left', textShadow: 'none'}}>{it.n}</div>
          <div style={{...stroke, fontSize: 90, color: '#fff', WebkitTextStroke: `9px ${DARK}`, textAlign: 'left', textShadow: 'none'}}>{fmt(it.v * Math.min(1, g))}</div>
        </div>
      );
    })}
  </div>
);
const Curve: React.FC<{f: number; label: string}> = ({f, label}) => {
  const pts: [number, number][] = [[40, 820], [200, 790], [340, 730], [470, 640], [590, 500], [700, 330], [800, 150], [940, 40]];
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  const prog = interpolate(f, [0, 28], [0, 1], {extrapolateRight: 'clamp'});
  const dot = pts[Math.min(pts.length - 1, Math.floor(prog * (pts.length - 1)))];
  return (
    <div style={{position: 'relative', width: 1000, height: 820}}>
      <svg width={1000} height={820} viewBox="0 0 1000 900">
        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={Y} stopOpacity=".7" /><stop offset="1" stopColor={Y} stopOpacity="0" /></linearGradient></defs>
        <path d={d} fill="none" stroke={DARK} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
        <path d={d} fill="none" stroke={Y} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
        <circle cx={dot[0]} cy={dot[1]} r={46} fill={PINK} stroke={DARK} strokeWidth={12} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: -60}}><div style={{...stroke, fontSize: 110, color: Y}}>{label}</div></div>
    </div>
  );
};

const plans: Plan[] = [
  {bg: 'a', zoom: 1, pan: 1, mascot: 'surpris', big: true, el: ({f}) => (<Col top={280}><Txt t="JEU" size={260} color={Y} /><Txt t="GRATUIT !" size={230} delay={4} /></Col>)},
  {bg: 'b', zoom: 1, pan: -1, el: ({f}) => (<Col top={300}><Txt t="N°" size={200} /><Count to={3} f={f} dur={10} max={560} color={Y} /><Txt t="SUR STEAM" size={130} delay={5} color={BLUE} /></Col>)},
  {bg: 'e', zoom: 1, pan: 1, el: () => (<Col top={420}><Txt t="ROB" size={330} color={Y} /><Txt t="RUN" size={330} delay={3} color={PINK} /></Col>)},
  {bg: 'd', zoom: 1, pan: -1, el: ({f}) => (<Col top={380}><Txt t="4 NOV" size={300} color={Y} /><Txt t="2026" size={200} delay={4} /></Col>)},
  {bg: 'fond', zoom: 1, pan: 1, el: () => (<Col top={440}><Card color={BLUE}><Txt t="ACCÈS" size={220} /></Card><Card><Txt t="ANTICIPÉ" size={190} /></Card></Col>)},
  {bg: 'c', zoom: 1, pan: -1, el: () => (<Col top={470}><Txt t="STUDIO" size={200} /><Txt t="KEFIR" size={300} delay={4} color={Y} /></Col>)},
  {bg: 'fond', zoom: 1, pan: 1, el: ({f}) => (<Col top={340}><Count to={16} f={f} dur={14} max={560} /><Txt t="JOURS" size={230} delay={3} color={PINK} /></Col>)},
  {bg: 'c', zoom: 1, pan: 1, el: ({f}) => (<Col top={400}><Count to={448687} f={f} dur={34} max={240} /><Txt t="JOUEURS" size={170} delay={4} /><Txt t="EN MÊME TEMPS" size={110} delay={6} color={BLUE} /></Col>)},
  {bg: 'a', zoom: 1, pan: -1, mascot: 'montre', el: ({f}) => (<Col top={320}><Txt t="RECORD" size={190} color={PINK} /><Count to={478990} f={f} dur={26} max={240} /><Txt t="DU JOUR !" size={150} delay={5} /></Col>)},
  {bg: 'e', zoom: 1, pan: 1, el: ({f}) => (<Col top={190}><Txt t="DÉPART DE FOLIE" size={130} color={Y} /><Curve f={f} label="0 ➜ 448 687" /></Col>)},
  {bg: 'c', zoom: 1, pan: -1, el: ({f}) => (<Col top={400}><Count to={5000} f={f} dur={20} max={420} /><Txt t="JOUEURS" size={190} delay={3} /><Txt t="MÊME MONDE" size={140} delay={6} color={BLUE} /></Col>)},
  {bg: 'b', zoom: 1, pan: 1, el: ({f}) => (<Col top={190}><Txt t="N°3 !" size={190} color={Y} /><Bars f={f} max={1049216} items={[{n: 'Counter-Strike 2', v: 1049216, c: BLUE}, {n: 'Dota 2', v: 782318, c: PINK}, {n: 'ROB RUN', v: 448687, c: Y}]} /></Col>)},
  {bg: 'b', zoom: 1, pan: -1, el: ({f}) => (<Col top={380}><Txt t="N°1" size={300} color={Y} /><Count to={1049216} f={f} dur={30} max={190} /><Txt t="JOUEURS" size={150} delay={5} color={BLUE} /></Col>)},
  {bg: 'fond', zoom: 1, pan: 1, el: ({f}) => (<Col top={170}><Txt t="DEVANT PUBG" size={140} color={Y} /><Bars f={f} max={448687} items={[{n: 'ROB RUN', v: 448687, c: Y}, {n: 'PUBG', v: 344551, c: PINK}]} /></Col>)},
  {bg: 'e', zoom: 1, pan: -1, el: ({f}) => (<Col top={400}><Txt t="PUBG" size={230} color={PINK} /><Count to={344551} f={f} dur={24} max={240} /><Txt t="JOUEURS" size={150} delay={5} /></Col>)},
  {bg: 'd', zoom: 1, pan: 1, el: ({f}) => (<Col top={330}><Count to={16} f={f} dur={10} max={560} color={PINK} /><Txt t="JOURS" size={250} delay={3} color={Y} /><Txt t="SEULEMENT !" size={150} delay={6} /></Col>)},
  {bg: 'f', zoom: 1, pan: -1, el: ({f}) => (<Col top={380}><Txt t="0 €" size={440} color={Y} /><Txt t="GRATUIT !" size={200} delay={4} /></Col>)},
  {bg: 'a', zoom: 1, pan: 1, mascot: 'reflechit', el: ({f}) => (<Col top={220}><Txt t="JUSQU'OÙ ?" size={170} color={Y} /><Curve f={f} label="?" /></Col>)},
  {bg: 'fond', zoom: 1, pan: -1, mascot: 'coucou', big: true, el: () => (<Col top={190}><Txt t="ABONNE-TOI" size={190} color={Y} /><Txt t="À PIXEL FACTS !" size={140} delay={4} /></Col>)},
];

const starts = timing.map((t) => Math.round(t[0] * FPS));
const planAt = (fr: number) => {
  let i = starts.findIndex((s, k) => fr >= s && fr < (k + 1 < starts.length ? starts[k + 1] : TOTAL));
  if (i < 0) { i = 0; for (let k = 0; k < starts.length; k++) if (starts[k] <= fr) i = k; } // repli : plan précédent
  return i;
};

const Subs: React.FC<{i: number; t: number}> = ({i, t}) => {
  const words = LINES[i].split(' ');
  const [a, b] = timing[i];
  const lens = words.map((w) => w.length + 2); const sum = lens.reduce((x, y) => x + y, 0);
  let acc = 0; const bounds = lens.map((l) => { const s = a + ((b - 0.12 - a) * acc) / sum; acc += l; return s; });
  let act = 0; bounds.forEach((s, k) => { if (t >= s) act = k; });
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1390, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 40px'}}>
      {words.map((w, k) => (
        <span key={k} style={{...stroke, fontSize: 92, WebkitTextStroke: `12px ${DARK}`, textShadow: 'none', color: k === act ? Y : '#fff', transform: k === act ? 'scale(1.12)' : 'scale(1)', display: 'inline-block', lineHeight: 1.12}}>{w}</span>
      ))}
    </div>
  );
};

const PlanView: React.FC<{i: number; f: number; t: number}> = ({i, f, t}) => {
  const p = plans[i];
  const dur = (i + 1 < starts.length ? starts[i + 1] : TOTAL) - starts[i];
  const prog = f / Math.max(1, dur);
  const z = 1.08 + 0.12 * prog;
  const tx = p.pan * (-30 + 60 * prog);
  const isImg = p.bg !== 'fond';
  const src = isImg ? staticFile(`img/${p.bg}.jpg`) : staticFile('fond_banniere.png');
  const El = p.el;
  const ms = p.mascot ? spring({frame: f, fps: FPS, config: {damping: 6, stiffness: 120}}) : 0;
  const big = !!p.big;
  const msize = p.mascot === 'coucou' ? 580 : big ? 520 : 330;
  return (
    <AbsoluteFill style={{background: BLUE, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z}) translateX(${tx}px)`}}>
        <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: isImg ? 'linear-gradient(180deg, rgba(40,20,80,.25), rgba(40,20,80,.15) 50%, rgba(40,20,80,.55))' : 'rgba(255,255,255,0)'}} />
      <El p={prog} f={f} />
      {p.mascot && !(p.mascot === 'coucou' && i === 18 && f > dur - 36) ? (
        <Img src={staticFile(`mascotte_${p.mascot}_transparent.png`)} style={{position: 'absolute', width: msize, right: p.mascot === 'coucou' ? 250 : 10, bottom: p.mascot === 'coucou' ? 520 : 60, transform: `scale(${ms}) rotate(${Math.sin(f / 5) * 4}deg)`, transformOrigin: '50% 100%', filter: `drop-shadow(0 10px 0 ${DARK})`}} />
      ) : null}
      <Subs i={i} t={t} />
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const fr = useCurrentFrame();
  const i = planAt(fr);
  const f = fr - starts[i];
  const logoIn = fr > TOTAL - 36;
  const lg = spring({frame: fr - (TOTAL - 36), fps: FPS, config: {damping: 8}});
  const music = interpolate(fr, [TOTAL - 45, TOTAL], [0.075, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill>
      <PlanView i={i} f={f} t={fr / FPS} />
      {logoIn ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: 60}}>
          <Img src={staticFile('photo_profil.png')} style={{width: 520, height: 520, borderRadius: 260, border: `16px solid ${DARK}`, transform: `scale(${lg})`}} />
        </AbsoluteFill>
      ) : null}
      <Audio src={staticFile('voix.mp3')} />
      <Audio src={staticFile('musique.wav')} volume={music} />
      {starts.slice(1).map((s, k) => {
        const n = k + 1;
        const src = n % 2 === 1 ? `sfx/w${((n >> 1) % 8) + 1}.mp3` : `pop${((n >> 1) % 3) + 1}.wav`;
        return (<Sequence key={n} from={s} durationInFrames={40}><Audio src={staticFile(src)} volume={n % 2 === 1 ? 0.3 : 0.4} /></Sequence>);
      })}
    </AbsoluteFill>
  );
};
