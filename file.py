#!/usr/bin/env python3
"""File de production de vidéos (version Windows, adaptée du guide Eigenflow).

Un passage = une seule tâche. Le Planificateur de tâches Windows le lance toutes les 10 minutes.
Rien n'est jamais publié sans que tu aies touché « Valider » sur Telegram.
"""
import ctypes, json, msvcrt, os, subprocess, sys, time, uuid
from pathlib import Path

BASE = Path(__file__).resolve().parent
INBOX, EVENTS, STATE = BASE / "inbox.jsonl", BASE / "events.jsonl", BASE / "state.json"
PAUSE = BASE / "pause.txt"  # limite de l'abonnement atteinte : heure de reprise
CLAUDE = str(Path.home() / ".local" / "bin" / "claude.exe")
MODELE = "sonnet"  # abonnement Pro : sonnet use beaucoup moins la limite qu'opus
TIMEOUT = {"production": 4 * 3600, "reprise": 2 * 3600, "publication": 3600, "analyse": 3600, "veille": 3600,
           "roblox": 3 * 3600, "reprise_roblox": 2 * 3600}
VEILLE_TOUTES_LES = 22 * 3600
ROBLOX_TOUTES_LES = 48 * 3600
JEU_ROBLOX = Path.home() / "Projets" / "balaye-simulator"
ATTENTE = ("pret", "revoir")  # vidéos qui attendent ta réponse
MAX_EN_ATTENTE = 3  # au-delà, la file fait une pause pour ne pas produire dans le vide
REGLES = {("valider", "pret"): "valide", ("valider", "revoir"): "valide", ("revoir", "pret"): "revoir",
          "rejeter": "rejete", "remarque": "a_reprendre"}
MOTS_ANALYSE = ("analyse", "pour info", "référence", "reference", "retiens")


def lire(p):
    return [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()] if p.exists() else []


def ecrire(p, data):  # fichier temporaire puis renommage : jamais un fichier écrit à moitié
    tmp = p.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(p)


def relever(st):
    connus = {i["id"] for i in st["items"]}
    for e in lire(INBOX):
        if e["id"] in connus:
            continue
        analyse = any(m in e.get("note", "").lower() for m in MOTS_ANALYSE)
        st["items"].append({"id": e["id"], "url": e["url"], "note": e.get("note", ""),
                            "status": "a_analyser" if analyse else "a_faire", "recu": time.time(),
                            "essais": 0, "reprises": 0, "remarques": []})
    evs = lire(EVENTS)
    for e in evs[st["ev_lus"]:]:
        prop = st.setdefault("propositions", {}).pop(e["item"], None)
        if prop:  # une proposition du Veilleur : ✅ = on la produit, ❌ ou 🔁 = on l'oublie
            if e["type"] == "valider" and prop["type"] == "video":
                st["items"].append({"id": e["item"], "url": prop["url"], "note": prop["note"], "status": "a_faire",
                                    "recu": time.time() - 600, "essais": 0, "reprises": 0, "remarques": []})
            elif e["type"] == "valider":  # idée de jeu Roblox : rangée pour l'agent Roblox
                with open(BASE / "idees-roblox.md", "a", encoding="utf-8") as f:
                    f.write(f"\n- {time.strftime('%Y-%m-%d')} : {prop['note']} ({prop['url']})\n")
            continue
        it = next((i for i in st["items"] if i["id"] == e["item"]), None)
        if not it or it["status"] in ("programme", "rejete"):
            continue
        if e["type"] == "remarque":
            it["remarques"].append(e["text"])
        it["status"] = REGLES.get((e["type"], it["status"]), REGLES.get(e["type"], it["status"]))
    st["ev_lus"] = len(evs)


def choisir(st):
    for statut, tache in (("valide", "publication"), ("a_reprendre", "reprise"),
                          ("a_analyser", "analyse"), ("en_cours", "production")):
        for it in (i for i in st["items"] if i["status"] == statut):
            if tache == "reprise" and it["reprises"] >= 3:
                it["status"] = "ici"  # trois versions refusées : tu la finis toi-même avec Claude
                continue
            if it.get("type") == "roblox":  # même circuit, mais l'agent Roblox à la place de l'agent vidéo
                tache = {"publication": "publication_roblox", "reprise": "reprise_roblox",
                         "production": "roblox"}.get(tache, tache)
            return tache, it
    roblox_actif = any(i.get("type") == "roblox" and i["status"] not in ("programme", "rejete", "erreur", "ici")
                       for i in st["items"])
    if not roblox_actif and time.time() - st.get("roblox_derniere", 0) > ROBLOX_TOUTES_LES:
        st["roblox_derniere"] = time.time()  # le Créateur Roblox améliore le jeu tous les 2 jours
        it = {"id": "roblox-" + time.strftime("%Y%m%d"), "type": "roblox", "url": "", "note": "", "status": "en_cours",
              "recu": time.time(), "essais": 0, "reprises": 0, "remarques": []}
        st["items"].append(it)
        return "roblox", it
    if sum(i["status"] in ATTENTE for i in st["items"]) < MAX_EN_ATTENTE:
        for i in st["items"]:  # 10 min d'attente : le temps que ta note suive le lien
            if i["status"] == "a_faire" and time.time() - i.get("recu", 0) > 600:
                return "production", i
    v = st.setdefault("veille", {"derniere": 0, "essais": 0})
    if time.time() - v["derniere"] > VEILLE_TOUTES_LES:  # le Veilleur passe une fois par jour
        return "veille", {"id": "veille-" + time.strftime("%Y%m%d"), "url": "", "note": "",
                          "essais": v["essais"], "reprises": 0, "remarques": []}
    return None, None


def garder_eveille(oui):  # empêche la mise en veille du PC pendant une tâche
    ES_CONTINUOUS, ES_SYSTEM_REQUIRED = 0x80000000, 0x00000001
    ctypes.windll.kernel32.SetThreadExecutionState(ES_CONTINUOUS | (ES_SYSTEM_REQUIRED if oui else 0))


def lancer(tache, it):
    d = BASE / "items" / it["id"]
    d.mkdir(parents=True, exist_ok=True)
    res = d / "result.json"
    if res.exists():
        res.rename(d / f"result-{int(time.time())}.json")
    consigne = (BASE / "consignes" / f"{tache}.md").read_text(encoding="utf-8")
    for k, v in {"ID": it["id"], "URL": it["url"], "NOTE": it["note"] or "(aucune)", "RESULT": str(res),
                 "DOSSIER": str(d), "REMARQUES": "\n".join(it["remarques"]) or "(aucune)"}.items():
        consigne = consigne.replace("{{" + k + "}}", v)
    # stream-json : le journal se remplit en direct, on voit où une tâche s'arrête
    # --safe-mode : sans plugins ni serveurs MCP (Fortnite, Vercel...) qui coûtent des jetons pour rien
    cmd = [CLAUDE, "-p", consigne, "--model", MODELE, "--output-format", "stream-json", "--verbose",
           "--permission-mode", "auto", "--safe-mode"]
    if it.get("type") == "roblox":  # le Créateur Roblox travaille aussi dans le dossier du jeu
        cmd += ["--add-dir", str(JEU_ROBLOX)]
    # environnement propre : aucune clé API ni réglage hérité d'une autre session Claude, seulement ton jeton
    env = {k: v for k, v in os.environ.items()
           if not k.upper().startswith(("ANTHROPIC_", "CLAUDE", "USE_LOCAL_OAUTH", "USE_STAGING_OAUTH"))}
    jeton = Path.home() / ".config" / "file-videos" / "claude_token.txt"  # sortie de « claude setup-token »
    if jeton.exists():
        # sans aucun espace ni retour à la ligne (le copier-coller sur 2 lignes en ajoute)
        env["CLAUDE_CODE_OAUTH_TOKEN"] = "".join(jeton.read_text(encoding="utf-8-sig").split())
    garder_eveille(True)
    try:
        with open(d / f"{tache}-{int(time.time())}.log", "w", encoding="utf-8") as log:
            debut = time.time()
            try:
                r = subprocess.run(cmd, cwd=BASE, stdout=log, stderr=subprocess.STDOUT, env=env,
                                   stdin=subprocess.DEVNULL, timeout=TIMEOUT[tache],
                                   # console cachée et stable : sans elle, chaque commande ouvre puis
                                   # ferme sa propre console et Windows tue Claude (code 129)
                                   creationflags=subprocess.CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP)
                log.write(f"\n[file.py] fin, code {r.returncode}, {int(time.time() - debut)} s\n")
            except subprocess.TimeoutExpired:
                log.write(f"\n[file.py] coupé : limite de temps atteinte\n")
            except Exception as e:
                log.write(f"\n[file.py] erreur : {e!r}\n")
    finally:
        garder_eveille(False)
    try:
        return json.loads(res.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        pass
    fin = "".join(sorted(d.glob(f"{tache}-*.log"))[-1].read_text(encoding="utf-8", errors="replace")[-4000:].lower().split())
    if any(m in fin for m in ("usagelimit", "hityourlimit", "limitreached", "rate_limit", "overloaded")):
        PAUSE.write_text(str(time.time() + 3600))  # limite de l'abonnement : pause d'1 h, sans compter d'échec
        return {"status": "limite"}
    return None


def message(it, texte, video=None, boutons=False):
    (BASE / "outbox").mkdir(exist_ok=True)
    ecrire(BASE / "outbox" / f"{time.time_ns()}-{uuid.uuid4().hex[:6]}.json",
           {"item": it["id"], "text": texte, "video": video, "boutons": boutons})


def apres(tache, it, r):
    if not r:  # pas de result.json : le passage suivant réessaie, trois fois au plus
        it["essais"] += 1
        if it["essais"] >= 3:
            it["status"] = "erreur"
            message(it, "Trois essais ratés, à regarder à la main.")
        return
    if r.get("status") == "limite":
        if it.get("type") != "roblox" and tache == "production":
            it["status"] = "en_cours"
        return  # on retentera après la pause, sans compter d'échec
    it["essais"], s = 0, r.get("status")
    if s == "pret":
        it["status"], it["reprises"] = "pret", it["reprises"] + (tache in ("reprise", "reprise_roblox"))
        message(it, r.get("telegram", "Prête à valider."), r.get("envoi"), boutons=True)
    elif s == "appris":
        it["status"] = "appris"
        message(it, r.get("telegram", "Analysée et rangée dans plan.md."))
    else:
        it["status"] = s if s in ("programme", "deja_fait") else "erreur"
        message(it, r.get("telegram") or f"{s or 'erreur'} {r.get('dueAt', '')}".strip())


def main():
    verrou = open(BASE / ".lock", "w")
    try:
        msvcrt.locking(verrou.fileno(), msvcrt.LK_NBLCK, 1)
    except OSError:
        return  # le passage précédent travaille encore
    st = json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {"items": [], "ev_lus": 0}
    agents_sans_ia(st)
    if PAUSE.exists() and time.time() < float(PAUSE.read_text() or 0):
        relever(st)  # on note quand même tes réponses, mais aucune IA ne démarre pendant la pause
        ecrire(STATE, st)
        return
    relever(st)
    tache, it = choisir(st)
    if tache == "production":
        it["status"] = "en_cours"  # coupure en route : le passage suivant reprend cet élément
    ecrire(STATE, st)
    if tache == "publication_roblox":
        publier_roblox(it)
        ecrire(STATE, st)
    elif tache == "veille":
        apres_veille(st, it, lancer(tache, it))
        ecrire(STATE, st)
    elif tache:
        apres(tache, it, lancer(tache, it))
        ecrire(STATE, st)


AGENTS_SANS_IA = {"roblox_tendances": 20 * 3600}  # script dans agents/ : intervalle entre deux passages


def agents_sans_ia(st):
    """Agents qui ne coûtent rien en abonnement Claude : de simples scripts Python lancés à intervalle fixe."""
    derniers = st.setdefault("agents", {})
    for nom, intervalle in AGENTS_SANS_IA.items():
        if time.time() - derniers.get(nom, 0) < intervalle:
            continue
        derniers[nom] = time.time()
        with open(BASE / "agents" / f"{nom}.log", "a", encoding="utf-8") as log:
            log.write(f"\n--- {time.strftime('%Y-%m-%d %H:%M')}\n")
            log.flush()
            try:
                subprocess.run([sys.executable, str(BASE / "agents" / f"{nom}.py")], stdout=log, stderr=subprocess.STDOUT,
                               timeout=600, env={**os.environ, "PYTHONIOENCODING": "utf-8"},
                               creationflags=subprocess.CREATE_NO_WINDOW)
            except Exception as e:
                log.write(f"erreur : {e!r}\n")


def publier_roblox(it):
    """Publication Roblox : pas besoin d'IA, le script officiel Open Cloud suffit."""
    r = subprocess.run([sys.executable, str(BASE / "agents" / "roblox_publier.py"), str(JEU_ROBLOX)],
                       capture_output=True, text=True, encoding="utf-8", env={**os.environ, "PYTHONIOENCODING": "utf-8"},
                       creationflags=subprocess.CREATE_NO_WINDOW)
    if r.returncode == 0:
        it["status"] = "programme"
        message(it, "🎮 Mise à jour publiée sur Roblox : elle est en ligne pour les joueurs !")
    else:
        it["essais"] += 1
        if it["essais"] >= 3:
            it["status"] = "erreur"
            message(it, "🎮 La publication Roblox a échoué 3 fois : " + (r.stdout + r.stderr)[-300:])


def apres_veille(st, it, r):
    v = st["veille"]
    if r and r.get("status") == "limite":
        return
    if not r or not r.get("propositions"):
        v["essais"] += 1
        if v["essais"] >= 3:  # on réessaie demain
            v["derniere"], v["essais"] = time.time(), 0
            message(it, "🔎 Veilleur : trois essais ratés aujourd'hui, je réessaie demain.")
        return
    v["derniere"], v["essais"] = time.time(), 0
    message(it, r.get("telegram", "🔎 Le Veilleur a trouvé de nouvelles idées :"))
    for n, p in enumerate(r["propositions"][:6], 1):
        pid = f"{it['id']}-{n}"
        st.setdefault("propositions", {})[pid] = {"type": p.get("type", "video"), "url": p.get("url", ""),
                                                  "note": p.get("note", p.get("titre", ""))}
        icone = "🎬" if p.get("type", "video") == "video" else "🎮"
        texte = f"{icone} **{p.get('titre', '')}**\n{p.get('pourquoi', '')}\n<{p.get('url', '')}>\n✅ je veux · ❌ non"
        message({"id": pid}, texte[:1900], boutons=True)


if __name__ == "__main__":
    main()
