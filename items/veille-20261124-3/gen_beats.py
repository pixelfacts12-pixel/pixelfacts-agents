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
(0,'words',Y,0,'6 ANS','POUR NAÎTRE','🥚','surpris',{}),
(1.5,'words',P,1,'POKÉMON','','✨','',{}),
(S[1],'counter',B,1,'GAME BOY','',0,'',{'to':1989,'raw':1}),
(S[1]+2.1,'words',G,1,'GAME BOY','NINTENDO','🎮','',{}),
(S[2],'counter',Y,2,'L\'IDÉE','',0,'',{'to':1990,'raw':1}),
(S[2]+1.9,'words',P,0,'SATOSHI TAJIRI','','💡','reflechit',{'corner':1}),
(S[2]+3.5,'words',B,0,'MONSTRES DE POCHE','','👾','',{}),
(S[3],'words',G,2,'COLLECTION D\'INSECTES','TOKYO, ENFANT','🦋','',{}),
(S[3]+1.9,'words',Y,2,'PETIT','COLLECTIONNEUR','🐛','',{}),
(S[4],'words',B,3,'GAME FREAK','AVEC NINTENDO','🤝','',{}),
(S[4]+2.0,'words',G,3,'SOUTIEN','DE NINTENDO','💪','',{}),
(S[5],'counter',P,3,'ANS DE TRAVAIL','',0,'',{'to':6,'raw':1}),
(S[6],'words',Y,4,'27 FÉVRIER','JAPON','🗓️','',{}),
(S[6]+1.6,'counter',G,4,'AU JAPON','',0,'',{'to':1996,'raw':1}),
(S[6]+3.1,'words',B,1,'1996','C\'EST PARTI !','🚀','',{}),
(S[7],'words',P,4,'ROUGE ET VERT','SUR GAME BOY','🎮','',{}),
(S[7]+1.5,'words',Y,4,'2 JEUX','DÉBUT DE TOUT','⭐','',{}),
(S[8],'words',Y,0,'6 ANS D\'IDÉES','1990 → 1996','🏆','surpris',{'corner':1}),
(S[8]+1.5,'words',G,4,'COLLECTION','GÉANTE','🌍','',{}),
(S[9],'cta',Y,0,'','','','coucou',{}),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"chart"|"bars"|"cta";accent:string;bg:number;label:string;sub:string;icon:string;mascot:string;to?:number;dec?:number;suffix?:string;prefix?:string;raw?:number;raw?:number;corner?:number;r0?:number;r1?:number;v0?:number;v1?:number;l0?:string;l1?:string;unit?:string;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = [']
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    d={'start':round(b[0],2),'end':round(end,2),'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':b[6] if isinstance(b[6],str) else '','mascot':b[7]}
    d.update(b[8]); out.append(json.dumps(d,ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total, [round(B_[i+1][0]-B_[i][0],1) for i in range(len(B_)-1)])
