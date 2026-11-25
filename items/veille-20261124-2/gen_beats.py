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
(0,'words',Y,0,'GTA 5','','🏆','surpris',{}),
(1.9,'words',P,1,'13 ANS APRÈS','','⏳','',{}),
(S[1],'counter',B,1,'SORTIE EN','',0,'',{'to':2013,'raw':1}),
(S[2],'chart',G,2,'EXEMPLAIRES','D\'APRÈS TAKE-TWO','','',{'v0':0,'v1':235,'suffix':' M','r0':0,'r1':1}),
(S[2]+2.3,'counter',Y,2,"PRÈS DE",'',0,'',{'to':235,'suffix':' M'}),
(S[3],'bars',G,3,'MILLIONS','',"",'',{'v0':230,'v1':235,'l0':'AVANT','l1':'ACTUEL','unit':' M','dec':0}),
(S[3]+1.6,'counter',P,3,'DE PLUS','',0,'',{'to':5,'prefix':'+','suffix':' M'}),
(S[4],'words',Y,0,'ÉNORME !','POUR UN VIEUX JEU','🤯','reflechit',{'corner':1}),
(S[5],'words',B,1,'FIN SEPTEMBRE','TAKE-TWO','🗓️','',{}),
(S[5]+1.8,'words',P,4,'30 SEPT. 2026','','📊','',{}),
(S[6],'words',Y,3,'RED DEAD 2','','🤠','',{}),
(S[6]+1.9,'counter',G,3,'PLUS DE','',0,'',{'to':89,'suffix':' M'}),
(S[7],'words',B,4,"TRIMESTRE D'AVANT",'','⏪','',{}),
(S[7]+1.6,'bars',Y,3,'RED DEAD 2','',"",'',{'v0':87,'v1':89,'l0':'AVANT','l1':'ACTUEL','unit':' M','dec':0}),
(S[8],'words',G,0,'2 CHAMPIONS','QUI CONTINUENT','🏆','surpris',{'corner':1}),
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
