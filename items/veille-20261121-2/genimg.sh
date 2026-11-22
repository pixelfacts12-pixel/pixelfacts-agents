#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-2
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-2/img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-2/img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 20; break; else sleep 20; fi
  done
done <<'L'
a|81|generic retro black game console with an open empty slot on its side, glowing, cute cartoon cubes around
b|82|big computer hard disk drive with sparkles being inserted into a slot, 40 GB glow, blocky cartoon
c|83|ethernet network cable plugged in with glowing connection lines and a small adapter box, cartoon
d|84|stack of many colorful game discs and cartridges floating, joyful, cartoon
e|85|flat sleek slim console with a smooth side and no slot, magnifying glass, cartoon
L
echo done
