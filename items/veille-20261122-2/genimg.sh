#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261122-2
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 12; break; else sleep 20; fi
  done
done <<'L'
a|31|mountain of generic colorful game boxes and plain grey cartridges piled too high in a toy shop, cartoon
b|32|crashing falling red arrow chart collapsing down with scattered generic game cartridges, cartoon
c|33|sandy desert at sunset with a big pit and buried plain cartridges and a little shovel and brush, archaeology dig site, cartoon
d|34|pile of plain grey generic game cartridges half buried in sand with a magnifying glass, cartoon
e|35|sunrise over a glowing city with a small generic red and white game console and sparkles, hopeful, cartoon
L
echo done
