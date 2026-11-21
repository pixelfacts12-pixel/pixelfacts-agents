import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence, Easing} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';
import {BEATS, WORDS, Beat, TOTAL as TOTAL_S} from './beats';
const MUSVOL = 0.068;

const {fontFamily} = loadFont();
const IMGS = ['a', 'b', 'c', 'd', 'e'];
const OUT = '#281450';
const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const stroke = (w = 10) => ({WebkitTextStroke: `${w}px ${OUT}`, paintOrder: 'stroke fill' as const, textShadow: `0 10px 0 ${OUT}`});
const big = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily, fontWeight: 700, fontSize: size, color, textAlign: 'center', lineHeight: 1.02, padding: '0 36px', ...stroke(size > 200 ? 16 : 12), ...extra,
});
// rotation de sons différents (whoosh + pops), jamais le même deux fois de suite
const SFX = ['whoosh_1', 'pop1', 'whoosh_5', 'whoosh_2', 'pop2', 'whoosh_7', 'whoosh_3', 'pop3', 'whoosh_8', 'whoosh_4', 'whoosh_6'];

const KEYS: [number, number][] = [[0, 0.02], [0.2, 0.04], [0.35, 0.2], [0.5, 1], [0.6, 0.55], [0.72, 0.22], [0.85, 0.06], [1, 0.03]];
const curveY = (x: number) => {
  for (let i = 1; i < KEYS.length; i++) if (x <= KEYS[i][0]) {
    const [x0, y0] = KEYS[i - 1]; const [x1, y1] = KEYS[i]; const u = (x - x0) / (x1 - x0);
    return y0 + (y1 - y0) * (u * u * (3 - 2 * u));
  }
  return KEYS[KEYS.length - 1][1];
};

const Cubes: React.FC<{frame: number; accent: string}> = ({frame, accent}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {Array.from({length: 14}).map((_, i) => {
      const seed = i * 97; const size = 60 + (seed % 7) * 22; const x = (seed * 53) % 1000;
      const y = 2100 - ((frame * (6 + (seed % 5) * 2.2) + seed * 130) % 2300);
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: 16,
        background: i % 2 ? '#FFD628' : accent, opacity: 0.3, transform: `rotate(${frame * 0.7 + seed}deg)`}} />;
    })}
  </AbsoluteFill>
);

const Mascot: React.FC<{pose: string; corner: boolean; frame: number; fps: number}> = ({pose, corner, frame, fps}) => {
  const enter = spring({frame, fps, config: {damping: 9, stiffness: 140}, durationInFrames: 18});
  const size = corner ? 270 : 480;
  return <div style={{position: 'absolute', top: 70, right: 30, width: size, zIndex: 6}}>
    <Img src={staticFile(`mascotte_${pose}_transparent.png`)} style={{width: '100%', transform: `scale(${enter}) rotate(${Math.sin(frame / 8) * 5}deg)`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))'}} />
  </div>;
};

const Caption: React.FC<{t: number; frame: number; fps: number; accent: string}> = ({t, frame, fps, accent}) => {
  let idx = WORDS.findIndex((w) => t >= w.start && t < w.end);
  if (idx === -1) { for (let i = 0; i < WORDS.length; i++) if (WORDS[i].start <= t) idx = i; }
  if (idx === -1) return null;
  const from = Math.max(0, idx - 1); const slice = WORDS.slice(from, Math.min(WORDS.length, idx + 2));
  return <div style={{position: 'absolute', bottom: 130, left: 20, right: 20, display: 'flex', justifyContent: 'center', columnGap: 30, flexWrap: 'wrap', zIndex: 8}}>
    {slice.map((w, i) => {
      const active = from + i === idx;
      const pop = active ? spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 10}, durationInFrames: 10}) : 1;
      return <span key={from + i} style={{...big(100, active ? accent : '#fff', {padding: '0 10px', opacity: active ? 1 : 0.75}), transform: `scale(${active ? 0.9 + 0.2 * pop : 1})`}}>{w.text}</span>;
    })}
  </div>;
};

const Chart: React.FC<{beat: Beat; p: number}> = ({beat, p}) => {
  const W = 960, H = 760;
  const reveal = (beat.r0 ?? 0) + ((beat.r1 ?? 1) - (beat.r0 ?? 0)) * p;
  const pts: string[] = [];
  const N = 120;
  for (let i = 0; i <= N; i++) { const x = (i / N) * reveal; pts.push(`${(x * W).toFixed(1)},${(H - curveY(x) * (H - 40) - 10).toFixed(1)}`); }
  const tx = reveal * W; const ty = H - curveY(reveal) * (H - 40) - 10;
  const val = Math.round((beat.v0 ?? 0) + ((beat.v1 ?? 0) - (beat.v0 ?? 0)) * p);
  return <div style={{width: 1010, borderRadius: 70, border: `10px solid ${beat.accent}`, background: 'rgba(40,20,80,0.78)', padding: '30px 0 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: `0 0 90px ${beat.accent}88`}}>
    <div style={big(val > 99999 ? 190 : 230, '#fff', {textShadow: `0 0 50px ${beat.accent}, 0 10px 0 ${OUT}`, whiteSpace: 'nowrap', padding: 0})}>{fmt(val)}</div>
    <svg width={W} height={H} style={{marginTop: 10, overflow: 'visible'}}>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="#ffffff22" strokeWidth={4} />)}
      <polyline points={pts.join(' ')} fill="none" stroke={OUT} strokeWidth={34} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={pts.join(' ')} fill="none" stroke={beat.accent} strokeWidth={20} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={tx} cy={ty} r={30} fill="#fff" stroke={OUT} strokeWidth={10} />
    </svg>
    <div style={big(110, beat.accent, {marginTop: 10})}>{beat.label}</div>
    {beat.sub ? <div style={big(90, '#fff', {marginTop: 4})}>{beat.sub}</div> : null}
  </div>;
};

const Stage: React.FC<{beat: Beat; localT: number; dur: number; frame: number; fps: number}> = ({beat, localT, dur, frame, fps}) => {
  const enter = 0.55 + 0.45 * spring({frame, fps, config: {damping: 9, stiffness: 130}, durationInFrames: 16});
  const slow = 1 + 0.07 * Math.min(1, localT / dur);
  const sc = enter * slow;
  const p = Easing.out(Easing.cubic)(Math.min(1, localT / Math.max(0.5, dur * 0.85)));
  if (beat.kind === 'chart') return <div style={{transform: `scale(${sc})`}}><Chart beat={beat} p={Math.min(1, localT / Math.max(0.5, dur * 0.92))} /></div>;
  if (beat.kind === 'counter') {
    const dec = beat.dec ?? 0; const v = (beat.to ?? 0) * p;
    const txt = dec ? (v / Math.pow(10, dec)).toFixed(dec).replace('.', ',') : fmt(Math.round(v));
    const size = (beat.to ?? 0) > 100000 ? 230 : beat.dec ? 230 : 300;
    return <div style={{width: 1000, height: 820, borderRadius: 80, border: `10px solid ${beat.accent}`, background: 'rgba(40,20,80,0.72)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', transform: `scale(${sc})`, boxShadow: `0 0 100px ${beat.accent}99`}}>
      <div style={big(size, '#fff', {textShadow: `0 0 50px ${beat.accent}, 0 10px 0 ${OUT}`, whiteSpace: 'nowrap', padding: 0})}>{beat.prefix ?? ''}{txt}{beat.suffix ?? ''}</div>
      <div style={{width: 760, height: 46, borderRadius: 23, background: '#ffffff33', marginTop: 50, overflow: 'hidden'}}>
        <div style={{width: `${p * 100}%`, height: '100%', background: beat.accent}} />
      </div>
      <div style={big(beat.label.length > 14 ? 84 : 110, beat.accent, {marginTop: 36})}>{beat.label}</div>
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
    <div style={{fontSize: 420, lineHeight: 1, transform: `translateY(${Math.sin(frame / 7) * 18}px) rotate(${Math.sin(frame / 11) * 5}deg)`, filter: 'drop-shadow(0 24px 40px rgba(0,0,0,.55))'}}>{beat.icon}</div>
    {beat.sub && <div style={big(100, '#fff', {marginTop: 10})}>{beat.sub}</div>}
    <div style={big(L > 17 ? 118 : L > 9 ? 130 : 170, beat.accent, {marginTop: 10, maxWidth: 1040})}>{beat.label}</div>
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
  const pan = (idx % 2 ? -1 : 1) * 30 * Math.min(1, localT / dur);
  const isLast = idx === BEATS.length - 1;
  return (
    <AbsoluteFill style={{background: OUT}}>
      <Img src={staticFile('fond_banniere.png')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />
      <Img src={staticFile(`img/${IMGS[beat.bg % IMGS.length]}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${bgZoom}) translateX(${pan}px)`, opacity: 0.85, filter: 'saturate(1.15)'}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${OUT}00 25%, ${OUT}99 100%)`}} />
      <Cubes frame={frame} accent={beat.accent} />
      <Audio src={staticFile('voix.mp3')} />
      <Audio src={staticFile('musique_brut.mp3')} volume={(f) => MUSVOL * Math.min(1, f / 30) * Math.min(1, (Math.ceil(TOTAL_S * 30) - f) / 45)} />
      {BEATS.map((b, i) => {
        const s = SFX[i % SFX.length];
        return <Sequence key={`w${i}`} from={Math.round(b.start * fps)} durationInFrames={30}>
          <Audio src={staticFile(`${s}.mp3`)} volume={s.startsWith('pop') ? 0.35 : 0.28} />
        </Sequence>;
      })}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 140}}>
        <Stage beat={beat} localT={localT} dur={dur} frame={bf} fps={fps} />
      </AbsoluteFill>
      {beat.mascot && <Mascot pose={beat.mascot} corner={Boolean(beat.corner)} frame={bf} fps={fps} />}
      <Caption t={t} frame={frame} fps={fps} accent={beat.accent} />
      {isLast && <AbsoluteFill style={{background: '#fff', opacity: interpolate(localT, [0, 0.15, 0.4], [0.5, 0.3, 0], {extrapolateRight: 'clamp'}), pointerEvents: 'none'}} />}
    </AbsoluteFill>
  );
};

