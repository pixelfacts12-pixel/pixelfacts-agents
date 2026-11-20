import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence, Easing} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';
import {BEATS, WORDS, Beat} from './beats';

const {fontFamily} = loadFont();
const NBG = 5; // nombre d'images de fond générées (bg1..bg5)
const OUT = '#281450';
const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
      return <span key={from + i} style={{...big(104, active ? accent : '#fff', {padding: '0 12px', opacity: active ? 1 : 0.7}), transform: `scale(${active ? 0.9 + 0.2 * pop : 1})`}}>{w.text}</span>;
    })}
  </div>;
};

const RANKS = [
  {name: 'COUNTER-STRIKE 2', v: 1048635, color: '#FFD628'},
  {name: 'DOTA 2', v: 781058, color: '#5ECBFF'},
  {name: 'ROB RUN', v: 453370, color: '#FF5FA2'},
];

const Stage: React.FC<{beat: Beat; localT: number; dur: number; frame: number; fps: number}> = ({beat, localT, dur, frame, fps}) => {
  const enter = 0.6 + 0.4 * spring({frame, fps, config: {damping: 10, stiffness: 120}, durationInFrames: 14});
  const slow = 1 + 0.08 * Math.min(1, localT / dur);
  const sc = enter * slow;
  switch (beat.kind) {
    case 'hook':
    case 'counter': {
      const p = Easing.out(Easing.cubic)(Math.min(1, localT / Math.max(0.5, dur * 0.8)));
      const from = beat.from ?? 0; const v = Math.round(from + ((beat.to ?? 0) - from) * p);
      return <>
        {beat.kind === 'hook' && <div style={{height: 330}} />}
        <div style={{width: 990, height: 900, borderRadius: 80, border: `10px solid ${beat.accent}`, background: 'rgba(40,20,80,0.62)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', transform: `scale(${sc})`, boxShadow: `0 0 100px ${beat.accent}99`}}>
          <div style={big(250, '#fff', {textShadow: `0 0 50px ${beat.accent}, 0 10px 0 ${OUT}`, whiteSpace: 'nowrap', padding: 0})}>{fmt(v)}</div>
          <div style={{width: 760, height: 46, borderRadius: 23, background: '#ffffff33', marginTop: 70, overflow: 'hidden'}}>
            <div style={{width: `${p * 100}%`, height: '100%', background: beat.accent}} />
          </div>
          <div style={big(100, beat.accent, {marginTop: 36})}>{beat.label}</div>
        </div>
      </>;
    }
    case 'words':
      return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`}}>
        <div style={{fontSize: 640, lineHeight: 1, transform: `translateY(${Math.sin(frame / 7) * 18}px) rotate(${Math.sin(frame / 11) * 4}deg)`, filter: 'drop-shadow(0 24px 40px rgba(0,0,0,.5))'}}>{beat.icon}</div>
        <div style={big(beat.label!.length > 14 ? 112 : beat.label!.length > 11 ? 120 : 140, beat.accent, {marginTop: 20})}>{beat.label}</div>
        {beat.sub && <div style={big(100, '#fff', {marginTop: 16})}>{beat.sub}</div>}
      </div>;
    case 'rank': {
      const maxV = 1048635;
      return <div style={{display: 'flex', flexDirection: 'column', gap: 60, width: 990, transform: `scale(${enter})`}}>
        {RANKS.map((r, i) => {
          const grow = Easing.out(Easing.cubic)(Math.min(1, Math.max(0, (localT - i * 0.12) / 0.7)));
          const hl = (beat.stage === 1 && i === 0) || (beat.stage === 2 && i === 1) || (beat.stage === 2 && i === 2);
          return <div key={i} style={{opacity: hl || i === 2 ? 1 : 0.8}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 10px'}}>
              <span style={big(92, '#fff', {padding: 0, textAlign: 'left', whiteSpace: 'nowrap'})}>{`${i + 1}. ${r.name}`}</span>
            </div>
            <div style={{height: 230, borderRadius: 50, background: '#00000055', overflow: 'hidden', border: `8px solid ${OUT}`, position: 'relative'}}>
              <div style={{width: `${(r.v / maxV) * 100 * grow}%`, height: '100%', background: r.color}} />
              <span style={{...big(130, '#fff', {padding: 0}), position: 'absolute', right: 30, top: 40}}>{fmt(Math.round(r.v * grow))}</span>
            </div>
          </div>;
        })}
      </div>;
    }
    case 'mult': {
      const p = Easing.out(Easing.cubic)(Math.min(1, localT / 1.0));
      return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`}}>
        <div style={big(120, '#fff')}>{beat.label}</div>
        <div style={big(560, beat.accent, {textShadow: `0 0 80px ${beat.accent}, 0 16px 0 ${OUT}`})}>×{Math.round((beat.to ?? 0) * p)}</div>
        <div style={big(110, '#fff')}>DE JOUEURS</div>
      </div>;
    }
    case 'cta':
      return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${sc})`, marginTop: 360}}>
        <div style={big(150, beat.accent)}>ABONNE-TOI</div>
        <div style={big(130, '#fff', {marginTop: 10})}>À PIXEL FACTS !</div>
        <div style={big(100, '#5ECBFF', {marginTop: 20})}>PROCHAIN FAIT 👇</div>
      </div>;
  }
};

export const RobRun: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  // plan courant : si aucun intervalle ne correspond (trou entre deux répliques), on garde le plan précédent
  let idx = BEATS.findIndex((b) => t >= b.start && t < b.end);
  if (idx === -1) { idx = 0; for (let i = 0; i < BEATS.length; i++) if (BEATS[i].start <= t) idx = i; }
  const beat = BEATS[idx];
  const dur = beat.end - beat.start; const localT = Math.max(0, t - beat.start); const bf = Math.max(0, frame - Math.round(beat.start * fps));
  const bgZoom = 1.12 + 0.18 * Math.min(1, localT / dur) + (idx % 2 ? 0.03 : 0);
  const isLast = idx === BEATS.length - 1;
  return (
    <AbsoluteFill style={{background: '#281450'}}>
      <Img src={staticFile('fond_banniere.png')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />
      <Img src={staticFile(`img/bg${(beat.bg % NBG) + 1}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%', transform: `scale(${bgZoom})`, opacity: 0.55, filter: 'blur(3px) saturate(1.2)'}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, ${beat.accent}33, #281450cc 85%)`}} />
      <Cubes frame={frame} accent={beat.accent} />
      <Audio src={staticFile('voix.mp3')} />
      <Audio src={staticFile('musique.mp3')} volume={(f) => 0.06 * Math.min(1, (Math.ceil(40.2 * 30) - f) / 45)} />
      {BEATS.map((b, i) => (
        <Sequence key={`w${i}`} from={Math.round(b.start * fps)} durationInFrames={24}>
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
