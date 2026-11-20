import json,re
T=json.load(open('timing.json')); W=json.load(open('voix.json'))
lines=[l.split('|',1)[1].strip() for l in open('lignes.txt',encoding='utf-8') if l.strip()]
ww=[m for s in W for m in s['mots']]
words=[]
for i,l in enumerate(lines):
    a=T['starts'][i]; b=a+T['durs'][i]
    sel=[m for m in ww if m['debut']>=a-0.05 and m['fin']<=b+0.1]
    s0=sel[0]['debut']; e0=sel[-1]['fin']
    toks=re.findall(r"[^\s]+",l); w_=[len(x)+2 for x in toks]; tot=sum(w_); c=s0
    for x,k in zip(toks,w_):
        e=c+(e0-s0)*k/tot; words.append({'start':round(c,2),'end':round(e,2),'text':x}); c=e
Y,P,B='#FFD628','#FF5FA2','#5ECBFF'
S=T['starts']
# (start, kind, accent, bg, icon, label, sub, extra)
B_=[
(0,'hook',Y,0,'🏆','RECORD GUINNESS','DANS ROBLOX',"mascot:'surpris'"),
(2.7,'words',B,4,'🤯','POSSIBLE ?','',"mascot:'reflechit',corner:true"),
(5.04,'date',P,1,'⭐','NOVEMBRE','2025',""),
(7.2,'words',Y,2,'🎮','DÉFIS OFFICIELS','SUR ROBLOX',""),
(10.46,'words',B,0,'🏃','1% WIN OBBY','PREMIER DÉFI',""),
(12.5,'days',P,5,'📆','DU 4 AU 17','NOVEMBRE',"from:4,to:17"),
(14.54,'words',Y,0,'🧗','ULTIMATE EASY OBBY','DEUXIÈME DÉFI',""),
(16.5,'days',B,5,'📆','DU 17 AU 30','NOVEMBRE',"from:17,to:30"),
(18.58,'words',P,1,'⏱️','FINIR LE PARCOURS','',""),
(20.3,'words',Y,1,'⚡','LE PLUS VITE','POSSIBLE',"mascot:'surpris',corner:true"),
(21.74,'words',B,0,'✅','ZÉRO ÉTAPE SAUTÉE','',""),
(23.6,'words',P,3,'🚫','ZÉRO PASS PAYANT','',""),
(25.49,'words',Y,4,'📊','TOP DU CLASSEMENT','',""),
(27.2,'words',Y,2,'🥇','MÉDAILLE D’OR','GUINNESS',""),
(28.87,'words',B,5,'💥','RECORD BATTU ?','',""),
(30.9,'words',P,3,'🧑‍⚖️','UN JUGE APPARAÎT','DANS LE JEU',"mascot:'montre',corner:true"),
(33.0,'words',Y,3,'📜','CERTIFICAT','OFFICIEL',""),
(35.0,'words',B,3,'💻','VERSION NUMÉRIQUE','',""),
(36.94,'words',P,4,'🌍','VRAI RECORD','DU MONDE',""),
(38.5,'words',Y,5,'📱','DEPUIS TON ÉCRAN','',""),
(40.06,'cta',Y,4,'','','',"mascot:'coucou'"),
]
out="export type Beat = {\n  start: number; end: number; kind: 'hook'|'date'|'days'|'words'|'cta'; accent: string; bg: number;\n  label?: string; sub?: string; icon?: string; to?: number; from?: number;\n  mascot?: 'surpris'|'reflechit'|'coucou'|'montre'; corner?: boolean;\n};\n"
out+=f"export const TOTAL = {T['total']};\nexport const WORDS = {json.dumps(words,ensure_ascii=False)};\nexport const BEATS: Beat[] = [\n"
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else T['total']
    out+=f"  {{start: {b[0]}, end: {end}, kind: '{b[1]}', accent: '{b[2]}', bg: {b[3]}, icon: '{b[4]}', label: '{b[5]}', sub: '{b[6]}'{', '+b[7] if b[7] else ''}}},\n"
out+="];\n"
open('remotion/src/beats.ts','w').write(out)
