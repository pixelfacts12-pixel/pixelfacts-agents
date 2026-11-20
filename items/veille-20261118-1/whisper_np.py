import json,subprocess,sys,numpy as np
from faster_whisper import WhisperModel
a=sys.argv[1]
raw=subprocess.check_output(['ffmpeg','-v','error','-i',a,'-f','f32le','-ac','1','-ar','16000','-'])
x=np.frombuffer(raw,dtype=np.float32)
m=WhisperModel("small",device="cpu",compute_type="int8")
seg,_=m.transcribe(x,language="fr",word_timestamps=True)
out=[{"debut":s.start,"fin":s.end,"texte":s.text.strip(),"mots":[{"mot":w.word.strip(),"debut":w.start,"fin":w.end} for w in (s.words or [])]} for s in seg]
json.dump(out,open(a.rsplit('.',1)[0]+'.json','w'),ensure_ascii=False,indent=1)
for s in out: print(round(s['debut'],1),s['texte'])
