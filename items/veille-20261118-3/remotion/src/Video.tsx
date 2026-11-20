import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence, Easing} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';
import {BEATS, WORDS, Beat, TOTAL} from './beats';

const {fontFamily} = loadFont();
const NBG = 7;
const OUT = '#281450';
const YEARS = [2001, 2002, 2005, 2013, 2020, 2026];
const stroke = (w = 10) => ({WebkitTextStroke: `${w}px ${OUT}`, paintOrder: 'stroke fill' as const, textShadow: `0 10px 0 ${OUT}`});
const big = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily, fontWeight: 700, fontSize: size, color, textAlign: 'center', lineHeight: 1.02, padding: '0 36px', ...stroke(size > 200 ? 16 : 12), ...extra,
});
// rotation de 11 sons différents (8 whoosh + 3 pops), jamais deux fois le même d'affilée
const SFX = ['whoosh_1', 'pop', 'whoosh_5', 'whoosh_2', 'pop2', 'whoosh_7', 'whoosh_3', 'pop3', 'whoosh_8', 'whoosh_4', 'whoosh_6'];

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
  const size = corner ? 260 : 520;
  const pos = corner ? {top: 70, right: 30} : {top: 60, right: 40};
  return <div style={{position: 'absolute', ...pos, width: size, zIndex: 6}}>
    <Img src={staticFile(`mascotte_${pose}_transparent.png`)} style={{width: '100%', transform: `scale(${enter}) rotate(${Math.sin(frame / 8) * 5}deg)`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.5))'}} />
  </div>;
};

const Caption: React.FC<{t: number; frame: number; fps: number; accent: string}> = ({t, frame, fps, accent}) => {
  let idx = WORDS.findIndex((w) => t >= w.start && t < w.end);
  if (idx === -1) { for (let i = 0; i < WORDS.length; i++) if (WORDS[i].start <= t) idx = i; } // silence : garder le dernier mot
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

// frise chronologique animée : années clés, la progression suit le plan courant
const Timeline: React.FC<{year: number; frame: number; accent: string}> = ({year, frame, accent}) => {
  const pos = (y: number) => {
    let k = 0; while (k < YEARS.length - 2 && y >= YEARS[k + 1]) k++;
    const a = YEARS[k], b = YEARS[k + 1]; return (k + Math.min(1, Math.max(0, (y - a) / (b - a)))) / (YEARS.length - 1);
  };
  const p = pos(year);
  return <div style={{position: 'absolute', left: 60, right: 60, top: 1500, height: 150, zIndex: 5}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 30, height: 22, borderRadius: 11, background: '#ffffff44', border: `4px solid ${OUT}`}} />
    <div style={{position: 'absolute', left: 0, width: `${p * 100}%`, top: 30, height: 22, borderRadius: 11, background: accent}} />
    {YEARS.map((y, i) => {
      const x = (i / (YEARS.length - 1)) * 100; const on = year >= y;
      return <div key={y} style={{position: 'absolute', left: `${x}%`, top: 0, transform: 'translateX(-50%)', textAlign: 'center'}}>
        <div style={{width: 46, height: 46, borderRadius: 23, background: on ? accent : '#fff', border: `6px solid ${OUT}`, margin: '19px auto 0', transform: `scale(${on ? 1 + 0.15 * Math.sin(frame / 5) : 1})`}} />
        <div style={big(46, on ? '#fff' : '#ffffffaa', {padding: 0, marginTop: 8, ...stroke(7)})}>{y}</div>
      </div>;
    })}
  </div>;
};

const labelSize = (s: string) => (s.length > 14 ? 108 : s.length > 11 ? 122 : s.length > 9 ? 150 : 190);

const Stage: React.FC<{beat: Beat; localT: number; dur: number; frame: number; fps: number}> = ({beat, localT, dur, frame, fps}) => {
  const enter = 0.6 + 0.4 * spring({frame, fps, config: {damping: 10, stiffness: 120}, durationInFrames: 14});
  const slow = 1 + 0.08 * Math.min(1, localT / dur);
  const sc = enter * slow;
  const icon = (size: number) => <div style={{fontSize: size, lineHeight: 1, transform: `translateY(${Math.sin(frame / 7) * 18}px) rotate(${Math.sin(frame / 11) * 4}deg)`, filter: 'drop-shadow(0 24px 40px rgba(0,0,0,.5))'}}>{beat.icon}</div>;
  const col = {display: 'flex', flexDirection: 'column' as const, alignItems: 'center', transform: `scale(${sc})`};
  if (beat.kind === 'num') {
    const p = Easing.out(Easing.cubic)(Math.min(1, localT / Math.max(0.5, dur * 0.7)));
    return <div style={col}>
      <div style={big(120, '#fff')}>{beat.sub}</div>
      <div style={big(560, beat.accent, {textShadow: `0 0 80px ${beat.accent}, 0 16px 0 ${OUT}`, padding: 0})}>{Math.round(beat.n * p)}</div>
      <div style={big(labelSize(beat.label), '#fff')}>{beat.label}</div>
    </div>;
  }
  if (beat.kind === 'year') {
    const prev = BEATS[Math.max(0, BEATS.indexOf(beat) - 1)];
    const from = prev.n < 1990 ? beat.n - 5 : prev.n;
    const p = Easing.out(Easing.cubic)(Math.min(1, localT / Math.max(0.4, dur * 0.5)));
    return <div style={col}>
      {beat.icon ? icon(300) : null}
      <div style={big(400, beat.accent, {textShadow: `0 0 80px ${beat.accent}, 0 16px 0 ${OUT}`, padding: 0})}>{Math.round(from + (beat.n - from) * p)}</div>
      <div style={big(labelSize(beat.label), '#fff', {marginTop: 6})}>{beat.label}</div>
      {beat.sub ? <div style={big(110, beat.accent, {marginTop: 6})}>{beat.sub}</div> : null}
    </div>;
  }
  if (beat.kind === 'cta') {
    return <div style={{...col, marginTop: 360}}>
      <div style={big(150, beat.accent)}>ABONNE-TOI</div>
      <div style={big(130, '#fff', {marginTop: 10})}>À PIXEL FACTS !</div>
      <div style={big(100, '#5ECBFF', {marginTop: 20})}>PROCHAIN FAIT 👇</div>
    </div>;
  }
  return <div style={col}>
    {icon(beat.label.length > 14 ? 460 : 560)}
    <div style={big(labelSize(beat.label), beat.accent, {marginTop: 20, maxWidth: 1040})}>{beat.label}</div>
    {beat.sub ? <div style={big(130, '#fff', {marginTop: 14})}>{beat.sub}</div> : null}
  </div>;
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  // si aucun intervalle ne correspond : garder le plan précédent (dernier dont start <= t), jamais le dernier du tableau
  let idx = BEATS.findIndex((b) => t >= b.start && t < b.end);
  if (idx === -1) { idx = 0; for (let i = 0; i < BEATS.length; i++) if (BEATS[i].start <= t) idx = i; }
  const beat = BEATS[idx];
  const dur = beat.end - beat.start; const localT = Math.max(0, t - beat.start); const bf = Math.max(0, frame - Math.round(beat.start * fps));
  const bgZoom = 1.1 + 0.2 * Math.min(1, localT / dur);
  const pan = (idx % 2 ? -1 : 1) * 40 * Math.min(1, localT / dur);
  const isLast = idx === BEATS.length - 1;
  const showTL = beat.kind !== 'cta' && idx > 1;
  const tlYear = beat.kind === 'year' ? Math.round(interpolate(Math.min(1, localT / 0.8), [0, 1], [BEATS[Math.max(0, idx - 1)].n || beat.n, beat.n])) : beat.kind === 'num' ? (idx < 14 ? 2001 : 2026) : beat.n;
  return (
    <AbsoluteFill style={{background: OUT}}>
      <Img src={staticFile('fond_banniere.png')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />
      <Img src={staticFile(`img/bg${(beat.bg % NBG) + 1}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${bgZoom}) translateX(${pan}px)`, opacity: 0.85, filter: 'saturate(1.2)'}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, ${beat.accent}22, ${OUT}bb 90%)`}} />
      <Cubes frame={frame} accent={beat.accent} />
      <Audio src={staticFile('voix.mp3')} />
      <Audio src={staticFile('musique_brut.mp3')} volume={(f) => 0.072 * Math.min(1, f / 30) * Math.min(1, (Math.ceil(TOTAL * 30) - f) / 45)} />
      {BEATS.map((b, i) => {
        const s = SFX[i % SFX.length];
        return <Sequence key={`w${i}`} from={Math.round(b.start * fps)} durationInFrames={30}>
          <Audio src={staticFile(`${s}.mp3`)} volume={s.startsWith('pop') ? 0.35 : 0.28} />
        </Sequence>;
      })}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: showTL ? 330 : 140}}>
        <Stage beat={beat} localT={localT} dur={dur} frame={bf} fps={fps} />
      </AbsoluteFill>
      {showTL && <Timeline year={tlYear} frame={frame} accent={beat.accent} />}
      {beat.mascot && <Mascot pose={beat.mascot} corner={idx !== 0 && beat.kind !== 'cta'} frame={bf} fps={fps} />}
      <Caption t={t} frame={frame} fps={fps} accent={beat.accent} />
      {isLast && <AbsoluteFill style={{background: '#fff', opacity: interpolate(localT, [0, 0.15, 0.4], [0.5, 0.3, 0], {extrapolateRight: 'clamp'}), pointerEvents: 'none'}} />}
    </AbsoluteFill>
  );
};
