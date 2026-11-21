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
(0,'words',Y,0,'UN SEUL JEU','ROBLOX','🎮','surpris',{}),
(1.9,'counter',B,0,'JOUEURS EN MÊME TEMPS','',0,'',{'to':25000000,'suffix':''}),
(S[1],'words',P,1,'STEAL A BRAINROT','','🧠','',{}),
(S[1]+2.0,'words',Y,2,'MAI 2025','SORTIE','🆕','',{}),
(S[2],'chart',G,2,'LA COURBE EXPLOSE','OCTOBRE 2025','',  '',{'r0':0,'r1':0.38,'v0':0,'v1':9000000}),
(S[2]+2.3,'chart',Y,2,'25 MILLIONS','D\'UN COUP','','',{'r0':0.38,'r1':0.5,'v0':9000000,'v1':25400000}),
(S[2]+3.9,'words',P,4,'D\'UN COUP !','','💥','',{}),
(S[3],'words',Y,1,'RECORD ABSOLU','','🏆','',{}),
(S[3]+1.9,'words',B,0,'POUR TOUS LES JEUX','','🌍','',{}),
(S[4],'words',P,3,'LE RECORD D\'AVANT','','⏮️','',{}),
(S[4]+1.7,'counter',G,4,'GROW A GARDEN','',0,'',{'to':22000000,'suffix':''}),
(S[5],'words',P,3,'ÇA PEUT REDESCENDRE','','📉','reflechit',{'corner':1}),
(S[5]+1.9,'chart',P,3,'ET ÇA DESCEND','','','',{'r0':0.5,'r1':0.82,'v0':25400000,'v1':1000000}),
(S[6]+1.3,'chart',B,3,'AUJOURD\'HUI','EN MÊME TEMPS','','',{'r0':0.82,'r1':1,'v0':1000000,'v1':73000}),
(S[7],'counter',P,3,'DE MOINS QU\'AU SOMMET','',0,'surpris',{'to':997,'dec':1,'suffix':' %','prefix':'-','corner':1}),
(S[7]+2.0,'words',Y,1,'AU SOMMET','','⛰️','',{}),
(S[8],'counter',Y,4,'MILLIARDS DE VISITES','',0,'',{'to':74,'suffix':'','prefix':'+'}),
(S[8]+2.6,'words',G,4,'ÉNORME !','','🤯','',{}),
(S[9],'words',P,1,'UN PHÉNOMÈNE','','🔥','',{}),
(S[9]+1.8,'words',B,2,'MONTER VITE : FACILE','','🚀','',{}),
(S[9]+3.6,'words',Y,0,'DURER : L\'EXPLOIT','','🏅','',{}),
(S[10],'cta',Y,0,'','','','coucou',{}),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"chart"|"cta";accent:string;bg:number;label:string;sub:string;icon:string;mascot:string;to?:number;dec?:number;suffix?:string;prefix?:string;corner?:number;r0?:number;r1?:number;v0?:number;v1?:number;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = [']
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    d={'start':round(b[0],2),'end':round(end,2),'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':b[6] if isinstance(b[6],str) else '','mascot':b[7]}
    d.update(b[8]); out.append(json.dumps(d,ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total, [round(B_[i+1][0]-B_[i][0],1) for i in range(len(B_)-1)])
