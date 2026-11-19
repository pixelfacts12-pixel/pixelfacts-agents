export type CodeLine = {start: number; end: number; code: string; punch?: boolean};
export type Caption = {start: number; end: number; text: string};

// Lignes de "code" décoratives (condensé, créé pour ce short — pas le texte de la vidéo source).
// Timings calés sur voix.vtt (edge-tts), dédupliqués des micro-chevauchements.
export const codeLines: CodeLine[] = [
  {start: 0.1, end: 5.336, code: 'roblox.valeur // 40 milliards $', punch: true},
  {start: 5.336, end: 8.188, code: '2004 — Menlo Park, Californie'},
  {start: 8.188, end: 11.197, code: 'fondateurs = ["Baszucki", "Cassel"]'},
  {start: 11.197, end: 15.211, code: 'projet.nom = "DynaBlocks"', punch: true},
  {start: 15.211, end: 20.942, code: '// ancienne société vendue : 20 000 000 $ (1998)', punch: true},
  {start: 20.942, end: 23.654, code: 'renommer("DynaBlocks" -> "Roblox") // 2005', punch: true},
  {start: 23.654, end: 25.349, code: 'Robots + Blocs = Roblox'},
  {start: 25.349, end: 28.432, code: 'lancer() // 1er sept. 2006', punch: true},
  {start: 28.432, end: 30.476, code: '// presque personne ne remarque...'},
  {start: 30.476, end: 32.012, code: 'statut: lancement lent'},
  {start: 32.012, end: 35.317, code: 'joueurs++ // ils construisent en cubes'},
  {start: 35.317, end: 39.438, code: 'regle = "les joueurs créent le jeu"'},
  {start: 39.438, end: 42.044, code: 'equipe.taille = 68 // 2013', punch: true},
  {start: 42.044, end: 44.396, code: 'equipe.taille = 163 // 2016', punch: true},
  {start: 44.396, end: 46.207, code: '// la machine démarre enfin'},
  {start: 46.207, end: 49.226, code: 'entreeEnBourse() // 10 mars 2021', punch: true},
  {start: 49.226, end: 52.669, code: 'valorisation = 41,9 milliards $', punch: true},
  {start: 52.669, end: 55.519, code: '// du garage... aux milliards'},
  {start: 55.519, end: 58.368, code: 'return "pas mal, pour DynaBlocks"', punch: true},
];

// Sous-titres exacts (texte du script, pour compréhension/accessibilité).
export const captions: Caption[] = [
  {start: 0.1, end: 5.336, text: "Roblox, quarante milliards de dollars aujourd'hui... a commencé avec des cubes moches, dans un garage."},
  {start: 5.336, end: 8.188, text: '2004, à Menlo Park, en Californie.'},
  {start: 8.188, end: 11.197, text: 'David Baszucki et Erik Cassel lancent un prototype.'},
  {start: 11.197, end: 12.309, text: 'Son nom ?'},
  {start: 12.309, end: 13.697, text: 'Pas Roblox.'},
  {start: 13.697, end: 15.211, text: 'DynaBlocks.'},
  {start: 15.211, end: 20.942, text: 'Les deux ingénieurs avaient déjà vendu leur précédente société, pour vingt millions de dollars, en 1998.'},
  {start: 20.942, end: 23.654, text: '2005 : DynaBlocks devient Roblox.'},
  {start: 23.654, end: 25.349, text: 'Robots plus blocs.'},
  {start: 25.349, end: 28.432, text: '1er septembre 2006 : lancement officiel.'},
  {start: 28.432, end: 30.476, text: 'Presque personne ne le remarque.'},
  {start: 30.476, end: 32.012, text: 'Les débuts sont lents.'},
  {start: 32.012, end: 35.317, text: 'Quelques milliers de joueurs, qui construisent des mondes en cubes.'},
  {start: 35.317, end: 39.438, text: 'Mais la base est déjà là : ce sont les joueurs qui créent, pas juste les développeurs.'},
  {start: 39.438, end: 42.044, text: '2013 : 68 employés.'},
  {start: 42.044, end: 44.396, text: '2016 : 163.'},
  {start: 44.396, end: 46.207, text: 'La machine démarre enfin.'},
  {start: 46.207, end: 49.226, text: '10 mars 2021 : Roblox entre en bourse.'},
  {start: 49.226, end: 52.669, text: 'Valorisation : quarante et un virgule neuf milliards de dollars.'},
  {start: 52.669, end: 55.519, text: "D'un garage avec des cubes tristes... à des milliards."},
  {start: 55.519, end: 58.368, text: "Pas mal, pour un jeu qui s'appelait DynaBlocks."},
];

export const TOTAL_DURATION_S = 60;
