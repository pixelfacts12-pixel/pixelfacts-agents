#!/usr/bin/env python3
"""File de production (version Windows, adaptée du guide Eigenflow), en DEUX voies parallèles.

  python file.py video   -> voie vidéo  : Veilleur, analyses, Créateur vidéo, Publicateur vidéo + agents sans IA
  python file.py roblox  -> voie Roblox : Créateur Roblox, retouches, Publicateur Roblox

Chaque voie fait une seule tâche par passage ; le Planificateur de tâches lance chaque voie toutes les 10 minutes.
Les deux voies partagent state.json : on ne le lit/écrit que sous un verrou court, jamais pendant le travail de l'IA.
Rien n'est jamais publié sans ton ✅ dans Discord.
"""
import contextlib, ctypes, json, msvcrt, os, subprocess, sys, time, uuid
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
MAX_EN_ATTENTE = 3  # au-delà, la voie vidéo fait une pause pour ne pas produire dans le vide
REGLES = {("valider", "pret"): "valide", ("valider", "revoir"): "valide", ("revoir", "pret"): "revoir",
          "rejeter": "rejete", "remarque": "a_reprendre"}
MOTS_ANALYSE = ("analyse", "pour info", "référence", "reference", "retiens")
AGENTS_SANS_IA = {"roblox_tendances": 20 * 3600, "roblox_stats": 20 * 3600, "chef": 24 * 3600}  # agents/<nom>.py


def lire(p):
    return [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()] if p.exists() else []


def ecrire(p, data):  # fichier temporaire puis renommage : jamais un fichier écrit à moitié
    tmp = p.with_suffix(f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(p)


@contextlib.contextmanager
def etat():
    """Verrou court sur state.json, partagé par les deux voies."""
    f = open(BASE / ".lock-etat", "a+")
    for _ in range(120):
        try:
            f.seek(0)
            msvcrt.locking(f.fileno(), msvcrt.LK_NBLCK, 1)
            break
        except OSError:
            time.sleep(1)
    else:
        f.close()
        raise TimeoutError("state.json reste verrouillé")
    try:
        st = json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {"items": [], "ev_lus": 0}
        yield st
        ecrire(STATE, st)
    finally:
        f.seek(0)
        msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, 1)
        f.close()


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
            elif e["type"] == "valider":  # idée de jeu Roblox : rangée pour le Créateur Roblox
                with open(BASE / "idees-roblox.md", "a", encoding="utf-8") as f:
                    f.write(f"\n- {time.strftime('%Y-%m-%d')} : {prop['note']} ({prop['url']})\n")
            continue
        it = next((i for i in reversed(st["items"]) if i["id"] == e["item"]), None)
        if not it or it["status"] in ("programme", "rejete"):
            continue
        if e["type"] == "remarque":
            it["remarques"].append(e["text"])
        it["status"] = REGLES.get((e["type"], it["status"]), REGLES.get(e["type"], it["status"]))
    st["ev_lus"] = len(evs)


def choisir(st, voie):
    roblox = voie == "roblox"
    mes_items = [i for i in st["items"] if (i.get("type") == "roblox") == roblox]
    for statut, tache in (("valide", "publication"), ("a_reprendre", "reprise"),
                          ("a_analyser", "analyse"), ("en_cours", "production")):
        for it in (i for i in mes_items if i["status"] == statut):
            if tache == "reprise" and it["reprises"] >= 3:
                it["status"] = "ici"  # trois versions refusées : tu la finis toi-même avec Claude
                continue
            if roblox:
                tache = {"publication": "publication_roblox", "reprise": "reprise_roblox", "production": "roblox"}.get(tache, tache)
            return tache, it
    if roblox:
        actif = any(i["status"] not in ("programme", "rejete", "erreur", "ici") for i in mes_items)
        retours = JEU_ROBLOX / "RETOURS.md"
        en_retard = retours.exists() and "- [ ]" in retours.read_text(encoding="utf-8")
        delai = 12 * 3600 if en_retard else ROBLOX_TOUTES_LES  # tant que tes retours ne sont pas finis : toutes les 12 h
        if not actif and time.time() - st.get("roblox_derniere", 0) > delai:
            st["roblox_derniere"] = time.time()
            it = {"id": "roblox-" + time.strftime("%Y%m%d-%H%M"), "type": "roblox", "url": "", "note": "",
                  "status": "en_cours", "recu": time.time(), "essais": 0, "reprises": 0, "remarques": []}
            st["items"].append(it)
            return "roblox", it
        return None, None
    if sum(i["status"] in ATTENTE for i in mes_items) < MAX_EN_ATTENTE:
        for i in mes_items:  # 10 min d'attente : le temps que ta note suive le lien
            if i["status"] == "a_faire" and time.time() - i.get("recu", 0) > 600:
                i["status"] = "en_cours"  # coupure en route : le passage suivant reprend cet élément
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
                log.write("\n[file.py] coupé : limite de temps atteinte\n")
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


def script(nom, *args, timeout=1800):
    """Lance un agent Python de agents/ et renvoie sa dernière ligne JSON (ou une erreur lisible)."""
    p = subprocess.run([sys.executable, str(BASE / "agents" / nom), *args], capture_output=True, text=True,
                       encoding="utf-8", env={**os.environ, "PYTHONIOENCODING": "utf-8"},
                       creationflags=subprocess.CREATE_NO_WINDOW, timeout=timeout)
    try:
        res = json.loads(p.stdout.strip().splitlines()[-1])
    except (ValueError, IndexError):
        res = {"ok": False}
    res.setdefault("ok", p.returncode == 0)
    if not res["ok"]:
        res["detail"] = (p.stdout + p.stderr)[-300:]
    return res


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
        return  # on retentera après la pause, sans compter d'échec
    it["essais"], s = 0, r.get("status")
    if s == "pret":
        it["status"], it["reprises"] = "pret", it["reprises"] + (tache in ("reprise", "reprise_roblox"))
        message(it, r.get("telegram", "Prête à valider."), r.get("envoi"), boutons=True)
    elif s == "appris":
        it["status"] = "appris"
        message(it, r.get("telegram", "Analysée et rangée dans plan.md."))
    elif tache == "publication" and "_pub" in r:
        res = r["_pub"]
        if res.get("ok"):
            it["status"] = "programme"
            quand = ", ".join(f"{k} : {(v.get('dueAt') or '')[:16].replace('T', ' ')}" for k, v in res["buffer"].items())
            message(it, r.get("telegram", "") + "\nProgrammée sur YouTube Shorts et Instagram Reels (" + quand + ", heure UTC).")
        else:
            it["essais"] += 1
            it["status"] = "erreur" if it["essais"] >= 3 else "valide"
            detail = json.dumps(res.get("buffer") or res.get("detail"), ensure_ascii=False)[:300]
            message(it, f"📤 Publication ratée ({it['essais']}/3) : {detail}")
    else:
        it["status"] = s if s in ("programme", "deja_fait") else "erreur"
        message(it, r.get("telegram") or f"{s or 'erreur'} {r.get('dueAt', '')}".strip())


def apres_roblox_publie(it, res):
    if res.get("ok"):
        it["status"] = "programme"
        message(it, "🎮 Mise à jour publiée sur Roblox : elle est en ligne pour les joueurs !")
    else:
        it["essais"] += 1
        if it["essais"] >= 3:
            it["status"] = "erreur"
            message(it, "🎮 La publication Roblox a échoué 3 fois : " + str(res.get("detail", ""))[-300:])


def apres_veille(st, it, r):
    v = st.setdefault("veille", {"derniere": 0, "essais": 0})
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


def main(voie):
    """voie = "tout" (défaut) : UN agent à la fois pour ménager l'abonnement Pro ; Roblox d'abord, sinon vidéo.
    voie = "video" ou "roblox" : une seule voie (pour faire tourner les deux en parallèle avec un plus gros abonnement)."""
    verrou = open(BASE / f".lock-{voie}", "w")
    try:
        msvcrt.locking(verrou.fileno(), msvcrt.LK_NBLCK, 1)
    except OSError:
        return  # le passage précédent travaille encore
    for v in (("roblox", "video") if voie == "tout" else (voie,)):
        if passage(v):
            return


def passage(voie):
    """Fait au plus une tâche de cette voie. Renvoie True si une tâche a été faite."""
    # 1. Choisir la tâche (verrou court sur l'état)
    with etat() as st:
        if voie == "video":
            agents_sans_ia(st)
        relever(st)
        if PAUSE.exists() and time.time() < float(PAUSE.read_text() or 0):
            return False  # tes réponses sont notées, mais aucune IA ne démarre pendant la pause
        tache, it = choisir(st, voie)
        it = dict(it) if it else None
    if not tache:
        return False

    # 2. Le travail long, SANS tenir l'état (l'autre voie continue pendant ce temps)
    if tache == "publication_roblox":
        r = script("roblox_publier.py", str(JEU_ROBLOX))
    else:
        r = lancer(tache, it)
        if tache == "publication" and r and r.get("status") == "programme" and r.get("video") and r.get("legende"):
            r["_pub"] = script("publier_video.py", r["video"], r["legende"])

    # 3. Enregistrer le résultat sur l'état le plus récent
    with etat() as st:
        if tache == "veille":
            apres_veille(st, it, r)
            return True
        actuel = next((i for i in reversed(st["items"]) if i["id"] == it["id"]), None)
        if not actuel:
            return True
        if tache == "publication_roblox":
            apres_roblox_publie(actuel, r)
        else:
            apres(tache, actuel, r)
    return True


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] in ("video", "roblox", "tout") else "tout")
