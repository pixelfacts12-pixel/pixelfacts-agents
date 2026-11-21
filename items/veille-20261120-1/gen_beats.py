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
(0,'words',Y,0,'29 ANS CACHÉ','','🕵️','surpris',{}),
(1.7,'counter',B,0,'ANS DE MYSTÈRE','',0,'',{'to':29,'suffix':''}),
(S[1],'words',P,2,'TALES OF DESTINY','','🎮','',{}),
(S[1]+2.0,'counter',Y,2,'ANNÉE DE SORTIE','',0,'',{'to':1997,'suffix':'','nofmt':1}),
(S[2],'words',G,1,'LILITH','','👧','',{}),
(S[2]+1.7,'words',B,1,'DANS LE CODE','','💾','',{}),
(S[3],'words',P,3,'PERSONNE SAIT','','❓','reflechit',{'corner':1}),
(S[3]+1.8,'words',Y,3,'JUSQU\'À...','','🔒','',{}),
(S[4],'words',B,4,'JUSTE UNE RUMEUR','','💬','',{}),
(S[4]+2.0,'words',P,0,'DES ANNÉES','','⏳','',{}),
(S[5],'words',Y,3,'NOVEMBRE 2026','','🗓️','',{}),
(S[5]+1.7,'words',G,3,'LE CHEMIN !','','🔑','surpris',{'corner':1}),
(S[6],'words',B,1,'RIEN PRENDRE','','🚫','',{}),
(S[6]+1.8,'words',P,1,'PAS GRONDÉ','','🙊','',{}),
(S[7],'words',Y,4,'LE PRODUCTEUR','','🎤','',{}),
(S[7]+1.5,'words',G,4,'INCROYABLE','','🤩','',{}),
(S[8],'counter',B,2,'REMAKE OFFICIEL','',0,'',{'to':2006,'suffix':'','nofmt':1}),
(S[8]+1.7,'words',P,2,'29 ANS RÉSOLUS','','✅','',{}),
(S[9],'cta',Y,0,'','','','coucou',{}),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"chart"|"cta";accent:string;bg:number;label:string;sub:string;icon:string;mascot:string;to?:number;dec?:number;suffix?:string;prefix?:string;corner?:number;nofmt?:number;r0?:number;r1?:number;v0?:number;v1?:number;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = [']
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    d={'start':round(b[0],2),'end':round(end,2),'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':b[6] if isinstance(b[6],str) else '','mascot':b[7]}
    d.update(b[8]); out.append(json.dumps(d,ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total, [round(B_[i+1][0]-B_[i][0],1) for i in range(len(B_)-1)])
