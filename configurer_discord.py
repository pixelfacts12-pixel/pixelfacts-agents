#!/usr/bin/env python3
"""Configuration unique du bot Discord : lit le jeton, trouve ton salon et ton identifiant, écrit discord.json.
Il faut avoir envoyé « salut » dans le salon #file-videos de ton serveur avant de le lancer."""
import json, subprocess, sys, urllib.request
from pathlib import Path

CONFDIR = Path.home() / ".config" / "file-videos"
TOKEN = "".join((CONFDIR / "discord_token.txt").read_text(encoding="utf-8-sig").split())
TETE = {"Authorization": f"Bot {TOKEN}", "User-Agent": "DiscordBot (file-videos, 1.0)"}
API = "https://discord.com/api/v10"


def get(chemin):
    return json.load(urllib.request.urlopen(urllib.request.Request(API + chemin, headers=TETE), timeout=30))


moi_bot = get("/users/@me")
print("Bot :", moi_bot["username"])
# Discord exige qu'un bot se connecte une fois à sa passerelle avant de pouvoir écrire
subprocess.run(["node", str(Path(__file__).with_name("passerelle_une_fois.mjs"))], input=TOKEN, text=True, timeout=60)
serveurs = get("/users/@me/guilds")
if not serveurs:
    sys.exit("Le bot n'est sur aucun serveur : refais l'étape d'invitation.")
for g in serveurs:
    for c in get(f"/guilds/{g['id']}/channels"):
        if c["type"] == 0 and c["name"] == "file-videos":
            msgs = get(f"/channels/{c['id']}/messages?limit=20")
            humains = [m for m in msgs if not m["author"].get("bot")]
            if not humains:
                sys.exit("Aucun message dans #file-videos : envoie « salut » puis relance.")
            conf = {"token": TOKEN, "channel_id": c["id"], "user_id": humains[0]["author"]["id"]}
            (CONFDIR / "discord.json").write_text(json.dumps(conf), encoding="utf-8")
            print(f"OK : serveur « {g['name']} », salon #file-videos, utilisateur {humains[0]['author']['username']}")
            sys.exit(0)
sys.exit("Salon #file-videos introuvable : crée-le (tout en minuscules, avec le tiret).")
