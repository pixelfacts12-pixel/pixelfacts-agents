#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261122-1
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 15; break; else sleep 20; fi
  done
done <<'L'
a|21|giant glowing number 100 made of shiny blocks with confetti and sparkles, generic futuristic white game console silhouette without any logo, cartoon
b|22|calendar pages flipping with a rising arrow made of colorful cubes, celebration, cartoon
c|23|big trophy and a golden ribbon with fireworks, stack of many white game console boxes without logos, cartoon
d|24|delivery truck full of boxes arriving at a toy shop, cheerful, cartoon
e|25|two generic game consoles racing side by side on a track toward a finish line, cartoon, no logos
f|26|happy cartoon kids holding game controllers cheering, colorful confetti, no real faces
L
echo done
