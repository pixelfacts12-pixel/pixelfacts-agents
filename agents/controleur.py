#!/usr/bin/env python3
"""Agent « Contrôleur » : toutes les 3 h, vérifie que tout tourne, sans IA. Il n'écrit à Alex QUE s'il y a un problème
(au plus une fois par jour pour le même problème) et répare seul ce qu'il peut.

Il vérifie :
  - Buffer : publications en erreur, publications en retard (heure passée mais pas envoyées), files presque vides/pleines ;
  - les vidéos envoyées depuis 26 h sont vraiment PUBLIQUES (YouTube) et en ligne (Instagram) ;
  - la file : éléments bloqués (fabrication > 6 h, publication en attente > 48 h), pause d'abonnement ;
  - GitHub : robots en échec ces 6 dernières heures.
Il écrit donnees/controle.json (dernier bilan, lu par le Chef).
"""
import json, time, urllib.error, urllib.request, uuid
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
CONFDIR = Path.home() / ".config" / "file-videos"
ORGANISATION = "6afe13ce2258c4f532685c07"
DEPOT = "pixelfacts12-pixel/pixelfacts-agents"
UA = {"User-Agent": "Mozilla/5.0 (pixelfacts controleur)"}


def maintenant():
    return datetime.now(timezone.utc)


def date(iso):
    return datetime.fromisoformat(iso.replace("Z", "+00:00")) if iso else None


def buffer(query, variables):
    cle = "".join((CONFDIR / "buffer_api_key.txt").read_text(encoding="utf-8-sig").split())
    req = urllib.request.Request("https://api.buffer.com", data=json.dumps({"query": query, "variables": variables}).encode(),
                                 headers={"Content-Type": "application/json", "Authorization": f"Bearer {cle}"})
    return json.load(urllib.request.urlopen(req, timeout=60))


def posts(statut):
    q = """query($i: PostsInput!) { posts(input: $i, first: 100) { edges { node {
      id channelService status dueAt sentAt externalLink error { message } assets { source } text } } } }"""
    r = buffer(q, {"i": {"organizationId": ORGANISATION, "filter": {"status": [statut]}}})
    return [e["node"] for e in ((r.get("data") or {}).get("posts") or {}).get("edges", [])]


def public(lien):
    try:
        if "youtube" in lien:
            urllib.request.urlopen(urllib.request.Request("https://www.youtube.com/oembed?format=json&url=" + lien, headers=UA), timeout=20)
        else:
            urllib.request.urlopen(urllib.request.Request(lien, headers=UA), timeout=20)
        return True
    except urllib.error.HTTPError as e:
        return e.code == 429  # trop de requêtes : on ne conclut pas
    except Exception:
        return True  # réseau capricieux : on ne crie pas au loup


def controler():
    problemes, reparations, a_relancer = [], [], []
    st = json.loads((BASE / "state.json").read_text(encoding="utf-8"))
    items = st["items"]

    # 1. Buffer
    try:
        programmes, envoyes, erreurs = posts("scheduled"), posts("sent"), posts("error")
        for p in erreurs:
            src = ((p.get("assets") or [{}])[0] or {}).get("source", "")
            it = next((i for i in items if i.get("video_url") and i["video_url"] in src), None)
            problemes.append(f"Buffer : publication {p['channelService']} en erreur ({(p.get('error') or {}).get('message', '?')})")
            if it and it["status"] == "programme" and not it.get("relance_buffer"):
                a_relancer.append(it["id"])  # réparation appliquée par la file (file.py)
                reparations.append(f"je reprogramme {it['id']} automatiquement")
        for p in programmes:
            d = date(p.get("dueAt"))
            if d and (maintenant() - d).total_seconds() > 45 * 60:
                problemes.append(f"Buffer : publication {p['channelService']} prévue à {d:%d/%m %H:%M} UTC mais pas encore envoyée")
        for service in ("youtube", "instagram"):
            n = sum(p["channelService"] == service for p in programmes)
            if n == 0 and any(i["status"] in ("pret", "a_faire", "en_cours") for i in items if i.get("type") != "roblox"):
                problemes.append(f"Buffer : plus aucune vidéo programmée sur {service} (valide des vidéos dans Discord)")
        for p in envoyes:
            d = date(p.get("sentAt"))
            if d and (maintenant() - d).total_seconds() < 26 * 3600 and p.get("externalLink") and not public(p["externalLink"]):
                problemes.append(f"{p['channelService']} : la vidéo {p['externalLink']} n'est pas publique")
    except Exception as e:
        problemes.append(f"Buffer injoignable ({e!r})")

    # 2. La file
    for i in items:
        if i["status"] == "en_cours" and time.time() - i.get("recu", time.time()) > 6 * 3600 and i.get("type") != "roblox":
            problemes.append(f"File : {i['id']} est en fabrication depuis plus de 6 h")
        if i["status"] == "valide" and i.get("attente_buffer") and time.time() - i.get("prochain_essai", time.time()) > 48 * 3600:
            problemes.append(f"File : {i['id']} attend une place dans Buffer depuis plus de 2 jours")
        if i["status"] == "erreur" and time.time() - i.get("recu", 0) < 7 * 86400:
            problemes.append(f"File : {i['id']} est en erreur (3 essais ratés)")
    pause = BASE / "pause.txt"
    if pause.exists() and time.time() < float(pause.read_text() or 0) - 2 * 3600:
        problemes.append("File : en pause longue (limite de l'abonnement Claude)")

    # 3. Robots GitHub
    try:
        r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.github.com/repos/{DEPOT}/actions/runs?per_page=60", headers=UA), timeout=30))
        rates = [x for x in r.get("workflow_runs", []) if x.get("conclusion") == "failure"
                 and (maintenant() - date(x["created_at"])).total_seconds() < 6 * 3600]
        if len(rates) >= 3:
            problemes.append(f"GitHub : {len(rates)} passages de robots en échec ces 6 dernières heures ({rates[0]['name']})")
    except Exception:
        pass

    return problemes, reparations, a_relancer


def main():
    problemes, reparations, a_relancer = controler()
    sortie = BASE / "donnees" / "controle.json"
    sortie.parent.mkdir(exist_ok=True)
    ancien = json.loads(sortie.read_text(encoding="utf-8")) if sortie.exists() else {}
    deja = ancien.get("signales", {})  # problème -> dernière fois qu'on en a parlé
    nouveaux = [p for p in problemes if time.time() - deja.get(p, 0) > 24 * 3600]
    for p in nouveaux:
        deja[p] = time.time()
    deja = {p: t for p, t in deja.items() if p in problemes}  # on oublie ce qui est réglé
    sortie.write_text(json.dumps({"date": maintenant().isoformat(), "problemes": problemes, "reparations": reparations,
                                  "a_relancer": a_relancer, "signales": deja}, ensure_ascii=False, indent=1), encoding="utf-8")
    if nouveaux or reparations:
        texte = "🛡️ **Contrôleur** : " + ("j'ai trouvé un souci" if nouveaux else "petite réparation faite") + "\n"
        texte += "\n".join("⚠️ " + p for p in nouveaux) + ("\n" if nouveaux else "")
        texte += "\n".join("🔧 " + r for r in reparations)
        (BASE / "outbox").mkdir(exist_ok=True)
        (BASE / "outbox" / f"{time.time_ns()}-{uuid.uuid4().hex[:6]}.json").write_text(
            json.dumps({"item": "controleur", "text": texte[:1900], "video": None, "boutons": False}, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"problemes": problemes, "reparations": reparations, "envoyes": len(nouveaux)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
