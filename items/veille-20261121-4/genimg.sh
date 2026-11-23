#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-4
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 12; break; else sleep 20; fi
  done
done <<'L'
a|11|happy crispy bacon strips with smiling faces sizzling in a pan, breakfast, cartoon
b|12|blocky cartoon character with square head and layered wavy brown hair, brand new default look, plain background
c|13|close up of layered wavy brown hair strips that look like bacon, glossy cartoon
d|14|big calendar page with the year 2014 and a sparkling avatar makeover, cartoon, no text except the number
e|15|small blocky yellow toy-brick character standing proudly, old style blocky figure, cartoon
L
echo done
