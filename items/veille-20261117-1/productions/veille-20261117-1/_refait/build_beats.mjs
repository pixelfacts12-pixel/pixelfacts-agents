import fs from 'node:fs';

const OLD_BEATS = [
  {start: 0.0, end: 3.34, kind: 'hook', accent: '#ff3b30', emoji: '💥', label: 'UN JEU A EXPLOSÉ', subPulseAt: 1.9},
  {start: 4.16, end: 5.70, kind: 'title', accent: '#ffb703', emoji: '🎮', label: 'FART TOGETHER'},
  {start: 6.76, end: 8.94, kind: 'icons', accent: '#ff6fa8', emoji: '🤭🤝', label: 'DES BRUITS RIGOLOS'},
  {start: 10.0, end: 12.06, kind: 'number', accent: '#00e5ff', number: 13000000, unit: 'VISITES', label: 'RÉSULTAT'},
  {start: 13.04, end: 15.92, kind: 'number', accent: '#00e5ff', number: 14000, unit: 'JOUEURS EN MÊME TEMPS', label: '7 NOVEMBRE', subPulseAt: 1.6},
  {start: 16.64, end: 18.6, kind: 'void', accent: '#ff3b30', emoji: '❌', label: '8 NOVEMBRE'},
  {start: 19.5, end: 21.48, kind: 'error', accent: '#94a3b8', label: 'TITRE INDISPONIBLE'},
  {start: 22.56, end: 24.8, kind: 'silence', accent: '#7c4dff', emoji: '🔇', label: 'AUCUNE EXPLICATION', subPulseAt: 1.3},
  {start: 25.68, end: 27.32, kind: 'search', accent: '#2dd4bf', emoji: '🔍', label: "L'ENQUÊTE CREUSE"},
  {start: 28.32, end: 30.74, kind: 'list', accent: '#fb923c', label: "D'AUTRES JEUX DISPARUS", subPulseAt: 1.3},
  {start: 31.7, end: 33.46, kind: 'sweep', accent: '#60a5fa', emoji: '🧹', label: 'MÉNAGE EN SILENCE'},
  {start: 34.72, end: 37.02, kind: 'theory', accent: '#a78bfa', emoji: '🏢', label: 'THÉORIE : LES MARQUES', subPulseAt: 1.2},
  {start: 38.02, end: 40.5, kind: 'stamp', accent: '#ff3b30', label: 'COUP DE FILET', sub: 'JAMAIS ANNONCÉ', subPulseAt: 1.3},
  {start: 41.48, end: 43.7, kind: 'meme', accent: '#facc15', emoji: '😂', label: 'LES JOUEURS RIGOLENT', subPulseAt: 1.2},
  {start: 44.68, end: 47.8, kind: 'click', accent: '#38bdf8', emoji: '🖱️', label: "LE BUZZ S'EFFACE", subPulseAt: 1.6},
  {start: 48.84, end: 51.4, kind: 'cta', accent: '#2dd4bf', emoji: '👀', label: "TU L'AVAIS VU PASSER ?"},
];

const data = JSON.parse(fs.readFileSync(new URL('./voix.json', import.meta.url)));
const segments = data.segments;
if (segments.length !== OLD_BEATS.length) {
  throw new Error(`segment count mismatch: ${segments.length} vs ${OLD_BEATS.length}`);
}

const round2 = (n) => Math.round(n * 100) / 100;

const newBeats = OLD_BEATS.map((b, i) => {
  const seg = segments[i];
  const newStart = round2(seg.start);
  const newEnd = round2(seg.end);
  const out = {...b, start: newStart, end: newEnd};
  if (b.subPulseAt !== undefined) {
    const oldDur = b.end - b.start;
    const newDur = newEnd - newStart;
    out.subPulseAt = round2(b.subPulseAt * (newDur / oldDur));
  }
  return out;
});

const words = segments.flatMap((seg) => seg.words.map((w) => ({
  start: round2(w.start),
  end: round2(w.end),
  text: w.word.trim(),
})));

// Corrections : whisper mécomprend ces mots (prononciation TTS), le texte réel du script fait foi.
for (let i = 0; i < words.length - 2; i++) {
  if (words[i].text === 'Far' && words[i + 1].text === 'too' && words[i + 2].text === 'Geyser.') {
    const together = {start: words[i + 1].start, end: words[i + 2].end, text: 'Together.'};
    words[i].text = 'Fart';
    words.splice(i + 1, 2, together);
  }
}
for (const w of words) {
  if (w.text === 'indispensable.') w.text = 'indisponible.';
  if (w.text === 'boss') w.text = 'buzz';
}

const fmtBeat = (b) => {
  const parts = [`start: ${b.start}`, `end: ${b.end}`, `kind: '${b.kind}'`, `accent: '${b.accent}'`];
  if (b.emoji !== undefined) parts.push(`emoji: '${b.emoji}'`);
  parts.push(`label: ${JSON.stringify(b.label)}`);
  if (b.sub !== undefined) parts.push(`sub: ${JSON.stringify(b.sub)}`);
  if (b.number !== undefined) parts.push(`number: ${b.number}`);
  if (b.unit !== undefined) parts.push(`unit: ${JSON.stringify(b.unit)}`);
  if (b.subPulseAt !== undefined) parts.push(`subPulseAt: ${b.subPulseAt}`);
  return `  {${parts.join(', ')}},`;
};

const fmtWord = (w) => `{start: ${w.start}, end: ${w.end}, text: ${JSON.stringify(w.text)}}`;

let wordLines = '';
let line = '  ';
for (const w of words) {
  const chunk = fmtWord(w) + ', ';
  if (line.length + chunk.length > 118) {
    wordLines += line.trimEnd() + '\n';
    line = '  ';
  }
  line += chunk;
}
if (line.trim().length) wordLines += line.trimEnd() + '\n';

const out = `export type Beat = {
  start: number; end: number; kind: string; accent: string;
  emoji?: string; label: string; sub?: string; number?: number; unit?: string;
  subPulseAt?: number;
};

export const BEATS: Beat[] = [
${newBeats.map(fmtBeat).join('\n')}
];

export type Word = {start: number; end: number; text: string};

export const WORDS: Word[] = [
${wordLines}];
`;

fs.writeFileSync(new URL('./beats.ts', import.meta.url), out, 'utf8');
console.log('last beat end:', newBeats[newBeats.length - 1].end);
console.log('total words:', words.length);
