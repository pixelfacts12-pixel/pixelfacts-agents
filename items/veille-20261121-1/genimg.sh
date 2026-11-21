#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$((seed+try))"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 15; break; else sleep 20; fi
  done
done <<'L'
a|11|cute yellow cube character falling off a colorful blocky platform with a big sound wave bubble, surprised
b|12|old retro game cartridge and CD-ROM disc glowing on a pedestal, year 2000 vibe, blocky room
c|13|detective cube character with magnifying glass looking at a sound wave on a screen, question marks
d|14|big golden coin pile and a shopping price tag shaped like a cube, padlock, licensing contract paper
e|15|speaker emitting colorful sound waves and fireworks, joyful comeback celebration, blocky city
L
echo done
