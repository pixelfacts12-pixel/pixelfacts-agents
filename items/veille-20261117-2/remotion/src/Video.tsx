import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence, Easing} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';
import {BEATS, Beat, END} from './beats';
import WORDS from './words.json';

const {fontFamily} = loadFont();
const OUT = '0 0 0 #281450';
const stroke = (w: number) => ({WebkitTextStroke: `${w}px #281450`, paintOrder: 'stroke fill' as const});
const fmt = (n: number, d = 0) => n.toFixed(d).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const Bg: React.FC<{beat: Beat; localT: number; dur: number; idx: number}> = ({beat, localT, dur, idx}) => {
  const z = 1.06 + 0.16 * (localT / dur);
  const panX = (idx % 2 ? 1 : -1) * 30 * (localT / dur);
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${beat.accent}, #281450)`, overflow: 'hidden'}}>
      {beat.bg !== undefined ? (
        <Img src={staticFile(`img${beat.bg}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z}) translateX(${panX}px)`}} />
      ) : null}
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(40,20,80,0.45), rgba(40,20,80,0.15) 40%, rgba(40,20,80,0.75))'}} />
    </AbsoluteFill>
  );
};

const Particles: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {Array.from({length: 16}).map((_, i) => {
      const seed = i * 97; const size = 30 + (seed % 7) * 14;
      const y = 2100 - ((frame * (4 + (seed % 5) * 2) + seed * 150) % 2300);
      return <div key={i} style={{position: 'absolute', left: (seed * 53) % 1080, top: y, width: size, height: size, borderRadius: 10,
        background: ['#FFD628', '#FF5FA2', '#5ECBFF'][i % 3], opacity: 0.35, transform: `rotate(${frame * 1.2 + seed}deg)`}} />;
    })}
  </AbsoluteFill>
);

const Txt: React.FC<{t: string; size: number; color?: string; sc?: number}> = ({t, size, color = '#fff', sc = 1}) => (
  <div style={{fontFamily, fontWeight: 700, fontSize: size, color, textAlign: 'center', lineHeight: 1.02, padding: '0 40px',
    ...stroke(Math.round(size / 9)), textShadow: '0 10px 0 #281450, 0 0 40px rgba(0,0,0,0.5)', transform: `scale(${sc})`}}>{t}</div>
);

const Stage: React.FC<{beat: Beat; localT: number; dur: number; f: number; fps: number}> = ({beat, localT, dur, f, fps}) => {
  const enter = spring({frame: f, fps, config: {damping: 9, stiffness: 150}, durationInFrames: 16});
  const pulse = beat.pop !== undefined && localT >= beat.pop ? spring({frame: f - Math.round(beat.pop * fps), fps, config: {damping: 7}, durationInFrames: 12}) : 1;
  const bob = Math.sin(f / 6) * 14;
  const emoji = (size: number) => <div style={{fontSize: size, lineHeight: 1, transform: `translateY(${bob}px) scale(${enter})`, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'}}>{beat.emoji}</div>;
  switch (beat.kind) {
    case 'num': {
      const p = Easing.out(Easing.cubic)(Math.min(1, localT / Math.min(1.2, dur * 0.7)));
      const v = (beat.number ?? 0) * p;
      return (<>
        <Txt t={beat.label} size={120} color="#fff" sc={enter} />
        <div style={{height: 10}} />
        <Txt t={`${beat.prefix ?? ''}${fmt(v, beat.decimals ?? 0)}${beat.suffix ?? ''}`} size={340} color={beat.accent} sc={enter * (0.96 + 0.08 * pulse)} />
        <Txt t={beat.unit ?? ''} size={130} sc={enter} />
      </>);
    }
    case 'versus':
      return (<>{emoji(380)}<div style={{height: 30}} /><Txt t={beat.label} size={118} color={beat.accent} sc={enter} />{beat.sub && <Txt t={beat.sub} size={110} sc={enter} />}</>);
    case 'title':
      return (<>{beat.emoji && emoji(300)}<div style={{height: 30}} /><Txt t={beat.label} size={150} color={beat.accent} sc={enter} /></>);
    case 'emoji':
      return (<>{emoji(520)}<div style={{height: 40}} /><Txt t={beat.label} size={118} color={beat.accent} sc={enter} />{beat.sub && <Txt t={beat.sub} size={110} sc={enter} />}</>);
    case 'stamp': {
      const slam = spring({frame: f, fps, config: {damping: 8, stiffness: 160}, durationInFrames: 14});
      return (<>
        <div style={{transform: `scale(${1.7 - 0.7 * slam}) rotate(-5deg)`, border: `14px solid ${beat.accent}`, borderRadius: 30, padding: '30px 30px', background: 'rgba(40,20,80,0.55)', margin: '0 30px'}}>
          <Txt t={beat.label} size={116} color={beat.accent} />
        </div>
        <div style={{height: 40}} />
        <Txt t={beat.sub ?? ''} size={150} sc={enter * (0.96 + 0.08 * pulse)} />
      </>);
    }
    case 'cta':
      return (<><div style={{height: 520}} /><Txt t={beat.label} size={140} color={beat.accent} sc={enter} /></>);
    default: return <Txt t={beat.label} size={130} />;
  }
};

const Mascot: React.FC<{pose: string; corner: boolean; f: number; fps: number}> = ({pose, corner, f, fps}) => {
  const e = spring({frame: f, fps, config: {damping: 8, stiffness: 130}, durationInFrames: 20});
  const size = corner ? 300 : 520;
  const pos = corner ? {top: 70, right: 20} : {top: 70, left: 270};
  return <Img src={staticFile(`mascotte_${pose}_transparent.png`)} style={{position: 'absolute', width: size, ...pos, zIndex: 5,
    transform: `scale(${e}) rotate(${Math.sin(f / 8) * 6}deg)`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))'}} />;
};

const Captions: React.FC<{t: number; fps: number; frame: number; accent: string}> = ({t, fps, frame, accent}) => {
  let idx = -1;
  for (let i = 0; i < WORDS.length; i++) if (WORDS[i].start <= t) idx = i;
  if (idx === -1 || t > WORDS[WORDS.length - 1].end + 0.3) return null;
  const w = WORDS[idx];
  const pop = spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 9}, durationInFrames: 10});
  return (
    <div style={{position: 'absolute', left: 20, right: 20, bottom: 170, textAlign: 'center', fontFamily, fontWeight: 700, fontSize: 130,
      color: accent, ...stroke(14), textShadow: '0 8px 0 #281450', transform: `scale(${0.8 + 0.2 * pop})`}}>
      {w.text.replace(/[.,!?:;«»]/g, '')}
    </div>
  );
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  // Plan courant = dernier plan dont start <= t (jamais le dernier du tableau par défaut).
  let idx = 0;
  for (let i = 0; i < BEATS.length; i++) if (BEATS[i].start <= t) idx = i;
  const beat = BEATS[idx];
  const dur = beat.end - beat.start;
  const localT = Math.min(Math.max(0, t - beat.start), dur);
  const f = Math.max(0, frame - Math.round(beat.start * fps));
  const isEnd = idx === BEATS.length - 1;
  const flash = isEnd && localT < 0.1 ? 0.5 : 0;
  const logoIn = t > END - 1.0;
  return (
    <AbsoluteFill>
      <Bg beat={beat} localT={localT} dur={dur} idx={idx} />
      <Particles frame={frame} />
      <Audio src={staticFile('voix.mp3')} />
      <Audio src={staticFile('musique.mp3')} volume={(fr) => 0.059 * Math.min(1, (END * 30 - fr) / 45)} />
      {BEATS.map((b, i) => i > 0 && (
        <Sequence key={`w${i}`} from={Math.round(b.start * fps)} durationInFrames={30}>
          <Audio src={staticFile(`whoosh_${((i * 3) % 8) + 1}.mp3`)} volume={0.35} />
        </Sequence>
      ))}
      {BEATS.filter((b) => b.pop !== undefined).map((b, i) => (
        <Sequence key={`p${i}`} from={Math.round((b.start + (b.pop ?? 0)) * fps)} durationInFrames={20}>
          <Audio src={staticFile('pop.mp3')} volume={0.4} />
        </Sequence>
      ))}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 120}}>
        <Stage beat={beat} localT={localT} dur={dur} f={f} fps={fps} />
      </AbsoluteFill>
      {beat.mascot && <Mascot pose={beat.mascot} corner={Boolean(beat.corner)} f={f} fps={fps} />}
      {!isEnd && <Captions t={t} fps={fps} frame={frame} accent={beat.accent} />}
      {logoIn && <Img src={staticFile('photo_profil.png')} style={{position: 'absolute', bottom: 140, left: 340, width: 400, borderRadius: 80,
        transform: `scale(${spring({frame: frame - Math.round((END - 1) * fps), fps, config: {damping: 9}, durationInFrames: 14})})`}} />}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
