#!/usr/bin/env python3
"""Agent « Chef » : un bilan par jour dans Discord, sans IA.

Il lit l'état de la file, les erreurs des agents et les stats, et dit à Alex ce qui avance, ce qui l'attend, ce qui bloque.
"""
import json, time, uuid
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
NOMS = {"pret": "attend ta réponse ✅/🔁/❌", "a_faire": "à fabriquer", "en_cours": "en fabrication",
        "valide": "validée, publication en cours", "programme": "terminée / publiée", "erreur": "en erreur ⚠️",
        "appris": "analysée", "rejete": "rejetée", "revoir": "attend ta remarque", "a_reprendre": "en retouche", "ici": "à finir avec Claude"}


def main():
    st = json.loads((BASE / "state.json").read_text(encoding="utf-8"))
    depuis = time.time() - 86400  # erreurs des dernières 24 h
    items = st["items"]
    lignes = [f"🧑‍💼 **Bilan du {time.strftime('%d/%m')}**"]

    compte = {}
    for i in items:
        compte.setdefault(i["status"], []).append(i)
    videos = [i for i in items if i.get("type") != "roblox"]
    lignes.append(f"🎬 Vidéos : {sum(i['status'] == 'pret' for i in videos)} à valider, "
                  f"{sum(i['status'] in ('a_faire', 'en_cours') for i in videos)} en file, "
                  f"{sum(i['status'] == 'programme' for i in videos)} prêtes à poster (dossier a-poster).")
    roblox = [i for i in items if i.get("type") == "roblox"]
    if roblox:
        lignes.append(f"🎮 Roblox : dernière amélioration {roblox[-1]['id']} → {NOMS.get(roblox[-1]['status'], roblox[-1]['status'])}.")
    stats = BASE / "donnees" / "stats-jeu.json"
    if stats.exists():
        h = json.loads(stats.read_text(encoding="utf-8"))
        if h:
            r = h[-1]
            lignes.append(f"📊 Ton jeu : {r['visites']} visites, {r['favoris']} favoris, {r['pour']}👍 / {r['contre']}👎.")
    erreurs = [i for i in items if i["status"] == "erreur"]
    if erreurs:
        lignes.append("⚠️ En erreur : " + ", ".join(i["id"] for i in erreurs) + " (je les regarde à ta prochaine session).")
    pause = BASE / "pause.txt"
    if pause.exists() and time.time() < float(pause.read_text() or 0):
        lignes.append("⏸️ Limite de l'abonnement Claude atteinte : la file reprend toute seule dans moins d'une heure.")
    err = BASE / "erreurs.jsonl"
    if err.exists():
        recentes = [json.loads(l) for l in err.read_text(encoding="utf-8").splitlines() if l.strip()]
        recentes = [e for e in recentes if e.get("ts", 0) > depuis]
        if recentes:
            lignes.append(f"🤖 Le bot Discord a eu {len(recentes)} erreur(s) depuis hier.")
    afaire = BASE / "A-FAIRE-ALEX.md"
    if afaire.exists():
        reste = [l[6:].split(" (")[0] for l in afaire.read_text(encoding="utf-8").splitlines() if l.startswith("- [ ]")]
        if reste:
            lignes.append("👉 Ce qui t'attend : " + " · ".join(reste[:3]))

    (BASE / "outbox").mkdir(exist_ok=True)
    (BASE / "outbox" / f"{time.time_ns()}-{uuid.uuid4().hex[:6]}.json").write_text(
        json.dumps({"item": "chef", "text": "\n".join(lignes)[:1900], "video": None, "boutons": False}, ensure_ascii=False),
        encoding="utf-8")
    print("\n".join(lignes))


if __name__ == "__main__":
    main()
