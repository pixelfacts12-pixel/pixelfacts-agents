import json, subprocess
lines=[l.split('|',1)[1].strip() for l in open('lignes.txt',encoding='utf-8') if l.strip()]
durs=[float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'voix_l/l{i+1}.wav']))for i in range(len(lines))]
starts=[];t=0
for d in durs: starts.append(t); t+=d+0.12
words=[]
for s,d,l in zip(starts,durs,lines):
    ws=l.replace('549 661','549661').replace('24 000','24000').replace('259 000','259000').replace('418 000','418000').split()
    disp=l.replace('549 661','549 661').split()
    # re-split en gardant les nombres groupés
    import re
    toks=re.findall(r"\d+ \d{3}|[^\s]+",l)
    w=[len(x)+2 for x in toks]; tot=sum(w); sp=d-0.15; c=s
    for x,ww in zip(toks,w):
        e=c+sp*ww/tot; words.append({'start':round(c,2),'end':round(e,2),'text':x}); c=e
json.dump({'starts':[round(x,3) for x in starts],'durs':durs,'words':words,'total':round(t,2)},open('timing.json','w'))
print([round(x,2) for x in starts],round(t,2))
