import json,re,subprocess
lines=[l.split('|',1)[1].strip() for l in open('lignes.txt',encoding='utf-8') if l.strip()]
durs=[float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'voix_l/l{i+1}.wav']))for i in range(len(lines))]
starts=[];t=0
for d in durs: starts.append(t); t+=d+0.12
words=[]
for s,d,l in zip(starts,durs,lines):
    toks=re.findall(r"[^\s]+",l)
    w=[len(x)+2 for x in toks]; tot=sum(w); sp=d-0.1; c=s
    for x,ww in zip(toks,w):
        e=c+sp*ww/tot; words.append({'start':round(c,2),'end':round(e,2),'text':x}); c=e
Y,B,P,G='#FFD628','#5ECBFF','#FF5FA2','#7CFF8A'
# (start,kind,accent,bg,label,sub,icon,extra)
B_=[
(0,'words',Y,0,'RECORD DU MONDE','','🏆','surpris'),
(1.9,'words',B,1,'DANS ROBLOX','','🎮',''),
(4.22,'words',P,2,'NOVEMBRE 2025','','🎯',''),
(6.2,'words',Y,2,'PREMIÈRE FOIS','OFFICIELLE','🥇',''),
(7.5,'words',B,1,'1% WIN OBBY','','🧗',''),
(9.34,'words',G,1,'FINIR LE PARCOURS','','🏁',''),
(10.9,'words',P,3,'LE PLUS VITE','','⏱️','reflechit'),
(12.36,'words',Y,0,'ZÉRO PAYANT','','🚫',''),
(13.9,'words',B,3,'TON TALENT','','⭐',''),
(15.29,'counter',Y,3,'MEILLEURS','',10,''),
(16.9,'words',Y,3,'MÉDAILLE D\'OR','','🥇',''),
(18.53,'words',P,4,'UN JUGE OFFICIEL','','🧑‍⚖️','reflechit'),
(20.3,'words',B,4,'UN CERTIFICAT','','📜',''),
(22.49,'words',G,1,'DEUXIÈME DÉFI','','🔥',''),
(24.4,'words',Y,1,'EASY OBBY','ULTIMATE','🌈',''),
(26.59,'words',P,0,'AUSSI UN RECORD','','🏆',''),
(28.0,'counter',B,5,'JOUEURS EN MÊME TEMPS','',25868678,''),
(30.2,'words',Y,5,'STEAL A BRAINROT','','🧠',''),
(31.85,'words',G,6,'OUI, C\'EST POSSIBLE','','✅','montre'),
(33.3,'words',P,6,'LIVRE DES RECORDS','','📖',''),
(starts[-1],'cta',Y,0,'','','','coucou'),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"cta";accent:string;bg:number;label:string;sub:string;icon:string;to:number;mascot:string;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = ['];
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    to=b[6] if isinstance(b[6],int) else 0
    icon=b[6] if isinstance(b[6],str) else ''
    out.append(json.dumps({'start':b[0],'end':end,'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':icon,'to':to,'mascot':b[7]},ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total)
