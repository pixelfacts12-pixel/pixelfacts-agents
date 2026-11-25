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
(0,'words',Y,0,'10 JEUX ROBLOX','','🏆','surpris',{}),
(1.8,'words',P,1,'EN QUELQUES SEMAINES','','🚀','',{}),
(S[1],'words',B,0,'LE 2 NOVEMBRE','','🗓️','',{}),
(S[1]+1.9,'words',Y,2,'LE CLASSEMENT','PAR VISITES / JOUR','📊','',{}),
(S[2],'words',G,0,'DONT SPLASH','NUMÉRO 1','🥇','',{}),
(S[2]+2.2,'counter',B,1,'VISITES PAR JOUR','',0,'',{'to':97,'dec':1,'suffix':' M'}),
(S[3],'counter',Y,2,'VISITES AU TOTAL','',0,'',{'to':162,'suffix':' M'}),
(S[3]+2.0,'words',P,3,'AU DÉPART','LE 2 NOVEMBRE','⏱️','reflechit',{'corner':1}),
(S[4],'bars',G,1,'VISITES','',"",'',{'v0':161.9,'v1':371.2,'l0':'2 NOV','l1':'25 NOV','unit':' M','dec':1}),
(S[4]+2.7,'counter',G,2,"VISITES AU 25 NOV.",'',0,'',{'to':371,'suffix':' M'}),
(S[5],'words',P,0,'BREAK AND STEAL AN EGG','NUMÉRO 2','🥈','',{}),
(S[5]+2.5,'counter',B,3,'AU DÉPART','',0,'',{'to':325,'suffix':' M'}),
(S[6],'bars',G,1,'VISITES','',"",'',{'v0':325.3,'v1':492.3,'l0':'2 NOV','l1':'25 NOV','unit':' M','dec':1}),
(S[6]+1.7,'counter',Y,2,"VISITES AU 25 NOV.",'',0,'',{'to':492,'suffix':' M'}),
(S[7],'words',B,3,'JOUEURS EN DIRECT','','👥','',{}),
(S[7]+2.0,'bars',P,3,'EN MÊME TEMPS','',"",'',{'v0':94659,'v1':45531,'l0':'2 NOV','l1':'25 NOV','unit':'','dec':0}),
(S[7]+4.4,'words',P,3,'MOITIÉ MOINS','','📉','surpris',{'corner':1}),
(S[8],'words',Y,4,'CAT BATTLES','','🐱','',{}),
(S[8]+1.7,'bars',P,3,'EN MÊME TEMPS','',"",'',{'v0':15025,'v1':3327,'l0':'2 NOV','l1':'25 NOV','unit':'','dec':0}),
(S[9],'words',G,1,'LES VISITES MONTENT','','📈','',{}),
(S[9]+1.9,'words',P,3,'LES JOUEURS BAISSENT','','📉','',{}),
(S[10],'cta',Y,0,'','','','coucou',{}),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"chart"|"bars"|"cta";accent:string;bg:number;label:string;sub:string;icon:string;mascot:string;to?:number;dec?:number;suffix?:string;prefix?:string;corner?:number;r0?:number;r1?:number;v0?:number;v1?:number;l0?:string;l1?:string;unit?:string;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = [']
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    d={'start':round(b[0],2),'end':round(end,2),'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':b[6] if isinstance(b[6],str) else '','mascot':b[7]}
    d.update(b[8]); out.append(json.dumps(d,ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total, [round(B_[i+1][0]-B_[i][0],1) for i in range(len(B_)-1)])
