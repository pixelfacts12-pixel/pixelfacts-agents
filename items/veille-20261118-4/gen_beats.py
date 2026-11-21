import json,re,subprocess
lines=[l.split('|',1)[1].strip() for l in open('lignes.txt',encoding='utf-8') if l.strip()]
durs=[float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'voix_l/l{i+1}.wav']))for i in range(len(lines))]
starts=[];t=0
for d in durs: starts.append(t); t+=d+0.12
words=[];widx={}
for li,(s,d,l) in enumerate(zip(starts,durs,lines)):
    toks=re.findall(r"[^\s]+",l)
    w=[len(x)+2 for x in toks]; tot=sum(w); sp=d-0.1; c=s
    for k,(x,ww) in enumerate(zip(toks,w)):
        e=c+sp*ww/tot; words.append({'start':round(c,2),'end':round(e,2),'text':x}); widx[(li+1,k)]=round(c,2); c=e
Y,B,P,G='#FFD628','#5ECBFF','#FF5FA2','#7CFF8A'
# (ligne,mot,kind,accent,bg,label,sub,icon,mascot,from,to)
B_=[
(1,0,'words',G,0,'PHANTOM BLADE ZERO','','🏯','surpris',0,0),
(1,4,'num',Y,1,'IL A FALLU','ANS','⏳','',0,10),
(1,11,'words',P,6,'TOUS LES RECORDS','','🏆','',0,0),
(2,0,'words',B,1,'TOUT COMMENCE','','🏮','',0,0),
(2,3,'num',Y,0,'EN','','📣','',2010,2016),
(2,10,'num',P,2,'MAIS EN','','⏸️','reflechit',2012,2018),
(2,16,'words',P,2,'PROJET EN PAUSE','','⏸️','',0,0),
(3,0,'words',B,1,'STUDIO S-GAME','2021','🏢','',0,0),
(3,8,'words',Y,3,'SOUTIEN DE TENCENT','','🤝','',0,0),
(4,0,'chart',Y,5,'LA LONGUE ROUTE','','📈','',0,0),
(4,6,'words',G,5,'ENFIN AU PUBLIC','','🎬','',0,0),
(4,10,'words',B,4,'PLAYSTATION','','🎮','',0,0),
(5,0,'counter',Y,6,'SOUHAITS','','❤️','',0,3000000),
(5,7,'words',P,6,'LISTE DE SOUHAITS','','💖','',0,0),
(6,0,'words',B,5,'SORTIE REPOUSSÉE','','📅','',0,0),
(6,4,'words',Y,5,'LE 29 OCTOBRE','','🗓️','',0,0),
(7,0,'counter',Y,6,'JOUEURS','','👥','',0,833921),
(7,12,'words',B,0,'SUR STEAM','','💻','',0,0),
(8,0,'counter',Y,6,'EXEMPLAIRES','','💰','',0,4000000),
(8,5,'num',G,5,'EN','H','⏱️','',0,72),
(9,0,'words',B,1,'UN STUDIO DE CHINE','','🏯','reflechit',0,0),
(9,5,'words',P,4,'FACE AUX GÉANTS','','🗼','',0,0),
(9,11,'words',Y,6,'DAVID CONTRE GOLIATH','','💪','',0,0),
(10,0,'words',Y,0,'ET TOI ?','','🤔','reflechit',0,0),
(10,7,'cta',Y,0,'','','','coucou',0,0),
]
total=round(t-0.12+1.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"cta"|"num"|"chart";accent:string;bg:number;label:string;sub:string;icon:string;from:number;to:number;mascot:string;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = ['];
st=[widx[(b[0],b[1])] for b in B_]; st[0]=0
for i,b in enumerate(B_):
    end=st[i+1] if i+1<len(B_) else total
    out.append(json.dumps({'start':st[i],'end':end,'kind':b[2],'accent':b[3],'bg':b[4],'label':b[5],'sub':b[6],'icon':b[7],'from':b[9],'to':b[10],'mascot':b[8]},ensure_ascii=False)+',')
    print(i,st[i],round(end-st[i],2),b[5])
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); json.dump({'total':total,'starts':st},open('timing.json','w'))
print(total)
