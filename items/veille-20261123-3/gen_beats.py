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
(0,'words',Y,4,'15 ANS !','','🎂','surpris',{}),
(S[0]+1.9,'words',B,0,'TROIS FAITS','','3️⃣','',{}),
(S[1],'words',P,1,'FAIT N°1','','🥇','',{}),
(S[1]+1.6,'words',Y,1,'11 • 11 • 2011','','🔢','',{'corner':1}),
(S[1]+3.7,'words',G,1,'CLIN D\'ŒIL !','','😉','',{}),
(S[2],'words',P,2,'FAIT N°2','','🥈','',{}),
(S[2]+1.4,'counter',Y,2,'EXEMPLAIRES','',0,'',{'to':60,'prefix':'+','suffix':' M'}),
(S[2]+3.4,'words',G,2,'PLEIN DE CHAUSSETTES','','🧦','reflechit',{'corner':1}),
(S[3],'bars',B,2,'','',0,'',{'r0':0,'r1':0.5}),
(S[3]+2.4,'bars',B,2,'','',0,'',{'r0':0.5,'r1':1}),
(S[4],'words',P,3,'FAIT N°3','','🥉','',{}),
(S[4]+1.5,'words',B,3,'IL RESSORT !','','🔁','',{}),
(S[4]+2.7,'frise',Y,3,'2016','',0,'',{'r0':0.333,'r1':0.34}),
(S[4]+3.9,'frise',G,3,'2017','',0,'',{'r0':0.34,'r1':0.4}),
(S[4]+5.1,'frise',P,3,'2018','',0,'',{'r0':0.4,'r1':0.47}),
(S[5],'words',Y,3,'PLUS DE VIES','','🐱','',{'corner':1}),
(S[5]+1.8,'words',B,0,'PAS DE RETRAITE','','🛋️','',{}),
(S[6],'frise',G,4,'QUINZE ANS','',0,'surpris',{'r0':0.47,'r1':1,'corner':1}),
(S[6]+1.5,'words',Y,2,'ENCORE ACHETÉ !','','🛒','',{}),
(S[7],'cta',Y,0,'','','','coucou',{}),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"chart"|"cta"|"remote"|"frise"|"bars";accent:string;bg:number;label:string;sub:string;icon:string;mascot:string;to?:number;v0?:number;dec?:number;suffix?:string;prefix?:string;corner?:number;nofmt?:number;r0?:number;r1?:number;v1?:number;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = [']
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    d={'start':round(b[0],2),'end':round(end,2),'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':b[6] if isinstance(b[6],str) else '','mascot':b[7]}
    d.update(b[8]); out.append(json.dumps(d,ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total, [round(B_[i+1][0]-B_[i][0],1) for i in range(len(B_)-1)])
