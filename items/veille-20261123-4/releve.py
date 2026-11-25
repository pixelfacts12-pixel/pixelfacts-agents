import json,subprocess,time,uuid,urllib.parse,sys
names=["DONT SPLASH","Break and Steal an Egg","Cat Battles","Turbo Soccer","RoWorld","Sell Fries","Backseat Rally","Fake an Egg","Kukirin Life","Bike Universe"]
out={}
for q in names:
    for attempt in range(4):
        r=subprocess.run(["curl","-s","-G","https://apis.roblox.com/search-api/omni-search","--data-urlencode","searchQuery="+q,"--data-urlencode","sessionId="+str(uuid.uuid4()),"--data-urlencode","pageType=all"],capture_output=True,text=True).stdout
        try: d=json.loads(r)
        except: d={}
        res=[c for g in d.get('searchResults',[]) for c in g.get('contents',[]) if c.get('contentType')=='Game']
        if res: break
        time.sleep(15)
    print(q,[(c['universeId'],c['name'][:25],c.get('playerCount')) for c in res[:3]]); out[q]=[(c['universeId'],c['name'],c.get('playerCount')) for c in res[:3]]
    time.sleep(3)
json.dump(out,open('search.json','w'),ensure_ascii=False)
