import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const Titre: React.FC<{texte: string; couleur: string}> = ({texte, couleur}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 12}});
  const sortie = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#0b0b10', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{
        transform: `scale(${pop}) rotate(${(1 - pop) * -8}deg)`, opacity: sortie,
        fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 120, color: couleur,
        textAlign: 'center', padding: 60, textShadow: '0 8px 0 #000, 0 0 40px ' + couleur,
      }}>{texte}</div>
    </AbsoluteFill>
  );
};
