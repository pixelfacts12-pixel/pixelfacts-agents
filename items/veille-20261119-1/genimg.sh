#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 150 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 15; break; else sleep 20; fi
  done
done <<'L'
a|11|a lonely wooden park bench under a big tree at sunset with falling leaves, a tiny glossy yellow cube sitting on it, nostalgic cozy mood
b|12|a park bench in the same spot across the seasons, calendar pages flying, spring summer autumn winter, glossy cubes
c|13|old retro gaming room with a CRT television and a console and a poster wall, 2013 nostalgia, warm light
d|14|cinema red curtain opening with a bright spotlight and film reel and popcorn, festive
e|15|giant wall calendar with dates circled and calendar pages flipping, clock, bright colors
f|16|golden trophy with confetti and fireworks and floating glossy cubes, celebration, sunrise
g|17|a park bench empty at golden hour with sparkles and confetti, happy ending, glossy cubes
L
echo done
