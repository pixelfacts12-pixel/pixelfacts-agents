import {
  AbsoluteFill, Audio, Img, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig, Sequence, Easing,
} from 'remotion';
import {BEATS, WORDS, Beat} from './beats';

const formatNumber = (n: number): string => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const Particles: React.FC<{frame: number; accent: string}> = ({frame, accent}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {Array.from({length: 26}).map((_, i) => {
      const seed = i * 97;
      const size = 34 + (seed % 9) * 14;
      const x = (seed * 53) % 1080;
      const speed = 5 + (seed % 5) * 2.4;
      const y = ((frame * speed + seed * 180) % 2300) - 180;
      const rot = frame * (0.5 + (seed % 3) * 0.4) + seed;
      return (
        <div key={i} style={{
          position: 'absolute', left: x, top: y, width: size, height: size,
          background: accent, opacity: 0.3, borderRadius: seed % 2 === 0 ? '50%' : 10,
          transform: `rotate(${rot}deg)`, boxShadow: `0 0 ${size}px ${accent}55`,
        }} />
      );
    })}
  </AbsoluteFill>
);

const GlowPanel: React.FC<{accent: string}> = ({accent}) => (
  <div style={{
    position: 'absolute', top: '50%', left: '50%', width: 1000, height: 1000,
    transform: 'translate(-50%,-50%)', borderRadius: '50%',
    background: `radial-gradient(circle, ${accent}66 0%, ${accent}2e 42%, transparent 72%)`,
  }} />
);

const CaptionBar: React.FC<{frame: number; fps: number; accent: string}> = ({frame, fps, accent}) => {
  const t = frame / fps;
  const idx = WORDS.findIndex((w) => t >= w.start && t < w.end);
  if (idx === -1) return null;
  const from = Math.max(0, idx - 1);
  const to = Math.min(WORDS.length, idx + 2);
  const slice = WORDS.slice(from, to);
  return (
    <div style={{
      position: 'absolute', bottom: 180, left: 24, right: 24, textAlign: 'center',
      display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18,
      fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 100, fontWeight: 900,
    }}>
      {slice.map((w, i) => {
        const active = from + i === idx;
        const pop = active ? spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 10}, durationInFrames: 10}) : 1;
        return (
          <span key={from + i} style={{
            color: active ? accent : '#ffffff', opacity: active ? 1 : 0.55,
            transform: `scale(${active ? pop : 1})`,
            textShadow: '0 4px 0 #000, 0 0 18px rgba(0,0,0,0.9)',
          }}>{w.text}</span>
        );
      })}
    </div>
  );
};

const Flash: React.FC<{show: boolean}> = ({show}) => (
  <AbsoluteFill style={{background: '#fff', opacity: show ? 0.35 : 0, pointerEvents: 'none'}} />
);

const Mascot: React.FC<{pose: 'surpris' | 'reflechit' | 'coucou'; corner: boolean; frame: number; fps: number}> = ({pose, corner, frame, fps}) => {
  const enter = spring({frame, fps, config: {damping: 9, stiffness: 140}, durationInFrames: 18});
  const wobble = Math.sin(frame / 9) * (corner ? 4 : 6);
  const size = corner ? 220 : 460;
  const style = corner
    ? {position: 'absolute' as const, top: 90, right: 36}
    : {position: 'absolute' as const, top: 180, left: '50%', transform: 'translateX(-50%)'};
  return (
    <div style={{...style, width: size, zIndex: 5}}>
      <Img src={staticFile(`mascotte_${pose}_transparent.png`)} style={{
        width: '100%', transform: `scale(${enter}) rotate(${wobble}deg)`,
        filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))',
      }} />
    </div>
  );
};

// Points d'une courbe qui ne redescend jamais (seulement des paliers vers le haut).
const CHART_POINTS: [number, number][] = [
  [30, 360], [130, 322], [210, 300], [290, 236], [370, 176], [450, 118], [560, 44],
];
const CHART_SEG_LEN = CHART_POINTS.slice(1).map((p, i) => Math.hypot(p[0] - CHART_POINTS[i][0], p[1] - CHART_POINTS[i][1]));
const CHART_TOTAL_LEN = CHART_SEG_LEN.reduce((a, b) => a + b, 0);
const pointAtFraction = (f: number): [number, number] => {
  const target = CHART_TOTAL_LEN * Math.max(0, Math.min(1, f));
  let acc = 0;
  for (let i = 0; i < CHART_SEG_LEN.length; i++) {
    if (acc + CHART_SEG_LEN[i] >= target) {
      const local = (target - acc) / CHART_SEG_LEN[i];
      const [x1, y1] = CHART_POINTS[i];
      const [x2, y2] = CHART_POINTS[i + 1];
      return [x1 + (x2 - x1) * local, y1 + (y2 - y1) * local];
    }
    acc += CHART_SEG_LEN[i];
  }
  return CHART_POINTS[CHART_POINTS.length - 1];
};
const CHART_PATH = CHART_POINTS.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');

const Stage: React.FC<{beat: Beat; localT: number; dur: number; frame: number; fps: number}> = ({beat, localT, dur, frame, fps}) => {
  const enter = spring({frame, fps, config: {damping: 11}, durationInFrames: 16});
  const zoom = 1 + 0.1 * Math.min(1, localT / dur);
  const scale = enter * zoom;
  const pulse = beat.subPulseAt !== undefined && localT >= beat.subPulseAt
    ? spring({frame: frame - Math.round(beat.subPulseAt * fps), fps, config: {damping: 9}, durationInFrames: 10})
    : 1;
  const bigEmoji = (txt: string, size = 420) => (
    <div style={{fontSize: size, lineHeight: 1, transform: `scale(${scale * (0.9 + 0.1 * pulse)})`, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'}}>{txt}</div>
  );
  const bigLabel = (txt: string, color = '#fff', size = 92) => (
    <div style={{
      fontFamily: 'Arial Black, Arial, sans-serif', fontSize: size, fontWeight: 900, color,
      textAlign: 'center', textShadow: '0 6px 0 #000, 0 0 30px rgba(0,0,0,0.8)', lineHeight: 1.08, padding: '0 40px',
    }}>{txt}</div>
  );

  switch (beat.kind) {
    case 'hook':
      return (
        <>
          {bigEmoji(beat.emoji ?? '🚨', 300)}
          <div style={{height: 50}} />
          {bigLabel(beat.label, '#ffffff', 96)}
        </>
      );
    case 'title':
      return (
        <>
          {bigEmoji(beat.emoji ?? '', 300)}
          <div style={{height: 34}} />
          <div style={{
            background: 'rgba(0,0,0,0.55)', border: `6px solid ${beat.accent}`, borderRadius: 28,
            padding: '34px 48px', transform: `scale(${scale})`,
          }}>
            {bigLabel(beat.label, beat.accent, 118)}
          </div>
        </>
      );
    case 'icons':
      return (
        <>
          <div style={{display: 'flex', gap: 34, transform: `scale(${scale})`}}>
            {Array.from(beat.emoji ?? '').map((e, i) => (
              <div key={i} style={{fontSize: 260, transform: `translateY(${Math.sin((frame + i * 20) / 8) * 18}px)`}}>{e}</div>
            ))}
          </div>
          <div style={{height: 40}} />
          {bigLabel(beat.label, '#ffffff', 100)}
        </>
      );
    case 'number': {
      const countT = Math.min(1, localT / Math.min(1.4, dur * 0.6));
      const eased = Easing.out(Easing.cubic)(countT);
      const value = Math.round((beat.number ?? 0) * eased);
      return (
        <>
          {bigLabel(beat.label, beat.accent, 80)}
          <div style={{height: 10}} />
          <div style={{
            width: 820, height: 360, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle, ${beat.accent}33, transparent 70%)`, border: `6px solid ${beat.accent}`,
          }}>
            <div style={{
              fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 150, fontWeight: 900, color: '#fff',
              transform: `scale(${scale * (0.95 + 0.08 * pulse)})`, textShadow: `0 0 50px ${beat.accent}, 0 8px 0 #000`,
            }}>{formatNumber(value)}{beat.suffix ?? ''}</div>
          </div>
          <div style={{height: 20}} />
          {bigLabel(beat.unit ?? '', '#ffffff', 64)}
        </>
      );
    }
    case 'stamp': {
      const slam = spring({frame, fps, config: {damping: 8, stiffness: 160}, durationInFrames: 14});
      return (
        <>
          <div style={{
            border: `12px solid ${beat.accent}`, color: beat.accent, borderRadius: 20,
            padding: '38px 54px', transform: `scale(${1.6 - 0.6 * slam}) rotate(-6deg)`,
            fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 100, fontWeight: 900,
            textShadow: `0 0 30px ${beat.accent}`, textAlign: 'center',
          }}>{beat.label}</div>
          <div style={{height: 34}} />
          {bigLabel(beat.sub ?? '', '#ffffff', 68)}
        </>
      );
    }
    case 'chart': {
      const progress = Math.min(1, localT / (dur * 0.85));
      const eased = Easing.out(Easing.cubic)(progress);
      const [tipX, tipY] = pointAtFraction(eased);
      const dashOffset = CHART_TOTAL_LEN * (1 - eased);
      return (
        <>
          {bigLabel(beat.label, beat.accent, 92)}
          <div style={{height: 20, transform: `scale(${scale})`}} />
          <svg width={600} height={400} viewBox="0 0 600 400" style={{overflow: 'visible', transform: `scale(${scale})`}}>
            <line x1={30} y1={360} x2={580} y2={360} stroke="#ffffff55" strokeWidth={4} />
            <line x1={30} y1={360} x2={30} y2={20} stroke="#ffffff55" strokeWidth={4} />
            <path d={CHART_PATH} fill="none" stroke={beat.accent} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={CHART_TOTAL_LEN} strokeDashoffset={dashOffset}
              style={{filter: `drop-shadow(0 0 24px ${beat.accent})`}} />
            <circle cx={tipX} cy={tipY} r={22} fill="#ffffff" style={{filter: `drop-shadow(0 0 30px ${beat.accent})`}} />
            <text x={tipX} y={tipY - 36} textAnchor="middle" fontSize={56}>📈</text>
          </svg>
          <div style={{height: 10}} />
          {bigLabel(beat.sub ?? '', '#ffffff', 68)}
        </>
      );
    }
    case 'cta':
      return (
        <>
          <div style={{height: 500}} />
          {bigLabel(beat.label, beat.accent, 100)}
        </>
      );
    default:
      return bigLabel(beat.label);
  }
};

export const Splash: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const idx = BEATS.findIndex((b) => t >= b.start && t < b.end);
  // En dehors d'un plan (court silence entre deux répliques), on reste sur le plan précédent
  // au lieu de retomber sur le dernier beat (ça affichait l'écran de fin entre chaque scène).
  let holdIdx = 0;
  for (let i = 0; i < BEATS.length; i++) {
    if (BEATS[i].start <= t) holdIdx = i;
  }
  const beat = idx === -1 ? (t < BEATS[0].start ? BEATS[0] : BEATS[holdIdx]) : BEATS[idx];
  const localT = Math.min(t - beat.start, beat.end - beat.start);
  const dur = beat.end - beat.start;
  const beatFrame = frame - Math.round(beat.start * fps);

  const isFinalBeat = beat === BEATS[BEATS.length - 1];
  const flashOn = isFinalBeat && Math.abs(localT) < 0.12;

  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 38%, ${beat.accent}55, #0a0e14 80%)`}}>
      <Particles frame={frame} accent={beat.accent} />
      <GlowPanel accent={beat.accent} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 560,
        background: `linear-gradient(to top, #000000ee, ${beat.accent}22 70%, transparent)`,
      }} />
      <Audio src={staticFile('voix.mp3')} />
      <Audio src={staticFile('musique.mp3')} volume={1.24} />

      {BEATS.map((b, i) => (
        <Sequence key={`w-${b.start}`} from={Math.round(b.start * fps)} durationInFrames={18}>
          <Audio src={staticFile(`whoosh_${(i % 8) + 1}.mp3`)} volume={0.32} />
        </Sequence>
      ))}
      {BEATS.filter((b) => b.subPulseAt !== undefined).map((b) => (
        <Sequence key={`p-${b.start}`} from={Math.round((b.start + (b.subPulseAt ?? 0)) * fps)} durationInFrames={16}>
          <Audio src={staticFile('pop.mp3')} volume={0.22} />
        </Sequence>
      ))}

      <div style={{
        position: 'absolute', left: 56, right: 56, top: 150, height: 1420, borderRadius: 48,
        background: `linear-gradient(180deg, ${beat.accent}2e, ${beat.accent}10)`,
        border: `5px solid ${beat.accent}99`, boxShadow: `0 0 90px ${beat.accent}55 inset, 0 30px 60px rgba(0,0,0,0.45)`,
      }} />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', top: 150, height: 1420, bottom: 'auto'}}>
        <Stage beat={beat} localT={localT} dur={dur} frame={beatFrame} fps={fps} />
      </AbsoluteFill>

      {beat.mascot && (
        <Mascot pose={beat.mascot} corner={Boolean(beat.mascotCorner)} frame={beatFrame} fps={fps} />
      )}

      <CaptionBar frame={frame} fps={fps} accent={beat.accent} />
      <Flash show={flashOn} />
    </AbsoluteFill>
  );
};
