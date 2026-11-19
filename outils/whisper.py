#!/usr/bin/env python3
"""Transcription mot à mot (CPU) : python outils/whisper.py voix.mp3 [langue] -> voix.json"""
import json, sys
from pathlib import Path
from faster_whisper import WhisperModel

audio = Path(sys.argv[1])
langue = sys.argv[2] if len(sys.argv) > 2 else "fr"
modele = WhisperModel("small", device="cpu", compute_type="int8")
segments, _ = modele.transcribe(str(audio), language=langue, word_timestamps=True)
sortie = []
for s in segments:
    sortie.append({"debut": s.start, "fin": s.end, "texte": s.text.strip(),
                   "mots": [{"mot": w.word.strip(), "debut": w.start, "fin": w.end} for w in (s.words or [])]})
audio.with_suffix(".json").write_text(json.dumps(sortie, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(sortie)} segments -> {audio.with_suffix('.json')}")
