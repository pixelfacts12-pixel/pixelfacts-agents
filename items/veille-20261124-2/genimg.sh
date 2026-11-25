#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 20; break; else sleep 20; fi
  done
done <<'L'
a|61|giant golden trophy on a glowing podium, spotlights, confetti, shiny
b|62|colorful calendar pages flying through the air, clock, sparkles, bright
c|63|huge mountain of colorful game boxes and discs piled like a mountain, sunny sky, no text
d|64|cartoon wild west desert sunset with cactus and canyon, warm orange sky, no people
e|65|bright sunny city skyline with palm trees and neon pink and blue sky, cartoon
L
echo done
