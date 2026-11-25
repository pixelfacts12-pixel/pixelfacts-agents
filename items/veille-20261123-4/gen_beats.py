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
(0,'words',Y,0,'UN JEU ROBLOX','','🎮','surpris',{}),
(1.8,'counter',B,3,'MILLIONS DE VISITES EN PLUS','',0,'',{'to':209,'prefix':'+'}),
(S[1],'words',P,1,'DONT SPLASH','','💦','',{}),
(S[1]+1.9,'counter',Y,4,'MILLIONS · 2 NOVEMBRE','',0,'',{'to':162}),
(S[1]+3.7,'words',B,1,'EN 23 JOURS','','🗓️','',{}),
(S[2],'bars',G,0,'DONT SPLASH','VISITES (MILLIONS)','','',{'va':162,'vb':371,'la':'2 NOV','lb':'25 NOV','unit':' M'}),
(S[2]+1.7,'words',G,4,'+129 % !','','🚀','',{}),
(S[3],'bars',P,2,'DONT SPLASH','JOUEURS EN DIRECT','','',{'va':97000,'vb':24000,'la':'2 NOV','lb':'25 NOV','unit':''}),
(S[3]+2.3,'words',B,2,'MOINS DE JOUEURS','','📉','reflechit',{'corner':1}),
(S[4],'bars',Y,1,'BREAK AND STEAL AN EGG','VISITES (MILLIONS)','','',{'va':325,'vb':492,'la':'2 NOV','lb':'25 NOV','unit':' M'}),
(S[4]+2.2,'words',Y,4,'NUMÉRO 2','','🥈','',{}),
(S[4]+3.6,'counter',G,4,'DE VISITES EN PLUS','',0,'',{'to':51,'prefix':'+','suffix':' %'}),
(S[5],'bars',P,2,'BREAK AND STEAL AN EGG','JOUEURS EN DIRECT','','',{'va':94700,'vb':47000,'la':'2 NOV','lb':'25 NOV','unit':''}),
(S[5]+2.0,'words',B,3,'MOITIÉ MOINS','','½','',{}),
(S[5]+3.6,'counter',P,3,'DE JOUEURS EN DIRECT','',0,'',{'to':50,'prefix':'-','suffix':' %'}),
(S[6],'bars',G,0,'TURBO SOCCER','JOUEURS EN DIRECT','','',{'va':19200,'vb':23400,'la':'2 NOV','lb':'25 NOV','unit':''}),
(S[6]+2.0,'words',G,1,'L\'INVERSE','','📈','',{}),
(S[6]+3.4,'counter',G,0,'DE JOUEURS EN PLUS','',0,'',{'to':22,'prefix':'+','suffix':' %'}),
(S[7],'bars',P,2,'CAT BATTLES','JOUEURS EN DIRECT','','',{'va':15000,'vb':3100,'la':'2 NOV','lb':'25 NOV','unit':''}),
(S[7]+1.8,'words',B,3,'FORTE BAISSE','','📉','',{}),
(S[8],'words',Y,0,'VISITES : ↑','','👟','surpris',{'corner':1}),
(S[8]+1.6,'words',P,2,'JOUEURS : ?','','🎯','',{}),
(S[8]+2.9,'words',B,1,'PAS PAREIL','','⚖️','',{}),
(S[9],'cta',Y,0,'','','','coucou',{}),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"bars"|"counter"|"chart"|"cta";accent:string;bg:number;label:string;sub:string;icon:string;mascot:string;to?:number;dec?:number;suffix?:string;prefix?:string;corner?:number;va?:number;vb?:number;la?:string;lb?:string;unit?:string;r0?:number;r1?:number;v0?:number;v1?:number;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = [']
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    d={'start':round(b[0],2),'end':round(end,2),'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':b[6] if isinstance(b[6],str) else '','mascot':b[7]}
    d.update(b[8]); out.append(json.dumps(d,ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total, [round(B_[i+1][0]-B_[i][0],1) for i in range(len(B_)-1)])
