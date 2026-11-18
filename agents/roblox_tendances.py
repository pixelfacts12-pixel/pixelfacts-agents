#!/usr/bin/env python3
"""Agent « Analyste Roblox » : relève les jeux Roblox qui montent, sans compte et sans IA.

Écrit donnees/roblox-tendances.json et donnees/roblox-tendances.md (lu par le Veilleur et le Créateur Roblox).
Critère principal : jeu récent (moins de 90 jours) avec beaucoup de joueurs en ce moment.
"""
import json, time, urllib.request, uuid
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SORTIE = BASE / "donnees"
UA = {"User-Agent": "Mozilla/5.0 (file-videos veille)"}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return json.load(r)


def classements():
    d = get(f"https://apis.roblox.com/explore-api/v1/get-sorts?sessionId={uuid.uuid4()}&device=computer&country=all")
    jeux = {}
    for s in d.get("sorts", []):
        if s.get("sortId") not in ("top-trending", "up-and-coming", "top-playing-now"):
            continue
        for g in s.get("games") or []:
            u = g.get("universeId")
            if u and u not in jeux:
                jeux[u] = {"universeId": u, "placeId": g.get("rootPlaceId"), "nom": g.get("name"),
                           "joueurs": g.get("playerCount", 0), "classement": s["sortId"],
                           "votes_pour": g.get("totalUpVotes", 0), "votes_contre": g.get("totalDownVotes", 0)}
    return jeux


def details(jeux):
    ids = list(jeux)
    for i in range(0, len(ids), 50):
        lot = ",".join(str(u) for u in ids[i:i + 50])
        for g in get(f"https://games.roblox.com/v1/games?universeIds={lot}").get("data", []):
            j = jeux.get(g["id"])
            if j:
                j.update({"cree": g.get("created", "")[:10], "maj": g.get("updated", "")[:10],
                          "visites": g.get("visits", 0), "favoris": g.get("favoritedCount", 0),
                          "genre": g.get("genre_l1") or g.get("genre", ""), "description": (g.get("description") or "")[:200]})
        time.sleep(0.5)


def main():
    SORTIE.mkdir(exist_ok=True)
    jeux = classements()
    details(jeux)
    maintenant = datetime.now(timezone.utc)
    for j in jeux.values():
        try:
            j["age_jours"] = (maintenant - datetime.fromisoformat(j["cree"]).replace(tzinfo=timezone.utc)).days
        except (KeyError, ValueError):
            j["age_jours"] = 9999
        total = j["votes_pour"] + j["votes_contre"]
        j["note"] = round(100 * j["votes_pour"] / total) if total else None
    recents = sorted((j for j in jeux.values() if j["age_jours"] <= 90), key=lambda j: -j["joueurs"])
    (SORTIE / "roblox-tendances.json").write_text(json.dumps({"date": maintenant.isoformat(), "recents": recents,
                                                              "tous": list(jeux.values())}, ensure_ascii=False, indent=1), encoding="utf-8")
    lignes = [f"# Jeux Roblox récents qui montent ({maintenant:%Y-%m-%d})", "",
              "| Jeu | Joueurs | Âge (j) | Note | Genre | Lien |", "|---|---|---|---|---|---|"]
    for j in recents[:25]:
        lignes.append(f"| {j['nom']} | {j['joueurs']} | {j['age_jours']} | {j['note']}% | {j.get('genre', '')} | "
                      f"https://www.roblox.com/games/{j['placeId']} |")
    (SORTIE / "roblox-tendances.md").write_text("\n".join(lignes) + "\n", encoding="utf-8")
    print(f"{len(jeux)} jeux relevés, {len(recents)} récents")


if __name__ == "__main__":
    main()
