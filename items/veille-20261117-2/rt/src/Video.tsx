import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Fredoka';
import voix from '../public/voix.json';
const {fontFamily} = loadFont();

const Y = '#FFD628', R = '#FF5FA2', B = '#5ECBFF', V = '#281450';
type Beat = {start: number; text: string[]; kind: 'img' | 'num' | 'bars' | 'end'; img?: string; big?: string; count?: [number, number]; suffix?: string; pixel?: string; col?: string; pan?: number};
const BEATS: Beat[] = [
  {start: 0, text: ['SEULEMENT', 'POUR UN JEU'], kind: 'num', big: '6', suffix: '€', pixel: 'surpris', col: Y},
  {start: 1.7, text: ['TROPHÉES'], kind: 'num', count: [0, 4], pixel: undefined, img: 'trophees', col: Y},
  {start: 3.2, text: ['MECCHA', 'CHAMELEON'], kind: 'img', img: 'cameleon', pan: 1},
  {start: 5.2, text: ['CACHE-CACHE', 'JAPONAIS'], kind: 'img', img: 'cameleon', pan: -1},
  {start: 6.7, text: ['PETITE', 'ÉQUIPE', 'INDÉ'], kind: 'img', img: 'equipe', pan: 1, pixel: 'reflechit'},
  {start: 8.2, text: ['TOUTE', 'PETITE'], kind: 'img', img: 'equipe', pan: -1},
  {start: 9.7, text: ['JUIN', '2026'], kind: 'num', big: '2026', col: B},
  {start: 11.6, text: ['ENVIRON', '6 € !'], kind: 'num', count: [0, 6], suffix: '€', col: R},
  {start: 13.6, text: ['GOLDEN', 'JOYSTICK'], kind: 'img', img: 'trophees', pan: -1},
  {start: 15.2, text: ['FACE', 'AUX GÉANTS'], kind: 'img', img: 'geants', pan: 1},
  {start: 17.2, text: ['MEILLEUR', 'MULTIJOUEUR'], kind: 'num', count: [0, 1], suffix: '/4', col: Y},
  {start: 19.1, text: ['MEILLEUR INDÉ', 'AUTO-ÉDITÉ'], kind: 'num', count: [1, 2], suffix: '/4', col: B},
  {start: 21.3, text: ['CHOIX DES', 'STREAMERS'], kind: 'num', count: [2, 3], suffix: '/4', col: R},
  {start: 22.9, text: ['CHOIX DES', 'DEVS'], kind: 'num', count: [3, 4], suffix: '/4', col: Y, pixel: 'montre'},
  {start: 24.4, text: ['4 TROPHÉES'], kind: 'bars'},
  {start: 27.4, text: ['AUTANT QUE', 'CAPCOM !'], kind: 'img', img: 'geants', pan: -1},
  {start: 28.9, text: ['UNE BONNE', 'IDÉE'], kind: 'num', big: '💡', col: Y},
  {start: 31.0, text: ['BAT UN GROS', 'BUDGET'], kind: 'img', img: 'trophees', pan: 1},
  {start: 32.5, text: ['ABONNE-TOI', 'PIXEL FACTS !'], kind: 'end'},
];
const FPS = 30;
const pickBeat = (t: number) => {
  let idx = 0;
  for (let i = 0; i < BEATS.length; i++) if (BEATS[i].start <= t) idx = i; // garde le plan précédent
  return idx;
};
const stroke = {WebkitTextStroke: `14px ${V}`, paintOrder: 'stroke fill' as const};

const Bg: React.FC<{b: Beat; local: number; i: number}> = ({b, local, i}) => {
  const z = 1.08 + local * 0.06;
  const imgs = ['cameleon', 'trophees', 'equipe', 'geants'];
  if (b.img && imgs.includes(b.img)) {
    return (
      <AbsoluteFill style={{overflow: 'hidden', background: B}}>
        <Img src={staticFile(`${b.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z}) translateX(${(b.pan ?? 1) * local * 30}px)`}} />
        <AbsoluteFill style={{background: 'linear-gradient(rgba(40,20,80,0.15), rgba(40,20,80,0.45))'}} />
      </AbsoluteFill>
    );
  }
  const g = [[B, '#9be3ff'], [R, '#ffb0d2'], [Y, '#fff0a0']][i % 3];
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: `radial-gradient(circle at 50% 40%, ${g[1]}, ${g[0]})`}}>
      <Img src={staticFile('fond_banniere.png')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, transform: `scale(${z})`}} />
    </AbsoluteFill>
  );
};

const Pop: React.FC<{f: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, children, style}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 9, stiffness: 160}});
  return <div style={{transform: `scale(${0.4 + 0.6 * s})`, opacity: Math.min(1, f / 3), ...style}}>{children}</div>;
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const i = pickBeat(t);
  const b = BEATS[i];
  const next = BEATS[i + 1]?.start ?? 36.6;
  const lf = Math.round((t - b.start) * FPS);
  const local = Math.min(1, (t - b.start) / Math.max(0.1, next - b.start));
  const words = (voix as any[]).flatMap((s) => s.mots);
  // sous-titres : groupes de 3 mots, mot actif en couleur (texte du script, timings Whisper)
  const wi = Math.max(0, words.reduce((a: number, w: any, k: number) => (w.debut <= t ? k : a), -1));
  const gs = Math.floor(wi / 2) * 2;
  const group = words.slice(gs, gs + 2);

  let center: React.ReactNode = null;
  if (b.kind === 'num' || b.kind === 'img') {
    const val = b.count ? Math.round(interpolate(lf, [0, 18], b.count, {extrapolateRight: 'clamp'})) : b.big;
    const showNum = b.kind === 'num';
    center = (
      <>
        {showNum && (
          <Pop f={lf} style={{fontSize: b.big === '💡' ? 620 : 460, fontWeight: 700, color: b.col, lineHeight: 1, ...stroke, textAlign: 'center'}}>
            {val}{b.suffix ?? ''}
          </Pop>
        )}
        <Pop f={Math.max(0, lf - 3)} style={{marginTop: showNum ? 20 : 0}}>
          {b.text.map((l, k) => (
            <div key={k} style={{fontSize: b.kind === 'num' ? 130 : 160, fontWeight: 700, color: k === 0 ? '#fff' : Y, textAlign: 'center', lineHeight: 1.05, ...stroke}}>{l}</div>
          ))}
        </Pop>
      </>
    );
  } else if (b.kind === 'bars') {
    const w1 = interpolate(lf, [0, 25], [0, 100], {extrapolateRight: 'clamp'});
    const w2 = interpolate(lf, [10, 35], [0, 100], {extrapolateRight: 'clamp'});
    const bar = (label: string, w: number, c: string) => (
      <div style={{width: 900, marginBottom: 40}}>
        <div style={{fontSize: 90, color: '#fff', fontWeight: 700, ...stroke}}>{label}</div>
        <div style={{height: 150, width: `${w}%`, background: c, border: `10px solid ${V}`, borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 30, fontSize: 120, fontWeight: 700, color: '#fff', ...stroke}}>{w > 60 ? '4' : ''}</div>
      </div>
    );
    center = (<>{bar('MECCHA CHAMELEON', w1, Y)}{bar('RESIDENT EVIL REQUIEM', w2, R)}
      <Pop f={lf}><div style={{fontSize: 150, fontWeight: 700, color: '#fff', ...stroke, marginTop: 20}}>4 = 4 !</div></Pop></>);
  } else {
    center = (
      <>
        <Pop f={lf} style={{position: 'absolute', top: 120}}><Img src={staticFile('mascotte_coucou_transparent.png')} style={{width: 780, transform: `rotate(${Math.sin(lf / 4) * 6}deg)`}} /></Pop>
        <div style={{marginTop: 650}}>
          {b.text.map((l, k) => <div key={k} style={{fontSize: 125, fontWeight: 700, color: k ? Y : '#fff', textAlign: 'center', lineHeight: 1.05, ...stroke}}>{l}</div>)}
        </div>
      </>
    );
  }

  const pix = b.pixel && b.kind !== 'end';
  return (
    <AbsoluteFill style={{fontFamily}}>
      <Bg b={b} local={local} i={i} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 220}}>{center}</AbsoluteFill>
      {pix && (
        <Pop f={lf} style={{position: 'absolute', right: 20, top: 90}}>
          <Img src={staticFile(`mascotte_${b.pixel}_transparent.png`)} style={{width: b.pixel === 'surpris' ? 520 : 340, transform: `rotate(${Math.sin(lf / 5) * 5}deg)`}} />
        </Pop>
      )}
      {b.kind !== 'end' && (
        <div style={{position: 'absolute', bottom: 150, width: '100%', display: 'flex', justifyContent: 'center', gap: 24, whiteSpace: 'nowrap', fontSize: 100, fontWeight: 700, ...stroke, WebkitTextStroke: `12px ${V}`}}>
          {group.map((w: any, k: number) => (
            <span key={k} style={{color: gs + k === wi ? Y : '#fff', margin: '0 16px', display: 'inline-block', transform: gs + k === wi ? 'scale(1.12)' : 'none'}}>{w.mot.replace(/[.,?!:]$/, '')}</span>
          ))}
        </div>
      )}
      {t > 35 && <AbsoluteFill style={{background: '#fff', opacity: interpolate(t, [35.1, 35.4, 36.2], [0, 0.0, 0])}} />}
    </AbsoluteFill>
  );
};
export const BEAT_STARTS = BEATS.map((b) => b.start);
