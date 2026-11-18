# File vidéo : ce que tu dois faire toi-même (15 min)

Ton PC fabrique les vidéos, tu valides sur Telegram, rien ne se publie sans toi.
Envoie un lien au bot : il fait une vidéo inspirée de ce lien (même idée et même format, mais du contenu refait).
Envoie un lien avec le mot **analyse** : il l'analyse, te propose 3 idées et range tout dans `plan.md`.

## 1. Le jeton Claude (pour que la file utilise ton abonnement Pro)
Ouvre un terminal (touche Windows, tape `cmd`, Entrée) et tape :
```
claude setup-token
```
Connecte-toi dans la page qui s'ouvre. Copie le jeton affiché (il commence par `sk-ant-oat`).
Crée le fichier `C:\Users\alexf\.config\file-videos\claude_token.txt` et colles-y le jeton, seul sur la ligne.
Ne le montre à personne et ne le colle jamais dans un chat.

## 2. Le bot Discord
1. Crée un serveur Discord privé (le + à gauche, « Créer le mien », « Pour moi et mes amis ») et un salon texte `file-videos`.
2. Va sur https://discord.com/developers/applications, « New Application », donne un nom, accepte.
3. Onglet **Bot** : active **Message Content Intent**, enregistre, puis « Reset Token » et copie le jeton dans `C:/Users/alexf/.config/file-videos/discord_token.txt`.
4. Onglet **OAuth2** > URL Generator : coche `bot`, puis View Channels, Send Messages, Attach Files, Read Message History, Add Reactions. Ouvre l'URL en bas et ajoute le bot à ton serveur.
5. Écris `salut` dans #file-videos, puis lance `py -3 configurer_discord.py` dans ce dossier.

Dans le salon : colle un lien = une vidéo ; un lien + « analyse » = une analyse. Sous une vidéo prête : ✅ valider, 🔁 à revoir, ❌ rejeter. Réponds au message de la vidéo pour demander un changement.

## 3. Allumer la file
Double-clique sur `installer-taches.cmd`. Pour tout arrêter : `desinstaller-taches.cmd`.

## Bon à savoir
- PC éteint = rien ne tourne. le bot relit le salon au rallumage, rien ne se perd.
- Abonnement Pro : compte environ 1 à 3 vidéos par jour avant d'atteindre la limite d'usage.
- Publication : pour l'instant la vidéo validée arrive dans `a-poster\`, prête à poster à la main avec sa légende. Coche toujours la mention IA.
- Gagner de l'argent avec les vidéos (YouTube Partenaire, fonds TikTok) demande 18 ans, ou un parent qui ouvre et gère le compte de paiement.
