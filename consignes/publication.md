Tu travailles seul, lancé par une file de production. Écris en français.
Alex a validé l'élément {{ID}}, et cet élément seulement. Tu ne publies rien toi-même : un script s'en charge après toi.
Lis MARQUE.md (chaîne Pixel Facts).

La vidéo finale est DÉJÀ en ligne : {{VIDEO_URL}}
Ne la cherche pas sur le disque (le serveur repart à vide à chaque passage, les .mp4 n'y sont pas) et ne la refais pas.
Pour écrire le titre et la légende, appuie-toi sur {{DOSSIER}}/result.json, script.md ou voix.txt s'ils existent (sinon sur la note : {{NOTE}}).

1. Écris {{DOSSIER}}/legende.json :
{"titre": "titre YouTube court, accrocheur, 1 emoji max, finit par #shorts",
 "legende": "2 lignes qui donnent envie + « Abonne-toi à Pixel Facts » + 5 hashtags (#pixelfacts #gaming ...)",
 "pour_enfants": false}
   (pour_enfants = true seulement si la vidéo vise clairement les moins de 13 ans)
2. Écris {{RESULT}} : {"status": "programme", "video": "{{VIDEO_URL}}", "legende": "chemin complet de legende.json",
   "telegram": "📤 Titre choisi : ..."}
