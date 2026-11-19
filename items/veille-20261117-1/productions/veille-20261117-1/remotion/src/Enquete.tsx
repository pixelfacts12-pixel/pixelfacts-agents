import {
  AbsoluteFill, Audio, interpolate, spring, staticFile,
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
    case 'hook': {
      const swapped = localT >= (beat.subPulseAt ?? 999);
      return (
        <>
          {bigEmoji(swapped ? '🎮💨' : '💥', 400)}
          <div style={{height: 36}} />
          {bigLabel(beat.label, '#ffffff')}
        </>
      );
    }
    case 'title':
      return (
        <>
          {bigEmoji(beat.emoji ?? '', 320)}
          <div style={{height: 24}} />
          <div style={{
            background: 'rgba(0,0,0,0.55)', border: `6px solid ${beat.accent}`, borderRadius: 28,
            padding: '28px 44px', transform: `scale(${scale})`,
          }}>
            {bigLabel(beat.label, beat.accent, 98)}
          </div>
        </>
      );
    case 'icons':
      return (
        <>
          <div style={{display: 'flex', gap: 30, transform: `scale(${scale})`}}>
            {(beat.emoji ?? '').split('').map((e, i) => (
              <div key={i} style={{fontSize: 230, transform: `translateY(${Math.sin((frame + i * 20) / 8) * 18}px)`}}>{e}</div>
            ))}
          </div>
          <div style={{height: 30}} />
          {bigLabel(beat.label)}
        </>
      );
    case 'number': {
      const countT = Math.min(1, localT / Math.min(1.4, dur * 0.6));
      const eased = Easing.out(Easing.cubic)(countT);
      const value = Math.round((beat.number ?? 0) * eased);
      return (
        <>
          {bigLabel(beat.label, beat.accent, 70)}
          <div style={{
            fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 130, fontWeight: 900, color: '#fff',
            transform: `scale(${scale * (0.95 + 0.08 * pulse)})`, textShadow: `0 0 50px ${beat.accent}, 0 8px 0 #000`,
          }}>{formatNumber(value)}</div>
          <div style={{height: 10}} />
          {bigLabel(beat.unit ?? '', '#ffffff', 56)}
        </>
      );
    }
    case 'void': {
      const grow = Math.min(1, localT / (dur * 0.6));
      return (
        <>
          <div style={{fontSize: 120 + grow * 260, filter: 'drop-shadow(0 0 40px rgba(255,59,48,0.8))'}}>{beat.emoji}</div>
          <div style={{height: 30}} />
          {bigLabel(beat.label, beat.accent)}
        </>
      );
    }
    case 'error':
      return (
        <div style={{
          background: '#111417', border: `4px solid ${beat.accent}`, borderRadius: 24, padding: '60px 46px',
          transform: `scale(${scale})`, boxShadow: '0 30px 80px rgba(0,0,0,0.6)', width: 880,
        }}>
          <div style={{fontSize: 150, textAlign: 'center'}}>⚠️</div>
          <div style={{height: 24}} />
          {bigLabel(beat.label, '#ffffff', 92)}
        </div>
      );
    case 'silence': {
      const show2 = localT >= (beat.subPulseAt ?? 999);
      return (
        <>
          <div style={{display: 'flex', gap: 20}}>
            {bigEmoji('🔇', 340)}
            {show2 ? bigEmoji('❓', 340) : null}
          </div>
          <div style={{height: 30}} />
          {bigLabel(beat.label, beat.accent)}
        </>
      );
    }
    case 'search':
      return (
        <>
          <div style={{fontSize: 420, transform: `scale(${scale}) rotate(${Math.sin(frame / 10) * 6}deg)`}}>🔍</div>
          <div style={{height: 30}} />
          {bigLabel(beat.label, beat.accent)}
        </>
      );
    case 'list': {
      const items = ['Jeu A', 'Jeu B', 'Jeu C'];
      const stage = Math.min(items.length, Math.floor((localT / dur) * (items.length + 0.4)) + 1);
      return (
        <>
          <div style={{display: 'flex', flexDirection: 'column', gap: 18, transform: `scale(${scale})`}}>
            {items.map((it, i) => (
              <div key={it} style={{
                fontSize: 64, fontFamily: 'Arial Black, Arial, sans-serif', color: i < stage ? '#555' : '#fff',
                textDecoration: i < stage ? 'line-through' : 'none', opacity: i < stage ? 0.45 : 1,
                textAlign: 'center',
              }}>🎮 {it}</div>
            ))}
          </div>
          <div style={{height: 30}} />
          {bigLabel(beat.label, beat.accent, 92)}
        </>
      );
    }
    case 'sweep': {
      const x = Math.sin(frame / 14) * 260;
      return (
        <>
          <div style={{fontSize: 360, transform: `translateX(${x}px) scale(${scale})`}}>🧹</div>
          <div style={{height: 30}} />
          {bigLabel(beat.label, beat.accent)}
        </>
      );
    }
    case 'theory': {
      const show2 = localT >= (beat.subPulseAt ?? 999);
      return (
        <>
          <div style={{
            border: `5px dashed ${beat.accent}`, borderRadius: 20, padding: '18px 34px',
            color: beat.accent, fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 44, marginBottom: 26,
          }}>THÉORIE (NON CONFIRMÉE)</div>
          <div style={{display: 'flex', gap: 20}}>
            {bigEmoji('🏢', 320)}
            {show2 ? bigEmoji('🚫💨', 220) : null}
          </div>
          <div style={{height: 20}} />
          {bigLabel(beat.label, '#ffffff', 92)}
        </>
      );
    }
    case 'stamp': {
      const slam = spring({frame, fps, config: {damping: 8, stiffness: 160}, durationInFrames: 14});
      return (
        <>
          <div style={{
            border: `10px solid ${beat.accent}`, color: beat.accent, borderRadius: 16,
            padding: '30px 48px', transform: `scale(${1.6 - 0.6 * slam}) rotate(-8deg)`,
            fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 94, fontWeight: 900,
            textShadow: `0 0 30px ${beat.accent}`,
          }}>{beat.label}</div>
          <div style={{height: 26}} />
          {bigLabel(beat.sub ?? '', '#ffffff', 56)}
        </>
      );
    }
    case 'meme':
      return (
        <>
          <div style={{position: 'relative', width: 900, height: 500, transform: `scale(${scale})`}}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{
                position: 'absolute', fontSize: 180,
                left: [40, 520, 160, 640][i], top: [20, 60, 260, 230][i] + Math.sin((frame + i * 15) / 7) * 16,
              }}>😂</div>
            ))}
          </div>
          {bigLabel(beat.label, beat.accent, 92)}
        </>
      );
    case 'click': {
      const show2 = localT >= (beat.subPulseAt ?? 999);
      return (
        <>
          <div style={{position: 'relative', width: 400, height: 400}}>
            <div style={{fontSize: 260, transform: `scale(${scale})`, textAlign: 'center'}}>🖱️</div>
            {show2 && [0, 60, 120, 180, 240, 300].map((deg) => (
              <div key={deg} style={{
                position: 'absolute', left: '50%', top: '50%', width: 3, height: 180, background: '#fff',
                transform: `rotate(${deg}deg) translateY(-90px)`, opacity: 0.8,
              }} />
            ))}
          </div>
          <div style={{height: 30}} />
          {bigLabel(beat.label, beat.accent, 92)}
        </>
      );
    }
    case 'cta':
      return (
        <>
          <div style={{
            background: '#fff', borderRadius: 50, padding: '46px 70px', position: 'relative',
            transform: `scale(${scale})`,
          }}>
            <div style={{fontSize: 180, textAlign: 'center'}}>{beat.emoji}</div>
            <div style={{
              position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0, borderLeft: '24px solid transparent', borderRight: '24px solid transparent',
              borderTop: '30px solid #fff',
            }} />
          </div>
          <div style={{height: 50}} />
          {bigLabel(beat.label, beat.accent, 92)}
        </>
      );
    default:
      return bigLabel(beat.label);
  }
};

export const Enquete: React.FC = () => {
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
      <Audio src={staticFile('musique.mp3')} volume={0.1} />

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

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', top: -140}}>
        <Stage beat={beat} localT={localT} dur={dur} frame={beatFrame} fps={fps} />
      </AbsoluteFill>

      <CaptionBar frame={frame} fps={fps} accent={beat.accent} />
      <Flash show={flashOn} />
    </AbsoluteFill>
  );
};
