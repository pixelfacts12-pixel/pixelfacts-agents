import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence, Easing} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';
import {BEATS, WORDS, TOTAL, Beat} from './beats';

const {fontFamily} = loadFont();
const OUT = '#281450';
const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const stroke = (w = 10) => ({WebkitTextStroke: `${w}px ${OUT}`, paintOrder: 'stroke fill' as const, textShadow: `0 10px 0 ${OUT}`});
const big = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily, fontWeight: 700, fontSize: size, color, textAlign: 'center', lineHeight: 1.02, padding: '0 36px', ...stroke(size > 200 ? 16 : 12), ...extra,
});
const SFX = ['whoosh_1', 'pop', 'whoosh_5', 'whoosh_2', 'pop2', 'whoosh_7', 'whoosh_3', 'pop3', 'whoosh_8', 'whoosh_4', 'whoosh_6'];

// courbe schématique : x = progression 0..1, y en millions de joueurs
const KEYS: [number, number][] = [[0, 0.2], [0.08, 1.5], [0.25, 20], [0.4, 25.4], [0.5, 22], [0.6, 6], [0.8, 0.8], [1, 0.069]];
// temps -> progression sur la courbe (synchronisé avec les plans)
const TK: [number, number][] = [[6.44, 0], [9.26, 0.08], [10.56, 0.25], [12.08, 0.27], [13.68, 0.4], [16.04, 0.42], [18.94, 0.8], [20.38, 1]];
const xOfT = (t: number) => {
  if (t <= TK[0][0]) return 0;
  for (let i = 1; i < TK.length; i++) if (t <= TK[i][0]) { const [t0, x0] = TK[i - 1]; const [t1, x1] = TK[i]; return x0 + (x1 - x0) * (t - t0) / (t1 - t0); }
  return 1;
};
const yAt = (x: number) => {
  for (let i = 1; i < KEYS.length; i++) {
    if (x <= KEYS[i][0]) {
      const [x0, y0] = KEYS[i - 1]; const [x1, y1] = KEYS[i];
      const u = (x - x0) / (x1 - x0); const s = u * u * (3 - 2 * u);
      return y0 + (y1 - y0) * s;
    }
  }
  return KEYS[KEYS.length - 1][1];
};

const Cubes: React.FC<{frame: number; accent: string}> = ({frame, accent}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {Array.from({length: 16}).map((_, i) => {
      const seed = i * 97; const size = 60 + (seed % 7) * 22; const x = (seed * 53) % 1000;
      const y = 2100 - ((frame * (6 + (seed % 5) * 2.2) + seed * 130) % 2300);
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: 16,
        background: i % 2 ? '#FFD628' : accent, opacity: 0.28, transform: `rotate(${frame * 0.7 + seed}deg)`}} />;
    })}
  </AbsoluteFill>
);

const Mascot: React.FC<{pose: string; corner: boolean; frame: number; fps: number}> = ({pose, corner, frame, fps}) => {
  const enter = spring({frame, fps, config: {damping: 9, stiffness: 140}, durationInFrames: 18});
  const size = corner ? 270 : 500;
  const pos = corner ? {top: 70, right: 30} : {top: 60, right: 40};
  return <div style={{position: 'absolute', ...pos, width: size, zIndex: 6}}>
    <Img src={staticFile(`mascotte_${pose}_transparent.png`)} style={{width: '100%', transform: `scale(${enter}) rotate(${Math.sin(frame / 8) * 5}deg)`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))'}} />
  </div>;
};

const Caption: React.FC<{t: number; frame: number; fps: number; accent: string}> = ({t, frame, fps, accent}) => {
  let idx = WORDS.findIndex((w) => t >= w.start && t < w.end);
  if (idx === -1) { for (let i = 0; i < WORDS.length; i++) if (WORDS[i].start <= t) idx = i; }
  if (idx === -1) return null;
  const from = idx; const slice = WORDS.slice(from, Math.min(WORDS.length, idx + 2));
  const cs = slice.reduce((a, w) => a + w.text.length, 0); const fs = cs > 24 ? 72 : cs > 18 ? 84 : 98;
  return <div style={{position: 'absolute', bottom: 130, left: 20, right: 20, display: 'flex', justifyContent: 'center', columnGap: 18, flexWrap: 'nowrap', zIndex: 8}}>
    {slice.map((w, i) => {
      const active = from + i === idx;
      const pop = active ? spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 10}, durationInFrames: 10}) : 1;
      return <span key={from + i} style={{...big(fs, active ? accent : '#fff', {padding: '0 6px', whiteSpace: 'nowrap', opacity: active ? 1 : 0.75}), transform: `scale(${active ? 0.9 + 0.2 * pop : 1})`}}>{w.text}</span>;
    })}
  </div>;
};

const Chart: React.FC<{t: number; accent: string}> = ({t, accent}) => {
  const W = 1000, H = 1000, PADL = 20, PADB = 20, MAXY = 28;
  const p = xOfT(t);
  const px = (x: number) => PADL + x * (W - 2 * PADL);
  const py = (y: number) => H - PADB - (y / MAXY) * (H - 2 * PADB - 40);
  const N = 120; const pts: string[] = [];
  for (let i = 0; i <= N; i++) { const x = (i / N) * p; pts.push(`${px(x)},${py(yAt(x))}`); }
  const line = pts.join(' ');
  const area = `${px(0)},${H - PADB} ${line} ${px(p)},${H - PADB}`;
  const cur = yAt(p);
  const label = cur >= 1 ? `${cur.toFixed(1).replace('.', ',')} M` : `${fmt(cur * 1e6)}`;
  const dx = px(p), dy = py(cur);
  return <div style={{width: W, position: 'relative'}}>
    <div style={big(190, '#fff', {textShadow: `0 0 60px ${accent}, 0 10px 0 ${OUT}`, whiteSpace: 'nowrap'})}>{label}</div>
    <svg width={W} height={H} style={{background: 'rgba(40,20,80,0.55)', borderRadius: 50, border: `10px solid ${accent}`, boxShadow: `0 0 90px ${accent}88`}}>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={30} x2={W - 30} y1={py(g * MAXY)} y2={py(g * MAXY)} stroke="#ffffff22" strokeWidth={4} strokeDasharray="14 14" />)}
      <text x={40} y={70} fontFamily={fontFamily} fontSize={44} fontWeight={700} fill="#ffffffcc">schéma simplifié · joueurs en même temps</text>
      <polygon points={area} fill={accent} opacity={0.3} />
      <polyline points={line} fill="none" stroke={accent} strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={dx} cy={dy} r={34} fill="#fff" stroke={OUT} strokeWidth={10} />
    </svg>
  </div>;
};

const Stage: React.FC<{beat: Beat; t: number; localT: number; dur: number; frame: number; fps: number}> = ({beat, t, localT, dur, frame, fps}) => {
  const enter = 0.55 + 0.45 * spring({frame, fps, config: {damping: 9, stiffness: 130}, durationInFrames: 16});
  const slow = 1 + 0.07 * Math.min(1, localT / dur);
  const sc = enter * slow;
  if (beat.kind === 'chart') {
    return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${enter})`, marginTop: 0}}>
      <div style={big(beat.label.length > 12 ? 130 : 150, beat.accent, {marginBottom: 6})}>{beat.label}</div>
      {beat.sub ? <div style={big(90, '#fff', {marginBottom: 6})}>{beat.sub}</div> : null}
      <Chart t={t} accent={beat.accent} />
    </div>;
  }
  if (beat.kind === 'counter' || beat.kind === 'fall') {
    const p = Easing.out(Easing.cubic)(Math.min(1, localT / Math.max(0.5, dur * 0.75)));
    const v = beat.kind === 'fall' ? 25400000 + (beat.to - 25400000) * p : beat.to * p;
    const txt = fmt(v);
    const n = txt.length + beat.pre.length + beat.suf.length;
    const size = n > 10 ? 150 : n > 8 ? 190 : n > 6 ? 250 : n > 4 ? 320 : 400;
    return <div style={{width: 1000, height: 1000, borderRadius: 80, border: `10px solid ${beat.accent}`, background: 'rgba(40,20,80,0.7)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', transform: `scale(${sc})`, boxShadow: `0 0 100px ${beat.accent}99`}}>
      <div style={big(size, '#fff', {textShadow: `0 0 50px ${beat.accent}, 0 10px 0 ${OUT}`, whiteSpace: 'nowrap', padding: 0})}>{beat.pre}{txt}{beat.suf}</div>
      <div style={{width: 760, height: 46, borderRadius: 23, background: '#ffffff33', marginTop: 50, overflow: 'hidden'}}>
        <div style={{width: `${(beat.kind === 'fall' ? 1 - p : p) * 100}%`, height: '100%', background: beat.accent}} />
      </div>
      <div style={big(beat.label.length > 16 ? 90 : 110, beat.accent, {marginTop: 36})}>{beat.label}</div>
    </div>;
  }
  if (beat.kind === 'cta') {
    return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`, marginTop: 300}}>
      <div style={big(160, beat.accent)}>ABONNE-TOI</div>
      <div style={big(135, '#fff', {marginTop: 10})}>À PIXEL FACTS !</div>
      <div style={big(100, '#5ECBFF', {marginTop: 20})}>PROCHAIN FAIT 👇</div>
    </div>;
  }
  const L = beat.label.length;
  return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`}}>
    <div style={{fontSize: 460, lineHeight: 1, transform: `translateY(${Math.sin(frame / 7) * 18}px) rotate(${Math.sin(frame / 11) * 5}deg)`, filter: 'drop-shadow(0 24px 40px rgba(0,0,0,.55))'}}>{beat.icon}</div>
    {beat.sub && <div style={big(110, '#fff', {marginTop: 10})}>{beat.sub}</div>}
    <div style={big(L > 15 ? 124 : L > 11 ? 140 : 170, beat.accent, {marginTop: 10, maxWidth: 1040})}>{beat.label}</div>
  </div>;
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  // aucun intervalle ne correspond : garder le plan précédent (dernier dont start <= t), jamais le dernier du tableau
  let idx = BEATS.findIndex((b) => t >= b.start && t < b.end);
  if (idx === -1) { idx = 0; for (let i = 0; i < BEATS.length; i++) if (BEATS[i].start <= t) idx = i; }
  const beat = BEATS[idx];
  const dur = beat.end - beat.start; const localT = Math.max(0, t - beat.start); const bf = Math.max(0, frame - Math.round(beat.start * fps));
  const bgZoom = 1.08 + 0.2 * Math.min(1, localT / dur);
  const pan = (idx % 2 ? -1 : 1) * 40 * Math.min(1, localT / dur);
  const isLast = idx === BEATS.length - 1;
  return (
    <AbsoluteFill style={{background: OUT}}>
      <Img src={staticFile('fond_banniere.png')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${bgZoom}) translateX(${pan}px)`, filter: `hue-rotate(${(idx * 37) % 360 > 180 ? 0 : (idx * 37) % 90}deg) saturate(1.2)`}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${beat.accent}33, ${OUT}cc 95%)`}} />
      <Cubes frame={frame} accent={beat.accent} />
      <Audio src={staticFile('voix.mp3')} />
      <Audio src={staticFile('musique.mp3')} volume={(f) => 0.064 * Math.min(1, f / 30) * Math.min(1, (Math.ceil(TOTAL * 30) - f) / 45)} />
      {BEATS.map((b, i) => {
        const s = SFX[i % SFX.length];
        return <Sequence key={`w${i}`} from={Math.round(b.start * fps)} durationInFrames={30}>
          <Audio src={staticFile(`${s}.mp3`)} volume={s.startsWith('pop') ? 0.35 : 0.28} />
        </Sequence>;
      })}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 140}}>
        <Stage beat={beat} t={t} localT={localT} dur={dur} frame={bf} fps={fps} />
      </AbsoluteFill>
      {beat.mascot && <Mascot pose={beat.mascot} corner={beat.corner} frame={bf} fps={fps} />}
      <Caption t={t} frame={frame} fps={fps} accent={beat.accent} />
      {isLast && <AbsoluteFill style={{background: '#fff', opacity: interpolate(localT, [0, 0.15, 0.4], [0.5, 0.3, 0], {extrapolateRight: 'clamp'}), pointerEvents: 'none'}} />}
    </AbsoluteFill>
  );
};
