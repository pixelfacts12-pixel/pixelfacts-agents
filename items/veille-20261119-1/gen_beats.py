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
(1,0,'bench',Y,0,'IL ATTEND','','','',0,0),
(1,5,'words',P,1,'GTA 6','DEPUIS','🔥','',0,0),
(1,7,'num',P,0,'ANS SUR CE BANC','','🪑','',0,13),
(2,0,'words',B,2,'SEPTEMBRE','','🎮','',0,0),
(2,2,'num',Y,2,'SORTIE DE GTA 5','','🎮','',2000,2013),
(2,7,'bench',B,0,"IL S'ASSIT",'','','',0,0),
(3,0,'words',P,3,'DÉCEMBRE','','🎬','',0,0),
(3,2,'num',Y,3,'BANDE-ANNONCE 1','','🎥','',2013,2023),
(3,4,'words',G,3,'ENFIN !','','🙌','',0,0),
(4,0,'num',B,3,'BANDE-ANNONCE 2','','🎥','montre',2023,2025),
(4,2,'words',Y,1,'LA DEUXIÈME !','','🎬','',0,0),
(5,0,'words',P,4,'LA DATE BOUGE','','⏳','',0,0),
(5,4,'words',B,4,'AUTOMNE 2025','','🍂','',0,0),
(5,6,'words',Y,4,'MAI 2026','','🔔','',0,0),
(5,8,'words',G,4,'NOVEMBRE 2026','','🗓️','',0,0),
(6,0,'num',Y,5,'NOVEMBRE','','🗓️','',0,19),
(6,4,'words',G,5,'ROCKSTAR CONFIRME','','✅','',0,0),
(6,6,'words',P,5,'DISPONIBLE !','','🎉','montre',0,0),
(7,0,'num',Y,6,"D'ATTENTE",'','⏳','',0,13),
(7,4,'bench',G,6,'LE BANC SE LIBÈRE','','','',1,0),
(8,0,'words',B,0,'TOI AUSSI ?','','🤔','reflechit',0,0),
(8,4,'words',Y,1,'COMBIEN DE TEMPS ?','','⏱️','',0,0),
(9,0,'cta',Y,6,'','','','coucou',0,0),
]
total=round(t-0.12+0.3,2)
out=['export type Beat = {start:number;end:number;kind:"words"|"bench"|"counter"|"cta"|"num";accent:string;bg:number;label:string;sub:string;icon:string;from:number;to:number;mascot:string;};','export const TOTAL = %s;'%total,'export const BEATS: Beat[] = ['];
st=[widx[(b[0],b[1])] for b in B_]; st[0]=0
for i,b in enumerate(B_):
    end=st[i+1] if i+1<len(B_) else total
    out.append(json.dumps({'start':st[i],'end':end,'kind':b[2],'accent':b[3],'bg':b[4],'label':b[5],'sub':b[6],'icon':b[7],'from':b[9],'to':b[10],'mascot':b[8]},ensure_ascii=False)+',')
    print(i,st[i],round(end-st[i],2),b[5])
out.append('];'); out.append('export const WORDS = '+json.dumps(words,ensure_ascii=False)+';')
open('remotion/src/beats.ts','w').write('\n'.join(out)); json.dump({'total':total,'starts':st},open('timing.json','w'))
print(total)
