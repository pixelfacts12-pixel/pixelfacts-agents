#!/usr/bin/env python3
"""Relais Telegram : range tes liens et tes boutons, envoie ce que la file dépose. Aucune IA ici.

Lancé chaque minute par le Planificateur de tâches. Telegram garde 24 h les messages non lus,
donc rien ne se perd si le PC est éteint moins d'une journée.
"""
import json, re, subprocess, time, urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent
CONF = json.loads((Path.home() / ".config" / "file-videos" / "telegram.json").read_text(encoding="utf-8"))
API = f"https://api.telegram.org/bot{CONF['token']}/"
MOI = CONF["chat_id"]  # le bot ignore tous les autres comptes
BOUTONS = (("v", "Valider"), ("r", "À revoir"), ("x", "Rejeter"))
CODES = {"v": "valider", "r": "revoir", "x": "rejeter"}


def appel(methode, **params):
    req = urllib.request.Request(API + methode, json.dumps(params).encode(), {"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=60))["result"]


def ajouter(nom, ligne):
    with open(BASE / nom, "a", encoding="utf-8") as f:
        f.write(json.dumps(ligne, ensure_ascii=False) + "\n")


def traiter(u):
    if "callback_query" in u and u["callback_query"]["from"]["id"] == MOI:
        q = u["callback_query"]
        code, item = q["data"].split("|")
        ajouter("events.jsonl", {"type": CODES[code], "item": item, "ts": time.time()})
        appel("answerCallbackQuery", callback_query_id=q["id"], text="Transmis à la file")
    m = u.get("message") or {}
    if m.get("chat", {}).get("id") != MOI:
        return
    texte = m.get("text", "")
    lien = re.search(r"https?://\S+", texte)
    vise = (m.get("reply_to_message") or {}).get("message_id")
    journal = BASE / "envoyes.jsonl"
    envois = {}
    if journal.exists():
        envois = {e["message_id"]: e["item"] for e in map(json.loads, journal.read_text(encoding="utf-8").splitlines())}
    if vise in envois:  # une réponse à une vidéo envoyée : remarque sur cette vidéo
        ajouter("events.jsonl", {"type": "remarque", "item": envois[vise], "text": texte, "ts": time.time()})
    elif lien:
        ajouter("inbox.jsonl", {"id": f"q{u['update_id']}", "url": lien[0], "note": texte.replace(lien[0], "").strip()})
        appel("sendMessage", chat_id=MOI, text="Noté, transmis à la file.")


def recevoir():
    f = BASE / "offset.txt"
    for u in appel("getUpdates", offset=int(f.read_text()) if f.exists() else 0, timeout=0):
        ajouter("updates.jsonl", u)  # copie brute d'abord : rien ne se perd si la suite plante
        f.write_text(str(u["update_id"] + 1))
        try:
            traiter(u)
        except Exception as e:
            ajouter("erreurs.jsonl", {"update": u["update_id"], "erreur": repr(e)})


def envoyer():
    for f in sorted((BASE / "outbox").glob("*.json")) if (BASE / "outbox").exists() else []:
        m = json.loads(f.read_text(encoding="utf-8"))
        clavier = {"inline_keyboard": [[{"text": t, "callback_data": f"{c}|{m['item']}"} for c, t in BOUTONS]]}
        if m["video"]:  # moins de 50 Mo, sinon Telegram refuse
            cmd = ["curl.exe", "-sf", API + "sendVideo", "--form-string", f"chat_id={MOI}", "-F", f"video=@{m['video']}",
                   "--form-string", "supports_streaming=true", "--form-string", f"caption={m['text']}"]
            cmd += ["--form-string", f"reply_markup={json.dumps(clavier)}"] if m["boutons"] else []
            res = json.loads(subprocess.run(cmd, capture_output=True, text=True, check=True).stdout)["result"]
        else:
            res = appel("sendMessage", chat_id=MOI, text=m["text"], **({"reply_markup": clavier} if m["boutons"] else {}))
        ajouter("envoyes.jsonl", {"message_id": res["message_id"], "item": m["item"]})
        f.unlink()


if __name__ == "__main__":
    recevoir()
    envoyer()
