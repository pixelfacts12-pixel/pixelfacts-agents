#!/usr/bin/env python3
"""Relais Discord : range tes liens et tes réactions, envoie ce que la file dépose. Aucune IA ici.

Lancé chaque minute par le Planificateur de tâches. Il relit le salon, rien ne se perd si le PC est éteint.
Dans le salon :
  - colle un lien            -> la file en fait une vidéo
  - colle un lien + « analyse » -> la file l'analyse et te propose 3 idées
  - sous une vidéo prête : ✅ Valider, 🔁 À revoir, ❌ Rejeter
  - réponds (Répondre) à une vidéo pour demander un changement
"""
import json, re, subprocess, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent
CONF = json.loads((Path.home() / ".config" / "file-videos" / "discord.json").read_text(encoding="utf-8"))
API = "https://discord.com/api/v10"
SALON, MOI = CONF["channel_id"], CONF["user_id"]  # le bot ignore tous les autres comptes
TETE = {"Authorization": f"Bot {CONF['token']}", "User-Agent": "DiscordBot (file-videos, 1.0)"}
REACTIONS = {"✅": "valider", "🔁": "revoir", "❌": "rejeter"}


def appel(methode, chemin, corps=None):
    data = json.dumps(corps).encode() if corps is not None else None
    req = urllib.request.Request(API + chemin, data=data, method=methode,
                                 headers={**TETE, **({"Content-Type": "application/json"} if data else {})})
    for _ in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                txt = r.read()
                return json.loads(txt) if txt else None
        except urllib.error.HTTPError as e:
            if e.code == 429:  # trop de requêtes : Discord dit combien attendre
                time.sleep(float(json.loads(e.read()).get("retry_after", 1)) + 0.2)
                continue
            raise


def ajouter(nom, ligne):
    with open(BASE / nom, "a", encoding="utf-8") as f:
        f.write(json.dumps(ligne, ensure_ascii=False) + "\n")


def lire(nom):
    p = BASE / nom
    return [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()] if p.exists() else []


def recevoir():
    f = BASE / "discord_dernier.txt"
    apres = f.read_text().strip() if f.exists() else None
    if apres is None:  # premier passage : on part du dernier message, sans relire l'historique
        derniers = appel("GET", f"/channels/{SALON}/messages?limit=1") or []
        f.write_text(derniers[0]["id"] if derniers else "0")
        return
    msgs = sorted(appel("GET", f"/channels/{SALON}/messages?limit=100&after={apres}") or [], key=lambda m: int(m["id"]))
    envois = {e["message_id"]: e["item"] for e in lire("envoyes.jsonl")}
    for m in msgs:
        ajouter("updates.jsonl", m)  # copie brute d'abord
        f.write_text(m["id"])
        if m["author"]["id"] != MOI:
            continue
        texte = m.get("content", "")
        lien = re.search(r"https?://\S+", texte)
        vise = (m.get("message_reference") or {}).get("message_id")
        if texte.lower().lstrip().startswith(("jeu:", "jeu :")):  # retour sur le jeu Roblox -> liste du Créateur Roblox
            retours = Path.home() / "Projets" / "balaye-simulator" / "RETOURS.md"
            with open(retours, "a", encoding="utf-8") as f:
                f.write("- [ ] (Discord " + time.strftime("%d/%m") + ") " + texte.split(":", 1)[1].strip() + "\n")
            appel("POST", f"/channels/{SALON}/messages",
                  {"content": "🎮 Ajouté à la liste du Créateur Roblox.", "message_reference": {"message_id": m["id"]}})
            continue
        cible = envois.get(vise)
        if not cible and not lien and texte.strip():  # message libre : retour sur la dernière vidéo 🔁 (ou la dernière envoyée)
            f_rev = BASE / "dernier_revoir.txt"
            avec_boutons = [e["item"] for e in lire("envoyes.jsonl") if e.get("boutons")]
            cible = f_rev.read_text().strip() if f_rev.exists() else (avec_boutons[-1] if avec_boutons else None)
        if cible:  # remarque sur cette vidéo / ce jeu
            ajouter("events.jsonl", {"type": "remarque", "item": cible, "text": texte, "ts": time.time()})
            appel("POST", f"/channels/{SALON}/messages",
                  {"content": "✍️ Retour transmis : l'agent refait une version avec tes remarques.", "message_reference": {"message_id": m["id"]}})
        elif lien:
            ajouter("inbox.jsonl", {"id": f"d{m['id']}", "url": lien[0], "note": texte.replace(lien[0], "").strip()})
            appel("POST", f"/channels/{SALON}/messages",
                  {"content": "Noté, transmis à la file.", "message_reference": {"message_id": m["id"]}})


def reactions():
    decides = {e["message_id"] for e in lire("decides.jsonl")}
    for e in [e for e in lire("envoyes.jsonl") if e.get("boutons") and e["message_id"] not in decides][-15:]:
        for emoji, type_ in REACTIONS.items():
            users = appel("GET", f"/channels/{SALON}/messages/{e['message_id']}/reactions/{urllib.parse.quote(emoji)}") or []
            if any(u["id"] == MOI for u in users):
                ajouter("events.jsonl", {"type": type_, "item": e["item"], "ts": time.time()})
                ajouter("decides.jsonl", {"message_id": e["message_id"]})
                if type_ == "revoir":
                    (BASE / "dernier_revoir.txt").write_text(e["item"])
                    texte = "✍️ Écris ton retour juste en dessous, dans le salon (ce qui ne va pas, ce que tu veux à la place)."
                else:
                    texte = "Transmis à la file."
                appel("POST", f"/channels/{SALON}/messages", {"content": texte, "message_reference": {"message_id": e["message_id"]}})
                break
            time.sleep(0.3)


def envoyer():
    for f in sorted((BASE / "outbox").glob("*.json")) if (BASE / "outbox").exists() else []:
        m = json.loads(f.read_text(encoding="utf-8"))
        if m["video"]:  # moins de 10 Mo, sinon Discord refuse
            cmd = ["curl.exe", "-sf", "-H", f"Authorization: {TETE['Authorization']}", "-H", f"User-Agent: {TETE['User-Agent']}",
                   "--form-string", f"payload_json={json.dumps({'content': m['text']})}",
                   "-F", f"files[0]=@{m['video']}", f"{API}/channels/{SALON}/messages"]
            res = json.loads(subprocess.run(cmd, capture_output=True, text=True, check=True).stdout)
        else:
            res = appel("POST", f"/channels/{SALON}/messages", {"content": m["text"]})
        if m["boutons"]:
            for emoji in REACTIONS:
                appel("PUT", f"/channels/{SALON}/messages/{res['id']}/reactions/{urllib.parse.quote(emoji)}/@me")
                time.sleep(0.4)
        ajouter("envoyes.jsonl", {"message_id": res["id"], "item": m["item"], "boutons": m["boutons"]})
        f.unlink()


if __name__ == "__main__":
    for etape in (recevoir, reactions, envoyer):
        try:
            etape()
        except Exception as e:
            ajouter("erreurs.jsonl", {"etape": etape.__name__, "erreur": repr(e), "ts": time.time()})
