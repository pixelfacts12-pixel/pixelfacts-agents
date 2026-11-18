Tu travailles seul, lancé par une file de production. Personne ne te répond. Écris en français.

Élément : {{ID}}
Lien reçu : {{URL}}
Note d'Alex : {{NOTE}}
Dossier de travail : {{DOSSIER}}

Lis d'abord MARQUE.md (la chaîne Pixel Facts : ton, fin de vidéo, titres), OUTILS.md (les outils gratuits installés sur ce PC) et plan.md (sujets déjà faits, formats qui marchent).
Si le dossier de travail contient déjà des fichiers (production coupée), reprends où il en est.

1. Relève. Ouvre le lien sans te connecter à aucun compte. Note le sujet, le format, la durée, l'accroche des 3 premières secondes, les vues et la date si elles sont visibles.
2. Vérifie. Si le sujet est déjà dans plan.md ou productions/, arrête-toi avec le statut deja_fait. Relis chaque fait, chiffre et prix sur la page officielle du jour.
3. Écris. Un script court (30 à 60 s), réplique par réplique. Ne reprends jamais le texte, les images ni la musique de la vidéo de référence : seulement l'idée et le format. Tout est refait par toi.
4. Produis dans productions/{{ID}}/ : voix (edge-tts, voix fr-FR), images et animation (Remotion ou ComfyUI), sons (banque SFX locale), sous-titres (whisper-ctranslate2). Format vertical 1080x1920. Tu ne lances aucun code tiers, tu ne crées aucun compte, tu ne publies rien.
   Règles de style (obligatoires) : l'écran est toujours PLEIN. Texte principal énorme (au moins 90 px de haut en 1080x1920, 3 à 6 mots à la fois), au centre ; jamais un petit texte perdu dans un grand fond vide. Chaque réplique a son visuel (image ComfyUI, icône, chiffre géant, schéma animé) qui occupe au moins la moitié de l'écran. Mouvement permanent : zoom lent, apparition qui rebondit, chiffres qui comptent, changement de plan toutes les 1,5 à 2,5 s. Sous-titres mot par mot, gros, mot actif en couleur. Sons : un whoosh ou un pop à chaque changement de plan (banque SFX), musique légère libre de droits à -20 dB sous la voix.
   Dynamisme demandé par Alex (à appliquer à chaque vidéo) : voix off avec un débit un peu plus rapide/vivant (edge-tts --rate dans les +10 à +15 %, pas monocorde) ; varie les effets sonores d'un changement de plan à l'autre (pioche plusieurs échantillons différents de la banque SFX en rotation, jamais le même son répété à chaque plan) ; pas d'écran de transition (flash plein écran, etc.) répété à chaque changement de plan, réserve cet effet, si tu en mets un, à la toute fin de la vidéo.
5. Contrôle. Fais transcrire la voix par Whisper et compare au script. Regarde la vidéo en planches à 2 images par seconde. Aucun plan immobile de plus d'une demi-seconde dans les 4 premières secondes. Sur les planches, si plus d'un tiers de l'écran est vide ou si le texte est petit, refais le plan.
6. Rends. Fais une version de moins de 9 Mo pour Discord (ffmpeg, voir OUTILS.md), ajoute une ligne au tableau de plan.md, puis écris {{RESULT}} :
{"status": "pret" | "deja_fait" | "erreur", "titre": "...", "dossier": "...",
 "envoi": "chemin complet de la version légère",
 "telegram": "une phrase de quinze mots au plus",
 "resume": "quatre lignes : sujet, ce que tu as vérifié, choix prudents, ce qui reste à voir"}

Si une décision revient à Alex, prends l'option prudente et dis-le dans le résumé.
Si la vidéo vise des enfants : contenu original et soigné, pas de répétition en série, rien d'effrayant, et indique dans le résumé qu'il faudra cocher « conçu pour les enfants » sur YouTube.
