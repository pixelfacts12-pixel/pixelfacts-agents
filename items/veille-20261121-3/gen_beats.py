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
(0,'words',Y,0,'TA XBOX 360','','🎮','surpris',{}),
(1.9,'words',P,0,'3 VOYANTS ROUGES','','🔴','',{}),
(S[1],'counter',Y,1,'ANS DE GARANTIE','',0,'',{'to':3,'nofmt':1}),
(S[1]+2.1,'counter',B,1,'5 JUILLET','',0,'',{'to':2007,'nofmt':1}),
(S[2],'counter',G,2,'MILLIARD DE DOLLARS','',0,'',{'to':105,'dec':2}),
(S[2]+2.3,'counter',P,2,'MILLIARD MAXIMUM','',0,'',{'to':115,'dec':2}),
(S[3],'words',B,3,'PAS DE SURCHAUFFE ','','🌡️','reflechit',{'corner':1}),
(S[3]+2.1,'words',Y,3,'PLUSIEURS FACTEURS','','⚙️','',{}),
(S[4],'words',G,4,'RÉPARATIONS PAYÉES','','🧾','',{}),
(S[4]+1.7,'words',P,4,'REMBOURSÉES       ','','💸','surpris',{'corner':1}),
(S[5],'counter',B,4,'NOVEMBRE','',0,'',{'to':2005,'nofmt':1}),
(S[5]+2.2,'counter',Y,4,'COUVERT JUSQU\'EN 2008','',0,'',{'to':2008,'nofmt':1}),
(S[6],'words',P,0,'UN VOYANT ROUGE','','🔴','reflechit',{'corner':1}),
(S[6]+1.5,'words',G,0,'UN ÉNORME SOUVENIR','','🕹️','',{}),
(S[7],'cta',Y,0,'','','','coucou',{}),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"chart"|"cta";accent:string;bg:number;label:string;sub:string;icon:string;mascot:string;to?:number;dec?:number;suffix?:string;prefix?:string;corner?:number;nofmt?:number;r0?:number;r1?:number;v0?:number;v1?:number;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = [']
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    d={'start':round(b[0],2),'end':round(end,2),'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':b[6] if isinstance(b[6],str) else '','mascot':b[7]}
    d.update(b[8]); out.append(json.dumps(d,ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total, [round(B_[i+1][0]-B_[i][0],1) for i in range(len(B_)-1)])
