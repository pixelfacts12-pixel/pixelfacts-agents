#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no letters, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 150 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 15; break; else sleep 15; fi
  done
done <<'L'
a|41|empty wooden park bench under a tree in a sunny city park, autumn leaves, nobody sitting, cozy
b|42|giant calendar wall with pages flying away in the wind, years passing, clock gears, colorful
c|43|empty park bench at sunset with spider webs and dust and fallen leaves, nostalgic, nobody
d|44|tropical sunny coast city with palm trees, neon pink sunset, sports car silhouette, beach vibes, no people
e|45|vintage film projector and glowing movie screen showing a sunset city skyline, no text
f|46|big countdown clock and hourglass with falling sand, floating glossy cubes
g|47|calendar with a giant red cross over a date and a sad hourglass, pastel
h|48|joyful fireworks over a tropical city at night, game console and controller glowing, confetti, celebration
i|49|two game consoles side by side glowing blue, one white one black, confetti and cubes
j|50|question mark made of glowing cubes over an empty park bench, colorful
L
echo done
