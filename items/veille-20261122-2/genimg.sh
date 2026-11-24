#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261122-2
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person, no brand"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 12; break; else sleep 20; fi
  done
done <<'L'
c|36|stack of plain generic game cartridges half buried in desert sand, concrete block, cartoon
L
echo done
