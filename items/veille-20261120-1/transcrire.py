# Variante de outils/whisper.py : décode l'audio avec ffmpeg (l'ouverture par av échoue sur ce serveur).
import json, subprocess, sys, numpy as np
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
raw = subprocess.run(["ffmpeg","-v","error","-i",src,"-f","f32le","-ac","1","-ar","16000","-"],capture_output=True,check=True).stdout
audio = np.frombuffer(raw, dtype=np.float32)
m = WhisperModel("small", device="cpu", compute_type="int8")
segs,_ = m.transcribe(audio, language="fr", word_timestamps=True)
res=[{"debut":s.start,"fin":s.end,"texte":s.text.strip(),"mots":[{"mot":w.word.strip(),"debut":w.start,"fin":w.end} for w in (s.words or [])]} for s in segs]
json.dump(res, open(out,"w"), ensure_ascii=False, indent=1)
