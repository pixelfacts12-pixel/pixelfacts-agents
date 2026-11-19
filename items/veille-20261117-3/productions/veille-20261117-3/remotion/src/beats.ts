export type Beat = {
  start: number; end: number; kind: string; accent: string;
  emoji?: string; label: string; sub?: string; number?: number; unit?: string;
  subPulseAt?: number; mascot?: 'surpris' | 'reflechit' | 'coucou'; mascotCorner?: boolean;
};

export const BEATS: Beat[] = [
  {start: 0, end: 1.2, kind: 'hook', accent: '#ff3b30', emoji: '📦', label: "UN OBJET MINUSCULE...", mascot: 'surpris'},
  {start: 1.2, end: 2.8, kind: 'hook', accent: '#ff3b30', emoji: '💰', label: "VENDU 4 500 $ ?!", subPulseAt: 0},
  {start: 2.8, end: 4.76, kind: 'icons', accent: '#ffb703', emoji: '🏴‍☠️🎮', label: "FORTNITE X ONE PIECE"},
  {start: 4.76, end: 6.1, kind: 'icons', accent: '#ffd628', emoji: '✨🔥', label: "UN OBJET ULTRA RARE"},
  {start: 6.98, end: 8.34, kind: 'title', accent: '#ffd628', emoji: '🏴‍☠️', label: "LE JETON PIRATE"},
  {start: 9.34, end: 11.8, kind: 'number', accent: '#00e5ff', number: 137500, unit: "UNE CHANCE SUR", label: "PROBABILITÉ D'APPARITION"},
  {start: 12.82, end: 15.08, kind: 'number', accent: '#5ecbff', number: 15, unit: "JOURS, PUIS DISPARU", label: "DURÉE DE VIE DU JETON"},
  {start: 16.28, end: 19.04, kind: 'icons', accent: '#ff6fa8', emoji: '💰🛒', label: "DES COMPTES REVENDUS TRÈS CHER", subPulseAt: 1.3},
  {start: 19.96, end: 21.44, kind: 'number', accent: '#ff3b30', number: 10000, unit: "DOLLARS RÉCLAMÉS", label: "UN VENDEUR A MÊME TENTÉ"},
  {start: 22.6, end: 23.48, kind: 'stamp', accent: '#ff3b30', label: "SUPPRIMÉ", sub: "ANNONCE RETIRÉE"},
  {start: 24.4, end: 27.34, kind: 'error', accent: '#94a3b8', label: "VENDRE UN COMPTE : INTERDIT"},
  {start: 28.08, end: 30.5, kind: 'void', accent: '#ff3b30', emoji: '🚫', label: "RISQUE : SUSPENSION DU COMPTE", mascot: 'reflechit', mascotCorner: true},
  {start: 31.24, end: 35.06, kind: 'number', accent: '#fb923c', number: 2070, unit: "€ POUR TOUTE LA BOUTIQUE", label: "ET CE JOUR-LÀ ?", subPulseAt: 1.5},
  {start: 36.0, end: 39.36, kind: 'stamp', accent: '#ffd628', label: "LE TRUC LE PLUS FOU", sub: "DE L'ANNÉE", subPulseAt: 1.3},
  {start: 40.04, end: 42.2, kind: 'cta', accent: '#2dd4bf', emoji: '👋', label: "ABONNE-TOI À PIXEL FACTS !", mascot: 'coucou'},
];

export type Word = {start: number; end: number; text: string};

export const WORDS: Word[] = [
  {start: 0, end: 0.28, text: "Un"}, {start: 0.28, end: 0.5, text: "objet"}, {start: 0.5, end: 0.92, text: "minuscule"},
  {start: 0.92, end: 1.2, text: "vendu"}, {start: 1.2, end: 1.88, text: "4 500 $"}, {start: 1.88, end: 2.8, text: "?!"},
  {start: 2.8, end: 3.3, text: "Dans"}, {start: 3.3, end: 3.7, text: "Fortnite,"}, {start: 4.2, end: 4.32, text: "la"},
  {start: 4.32, end: 4.54, text: "collab"}, {start: 4.54, end: 4.76, text: "avec"}, {start: 4.76, end: 4.96, text: "One"},
  {start: 4.96, end: 5.14, text: "Piece"}, {start: 5.14, end: 5.32, text: "a"}, {start: 5.32, end: 5.4, text: "un"},
  {start: 5.4, end: 5.62, text: "objet"}, {start: 5.62, end: 5.88, text: "ultra"}, {start: 5.88, end: 6.1, text: "rare."},
  {start: 6.98, end: 7.26, text: "Son"}, {start: 7.26, end: 7.46, text: "nom,"}, {start: 7.76, end: 7.84, text: "le"},
  {start: 7.84, end: 8.06, text: "jeton"}, {start: 8.06, end: 8.34, text: "pirate."}, {start: 9.38, end: 9.58, text: "Sa"},
  {start: 9.58, end: 9.82, text: "chance"}, {start: 9.82, end: 9.96, text: "d'"}, {start: 9.96, end: 10.38, text: "apparaître,"},
  {start: 10.66, end: 10.78, text: "une"}, {start: 10.78, end: 10.92, text: "sur"}, {start: 10.92, end: 11.52, text: "137"},
  {start: 11.52, end: 11.8, text: "500."}, {start: 12.82, end: 12.98, text: "Il"}, {start: 12.98, end: 13.1, text: "ne"},
  {start: 13.1, end: 13.22, text: "dure"}, {start: 13.22, end: 13.36, text: "que"}, {start: 13.36, end: 13.56, text: "quinze"},
  {start: 13.56, end: 13.76, text: "jours"}, {start: 13.76, end: 13.9, text: "avant"}, {start: 13.9, end: 14.06, text: "de"},
  {start: 14.06, end: 14.54, text: "disparaître"}, {start: 14.54, end: 14.76, text: "pour"}, {start: 14.76, end: 15.08, text: "toujours."},
  {start: 16.28, end: 16.72, text: "Résultat,"}, {start: 17.08, end: 17.16, text: "des"}, {start: 17.16, end: 17.4, text: "comptes"},
  {start: 17.4, end: 17.52, text: "avec"}, {start: 17.52, end: 17.7, text: "ce"}, {start: 17.7, end: 17.98, text: "jeton"},
  {start: 17.98, end: 18.34, text: "revendus"}, {start: 18.34, end: 18.52, text: "très"}, {start: 18.52, end: 18.7, text: "cher"},
  {start: 18.7, end: 18.9, text: "sur"}, {start: 18.9, end: 19.04, text: "eBay."}, {start: 19.96, end: 20.14, text: "Un"},
  {start: 20.14, end: 20.48, text: "vendeur"}, {start: 20.48, end: 20.56, text: "a"}, {start: 20.56, end: 20.68, text: "même"},
  {start: 20.68, end: 21.16, text: "réclamé"}, {start: 21.16, end: 21.3, text: "10"}, {start: 21.3, end: 21.44, text: "000 $."},
  {start: 22.6, end: 23.04, text: "Annonce"}, {start: 23.04, end: 23.48, text: "supprimée."}, {start: 24.4, end: 24.6, text: "Vendre"},
  {start: 24.6, end: 24.74, text: "un"}, {start: 24.74, end: 25.02, text: "compte"}, {start: 25.02, end: 25.9, text: "?"},
  {start: 25.9, end: 26.34, text: "Interdit"}, {start: 26.34, end: 26.5, text: "par"}, {start: 26.5, end: 26.6, text: "les"},
  {start: 26.6, end: 26.82, text: "règles"}, {start: 26.82, end: 26.96, text: "d'"}, {start: 26.96, end: 27.14, text: "Epic"},
  {start: 27.14, end: 27.34, text: "Games."}, {start: 28.08, end: 28.48, text: "Le"}, {start: 28.48, end: 28.7, text: "risque,"},
  {start: 28.7, end: 29.18, text: "la"}, {start: 29.18, end: 29.52, text: "suspension"}, {start: 29.52, end: 30.06, text: "immédiate"},
  {start: 30.06, end: 30.2, text: "du"}, {start: 30.2, end: 30.5, text: "compte."}, {start: 31.24, end: 31.54, text: "Et"},
  {start: 31.54, end: 31.8, text: "acheter"}, {start: 31.8, end: 32.0, text: "toute"}, {start: 32.0, end: 32.16, text: "la"},
  {start: 32.16, end: 32.44, text: "boutique"}, {start: 32.44, end: 32.56, text: "ce"}, {start: 32.56, end: 32.72, text: "jour"},
  {start: 32.72, end: 32.88, text: "-là"}, {start: 32.88, end: 33.7, text: "?"}, {start: 33.7, end: 34.02, text: "Environ"},
  {start: 34.02, end: 34.72, text: "2070"}, {start: 34.72, end: 35.06, text: "€."}, {start: 36.0, end: 36.16, text: "Un"},
  {start: 36.16, end: 36.4, text: "objet"}, {start: 36.4, end: 36.94, text: "minuscule,"}, {start: 37.28, end: 37.38, text: "des"},
  {start: 37.38, end: 37.6, text: "prix"}, {start: 37.6, end: 38.0, text: "énormes,"}, {start: 38.24, end: 38.3, text: "un"},
  {start: 38.3, end: 38.4, text: "des"}, {start: 38.4, end: 38.6, text: "trucs"}, {start: 38.6, end: 38.72, text: "les"},
  {start: 38.72, end: 38.86, text: "plus"}, {start: 38.86, end: 39.02, text: "fous"}, {start: 39.02, end: 39.12, text: "de"},
  {start: 39.12, end: 39.18, text: "l'"}, {start: 39.18, end: 39.36, text: "année."}, {start: 40.04, end: 40.48, text: "Abonne"},
  {start: 40.48, end: 40.66, text: "-toi"}, {start: 40.66, end: 40.8, text: "à"}, {start: 40.8, end: 40.98, text: "Pixel"},
  {start: 40.98, end: 41.38, text: "Facts"}, {start: 41.38, end: 41.58, text: "pour"}, {start: 41.58, end: 41.7, text: "le"},
  {start: 41.7, end: 41.92, text: "prochain"}, {start: 41.92, end: 42.2, text: "fait !"},
];
