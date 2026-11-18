# Outils gratuits de ce PC pour la file vidéo

Tout est déjà installé (RTX 5070 Ti). Mode d'emploi complet : %USERPROFILE%\Tools\MONTAGE_OUTILS.md

| Besoin | Commande |
|---|---|
| Voix off | `edge-tts --voice fr-FR-HenriNeural --text "..." --write-media voix.mp3 --write-subtitles voix.vtt` (voix : `edge-tts --list-voices`, ex. fr-FR-DeniseNeural, fr-FR-RemyMultilingualNeural) |
| Sous-titres / contrôle de la voix | `whisper-ctranslate2 voix.mp3 --language fr --word_timestamps True --output_format json` |
| Animation en code | copier `%USERPROFILE%\Tools\remotion-template`, puis `npx remotion render <Composition> out.mp4` |
| Images IA | `%USERPROFILE%\Tools\ComfyUI\.venv\Scripts\python.exe %USERPROFILE%\Tools\comfy\gen.py image "prompt" -o out.png --w 1080 --h 1920` |
| Plans vidéo IA | `... gen.py video "prompt" -o out.mp4 --seconds 3` |
| Effets sonores | banque `%USERPROFILE%\Sons\SFX` (crédits dans CREDITS.md) |
| Version légère Discord (< 9 Mo) | `ffmpeg -i final.mp4 -vf scale=720:1280 -c:v libx264 -preset slow -b:v DEBITk -maxrate DEBITk -bufsize 2xDEBITk -c:a aac -b:a 96k -movflags +faststart envoi.mp4` avec DEBIT = 72000 / durée en s − 96 (60 s → 1100k) |

Règles : licences commerciales seulement (pas de BY-SA), créditer les CC-BY, ne jamais lancer de code tiers inconnu.
