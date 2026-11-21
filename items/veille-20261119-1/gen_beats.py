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
(1,0,'words',Y,0,'SAVAIS-TU ?','','🤔','banc',0,0),
(1,2,'words',P,0,'CE PERSONNAGE','','🪑','banc',0,0),
(1,4,'words',G,2,'ATTEND GTA 6','','⏳','banc',0,0),
(1,10,'num',Y,1,'DEPUIS','','🗓️','',2009,2013),
(2,0,'words',B,1,'CETTE ANNÉE-LÀ','','📅','',0,0),
(2,3,'words',P,5,'SEPTEMBRE','2013','🍂','',0,0),
(2,5,'words',G,3,'GTA 5 SORT','','🎮','reflechit',0,0),
(3,0,'words',B,4,'PREMIER TRAILER','','🎬','',0,0),
(3,3,'words',G,3,'GTA 6','','🌴','',0,0),
(3,6,'num',P,4,'DÉCEMBRE','','🎞️','',2019,2023),
(4,0,'words',Y,4,'DEUXIÈME TRAILER','','🎬','',0,0),
(4,3,'num',G,4,'MAI','','🔥','',2021,2025),
(5,0,'words',P,6,'2 REPORTS','','😬','surpris',0,0),
(5,4,'words',B,6,'MAI 2026','','🗓️','',0,0),
(5,7,'words',Y,6,'NOVEMBRE 2026','','⏳','',0,0),
(6,0,'words',G,7,'ENFIN SORTI !','','🎉','',0,0),
(6,5,'num',Y,7,'NOVEMBRE','','🚀','',12,19),
(6,9,'words',B,8,'SUR PS5','','🎮','',0,0),
(6,12,'words',G,8,'XBOX SERIES X|S','','🟢','',0,0),
(7,0,'words',P,9,'ET TOI ?','','🤔','reflechit',0,0),
(7,3,'words',Y,9,'TU ATTENDS QUOI ?','','🎮','',0,0),
(7,6,'words',B,5,'DEPUIS QUAND ?','','⏳','',0,0),
(8,0,'words',B,2,'ANIMATION NON OFFICIELLE','','ℹ️','',0,0),
(8,3,'words',Y,2,'NON AFFILIÉE À ROCKSTAR','','ℹ️','',0,0),
(9,0,'cta',Y,0,'','','','coucou',0,0),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"counter"|"cta"|"num";accent:string;bg:number;label:string;sub:string;icon:string;from:number;to:number;mascot:string;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = ['];
st=[widx[(b[0],b[1])] for b in B_]; st[0]=0
for i,b in enumerate(B_):
    end=st[i+1] if i+1<len(B_) else total
    out.append(json.dumps({'start':st[i],'end':end,'kind':b[2],'accent':b[3],'bg':b[4],'label':b[5],'sub':b[6],'icon':b[7],'from':b[9],'to':b[10],'mascot':b[8]},ensure_ascii=False)+',')
    print(i,st[i],round(end-st[i],2),b[5])
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); json.dump({'total':total,'starts':st},open('timing.json','w'))
print(total)
