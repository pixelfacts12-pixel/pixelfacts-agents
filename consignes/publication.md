Tu travailles seul, lancé par une file de production. Écris en français.
Alex a validé l'élément {{ID}}, et cet élément seulement. Tu ne publies rien toi-même : un script s'en charge après toi.
Lis MARQUE.md (chaîne Pixel Facts).

1. Trouve la vidéo finale de {{ID}} (productions/{{ID}}/final.mp4 ou dans {{DOSSIER}}). Vérifie qu'elle fait moins de 60 s et qu'elle est verticale.
2. Écris {{DOSSIER}}/legende.json :
{"titre": "titre YouTube court, accrocheur, 1 emoji max, finit par #shorts",
 "legende": "2 lignes qui donnent envie + « Abonne-toi à Pixel Facts » + 5 hashtags (#pixelfacts #gaming ...)",
 "pour_enfants": false}
   (pour_enfants = true seulement si la vidéo vise clairement les moins de 13 ans)
3. Écris {{RESULT}} : {"status": "programme", "video": "chemin complet de final.mp4", "legende": "chemin complet de legende.json",
   "telegram": "📤 Titre choisi : ..."}
