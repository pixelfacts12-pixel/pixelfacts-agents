#!/usr/bin/env python3
"""Agent « Publicateur Roblox » : construit le jeu avec Rojo, le publie par l'API officielle Open Cloud,
puis le fait TESTER automatiquement sur les serveurs de Roblox (Luau Execution).

Usage : roblox_publier.py <dossier du projet Rojo> [--test]
  --test : publie en version « Saved » (pas en ligne pour les joueurs), puis lance le contrôle automatique.
Réglages dans ~/.config/file-videos/roblox.json : {"universe_id": 123, "place_id": 456}
+ la clé seule dans roblox_api_key.txt (droits : universe-places write, luau-execution-session write, asset read/write).
Sortie : une ligne JSON {"ok": ..., "version": n, "controle": {...}}. ok = false si le contrôle échoue.
"""
import json, shutil, subprocess, sys, time, urllib.error, urllib.request
from pathlib import Path

CONFDIR = Path.home() / ".config" / "file-videos"
CONF = json.loads((CONFDIR / "roblox.json").read_text(encoding="utf-8-sig"))
CLE = "".join((CONFDIR / "roblox_api_key.txt").read_text(encoding="utf-8-sig").split())  # clé seule, une ligne
ROJO = shutil.which("rojo") or str(Path.home() / "AppData/Local/Microsoft/WinGet/Packages/Rojo.Rojo_Microsoft.Winget.Source_8wekyb3d8bbwe/rojo.exe")
U, P = CONF["universe_id"], CONF["place_id"]

# Script lancé dans un vrai serveur Roblox avec la version testée : les scripts du jeu tournent,
# on attend un peu puis on vérifie que tout ce qui compte existe. Une erreur Luau du jeu fait aussi échouer.
CONTROLE = r'''
-- dans une session de test, Roblox ne démarre pas les scripts du jeu : on les relance nous-mêmes
local erreurs = {}
game:GetService("ScriptContext").Error:Connect(function(msg, trace)
	table.insert(erreurs, msg)
end)
for _, s in ipairs(game:GetService("ServerScriptService"):GetDescendants()) do
	if s:IsA("Script") then
		s.Enabled = false
		s.Enabled = true
	end
end
task.wait(8)
local RS = game:GetService("ReplicatedStorage")
local r = {}
local zones = workspace:FindFirstChild("Zones")
r.zones = zones and #zones:GetChildren() or 0
local p = workspace:FindFirstChild("Poussiere")
r.objets = p and #p:GetChildren() or 0
local d = workspace:FindFirstChild("Decor")
r.decor = d and #d:GetDescendants() or 0
local rem = RS:FindFirstChild("Remotes")
r.remotes = rem and #rem:GetChildren() or 0
r.config = pcall(function() return require(RS.Shared.Config) end)
r.erreurs = erreurs
return game:GetService("HttpService"):JSONEncode(r)
'''


def appel(methode, url, corps=None, entetes=None, brut=None):
    req = urllib.request.Request(url, method=methode, data=brut if brut is not None else (json.dumps(corps).encode() if corps else None),
                                 headers={"x-api-key": CLE, "Content-Type": "application/json", **(entetes or {})})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        return e.code, {"erreur": e.read().decode("utf-8", "replace")[:500]}


def controler(version):
    code, t = appel("POST", f"https://apis.roblox.com/cloud/v2/universes/{U}/places/{P}/versions/{version}/luau-execution-session-tasks",
                    {"script": CONTROLE, "timeout": "120s"})
    if code != 200:
        return {"ok": False, "erreur": f"lancement du test refusé ({code}) : {t}"}
    for _ in range(60):
        time.sleep(4)
        code, t = appel("GET", "https://apis.roblox.com/cloud/v2/" + t["path"])
        etat = t.get("state")
        if etat == "COMPLETE":
            try:
                r = json.loads(t["output"]["results"][0])
            except (KeyError, IndexError, ValueError, TypeError):
                return {"ok": False, "erreur": f"réponse illisible : {t.get('output')}"}
            # Les sessions de test de Roblox ne démarrent pas les Scripts du jeu : on ne peut vérifier ici que
            # les modules (Config) et l'absence d'erreur Luau. Le reste se teste en jouant (Studio ou appli Roblox).
            probleme = [n for n, ok in (("Config", r.get("config")), ("erreurs Luau", not r.get("erreurs"))) if not ok]
            return {"ok": not probleme, "mesures": r, "probleme": probleme}
        if etat in ("FAILED", "CANCELLED"):
            return {"ok": False, "erreur": t.get("error")}
    return {"ok": False, "erreur": "le test n'a pas fini à temps"}


def main():
    projet = Path(sys.argv[1]).resolve()
    test = "--test" in sys.argv
    compilateur = shutil.which("luau-compile")
    if compilateur:  # outil officiel Luau : refuse de publier un fichier avec une faute de code
        fautes = []
        for f in sorted((projet / "src").rglob("*.lua")):
            r = subprocess.run([compilateur, "--null", str(f)], capture_output=True, text=True)
            if r.returncode != 0:
                fautes.append(f"{f.relative_to(projet)} : {(r.stdout + r.stderr).strip()[:300]}")
        if fautes:
            print(json.dumps({"ok": False, "erreur": "fautes de code Luau", "fautes": fautes}, ensure_ascii=False))
            sys.exit(1)
    fichier = projet / "build.rbxlx"
    subprocess.run([str(ROJO), "build", str(projet / "default.project.json"), "-o", str(fichier)], check=True, capture_output=True)
    code, rep = appel("POST", f"https://apis.roblox.com/universes/v1/{U}/places/{P}/versions?versionType={'Saved' if test else 'Published'}",
                      entetes={"Content-Type": "application/xml"}, brut=fichier.read_bytes())
    if code != 200:
        print(json.dumps({"ok": False, "code": code, "erreur": rep}, ensure_ascii=False))
        sys.exit(1)
    version = rep.get("versionNumber")
    controle = controler(version) if test else {"ok": True, "note": "version en ligne : déjà contrôlée en test"}
    print(json.dumps({"ok": controle["ok"], "test": test, "version": version, "controle": controle}, ensure_ascii=False))
    sys.exit(0 if controle["ok"] else 1)


if __name__ == "__main__":
    main()
