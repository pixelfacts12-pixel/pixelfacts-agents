export type Beat = {
  start: number; end: number; kind: string; accent: string;
  emoji?: string; label: string; sub?: string; number?: number; unit?: string; suffix?: string;
  subPulseAt?: number; mascot?: 'surpris' | 'reflechit' | 'coucou'; mascotCorner?: boolean;
};

export const BEATS: Beat[] = [
  {start: 0, end: 2.16, kind: 'hook', accent: '#FFD628', emoji: '🚨', label: "UN JEU ROBLOX GRATUIT VIENT DE BATTRE UN RECORD FOU", mascot: 'surpris'},
  {start: 2.94, end: 4.4, kind: 'icons', accent: '#5ECBFF', emoji: '📈🎮', label: "EN UN MOIS..."},
  {start: 4.4, end: 5.96, kind: 'number', accent: '#FF5FA2', number: 341, suffix: 'M', unit: "DE VISITES", label: "IL A DÉPASSÉ", subPulseAt: 0},
  {start: 6.82, end: 8.04, kind: 'title', accent: '#FFD628', emoji: '🎮', label: "DONT SPLASH"},
  {start: 8.36, end: 9.48, kind: 'stamp', accent: '#5ECBFF', label: "SORTI LE 17 OCTOBRE", sub: "À PEINE UN MOIS"},
  {start: 10.36, end: 12.58, kind: 'number', accent: '#2DD4BF', number: 10, suffix: 'M', unit: "VISITES EN PLUS", label: "DEPUIS, CHAQUE JOUR", subPulseAt: 0.3},
  {start: 13.48, end: 16.38, kind: 'number', accent: '#FB923C', number: 28000, unit: "JOUENT EN MÊME TEMPS", label: "LÀ, MAINTENANT"},
  {start: 17.18, end: 19.2, kind: 'number', accent: '#FF5FA2', number: 750000, unit: "L'ONT MIS EN FAVORIS", label: "JOUEURS CONQUIS", mascot: 'reflechit', mascotCorner: true},
  {start: 20.02, end: 22.38, kind: 'number', accent: '#2DD4BF', number: 86, suffix: '%', unit: "D'AVIS POSITIFS", label: "ET EN PLUS", subPulseAt: 0.2},
  {start: 23.24, end: 24.52, kind: 'stamp', accent: '#94A3B8', label: "PAS DE STAR", sub: "PAS DE PUB"},
  {start: 24.52, end: 26.28, kind: 'chart', accent: '#FFD628', label: "JUSTE UNE COURBE", sub: "QUI NE REDESCEND PAS"},
  {start: 26.88, end: 28.8, kind: 'stamp', accent: '#FF5FA2', label: "UN VRAI PHÉNOMÈNE", sub: "ROBLOX DE CET AUTOMNE", subPulseAt: 0.15},
  {start: 29.74, end: 33.5, kind: 'cta', accent: '#2DD4BF', emoji: '👋', label: "ABONNE-TOI À PIXEL FACTS !", mascot: 'coucou'},
];

export type Word = {start: number; end: number; text: string};

export const WORDS: Word[] = [
  {start: 0.0, end: 0.3, text: "Un"}, {start: 0.3, end: 0.42, text: "jeu"}, {start: 0.42, end: 0.74, text: "Roblox"},
  {start: 0.74, end: 0.98, text: "gratuit"}, {start: 0.98, end: 1.28, text: "vient"}, {start: 1.28, end: 1.38, text: "de"},
  {start: 1.38, end: 1.58, text: "battre"}, {start: 1.58, end: 1.68, text: "un"}, {start: 1.68, end: 1.88, text: "record"},
  {start: 1.88, end: 2.16, text: "fou."}, {start: 2.94, end: 3.2, text: "En"}, {start: 3.2, end: 3.32, text: "un"},
  {start: 3.32, end: 3.5, text: "mois,"}, {start: 3.86, end: 3.94, text: "il"}, {start: 3.94, end: 4.02, text: "a"},
  {start: 4.02, end: 4.4, text: "dépassé"}, {start: 4.4, end: 5.2, text: "341"}, {start: 5.2, end: 5.38, text: "millions"},
  {start: 5.38, end: 5.56, text: "de"}, {start: 5.56, end: 5.96, text: "visites."}, {start: 6.82, end: 7.08, text: "Son"},
  {start: 7.08, end: 7.28, text: "nom,"}, {start: 7.52, end: 7.64, text: "Dont"}, {start: 7.64, end: 8.04, text: "Splash,"},
  {start: 8.36, end: 8.66, text: "sorti"}, {start: 8.66, end: 8.74, text: "le"}, {start: 8.74, end: 8.94, text: "17"},
  {start: 8.94, end: 9.48, text: "octobre."}, {start: 10.36, end: 10.8, text: "Depuis,"}, {start: 11.2, end: 11.28, text: "plus"},
  {start: 11.28, end: 11.42, text: "de"}, {start: 11.42, end: 11.56, text: "10"}, {start: 11.56, end: 11.74, text: "millions"},
  {start: 11.74, end: 11.88, text: "de"}, {start: 11.88, end: 12.14, text: "visites"}, {start: 12.14, end: 12.3, text: "chaque"},
  {start: 12.3, end: 12.58, text: "jour."}, {start: 13.48, end: 13.76, text: "Là,"}, {start: 14.08, end: 14.36, text: "maintenant,"},
  {start: 14.84, end: 14.92, text: "près"}, {start: 14.92, end: 15.04, text: "de"}, {start: 15.04, end: 15.48, text: "28 000"},
  {start: 15.48, end: 15.76, text: "joueurs"}, {start: 15.76, end: 15.92, text: "jouent"}, {start: 15.92, end: 16.02, text: "en"},
  {start: 16.02, end: 16.18, text: "même"}, {start: 16.18, end: 16.38, text: "temps."}, {start: 17.18, end: 18.14, text: "750 000"},
  {start: 18.14, end: 18.44, text: "joueurs"}, {start: 18.44, end: 18.56, text: "l'ont"}, {start: 18.56, end: 18.68, text: "mis"},
  {start: 18.68, end: 18.8, text: "en"}, {start: 18.8, end: 19.2, text: "favoris."}, {start: 20.02, end: 20.18, text: "Et"},
  {start: 20.18, end: 21.14, text: "86 %"}, {start: 21.14, end: 21.4, text: "des"}, {start: 21.4, end: 21.6, text: "avis"},
  {start: 21.6, end: 21.78, text: "sont"}, {start: 21.78, end: 22.38, text: "positifs."}, {start: 23.24, end: 23.4, text: "Pas"},
  {start: 23.4, end: 23.52, text: "de"}, {start: 23.52, end: 23.74, text: "star,"}, {start: 24.12, end: 24.22, text: "pas"},
  {start: 24.22, end: 24.36, text: "de"}, {start: 24.36, end: 24.52, text: "pub,"}, {start: 24.52, end: 25.04, text: "juste"},
  {start: 25.04, end: 25.24, text: "une"}, {start: 25.24, end: 25.52, text: "courbe"}, {start: 25.52, end: 25.62, text: "qui"},
  {start: 25.62, end: 25.72, text: "ne"}, {start: 25.72, end: 26.08, text: "redescend"}, {start: 26.08, end: 26.28, text: "pas."},
  {start: 26.88, end: 27.3, text: "Un"}, {start: 27.3, end: 27.46, text: "vrai"}, {start: 27.46, end: 27.9, text: "phénomène"},
  {start: 27.9, end: 28.26, text: "Roblox"}, {start: 28.26, end: 28.36, text: "de"}, {start: 28.36, end: 28.56, text: "cet"},
  {start: 28.56, end: 28.8, text: "automne."}, {start: 29.74, end: 30.28, text: "Abonne-toi"}, {start: 30.28, end: 30.4, text: "à"},
  {start: 30.4, end: 30.62, text: "Pixel"}, {start: 30.62, end: 31.0, text: "Facts"}, {start: 31.0, end: 31.18, text: "pour"},
  {start: 31.18, end: 31.3, text: "le"}, {start: 31.3, end: 31.52, text: "prochain"}, {start: 31.52, end: 31.8, text: "fait !"},
];
