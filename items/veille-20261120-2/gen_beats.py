import json,re,subprocess
lines=[l.split('|',1)[1].strip() for l in open('lignes.txt',encoding='utf-8') if l.strip()]
durs=[float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'voix_l/l{i+1}.wav']))for i in range(len(lines))]
starts=[];t=0
for d in durs: starts.append(t); t+=d+0.12
words=[]
for s,d,l in zip(starts,durs,lines):
    toks=re.findall(r"[^\s]+",l); w=[len(x)+2 for x in toks]; tot=sum(w); sp=d-0.1; c=s
    for x,ww in zip(toks,w):
        e=c+sp*ww/tot; words.append({'start':round(c,2),'end':round(e,2),'text':x}); c=e
S=starts
Y,B,P,G='#FFD628','#5ECBFF','#FF5FA2','#7CFF8A'
# (start,kind,accent,bg,label,sub,icon,mascot,extra)
B_=[
(0,'words',Y,0,'UNE MARQUE','TROTTINETTES','🛴','surpris',{}),
(1.5,'words',B,0,'DEVENUE UN JEU','','🎮','',{}),
(2.9,'words',P,2,'FAIT PAR DES FANS','','👥','',{}),
(S[1],'words',Y,0,'KUKIRIN','LA MARQUE','🛴','',{}),
(S[1]+1.8,'words',B,1,'KUKIRIN LIFE','LE JEU','🎮','',{}),
(S[1]+3.4,'words',P,1,'AUCUN LIEN','','🚫','',{}),
(S[2],'words',Y,2,'SEPTEMBRE 2026','SORTIE','🚀','',{}),
(S[2]+2.2,'words',G,3,'ENCORE EN TEST','','🧪','',{}),
(S[3],'counter',B,4,'VISITES','',0,'',{'to':105798768,'suffix':''}),
(S[3]+2.0,'words',P,4,'DÉJÀ ÉNORME','','🤯','surpris',{'corner':1}),
(S[4],'counter',Y,2,'JOUEURS','',0,'',{'to':11305,'suffix':''}),
(S[4]+1.5,'words',G,2,'EN MÊME TEMPS','','⏱️','',{}),
(S[5],'words',B,1,'GRANDE CARTE','','🗺️','',{}),
(S[5]+1.6,'words',Y,0,'DES COURSES','','🏁','',{}),
(S[5]+3.1,'words',P,3,'PERSONNALISER','','🎨','',{}),
(S[6],'words',Y,4,'TOP 10','','🏆','',{}),
(S[6]+1.8,'words',B,4,'NOUVEAUX JEUX','ROBLOX','🆕','',{}),
(S[6]+3.4,'words',G,2,'DÉBUT NOVEMBRE','','🍂','',{}),
(S[7],'words',P,2,'JEU DE FANS','','💛','',{}),
(S[7]+1.4,'words',Y,1,'PAS D\'ACCORD','DE LA MARQUE','🙅','',{}),
(S[7]+2.8,'words',B,4,'DES FOULES','','👥','',{}),
(S[8],'words',Y,0,'UNE VRAIE MARQUE','','🛴','reflechit',{'corner':1}),
(S[8]+1.6,'words',P,3,'DEVENUE UN JEU','','🎮','',{}),
(S[8]+3.1,'words',G,1,'TU Y JOUERAIS ?','','🤔','',{}),
(S[9],'cta',Y,0,'','','','coucou',{}),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"chart"|"cta";accent:string;bg:number;label:string;sub:string;icon:string;mascot:string;to?:number;dec?:number;suffix?:string;prefix?:string;corner?:number;r0?:number;r1?:number;v0?:number;v1?:number;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = [']
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    d={'start':round(b[0],2),'end':round(end,2),'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':b[6] if isinstance(b[6],str) else '','mascot':b[7]}
    d.update(b[8]); out.append(json.dumps(d,ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total, [round(B_[i+1][0]-B_[i][0],1) for i in range(len(B_)-1)])
