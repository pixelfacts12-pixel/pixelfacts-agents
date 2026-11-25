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
(0,'counter',Y,0,'JOUEURS','','',"surpris",{'to':52,'dec':1,'suffix':' M','corner':1}),
(2.0,'words',P,1,'EN 4 JOURS','','⏱️','',{}),
(S[1],'words',G,4,'ZELDA OCARINA OF TIME','','🎶','',{}),
(S[1]+2.4,'words',B,2,'SUR SWITCH 2','LE 5 NOVEMBRE','🗓️','',{}),
(S[2],'counter',Y,3,'LE JEU ORIGINAL','','','',{'to':1998,'raw':1}),
(S[2]+1.7,'words',P,0,'28 ANS PLUS TARD','','🕹️','',{}),
(S[3],'counter',B,1,'DONT AU JAPON','','','',{'to':810000}),
(S[4],'words',P,2,'ATTENTION !','','⚠️','surpris',{'corner':1}),
(S[4]+1.7,'words',Y,4,'PHYSIQUE + NUMÉRIQUE','TOTAL MONDIAL','🌍','',{}),
(S[5],'counter',G,1,'BOÎTES AUX USA','','','',{'to':1000000,'prefix':'+ '}),
(S[5]+1.8,'words',B,2,'SEULEMENT LES BOÎTES','ÉTATS-UNIS','📦','',{}),
(S[6],'words',Y,0,'LE PREMIER','+ DE 1 MILLION','🥇','',{}),
(S[6]+1.4,'counter',P,3,'DEPUIS','','','',{'to':2023,'raw':1}),
(S[7],'words',B,4,'DEUX CHIFFRES','DIFFÉRENTS','🔢','',{}),
(S[7]+2.0,'words',P,2,'IMPOSSIBLE À COMPARER','','⚖️','reflechit',{'corner':1}),
(S[8],'words',G,0,'ÇA FAIT RÊVER','','✨','',{}),
(S[8]+1.6,'words',Y,3,'DEPUIS 1998','','💚','',{}),
(S[9],'cta',Y,0,'','','','coucou',{}),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"chart"|"bars"|"cta";accent:string;bg:number;label:string;sub:string;icon:string;mascot:string;to?:number;dec?:number;suffix?:string;prefix?:string;raw?:number;corner?:number;r0?:number;r1?:number;v0?:number;v1?:number;l0?:string;l1?:string;unit?:string;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = [']
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    d={'start':round(b[0],2),'end':round(end,2),'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':b[6] if isinstance(b[6],str) else '','mascot':b[7]}
    d.update(b[8]); out.append(json.dumps(d,ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total, [round(B_[i+1][0]-B_[i][0],1) for i in range(len(B_)-1)])
