#!/usr/bin/env python3
"""Agent « Publicateur Roblox » : construit le jeu avec Rojo puis le publie par l'API officielle Open Cloud.

Usage : roblox_publier.py <dossier du projet Rojo> [--test]
  --test : publie en version « Saved » (visible seulement par toi dans Studio), sans toucher la version en ligne.
Réglages dans ~/.config/file-videos/roblox.json :
  {"universe_id": 123, "place_id": 456}  + la clé seule dans roblox_api_key.txt
La clé se crée sur https://create.roblox.com/dashboard/credentials (droit « universe-places : write »).
"""
import json, shutil, subprocess, sys, urllib.error, urllib.request
from pathlib import Path

CONFDIR = Path.home() / ".config" / "file-videos"
CONF = json.loads((CONFDIR / "roblox.json").read_text(encoding="utf-8-sig"))
CLE = "".join((CONFDIR / "roblox_api_key.txt").read_text(encoding="utf-8-sig").split())  # clé seule, une ligne
ROJO = shutil.which("rojo") or str(Path.home() / "AppData/Local/Microsoft/WinGet/Packages/Rojo.Rojo_Microsoft.Winget.Source_8wekyb3d8bbwe/rojo.exe")


def main():
    projet = Path(sys.argv[1]).resolve()
    test = "--test" in sys.argv
    fichier = projet / "build.rbxlx"
    subprocess.run([str(ROJO), "build", str(projet / "default.project.json"), "-o", str(fichier)], check=True)
    url = (f"https://apis.roblox.com/universes/v1/{CONF['universe_id']}/places/{CONF['place_id']}/versions"
           f"?versionType={'Saved' if test else 'Published'}")
    req = urllib.request.Request(url, data=fichier.read_bytes(), method="POST",
                                 headers={"x-api-key": CLE, "Content-Type": "application/xml"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            print(json.dumps({"ok": True, "test": test, "reponse": json.load(r)}))
    except urllib.error.HTTPError as e:
        print(json.dumps({"ok": False, "code": e.code, "erreur": e.read().decode("utf-8", "replace")[:500]}))
        sys.exit(1)


if __name__ == "__main__":
    main()
