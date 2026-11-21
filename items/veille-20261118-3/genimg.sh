#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
i=0
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 150 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 20; break; else sleep 20; fi
  done
done <<'L'
a|31|retro game console glowing in a spotlight with confetti and a giant number 25 made of green glossy cubes, anniversary party
b|32|calendar page with a big red circle around a date, floating glossy cubes, nostalgic early 2000s vibe, green and blue
c|33|heroic cube soldier in green armor silhouette on a sci-fi ring-shaped planet, cartoon, no weapons visible, friendly
d|34|chunky black and green game console with a glowing green orb and a controller, floating in sky with cubes
e|35|timeline path made of glowing blocks winding through the sky with four milestone markers, colorful
f|36|sleek futuristic black game console tower and controller glowing green, bright cartoon style
g|37|big birthday cake with 25 candles surrounded by floating game controllers and fireworks, cute
L
echo done
