# Retours d'Alex (à traiter AVANT toute autre idée, dans l'ordre)

Le Créateur Roblox coche chaque ligne quand elle est finie et testée (build OK + publication de test).
But global : un jeu UNIQUE, beau, qui donne envie dès la 1re minute. Style : cartoon low poly coloré, cohérent partout (pas de mélange réaliste/cartoon).

## 00. PREMIÈRE IMPRESSION (priorité n°1 absolue — demande d'Alex du 20/11, référence : le jeu « Atomic Incremental »)
Quand un joueur arrive, il doit voir TOUT ça, adapté à Balaye (balais, poussière, pièces). On reprend les idées, jamais leurs images ni leurs textes.
- [ ] Gros titre de bienvenue en haut « Bienvenue dans Balaye Simulator ! » + objectif du moment juste dessous (« Balaie 0 / 5 tas »), qui change à chaque étape (= le tutoriel).
- [ ] Flèches au sol (chevrons animés) qui guident vers l'objectif du moment.
- [ ] Panneaux d'améliorations DANS le monde, face au spawn (grands panneaux SurfaceGui inclinés) : une carte par amélioration avec nom, « Niveau 0 / 20 », effet « x1.00 → x1.40 », prix, boutons ACHETER et MAXIMUM. Un panneau pour les améliorations du balai/poussière (valeur, vitesse d'apparition, capacité du sac, rayon de balayage), un second pour celles du joueur (vitesse de marche, aimant, collecte automatique verrouillée « Débloqué à la renaissance 1 »).
- [ ] Tableau de renaissance (prestige) dans le monde : ce qu'il faut, ce que ça rapporte (x2.5 pièces…), ce que ça débloque, bouton « PAS ASSEZ » / « RENAÎTRE ».
- [ ] Classement géant dans le monde (top joueurs par pièces) + statue/piédestal du n°1.
- [ ] Zones verrouillées visibles avec panneau « Débloquer avec la renaissance II » et grande porte « Nécessite la renaissance IV » avec barre 0/4.
- [ ] Menu à droite en grosses icônes 3D colorées avec texte : Quotidien (compteur + « ! » rouge quand dispo), Boutique, Inventaire, Statistiques, Paramètres.
- [ ] En bas au centre : 2e monnaie + bouton « Arbre de talents » (verrouillé au début, cadenas).
- [ ] En bas à droite : boost actif avec minuteur (« x2 pièces 2:42 »).
- [ ] En bas à gauche : bonus amis (« +0 % », bouton + pour inviter) ; à gauche : compteur de pièces avec grosse icône.
- [ ] Bouton « Updates » en haut à droite (nouveautés du jeu).
- [ ] Les objets à ramasser apparaissent autour du joueur en continu (comme les orbes) avec une étiquette « Capacité 5/5 — Sac plein ».
- [ ] Monde : sol en damier lumineux, chemins orange en dalles, falaises stylisées autour, arbres et rochers low-poly, ciel bleu ; tout lisible de loin.

## 0. REFONTE VISUELLE (priorité n°1, suite de la vitrine faite le 20/11) — lis STYLE.md
- [x] Zones plus petites ou bien plus remplies : le joueur doit toujours avoir un gros tas à moins de 10 studs (Config.TailleZone, PoussieresParZone, TasParZone). Viser des montagnes de 60 à 120 objets.
- [x] Grenier : murs en planches avec fenêtres, plus de bric-à-brac (cartons, vieux meubles, toiles d'araignée, malles), pas de grand vide.
- [x] Rendre chaque zone aussi remplie que le Grenier (Plage, Forêt, Volcan, Nuages) et vérifier qu'aucun décor ne bloque la caméra ou le passage.
- [ ] Balai visible et beau, qui change à chaque niveau + effet de poussière à chaque coup.
- [ ] Particules et texte flottant « +12 » au ramassage ; gros effet pour les raretés.
- [ ] Musique de fond chill + sons (utiliser seulement des assets audio Roblox libres vérifiés ; sinon noter dans NOTES.md ce qu'Alex doit choisir).

## 1. Les bases (Alex a testé le 18/11 et trouve le jeu « un peu nul »)
- [x] Bordures de map : chaque zone fermée proprement (murs/haies/clôtures décorées, pas de vide où l'on tombe), plus de murs gris.
- [x] Passer d'une zone à l'autre intuitivement : quand on touche la barrière avec assez d'argent, une fenêtre « Débloquer La Plage pour 400 pièces ? Oui » ; sinon « Il te manque X pièces ». Plus besoin de passer par la boutique.
- [x] Boutons pour voyager entre les mondes déjà débloqués (menu « Mondes » avec téléportation).
- [ ] Tutoriel de départ clair : flèche/guidage étape par étape (1. équipe le balai, 2. balaie 5 tas, 3. va vendre sur la zone verte, 4. achète une amélioration, 5. débloque la Plage), avec textes simples et une récompense à la fin.
- [ ] Ciel stylé et ambiance par zone (Lighting, Atmosphere, Sky, couleurs différentes par monde).

## 2. Rendre le jeu unique et satisfaisant
- [ ] Balai plus détaillé (vrai modèle avec manche, poils, couleur par niveau) et animation de balayage visible.
- [ ] Tas de poussière plus détaillés et variés par zone (sable, feuilles, cendres, nuages...), qui « explosent » en particules quand on les ramasse.
- [ ] Effets spéciaux : particules, sons (balayage, pièces, vente, déblocage), texte flottant « +12 », écran qui célèbre quand on débloque une zone.
- [ ] Plus de choses à faire dès le début : 2 ou 3 améliorations bon marché, une quête simple, des tas « dorés » rares qui rapportent x10.
- [ ] Secrets : objets cachés à trouver dans chaque zone (badge/récompense), un passage secret, un code promo affiché quelque part.
- [ ] Décor : chaque monde a des éléments à lui (palmiers et vagues sur la Plage, arbres en Forêt, lave au Volcan, îles flottantes dans les Nuages).

## 3. Retours d'Alex du 18/11 (soir) — à faire après les parties 1 et 2
- [ ] Roue de la chance avec des objets dedans (tours gratuits gagnés en jouant ; si un tour est payant en Robux, afficher les chances de chaque objet, règle Roblox).
- [ ] Boules/tas de rareté différente (commun, rare, épique, légendaire, mythique) avec couleur, effet et valeur différents.
- [ ] Contour de map propre et net partout (déjà en partie 1 : à soigner encore visuellement).
- [ ] Effets sonores et visuels partout (ramasser, vendre, acheter, débloquer, rareté rare = gros effet).
- [ ] Textures et profondeur : matériaux variés au sol et sur les murs (Material + couleurs + reliefs, décor en plusieurs couches).
- [ ] Pets à acheter avec l'argent du jeu (œufs, raretés, bonus de pièces ou de vitesse de balayage, ils suivent le joueur).
- [ ] Objets à acheter avec l'argent du jeu (boosts, cosmétiques).
- [ ] Microtransactions : Developer Products (packs de pièces, boosts x2 15 min, tours de roue) et game pass (Argent x2, Balai auto, Pets en plus). Les numéros des produits sont à créer par Alex sur create.roblox.com : préparer le code avec des numéros à 0 et lister dans NOTES.md ce qu'Alex doit créer (nom, prix conseillé en Robux).
- [ ] Balais avec pouvoirs différents, formes et couleurs différentes (ex. balai de feu = rayon x2, balai aimant, balai arc-en-ciel = chance de rareté).
- [ ] Traînées pour le joueur (cosmétiques) + améliorations du joueur : vitesse de marche, aimant à poussière, gains hors-ligne (30 min par défaut, améliorable), taille du sac, chance de rareté...
- [ ] Rendre le jeu addictif pour que les joueurs reviennent : objectifs courts, quêtes du jour, classements, récompenses de connexion (le cadeau quotidien existe déjà : le garder et l'améliorer).
- [ ] Cadeaux de session pour que les joueurs restent : 3 cadeaux toutes les 5 min, puis 3 cadeaux toutes les 10 min (meilleurs), puis 3 toutes les 15 min (encore meilleurs), puis on recommence. Le contenu dépend du joueur : un % de son argent, un pet selon le monde où il est, des boosts, des tours de roue.
