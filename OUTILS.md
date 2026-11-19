# Outils gratuits pour la file vidéo (serveur GitHub, Linux, sans carte graphique)

Tout est installé au début de chaque passage. Tu travailles dans le dossier de la file (dépôt pixelfacts-agents).

| Besoin | Commande |
|---|---|
| Voix off | `edge-tts --voice fr-FR-HenriNeural --text "..." --write-media voix.mp3 --write-subtitles voix.vtt` (autres voix : fr-FR-DeniseNeural, fr-FR-RemyMultilingualNeural ; `edge-tts --list-voices`) |
| Sous-titres / contrôle de la voix | `python outils/whisper.py voix.mp3` → voix.json (mots horodatés, modèle small sur CPU) |
| Animation en code | copier `outils/remotion-template` dans le dossier de travail, `npm ci`, puis `npx remotion render <Composition> out.mp4 --concurrency=4`. Chrome est déjà installé sur le serveur. Police : `@remotion/google-fonts/Fredoka` (npm i @remotion/google-fonts) |
| Images IA (fonds, illustrations) | `curl -L -o image.jpg "https://image.pollinations.ai/prompt/<prompt encodé URL>?width=1080&height=1920&nologo=true&seed=<n>"` (gratuit, sans compte, ~10-30 s ; réessaie avec un autre seed si l'image est ratée). Style : cartoon 3D brillant, couleurs Pixel Facts. Jamais de visage réel ni de logo de marque. |
| Mascotte Pixel | `marque/mascotte_*_transparent.png` (fond transparent), fond `marque/fond_banniere.png` |
| Effets sonores | `outils/sfx/` (crédits dans outils/sfx/CREDITS.md). Pour d'autres sons : Openverse (licences CC0 ou CC-BY seulement, créditer les CC-BY dans la légende) |
| Montage, planches, version légère | `ffmpeg` |
| Version légère Discord (< 9 Mo) | `ffmpeg -i final.mp4 -vf scale=720:1280 -c:v libx264 -preset slow -b:v DEBITk -maxrate DEBITk -bufsize 2xDEBITk -c:a aac -b:a 96k -movflags +faststart envoi.mp4` avec DEBIT = 72000 / durée en s − 96 (60 s → 1100k) |

Règles : licences commerciales seulement (pas de BY-SA), ne jamais lancer de code tiers inconnu, garder final.mp4 (1080x1920) ET envoi.mp4 dans le dossier de travail.
Temps : le serveur a 4 cœurs sans carte graphique ; un rendu Remotion de 60 s prend quelques minutes, c'est normal.
