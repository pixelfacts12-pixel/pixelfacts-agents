#!/bin/bash
cd "$(dirname "$0")"; mkdir -p img
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 8; break; else sleep 15; fi
  done
done <<'L'
a|71|golden trophy on a podium rising on a giant glowing staircase of cubes, confetti, sparkles
b|72|huge pile of colorful cartoon game discs and boxes towering like a mountain, spotlights
c|73|running champion cube character on a track climbing upward arrow, motion lines, bright stadium
d|74|wild west desert sunset with a cartoon horse silhouette and cacti, warm golden light, no people
e|75|city skyline at sunset with palm trees and a glowing rising graph arrow in the sky, retro neon
L
echo done
