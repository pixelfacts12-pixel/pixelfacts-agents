#!/usr/bin/env python3
"""Agent « Publicateur vidéo » : met la vidéo en ligne sur GitHub Pages, puis la programme sur YouTube Shorts
et Instagram Reels via l'API Buffer (file d'attente Buffer = horaires choisis par Buffer).

Usage : publier_video.py <chemin video.mp4> <fichier legende.json>
legende.json : {"titre": "...", "legende": "texte + hashtags", "pour_enfants": false}
Réglages (~/.config/file-videos/) : buffer_api_key.txt, github.json {"user": "...", "repo": "..."}, github_token.txt
"""
import json, shutil, subprocess, sys, time, urllib.error, urllib.request
from pathlib import Path

CONFDIR = Path.home() / ".config" / "file-videos"
BUFFER = "".join((CONFDIR / "buffer_api_key.txt").read_text(encoding="utf-8-sig").split())
GH = json.loads((CONFDIR / "github.json").read_text(encoding="utf-8-sig"))
GH_TOKEN = "".join((CONFDIR / "github_token.txt").read_text(encoding="utf-8-sig").split())
DEPOT = Path(__file__).resolve().parent.parent / "media-public"  # copie locale du dépôt GitHub public
CANAUX = {"youtube": "6afe1800ece6dfde5f127239", "instagram": "6afe17ecece6dfde5f12713b"}


def git(*args):
    return subprocess.run(["git", "-C", str(DEPOT), *args], capture_output=True, text=True, check=True)


def mettre_en_ligne(video, nom):
    url_depot = f"https://{GH['user']}:{GH_TOKEN}@github.com/{GH['user']}/{GH['repo']}.git"
    if not (DEPOT / ".git").exists():
        subprocess.run(["git", "clone", "-q", url_depot, str(DEPOT)], check=True, capture_output=True)
        git("remote", "set-url", "origin", f"https://github.com/{GH['user']}/{GH['repo']}.git")  # jeton jamais stocké sur disque
    git("pull", "-q", "--rebase", url_depot, "main")
    (DEPOT / "videos").mkdir(exist_ok=True)
    shutil.copy(video, DEPOT / "videos" / nom)
    git("add", "-A")
    git("-c", "user.name=Pixel Facts", "-c", "user.email=pixelfacts@users.noreply.github.com", "commit", "-q", "-m", f"Vidéo {nom}")
    git("push", "-q", url_depot, "HEAD:main")
    url = f"https://{GH['user'].lower()}.github.io/{GH['repo']}/videos/{nom}"
    for _ in range(40):  # GitHub Pages met 1 à 3 min à publier le fichier
        try:
            with urllib.request.urlopen(urllib.request.Request(url, method="HEAD"), timeout=20) as r:
                if r.status == 200:
                    return url
        except urllib.error.URLError:
            pass
        time.sleep(15)
    raise RuntimeError(f"la vidéo n'est pas apparue sur {url}")


def buffer(query, variables):
    req = urllib.request.Request("https://api.buffer.com", data=json.dumps({"query": query, "variables": variables}).encode(),
                                 headers={"Content-Type": "application/json", "Authorization": f"Bearer {BUFFER}"})
    return json.load(urllib.request.urlopen(req, timeout=60))


MUTATION = """mutation($i: CreatePostInput!) { createPost(input: $i) {
  ... on PostActionSuccess { post { id dueAt } }
  ... on MutationError { message } } }"""


def programmer(url, leg):
    resultats = {}
    for service, canal in CANAUX.items():
        meta = ({"youtube": {"title": leg["titre"][:100], "categoryId": "20", "privacy": "public", "madeForKids": bool(leg.get("pour_enfants")),
                             "isAiGenerated": True, "notifySubscribers": True}}
                if service == "youtube" else
                {"instagram": {"type": "reel", "shouldShareToFeed": True, "isAiGenerated": True}})
        entree = {"channelId": canal, "text": leg["legende"], "schedulingType": "automatic", "mode": "addToQueue",
                  "assets": [{"video": {"url": url, "metadata": {"thumbnailOffset": 1000}}}], "metadata": meta}
        r = buffer(MUTATION, {"i": entree})
        res = (r.get("data") or {}).get("createPost") or {}
        resultats[service] = res.get("post") or {"erreur": res.get("message") or r.get("errors")}
    return resultats


def main():
    if sys.argv[1] == "--upload":  # seulement mettre la vidéo en ligne (dès qu'elle est prête)
        video = Path(sys.argv[2])
        print(json.dumps({"ok": True, "url": mettre_en_ligne(video, f"{time.strftime('%Y%m%d-%H%M%S')}-{video.parent.name}.mp4")}))
        return
    leg = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8-sig"))
    if sys.argv[1].startswith("http"):  # déjà en ligne
        url = sys.argv[1]
    else:
        video = Path(sys.argv[1])
        url = mettre_en_ligne(video, f"{time.strftime('%Y%m%d-%H%M%S')}-{video.parent.name}.mp4")
    res = programmer(url, leg)
    ok = all("id" in v for v in res.values())
    print(json.dumps({"ok": ok, "url": url, "buffer": res}, ensure_ascii=False))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
