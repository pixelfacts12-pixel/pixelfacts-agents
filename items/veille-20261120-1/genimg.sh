#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 50; break; else sleep 50; fi
  done
done <<'L'
b|52|old retro gray game console with a glowing disc and colorful pixel sparkles, nostalgic 1990s vibe
c|53|giant magnifying glass over a map full of colorful cubes, detective investigation, bright
d|54|tiny cartoon girl silhouette with a frying pan icon standing behind a glowing locked door, fantasy village
e|55|calendar pages flying through the air with sparkles and confetti, celebration, bright blue sky
L
echo done
