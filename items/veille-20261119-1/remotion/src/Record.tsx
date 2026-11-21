import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence, Easing} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';
import {BEATS, WORDS, Beat} from './beats';

const {fontFamily} = loadFont();
const NBG = 6;
const OUT = '#281450';
const stroke = (w = 10) => ({WebkitTextStroke: `${w}px ${OUT}`, paintOrder: 'stroke fill' as const, textShadow: `0 10px 0 ${OUT}`});
const big = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily, fontWeight: 700, fontSize: size, color, textAlign: 'center', lineHeight: 1.02, padding: '0 36px', ...stroke(size > 200 ? 16 : 12), ...extra,
});

const Cubes: React.FC<{frame: number; accent: string}> = ({frame, accent}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {Array.from({length: 18}).map((_, i) => {
      const seed = i * 97; const size = 60 + (seed % 7) * 22; const x = (seed * 53) % 1000;
      const y = 2100 - ((frame * (6 + (seed % 5) * 2.2) + seed * 130) % 2300);
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: 16,
        background: i % 2 ? '#FFD628' : accent, opacity: 0.28, transform: `rotate(${frame * 0.7 + seed}deg)`}} />;
    })}
  </AbsoluteFill>
);

const Mascot: React.FC<{pose: string; corner: boolean; frame: number; fps: number}> = ({pose, corner, frame, fps}) => {
  const enter = spring({frame, fps, config: {damping: 9, stiffness: 140}, durationInFrames: 18});
  const size = corner ? 260 : 520;
  const pos = corner ? {top: 70, right: 30} : {top: 60, left: 280};
  return <div style={{position: 'absolute', ...pos, width: size, zIndex: 6}}>
    <Img src={staticFile(`mascotte_${pose}_transparent.png`)} style={{width: '100%', transform: `scale(${enter}) rotate(${Math.sin(frame / 8) * 5}deg)`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))'}} />
  </div>;
};

const Caption: React.FC<{t: number; frame: number; fps: number; accent: string}> = ({t, frame, fps, accent}) => {
  let idx = WORDS.findIndex((w) => t >= w.start && t < w.end);
  if (idx === -1) { for (let i = 0; i < WORDS.length; i++) if (WORDS[i].start <= t) idx = i; } // silence : garder le dernier mot
  if (idx === -1) return null;
  const from = Math.max(0, idx - 1); const slice = WORDS.slice(from, Math.min(WORDS.length, idx + 2));
  return <div style={{position: 'absolute', bottom: 150, left: 20, right: 20, display: 'flex', justifyContent: 'center', columnGap: 34, flexWrap: 'wrap', zIndex: 8}}>
    {slice.map((w, i) => {
      const active = from + i === idx;
      const pop = active ? spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 10}, durationInFrames: 10}) : 1;
      return <span key={from + i} style={{...big(104, active ? accent : '#fff', {padding: '0 12px', opacity: active ? 1 : 0.75}), transform: `scale(${active ? 0.9 + 0.2 * pop : 1})`}}>{w.text}</span>;
    })}
  </div>;
};

const labelSize = (s: string) => (s.length > 17 ? 118 : s.length > 13 ? 134 : 160);

const Stage: React.FC<{beat: Beat; localT: number; dur: number; frame: number; fps: number}> = ({beat, localT, dur, frame, fps}) => {
  const enter = 0.6 + 0.4 * spring({frame, fps, config: {damping: 10, stiffness: 120}, durationInFrames: 14});
  const slow = 1 + 0.08 * Math.min(1, localT / dur);
  const sc = enter * slow;
  const icon = (size: number) => <div style={{fontSize: size, lineHeight: 1, transform: `translateY(${Math.sin(frame / 7) * 18}px) rotate(${Math.sin(frame / 11) * 4}deg)`, filter: 'drop-shadow(0 24px 40px rgba(0,0,0,.5))'}}>{beat.icon}</div>;
  switch (beat.kind) {
    case 'hook':
      return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`, marginTop: 330}}>
        {icon(520)}
        <div style={big(150, beat.accent, {marginTop: 20})}>{beat.label}</div>
        <div style={big(130, '#fff', {marginTop: 10})}>{beat.sub}</div>
      </div>;
    case 'date': {
      const p = Easing.out(Easing.cubic)(Math.min(1, localT / Math.max(0.5, dur * 0.8)));
      return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`}}>
        <div style={big(150, '#fff')}>{beat.label}</div>
        <div style={big(420, beat.accent, {textShadow: `0 0 80px ${beat.accent}, 0 16px 0 ${OUT}`, padding: 0})}>{Math.round(2000 + 25 * p)}</div>
        {icon(380)}
      </div>;
    }
    case 'days': {
      const p = Easing.out(Easing.cubic)(Math.min(1, localT / Math.max(0.5, dur * 0.7)));
      const v = Math.round((beat.from ?? 0) + ((beat.to ?? 0) - (beat.from ?? 0)) * p);
      return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`}}>
        <div style={big(120, '#fff')}>DU {beat.from}</div>
        <div style={big(200, '#fff', {marginTop: 0})}>AU</div>
        <div style={big(520, beat.accent, {textShadow: `0 0 80px ${beat.accent}, 0 16px 0 ${OUT}`, padding: 0})}>{v}</div>
        <div style={big(140, '#fff')}>{beat.sub}</div>
      </div>;
    }
    case 'words':
      return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`}}>
        {icon(560)}
        <div style={big(labelSize(beat.label!), beat.accent, {marginTop: 20})}>{beat.label}</div>
        {beat.sub ? <div style={big(110, '#fff', {marginTop: 14})}>{beat.sub}</div> : null}
      </div>;
    case 'cta':
      return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`, marginTop: 360}}>
        <div style={big(150, beat.accent)}>ABONNE-TOI</div>
        <div style={big(130, '#fff', {marginTop: 10})}>À PIXEL FACTS !</div>
        <div style={big(100, '#5ECBFF', {marginTop: 20})}>PROCHAIN FAIT 👇</div>
      </div>;
  }
};

export const Record: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  // si aucun intervalle ne correspond : garder le plan précédent (dernier dont start <= t)
  let idx = BEATS.findIndex((b) => t >= b.start && t < b.end);
  if (idx === -1) { idx = 0; for (let i = 0; i < BEATS.length; i++) if (BEATS[i].start <= t) idx = i; }
  const beat = BEATS[idx];
  const dur = beat.end - beat.start; const localT = Math.max(0, t - beat.start); const bf = Math.max(0, frame - Math.round(beat.start * fps));
  const bgZoom = 1.12 + 0.18 * Math.min(1, localT / dur) + (idx % 2 ? 0.03 : 0);
  const isLast = idx === BEATS.length - 1;
  return (
    <AbsoluteFill style={{background: '#281450'}}>
      <Img src={staticFile('fond_banniere.png')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />
      <Img src={staticFile(`img/bg${(beat.bg % NBG) + 1}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', transform: `scale(${bgZoom})`, opacity: 0.8, filter: 'saturate(1.2)'}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, ${beat.accent}22, #281450bb 90%)`}} />
      <Cubes frame={frame} accent={beat.accent} />
      <Audio src={staticFile('voix.mp3')} />
      <Audio src={staticFile('musique_brut.mp3')} volume={(f) => 0.06 * Math.min(1, f / 30) * Math.min(1, (Math.ceil(43.15 * 30) - f) / 45)} />
      {BEATS.map((b, i) => (
        <Sequence key={`w${i}`} from={Math.round(b.start * fps)} durationInFrames={30}>
          <Audio src={staticFile(i % 3 === 2 ? 'pop.mp3' : `whoosh_${(i % 8) + 1}.mp3`)} volume={i % 3 === 2 ? 0.35 : 0.28} />
        </Sequence>
      ))}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 140}}>
        <Stage beat={beat} localT={localT} dur={dur} frame={bf} fps={fps} />
      </AbsoluteFill>
      {beat.mascot && <Mascot pose={beat.mascot} corner={Boolean(beat.corner)} frame={bf} fps={fps} />}
      <Caption t={t} frame={frame} fps={fps} accent={beat.accent} />
      {isLast && <AbsoluteFill style={{background: '#fff', opacity: interpolate(localT, [0, 0.15, 0.4], [0.5, 0.3, 0], {extrapolateRight: 'clamp'}), pointerEvents: 'none'}} />}
    </AbsoluteFill>
  );
};
