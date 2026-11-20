export type Beat = {
  start: number; end: number; kind: 'hook'|'title'|'num'|'stamp'|'emoji'|'cta'|'versus';
  accent: string; bg?: number; emoji?: string; label: string; sub?: string;
  number?: number; suffix?: string; prefix?: string; unit?: string; decimals?: number;
  mascot?: 'surpris'|'reflechit'|'coucou'; corner?: boolean; pop?: number;
};
const S = [[0,3.7],[3.82,8.04],[8.16,12.31],[12.43,14.54],[14.66,17.16],[17.28,20.57],[20.69,23.93],[24.05,28.1],[28.22,30.94],[31.06,34.58],[34.7,37.68]];
const s = (i: number) => S[i][0];
export const END = 38.9;
export const BEATS: Beat[] = [
  {start: 0, end: 1.9, kind: 'num', accent: '#FFD628', bg: 1, number: 5.99, decimals: 2, prefix: '', suffix: ' $', label: 'UN JEU À', unit: 'SEULEMENT', mascot: 'surpris'},
  {start: 1.9, end: s(1), kind: 'versus', accent: '#FF5FA2', bg: 1, emoji: '🥊', label: 'BAT DES GÉANTS'},
  {start: s(1), end: 6.0, kind: 'title', accent: '#FFD628', bg: 0, label: 'MECCHA CHAMELEON'},
  {start: 6.0, end: s(2), kind: 'emoji', accent: '#5ECBFF', emoji: '🦎🫣', label: 'CACHE-CACHE', sub: 'SORTI EN JUIN'},
  {start: s(2), end: 10.3, kind: 'title', accent: '#FFD628', bg: 2, emoji: '🏆', label: 'GOLDEN JOYSTICK 2026'},
  {start: 10.3, end: s(3), kind: 'num', accent: '#FF5FA2', bg: 2, number: 4, label: 'IL RAFLE', unit: 'PRIX !', pop: 0.5},
  {start: s(3), end: s(4), kind: 'title', accent: '#5ECBFF', bg: 3, emoji: '🎮', label: 'MEILLEUR JEU MULTIJOUEUR'},
  {start: s(4), end: s(5), kind: 'stamp', accent: '#FFD628', bg: 4, label: 'MEILLEUR JEU INDÉ', sub: 'AUTO-ÉDITÉ', pop: 1.0},
  {start: s(5), end: 18.95, kind: 'emoji', accent: '#2DD4BF', emoji: '🧑‍💻', label: 'CHOIX DES DÉVELOPPEURS'},
  {start: 18.95, end: s(6), kind: 'emoji', accent: '#FF5FA2', emoji: '📺', label: 'CHOIX DES STREAMERS'},
  {start: s(6), end: 22.3, kind: 'num', accent: '#FFD628', bg: 5, number: 15, suffix: ' M', label: 'VENDUS', unit: 'EXEMPLAIRES', mascot: 'reflechit', corner: true},
  {start: 22.3, end: s(7), kind: 'num', accent: '#5ECBFF', bg: 5, number: 26, label: 'EN SEULEMENT', unit: 'JOURS !', pop: 0.3},
  {start: s(7), end: 26.05, kind: 'versus', accent: '#FF5FA2', bg: 2, emoji: '👑', label: 'RESIDENT EVIL REQUIEM', sub: 'JEU DE L\'ANNÉE'},
  {start: 26.05, end: s(8), kind: 'stamp', accent: '#FFD628', bg: 1, label: 'MÊME SOIRÉE', sub: 'MÊME SCÈNE'},
  {start: s(8), end: 29.6, kind: 'stamp', accent: '#FF5FA2', bg: 4, label: 'PAS D\'ÉNORME BUDGET', sub: 'REQUIS'},
  {start: 29.6, end: s(9), kind: 'emoji', accent: '#2DD4BF', emoji: '🚀', label: 'POUR VISER HAUT'},
  {start: s(9), end: 32.8, kind: 'title', accent: '#FFD628', bg: 4, emoji: '💡', label: 'LANCE TON IDÉE'},
  {start: 32.8, end: s(10), kind: 'title', accent: '#5ECBFF', bg: 5, emoji: '🌍', label: 'TOUR DU MONDE'},
  {start: s(10), end: END, kind: 'cta', accent: '#FFD628', bg: 0, label: 'ABONNE-TOI À PIXEL FACTS !', mascot: 'coucou'},
];
