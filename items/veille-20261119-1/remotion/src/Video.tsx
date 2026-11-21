import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence, Easing} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';
import {BEATS, WORDS, Beat, TOTAL} from './beats';

const {fontFamily} = loadFont();
const IMGS = ['a','b','c','d','e','f','g'];
const DISC = 'Animation non officielle, non affiliée à Rockstar';
const fmtYear = (n: number) => (n > 9999 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n));
const OUT = '#281450';
const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const stroke = (w = 10) => ({WebkitTextStroke: `${w}px ${OUT}`, paintOrder: 'stroke fill' as const, textShadow: `0 10px 0 ${OUT}`});
const big = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily, fontWeight: 700, fontSize: size, color, textAlign: 'center', lineHeight: 1.02, padding: '0 36px', ...stroke(size > 200 ? 16 : 12), ...extra,
});
const SFX = ['whoosh_1','pop','whoosh_5','whoosh_2','pop2','whoosh_7','whoosh_3','pop3','whoosh_8','whoosh_4','whoosh_6'];

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
  const pos = corner ? {top: 70, right: 30} : {top: 60, right: 30};
  return <div style={{position: 'absolute', ...pos, width: size, zIndex: 6}}>
    <Img src={staticFile(`mascotte_${pose}_transparent.png`)} style={{width: '100%', transform: `scale(${enter}) rotate(${Math.sin(frame / 8) * 5}deg)`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))'}} />
  </div>;
};

const Caption: React.FC<{t: number; frame: number; fps: number; accent: string}> = ({t, frame, fps, accent}) => {
  let idx = WORDS.findIndex((w) => t >= w.start && t < w.end);
  if (idx === -1) { for (let i = 0; i < WORDS.length; i++) if (WORDS[i].start <= t) idx = i; }
  if (idx === -1) return null;
  const from = Math.max(0, idx - 1); const slice = WORDS.slice(from, Math.min(WORDS.length, idx + 2));
  return <div style={{position: 'absolute', bottom: 150, left: 20, right: 20, display: 'flex', justifyContent: 'center', columnGap: 30, flexWrap: 'wrap', zIndex: 8}}>
    {slice.map((w, i) => {
      const active = from + i === idx;
      const pop = active ? spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 10}, durationInFrames: 10}) : 1;
      return <span key={from + i} style={{...big(100, active ? accent : '#fff', {padding: '0 10px', opacity: active ? 1 : 0.75}), transform: `scale(${active ? 0.9 + 0.2 * pop : 1})`}}>{w.text}</span>;
    })}
  </div>;
};

const Stage: React.FC<{beat: Beat; localT: number; dur: number; frame: number; fps: number}> = ({beat, localT, dur, frame, fps}) => {
  const enter = 0.55 + 0.45 * spring({frame, fps, config: {damping: 9, stiffness: 130}, durationInFrames: 16});
  const slow = 1 + 0.065 * Math.min(1, localT / dur);
  const sc = enter * slow;
  if (beat.kind === 'num') {
    const p = Easing.out(Easing.cubic)(Math.min(1, localT / Math.max(0.5, dur * 0.7)));
    const v = Math.round(beat.from + (beat.to - beat.from) * p);
    return <div style={{width: 1010, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`, borderRadius: 80, border: `10px solid ${beat.accent}`, background: 'rgba(40,20,80,0.68)', padding: '50px 0', boxShadow: `0 0 100px ${beat.accent}99`}}>
      <div style={big(beat.label.length > 18 ? 84 : beat.label.length > 12 ? 100 : 140, '#fff')}>{beat.label}</div>
      <div style={big(Math.min(460, Math.floor(930 / (0.6 * Math.max(2.5, fmtYear(beat.to).length + beat.sub.length)))), beat.accent, {textShadow: `0 0 80px ${beat.accent}, 0 16px 0 ${OUT}`, padding: 0, whiteSpace: 'nowrap'})}>{fmtYear(v)}{beat.sub}</div>
      <div style={{fontSize: 260, lineHeight: 1.1, transform: `translateY(${Math.sin(frame / 7) * 14}px) rotate(${Math.sin(frame / 11) * 6}deg)`}}>{beat.icon}</div>
    </div>;
  }
  if (beat.kind === 'bench') {
    const freed = beat.from === 1;
    const jump = freed ? Math.abs(Math.sin(frame / 6)) * 150 : Math.sin(frame / 14) * 10;
    const pose = freed ? 'montre' : 'reflechit';
    return <div style={{width: 1040, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`}}>
      <div style={big(beat.label.length > 12 ? 130 : 190, beat.accent, {marginBottom: 20})}>{beat.label}</div>
      <div style={{position: 'relative', width: 1000, height: 800}}>
        {Array.from({length: 8}).map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 131) % 950, top: ((frame * (5 + i % 4) + i * 170) % 900) - 100, fontSize: 90 + (i % 3) * 20, transform: `rotate(${frame * 3 + i * 40}deg)`}}>{freed ? '🎉' : '🍂'}</div>)}
        <Img src={staticFile(`mascotte_${pose}_transparent.png`)} style={{position: 'absolute', left: 250, top: 40 - jump, width: 520, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))', transform: `rotate(${Math.sin(frame / 9) * 4}deg)`}} />
        <svg viewBox="0 0 1000 400" style={{position: 'absolute', left: 0, top: 440, width: 1000, height: 400}}>
          <g stroke={OUT} strokeWidth="14" strokeLinejoin="round">
            <rect x="90" y="30" width="820" height="70" rx="22" fill="#C97B3A" />
            <rect x="90" y="120" width="820" height="70" rx="22" fill="#E39A52" />
            <rect x="60" y="215" width="880" height="80" rx="24" fill="#FFB35E" />
            <rect x="130" y="290" width="70" height="100" rx="14" fill="#6B4A8F" />
            <rect x="800" y="290" width="70" height="100" rx="14" fill="#6B4A8F" />
          </g>
        </svg>
      </div>
    </div>;
  }
  if (beat.kind === 'counter') {
    const p = Easing.out(Easing.cubic)(Math.min(1, localT / Math.max(0.5, dur * 0.75)));
    const v = Math.round(beat.to * p);
    const size = beat.to > 1000 ? 205 : 300;
    return <div style={{width: 1000, height: 820, borderRadius: 80, border: `10px solid ${beat.accent}`, background: 'rgba(40,20,80,0.7)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', transform: `scale(${sc})`, boxShadow: `0 0 100px ${beat.accent}99`}}>
      <div style={big(size, '#fff', {textShadow: `0 0 50px ${beat.accent}, 0 10px 0 ${OUT}`, whiteSpace: 'nowrap', padding: 0})}>{beat.to > 1000 ? '' : 'TOP '}{fmt(v)}</div>
      <div style={{width: 760, height: 46, borderRadius: 23, background: '#ffffff33', marginTop: 50, overflow: 'hidden'}}>
        <div style={{width: `${p * 100}%`, height: '100%', background: beat.accent}} />
      </div>
      <div style={big(beat.label.length > 12 ? 84 : 110, beat.accent, {marginTop: 36})}>{beat.label}</div>
    </div>;
  }
  if (beat.kind === 'chart') {
    const p = Easing.out(Easing.cubic)(Math.min(1, localT / Math.max(0.5, dur * 0.7)));
    const bars = [{v: beat.from, c: '#5ECBFF', l: 'JOUR J'}, {v: beat.to, c: '#FFD628', l: 'WEEK-END'}];
    return <div style={{width: 1010, height: 1000, borderRadius: 80, border: `10px solid ${beat.accent}`, background: 'rgba(40,20,80,0.72)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0', transform: `scale(${sc})`, boxShadow: `0 0 100px ${beat.accent}99`}}>
      <div style={big(110, '#fff')}>{beat.label}</div>
      <div style={{display: 'flex', alignItems: 'flex-end', columnGap: 70, height: 680, marginTop: 10}}>
        {bars.map((b, i) => {
          const h = 560 * (b.v / beat.to) * p;
          return <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 380}}>
            <div style={big(78, '#fff', {padding: 0, whiteSpace: 'nowrap'})}>{fmtYear(Math.round(b.v * p))}</div>
            <div style={{width: 340, height: h, borderRadius: '30px 30px 0 0', background: b.c, border: `8px solid ${OUT}`, boxShadow: `0 0 50px ${b.c}`}} />
          </div>;
        })}
      </div>
      <div style={{display: 'flex', columnGap: 70}}>{bars.map((b, i) => <div key={i} style={{...big(76, b.c, {padding: 0}), width: 380}}>{b.l}</div>)}</div>
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
  const words = beat.label.split(' ');
  return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`}}>
    <div style={{fontSize: 420, lineHeight: 1, transform: `translateY(${Math.sin(frame / 7) * 18}px) rotate(${Math.sin(frame / 11) * 5}deg)`, filter: 'drop-shadow(0 24px 40px rgba(0,0,0,.55))'}}>{beat.icon}</div>
    {beat.sub && <div style={big(100, '#fff', {marginTop: 10})}>{beat.sub}</div>}
    <div style={big(L > 15 ? 124 : words.length === 1 && L > 9 ? 118 : L > 11 ? 140 : 170, beat.accent, {marginTop: 10, maxWidth: 1040})}>{words.length > 2 ? beat.label : beat.label}</div>
  </div>;
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  // si aucun intervalle ne correspond, garder le plan précédent (dernier dont start <= t)
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
      <Img src={staticFile(`img/${IMGS[beat.bg % IMGS.length]}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${bgZoom}) translateX(${pan}px)`, opacity: 0.9, filter: 'saturate(1.15)'}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${OUT}00 25%, ${OUT}99 100%)`}} />
      <Cubes frame={frame} accent={beat.accent} />
      <Audio src={staticFile('voix.mp3')} />
      <Audio src={staticFile('musique_brut.mp3')} volume={(f) => 0.065 * Math.min(1, f / 30) * Math.min(1, (Math.ceil(TOTAL * 30) - f) / 45)} />
      {BEATS.map((b, i) => {
        const s = SFX[i % SFX.length];
        return <Sequence key={`w${i}`} from={Math.round(b.start * fps)} durationInFrames={24}>
          <Audio src={staticFile(`${s}.mp3`)} volume={s.startsWith('pop') ? 0.35 : 0.28} />
        </Sequence>;
      })}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 140}}>
        <Stage beat={beat} localT={localT} dur={dur} frame={bf} fps={fps} />
      </AbsoluteFill>
      {beat.mascot && <Mascot pose={beat.mascot} corner={idx !== 0 && beat.kind !== 'cta'} frame={bf} fps={fps} />}
      <div style={{position: 'absolute', bottom: 38, left: 30, right: 30, zIndex: 9, ...big(46, '#fff', {fontWeight: 600, padding: 0, ...stroke(7), textShadow: 'none'})}}>{DISC}</div>
      <Caption t={t} frame={frame} fps={fps} accent={beat.accent} />
      {isLast && <AbsoluteFill style={{background: '#fff', opacity: interpolate(localT, [0, 0.15, 0.4], [0.5, 0.3, 0], {extrapolateRight: 'clamp'}), pointerEvents: 'none'}} />}
    </AbsoluteFill>
  );
};
