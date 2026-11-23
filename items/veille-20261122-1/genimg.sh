#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261122-1
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 12; break; else sleep 20; fi
  done
done <<'L'
a|21|giant glowing hundred million milestone with confetti and fireworks, generic game controller, celebration, cartoon
b|22|calendar pages flying with a glowing blue launch rocket, year 2020 mood, sparkles, cartoon
c|23|giant rising glowing line chart staircase going up to the sky with golden coins and stars, cartoon
d|24|golden trophy on a podium surrounded by stacks of generic white game boxes, cartoon
e|25|crowd of cute little cube characters cheering holding generic gamepads, party, colorful, cartoon
L
echo done
