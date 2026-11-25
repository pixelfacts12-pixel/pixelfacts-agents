#!/bin/bash
cd "$(dirname "$0")"; mkdir -p img
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 10; break; else sleep 15; fi
  done
done <<'L'
a|61|magical glowing golden ocarina flute floating above green hills at sunrise, sparkles, fantasy meadow
b|62|giant stack of colorful cardboard game boxes towering like a skyscraper, spotlights, confetti
c|63|cloud with download arrows beside a pile of boxes, balance scale, bright playful scene
d|64|nostalgic retro cartoon bedroom with old CRT television and colorful cubes, warm light
e|65|heroic green hills and a shining golden triangle crystal glowing in the sky, sparkles, adventure
L
echo done
