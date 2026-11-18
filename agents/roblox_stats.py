#!/usr/bin/env python3
"""Agent « Analyste map perso » : relève les chiffres publics de ton jeu Roblox chaque jour, sans IA.

Écrit donnees/stats-jeu.json (historique) et donnees/stats-jeu.md (lu par le Créateur Roblox et le Chef).
"""
import json, time, urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SORTIE = BASE / "donnees"
CONF = json.loads((Path.home() / ".config" / "file-videos" / "roblox.json").read_text(encoding="utf-8-sig"))
UA = {"User-Agent": "Mozilla/5.0 (file-videos stats)"}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return json.load(r)


def main():
    SORTIE.mkdir(exist_ok=True)
    u = CONF["universe_id"]
    g = (get(f"https://games.roblox.com/v1/games?universeIds={u}").get("data") or [{}])[0]
    v = (get(f"https://games.roblox.com/v1/games/votes?universeIds={u}").get("data") or [{}])[0]
    releve = {"date": time.strftime("%Y-%m-%d %H:%M"), "visites": g.get("visits", 0), "joueurs": g.get("playing", 0),
              "favoris": g.get("favoritedCount", 0), "pour": v.get("upVotes", 0), "contre": v.get("downVotes", 0),
              "maj": (g.get("updated") or "")[:16]}
    fichier = SORTIE / "stats-jeu.json"
    hist = json.loads(fichier.read_text(encoding="utf-8")) if fichier.exists() else []
    hist.append(releve)
    fichier.write_text(json.dumps(hist[-120:], ensure_ascii=False, indent=1), encoding="utf-8")
    lignes = [f"# Stats de « {g.get('name', 'mon jeu')} » (universe {u})", "",
              "| Date | Visites | Joueurs | Favoris | 👍 | 👎 |", "|---|---|---|---|---|---|"]
    for r in hist[-14:]:
        lignes.append(f"| {r['date']} | {r['visites']} | {r['joueurs']} | {r['favoris']} | {r['pour']} | {r['contre']} |")
    if len(hist) >= 2:
        lignes += ["", f"Depuis le relevé précédent : {hist[-1]['visites'] - hist[-2]['visites']:+d} visites, "
                       f"{hist[-1]['favoris'] - hist[-2]['favoris']:+d} favoris."]
    (SORTIE / "stats-jeu.md").write_text("\n".join(lignes) + "\n", encoding="utf-8")
    print(json.dumps(releve, ensure_ascii=False))


if __name__ == "__main__":
    main()
