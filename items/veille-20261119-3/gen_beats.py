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
(1,0,'words',Y,0,'UN VŒU !','','🌠','surpris',0,0),
(1,7,'words',G,1,'PIXEL = PNJ','','🧍','',0,0),
(2,0,'words',B,1,'PNJ =','','❓','reflechit',0,0),
(2,4,'words',Y,2,'PERSONNAGE NON JOUEUR','','🎭','',0,0),
(3,0,'words',P,2,'PROBLÈME N°1','','😅','',0,0),
(3,4,'words',G,2,'MÊME PHRASE','TOUTE LA JOURNÉE','💬','',0,0),
(4,0,'words',Y,2,'BIENVENUE, VOYAGEUR !','','👋','',0,0),
(4,4,'num',B,2,'FOIS','','🔁','',0,2000),
(5,0,'words',P,3,'PROBLÈME N°2','','😵','',0,0),
(5,4,'words',G,3,'EN ROND','AUTOUR DE L’ARBRE','🌳','',0,0),
(6,0,'words',Y,4,'PROBLÈME N°3','','😬','surpris',0,0),
(6,4,'words',B,6,'SA QUÊTE','','📜','',0,0),
(6,7,'num',P,5,'POULES','','🐔','',0,3),
(7,0,'words',G,5,'IL LES TROUVE !','','🎉','',0,0),
(7,4,'words',P,6,'ELLE RECOMMENCE','','🔄','',0,0),
(8,0,'words',B,7,'NOUVEAU VŒU','','🌟','',0,0),
(8,5,'words',Y,7,'CUBE JAUNE','','🟨','coucou',0,0),
(8,9,'words',G,7,'ÇA MARCHE !','','🎊','',0,0),
(9,0,'words',P,8,'MORALITÉ','','💡','reflechit',0,0),
(9,5,'words',Y,9,'DIS MERCI AUX PNJ','','💛','',0,0),
(10,0,'words',B,8,'HISTOIRE INVENTÉE','','ℹ️','',0,0),
(10,3,'words',Y,8,'PAS UN JEU OFFICIEL','','ℹ️','',0,0),
(11,0,'cta',Y,0,'','','','coucou',0,0),
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
