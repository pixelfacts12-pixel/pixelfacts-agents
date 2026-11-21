#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-1
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-1/img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-1/img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 20; break; else sleep 20; fi
  done
done <<'L'
a|71|cute cartoon cube character with surprised open mouth and a glowing sound wave bursting out, blocky colorful room
b|72|retro vintage CD-ROM discs and old computer with floating sound waves, blocky cartoon style
c|73|giant balance scale with a golden contract paper and coins, courtroom of cubes, no text
d|74|price tag with big coin stack and a locked sound speaker icon, shiny blocky world
e|75|calendar flipping pages and a speaker returning with sparkles, celebration confetti, bright sky
L
echo done
