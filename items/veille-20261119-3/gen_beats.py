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
(1,0,'words',Y,0,'SAVAIS-TU ?','','🤔','surpris',0,0),
(1,3,'words',P,0,'COINCÉ DANS','','🎮','',0,0),
(1,8,'words',B,1,'UN JEU VIDÉO','','🕹️','',0,0),
(1,11,'words',G,1,'COMME PNJ !','','🧍','',0,0),
(2,0,'words',Y,1,'UN JOUEUR ARRIVE','','⚔️','',0,0),
(2,7,'words',B,3,'« SALUT ! »','','👋','',0,0),
(2,10,'words',P,2,'UNE QUÊTE ?','','❗','',0,0),
(3,0,'words',Y,0,'PIXEL PANIQUE','','😅','surpris',0,0),
(3,5,'words',G,3,'UNE SEULE PHRASE','','💬','',0,0),
(3,11,'words',B,0,'QUELLE BELLE JOURNÉE !','','☀️','',0,0),
(4,0,'words',P,3,'LE JOUEUR PARLE','','🗣️','',0,0),
(4,4,'num',Y,3,'DE SUITE',' FOIS','🔁','',0,10),
(4,8,'words',G,3,'LA MÊME PHRASE','','🔁','',0,0),
(5,0,'words',B,8,'PIXEL FUIT','','🏃','',0,0),
(5,6,'words',P,4,'DANS UN MUR','','🧱','',0,0),
(5,10,'words',Y,4,'PENDANT 1 HEURE','','⏱️','',0,0),
(6,0,'words',B,5,'CHERCHE QUITTER','','🔘','',0,0),
(6,6,'words',P,5,'PAS DE BOUTON !','','🚫','reflechit',0,0),
(7,0,'words',Y,6,'UNE POMME','','🍎','',0,0),
(7,6,'words',G,2,'QUÊTE TERMINÉE','','✅','',0,0),
(7,11,'words',B,7,'DING !','','🔔','',0,0),
(8,0,'words',G,7,'PIXEL EST LIBRE !','','🎉','',0,0),
(8,4,'words',P,8,'UN AUTRE JOUEUR','','🏃','',0,0),
(8,10,'words',Y,8,'EN COURANT !','','💨','',0,0),
(9,0,'words',P,9,'ET TOI ?','','🤔','reflechit',0,0),
(9,3,'words',B,9,'TU LUI PARLES ?','','💬','',0,0),
(9,7,'words',Y,3,'UNE HEURE ?','','⏱️','',0,0),
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
