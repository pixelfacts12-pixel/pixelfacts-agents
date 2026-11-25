#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261123-3
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person, no brand"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 8; break; else sleep 20; fi
  done
done <<'L'
a|31|snowy fantasy mountain peaks with a glowing northern lights sky, generic, no characters
b|32|giant calendar page with huge number eleven eleven, confetti, sparkles, cartoon
c|33|enormous pile of colorful generic game boxes and gold coins, confetti, cheering
d|34|cartoon time machine clock spinning with game cartridges and discs orbiting, sparkles
e|35|big birthday cake with fifteen candles on a snowy fantasy hill, balloons
L
echo done
