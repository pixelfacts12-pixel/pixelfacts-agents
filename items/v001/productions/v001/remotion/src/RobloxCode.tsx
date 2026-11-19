import {
  AbsoluteFill, Audio, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig, Sequence,
} from 'remotion';
import {codeLines, captions, CodeLine} from './segments';

const CUBE_COLORS = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#ff7043'];

const Cube: React.FC<{seed: number; frame: number}> = ({seed, frame}) => {
  const size = 40 + (seed % 5) * 14;
  const xBase = (seed * 137) % 1080;
  const speed = 6 + (seed % 4) * 3;
  const y = ((frame * speed + seed * 240) % 2200) - 150;
  const rot = frame * (0.6 + (seed % 3) * 0.3) + seed * 30;
  const color = CUBE_COLORS[seed % CUBE_COLORS.length];
  return (
    <div style={{
      position: 'absolute', left: xBase, top: y, width: size, height: size,
      background: color, opacity: 0.16, borderRadius: 6,
      transform: `rotate(${rot}deg)`,
    }} />
  );
};

const Background: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{background: 'linear-gradient(160deg,#0a0e14,#10151f 60%,#0a0e14)', overflow: 'hidden'}}>
    {Array.from({length: 14}).map((_, i) => <Cube key={i} seed={i} frame={frame} />)}
  </AbsoluteFill>
);

const TerminalChrome: React.FC = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10, padding: '18px 26px',
    background: '#1b212c', borderBottom: '1px solid #2a323f',
  }}>
    <div style={{width: 16, height: 16, borderRadius: '50%', background: '#ff5f56'}} />
    <div style={{width: 16, height: 16, borderRadius: '50%', background: '#ffbd2e'}} />
    <div style={{width: 16, height: 16, borderRadius: '50%', background: '#27c93f'}} />
    <span style={{marginLeft: 14, color: '#7a8699', fontFamily: 'Consolas, monospace', fontSize: 24}}>
      roblox_histoire.js
    </span>
  </div>
);

const typedText = (full: string, t: number): string => {
  const n = Math.max(0, Math.min(full.length, Math.floor(full.length * t)));
  return full.slice(0, n);
};

const colorizeToken = (tok: string): {text: string; color: string} => {
  if (/^\d/.test(tok) || /^\d+[.,]?\d*$/.test(tok)) return {text: tok, color: '#f78c6c'};
  if (tok.startsWith('"') || tok.endsWith('"')) return {text: tok, color: '#c3e88d'};
  if (['//'].includes(tok) || tok.startsWith('//')) return {text: tok, color: '#546178'};
  if (['=', '->', '+', '++', '(', ')', '[', ']'].includes(tok)) return {text: tok, color: '#89ddff'};
  return {text: tok, color: '#e4e8f1'};
};

const CodeRow: React.FC<{line: CodeLine; frame: number; active: boolean; fps: number}> = ({line, frame, active, fps}) => {
  const startF = line.start * fps;
  const endF = line.end * fps;
  const typeSpan = Math.min(28, (endF - startF) * 0.6);
  const t = interpolate(frame, [startF, startF + typeSpan], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shown = active ? typedText(line.code, t) : line.code;
  const isComment = shown.trim().startsWith('//');

  const punchT = interpolate(frame, [startF, startF + 10, startF + 20], [0, 1.25, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = active && line.punch && t > 0.9 ? punchT : 1;

  const cursorOn = active && t < 1 && Math.floor(frame / 8) % 2 === 0;

  return (
    <div style={{
      fontFamily: 'Consolas, "Courier New", monospace', fontSize: 34, lineHeight: 1.5,
      color: isComment ? '#546178' : '#e4e8f1', whiteSpace: 'pre-wrap',
      transform: `scale(${scale})`, transformOrigin: 'left center',
      textShadow: active && line.punch && t > 0.9 ? '0 0 24px rgba(247,140,108,0.8)' : 'none',
    }}>
      <span style={{color: '#546178', marginRight: 14}}>{'>'}</span>
      {shown}
      {cursorOn ? <span style={{color: '#89ddff'}}>▌</span> : null}
    </div>
  );
};

const CaptionBar: React.FC<{text: string}> = ({text}) => (
  <div style={{
    position: 'absolute', bottom: 160, left: 50, right: 50, textAlign: 'center',
    fontFamily: 'Arial, sans-serif', fontSize: 40, fontWeight: 800, color: '#ffffff',
    textShadow: '0 3px 0 #000, 0 0 16px rgba(0,0,0,0.8)', lineHeight: 1.25,
  }}>
    {text}
  </div>
);

export const RobloxCode: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const activeIdx = codeLines.findIndex((l) => t >= l.start && t < l.end);
  const idx = activeIdx === -1 ? (t < codeLines[0].start ? 0 : codeLines.length - 1) : activeIdx;
  const visible = codeLines.slice(Math.max(0, idx - 3), idx + 1);

  const caption = captions.find((c) => t >= c.start && t < c.end);

  const introPop = spring({frame, fps, config: {damping: 14}, durationInFrames: 18});
  const titleOpacity = interpolate(frame, [0, 10, 70, 85], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const lastLine = codeLines[codeLines.length - 1];
  const outroStart = lastLine.end * fps + 20;
  const outroOpacity = interpolate(frame, [outroStart, outroStart + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#0a0e14'}}>
      <Background frame={frame} />
      <Audio src={staticFile('voix.mp3')} />
      {codeLines.filter((l) => l.punch).map((l) => (
        <Sequence key={l.start} from={Math.round(l.start * fps)} durationInFrames={20}>
          <Audio src={staticFile('whoosh.mp3')} volume={0.25} />
        </Sequence>
      ))}

      <div style={{
        position: 'absolute', top: 170, left: 40, right: 40, bottom: 260,
        background: 'rgba(13,17,23,0.82)', borderRadius: 22, overflow: 'hidden',
        border: '1px solid #262d38', boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
      }}>
        <TerminalChrome />
        <div style={{padding: '34px 30px', display: 'flex', flexDirection: 'column', gap: 14}}>
          {visible.map((l) => (
            <CodeRow key={l.start} line={l} frame={frame} active={l === codeLines[idx]} fps={fps} />
          ))}
        </div>
      </div>

      <div style={{
        position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center',
        opacity: titleOpacity, transform: `scale(${introPop})`,
      }}>
        <span style={{
          fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 46, color: '#89ddff',
          textShadow: '0 0 20px rgba(137,221,255,0.6)', letterSpacing: 2,
        }}>
          L'HISTOIRE VRAIE DE ROBLOX
        </span>
      </div>

      {caption ? <CaptionBar text={caption.text} /> : null}

      <AbsoluteFill style={{
        justifyContent: 'center', alignItems: 'center', opacity: outroOpacity,
        background: outroOpacity > 0.05 ? 'rgba(10,14,20,0.55)' : 'transparent',
      }}>
        <div style={{
          fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 56, color: '#f78c6c',
          textAlign: 'center', padding: 40, textShadow: '0 0 30px rgba(247,140,108,0.7)',
        }}>
          DynaBlocks → Roblox{"\n"}40 milliards $ plus tard 🎮
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
