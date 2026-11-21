import json,re
Y,B,P,G='#FFD628','#5ECBFF','#FF5FA2','#7CFF8A'
segs=json.load(open('voix.json'))
lines=[l.split('|',1)[1].strip() for l in open('lignes.txt',encoding='utf-8') if l.strip()]
assert len(segs)==len(lines),(len(segs),len(lines))
TOTAL=round(segs[-1]['fin']+0.5,2)
words=[]
for s,l in zip(segs,lines):
    toks=l.split(); w=[len(x)+2 for x in toks]; tot=sum(w); a=s['debut']; b=s['fin']; c=a
    for x,ww in zip(toks,w):
        e=c+(b-a)*ww/tot; words.append({'start':round(c,2),'end':round(e,2),'text':x}); c=e
# (start, kind, accent, label, sub, icon, to, extra)
H=[
(0,'words',Y,'UN SEUL JEU','ROBLOX','🤯',0,{'mascot':'surpris'}),
(1.9,'counter',B,'JOUEURS EN MÊME TEMPS','',None,25000000,{}),
(4.5,'words',P,'STEAL A BRAINROT','','🧠',0,{}),
(6.44,'chart',Y,'MAI 2025','NAISSANCE','',0,{}),
(9.26,'chart',B,'AOÛT 2025','',  '',0,{}),
(10.56,'counter',B,'MILLIONS DE JOUEURS','',None,20000000,{}),
(12.08,'chart',P,'OCTOBRE 2025','',  '',0,{}),
(13.68,'counter',Y,'MILLIONS : RECORD','',None,25000000,{}),
(14.62,'words',Y,'RECORD !','','🏆',0,{}),
(16.04,'chart',P,'ÇA REDESCEND','','',0,{'mascot':'reflechit','corner':True}),
(18.94,'chart',B,'AUJOURD’HUI','','',0,{}),
(20.38,'fall',P,'JOUEURS EN CE MOMENT','',None,69000,{}),
(22.72,'counter',Y,'FOIS MOINS','',None,300,{'suf':'×'}),
(24.04,'words',B,'QU’AU SOMMET','','⛰️',0,{}),
(25.36,'words',G,'MAIS QUAND MÊME','','🔥',0,{}),
(26.92,'counter',Y,'MILLIARDS DE VISITES','',None,74,{}),
(29.14,'words',P,'UN PHÉNOMÈNE','','🎢',0,{}),
(30.5,'words',G,'MONTE VITE','','🚀',0,{'mascot':'montre','corner':True}),
(31.38,'words',B,'REDESCEND VITE','','📉',0,{}),
(segs[-1]['debut'],'cta',Y,'','','',0,{'mascot':'coucou'}),
]
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"chart"|"fall"|"cta";accent:string;label:string;sub:string;icon:string;to:number;pre:string;suf:string;mascot:string;corner:boolean;};',
'export const TOTAL = %s;'%TOTAL,'export const BEATS: Beat[] = [']
for i,h in enumerate(H):
    end=H[i+1][0] if i+1<len(H) else TOTAL
    x=h[7]
    out.append(json.dumps({'start':h[0],'end':end,'kind':h[1],'accent':h[2],'label':h[3],'sub':h[4],'icon':h[5] or '','to':h[6],'pre':x.get('pre',''),'suf':x.get('suf',''),'mascot':x.get('mascot',''),'corner':x.get('corner',False)},ensure_ascii=False)+',')
out+=['];','export const WORDS = '+json.dumps(words,ensure_ascii=False)+';']
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(TOTAL,len(H))
