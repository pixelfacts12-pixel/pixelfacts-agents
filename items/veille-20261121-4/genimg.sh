#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-4
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 15; break; else sleep 20; fi
  done
done <<'L'
a|11|cute round yellow cube character with brown layered wavy hair like bacon strips, big blue eyes, cheerful, cartoon
b|12|brown wavy hair shaped like crispy bacon strips floating, sparkling, cartoon
c|13|calendar page with sparkles and a magic makeover transformation, cartoon
d|14|crowd of many identical little blocky cartoon characters with same brown hair, funny, colorful
e|15|question mark and lots of tiny brown bacon-like hair strips raining, playful cartoon
L
echo done
