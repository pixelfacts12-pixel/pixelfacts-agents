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
(0,'counter',Y,0,'EN 1983','',0,'surpris',{'to':1983,'nofmt':1}),
(S[0]+2.2,'words',P,1,'DANGER !','','⚠️','',{}),
(S[1],'words',B,0,'TROP DE CONSOLES','','🎮','',{}),
(S[1]+2.2,'words',G,0,'JEUX BÂCLÉS','','📦','reflechit',{'corner':1}),
(S[2],'counter',P,1,'DE VENTES','',0,'',{'to':97,'prefix':'-','suffix':' %'}),
(S[2]+2.3,'words',Y,1,'CHUTE LIBRE','','📉','surpris',{'corner':1}),
(S[3],'words',B,2,'PIXEL ENQUÊTE','','🔎','montre',{'corner':1}),
(S[3]+2.1,'words',Y,2,'NOUVEAU-MEXIQUE','','🏜️','',{}),
(S[4],'counter',G,3,'SEPTEMBRE','',0,'',{'to':1983,'nofmt':1}),
(S[4]+2.4,'words',P,3,'CARTOUCHES ENTERRÉES','','⛏️','',{}),
(S[5],'counter',Y,3,'FOUILLES EN','',0,'reflechit',{'to':2014,'nofmt':1,'corner':1}),
(S[5]+1.7,'counter',B,3,'CARTOUCHES','',0,'',{'to':728000}),
(S[6],'words',P,4,'LE JAPON RÉAGIT','','🕹️','',{}),
(S[6]+2.2,'counter',G,4,'FAMICOM : 15 JUILLET','',0,'',{'to':1983,'nofmt':1}),
(S[7],'counter',B,4,'LA NES AUX USA','',0,'',{'to':1985,'nofmt':1}),
(S[7]+2.3,'words',Y,4,'LE JEU REPART !','','🚀','surpris',{'corner':1}),
(S[8],'words',P,2,'TU AURAIS PARIÉ ?','','🤔','reflechit',{'corner':1}),
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
