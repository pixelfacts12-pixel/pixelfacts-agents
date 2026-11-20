import json,re
d=json.load(open('voix.json'))
fix={'ILO':'Halo','Etage':'Et'}
words=[]
for s in d:
    for w in s['mots']:
        m=w['mot']; m=fix.get(m,m)
        if (m.startswith('-') or m.startswith("'") or m in ('?','s',"d","l")) and words and not words[-1].get('glue'):
            pass
        words.append({'start':round(w['debut'],2),'end':round(w['fin'],2),'text':m})
# fusion des fragments (-tu, 's' + 'est', etc.)
out=[];i=0
while i<len(words):
    w=dict(words[i])
    while i+1<len(words) and (words[i+1]['text'].startswith(('-',"'")) or w['text'] in ("s","d","l",'Abonne') and words[i+1]['text'].startswith(('-',"'"))):
        w['text']+=words[i+1]['text']; w['end']=words[i+1]['end']; i+=1
    if w['text'] in ('s','d','l') and i+1<len(words):
        i+=1; w['text']+=words[i]['text']; w['end']=words[i]['end']
    if w['text']!='?': out.append(w)
    i+=1
words=out
Y,B,P,G='#FFD628','#5ECBFF','#FF5FA2','#7CFF8A'
# (start,kind,accent,bg,label,sub,icon,year/to,mascot)
B_=[
(0,'words',Y,0,'25 ANS','DE XBOX','🎮',0,'surpris'),
(1.4,'num',B,1,'ANS','ANNIVERSAIRE','',25,''),
(3.28,'year',Y,1,'15 NOVEMBRE','','🚀',2001,''),
(5.18,'words',P,2,'ÉTATS-UNIS','','🇺🇸',2001,''),
(6.14,'words',G,5,'HALO AU LANCEMENT','','🟢',2001,'reflechit'),
(8.7,'year',B,2,'JAPON','FÉVRIER','🇯🇵',2002,''),
(10.8,'year',P,2,'EUROPE','MARS','🇪🇺',2002,''),
(12.86,'year',Y,3,'XBOX 360','','🕹️',2005,''),
(14.9,'words',B,3,'XBOX 360','','🎮',2005,''),
(16.14,'year',G,3,'XBOX ONE','','🟩',2013,''),
(17.96,'year',P,3,'SERIES X|S','','⚡',2020,''),
(20.62,'words',Y,4,'1RE XBOX','','📦',2001,''),
(22.24,'num',B,4,'EXEMPLAIRES','24 MILLIONS',' ',24,''),
(24.68,'words',P,1,'ANNIVERSAIRE','','🎂',2026,'montre'),
(26.12,'words',G,5,'HALO : FIREFIGHT','','🟢',2026,''),
(27.5,'words',B,5,'GRATUIT CET HIVER','','❄️',2026,''),
(29.28,'num',Y,6,'JEUX SUR PC','XBOX D\'ORIGINE','',25,''),
(31.1,'words',P,6,'SUR PC','','💻',2026,''),
(32.88,'cta',Y,0,'','','',2026,'coucou'),
]
total=round(d[-1]['fin']+0.6,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"num"|"year"|"cta";accent:string;bg:number;label:string;sub:string;icon:string;n:number;mascot:string;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = ['];
for i,b in enumerate(B_):
    end=B_[i+1][0] if i+1<len(B_) else total
    out.append(json.dumps({'start':b[0],'end':end,'kind':b[1],'accent':b[2],'bg':b[3],'label':b[4],'sub':b[5],'icon':b[6],'n':b[7],'mascot':b[8]},ensure_ascii=False)+',')
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); print(total,len(words)); print([w['text'] for w in words])
