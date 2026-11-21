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
(1,0,'words',G,0,'25 ANS DE XBOX','','🎂','surpris',0,0),
(1,5,'num',Y,6,'EN','',"🎉",'',2000,2026),
(2,0,'words',P,1,'15 NOVEMBRE','TOUT COMMENCE','🕹️','',0,0),
(2,5,'num',Y,1,'EN','','🕹️','',1990,2001),
(3,0,'words',B,3,'PRIX DE LANCEMENT','','🏷️','',0,0),
(3,4,'num',G,3,'DOLLARS','$','💵','',0,299),
(3,8,'words',P,2,'ET UN JEU !','','🎮','',0,0),
(3,11,'words',Y,2,'ET HALO !','','🪐','reflechit',0,0),
(4,2,'words',G,2,'COMBAT EVOLVED','','🛡️','',0,0),
(4,4,'words',P,2,'STUDIO BUNGIE','','🏢','',0,0),
(5,0,'words',B,4,'4 ANS PLUS TARD','','⏳','',0,0),
(5,5,'words',P,4,'22 NOVEMBRE','2005','💿','',0,0),
(5,10,'words',G,3,'XBOX 360','','🔥','',0,0),
(6,0,'words',B,5,'XBOX ONE','','🟢','',0,0),
(6,4,'num',Y,5,'EN','','📺','',2003,2013),
(7,0,'words',G,5,'SERIES X ET S','','⚡','',0,0),
(7,7,'num',P,5,'EN','','🚀','',2010,2020),
(8,0,'words',Y,6,'AUJOURD\'HUI','','🎉','',0,0),
(8,5,'num',G,6,'ANS','','🎂','montre',0,25),
(9,0,'words',P,6,'ET TOI ?','','🤔','reflechit',0,0),
(9,4,'words',Y,0,'TA XBOX PRÉFÉRÉE','','❤️','',0,0),
(10,0,'cta',Y,0,'','','','coucou',0,0),
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
