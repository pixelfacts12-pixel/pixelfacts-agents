import json,re,subprocess
lines=[l.split('|',2)[2].strip() for l in open('lignes.txt',encoding='utf-8') if l.strip()]
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

B_=[
(0,'words',Y,0,'NÉ EN 1990','','🎮','surpris',{}),
(S[0]+2.0,'counter',B,3,'UNE IDÉE','',0,'',{'to':1990,'v0':1980,'nofmt':1}),
(S[1],'words',P,1,'SATOSHI TAJIRI','','🧑‍🔬','',{}),
(S[1]+1.9,'words',G,1,'COLLECTION','','🐛','',{}),
(S[1]+3.6,'words',Y,0,'SUR GAME BOY','','🕹️','',{}),
(S[2],'words',B,2,'GAME FREAK','','💡','montre',{'corner':1}),
(S[2]+1.8,'counter',Y,3,'ANS DE TRAVAIL','',0,'',{'to':6,'v0':0}),
(S[3],'words',P,2,'ESSAIS ET PATIENCE','','🧪','reflechit',{'corner':1}),
(S[3]+2.0,'counter',B,3,'DÉBUT','',0,'',{'to':1990,'v0':1985,'nofmt':1}),
(S[3]+3.7,'counter',G,3,'ARRIVÉE','',0,'',{'to':1996,'v0':1991,'nofmt':1}),
(S[4],'counter',Y,3,'27 FÉVRIER','',0,'',{'to':1996,'v0':1990,'nofmt':1}),
(S[4]+2.0,'words',P,4,'SORTIE AU JAPON','','🗾','surpris',{'corner':1}),
(S[4]+3.5,'words',B,4,'ROUGE ET VERT','','🔴','',{}),
(S[5],'counter',G,3,'30 ANS DÉJÀ','',0,'',{'to':2026,'v0':1996,'nofmt':1}),
(S[5]+1.9,'words',Y,4,'FRANCHISE MONDIALE','','🌍','',{}),
(S[6],'words',P,1,'TOUT A COMMENCÉ','','🌱','',{}),
(S[6]+1.5,'words',B,1,'PAR UNE PASSION','','💖','',{}),
(S[7],'cta',Y,0,'','','','coucou',{}),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"chart"|"cta";accent:string;bg:number;label:string;sub:string;icon:string;mascot:string;to?:number;v0?:number;dec?:number;suffix?:string;prefix?:string;corner?:number;nofmt?:number;r0?:number;r1?:number;v1?:number;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = [']
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    d={'start':round(b[0],2),'end':round(end,2),'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':b[6] if isinstance(b[6],str) else '','mascot':b[7]}
    d.update(b[8]); out.append(json.dumps(d,ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total, [round(B_[i+1][0]-B_[i][0],1) for i in range(len(B_)-1)])
