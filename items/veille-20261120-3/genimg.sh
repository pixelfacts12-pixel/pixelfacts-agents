#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3; do
    curl -sL -m 90 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; break; else sleep 20; fi
  done
done <<'L'
a|41|bright colorful cube world with a glowing golden doorway, cheerful, sunny
b|42|huge crowd of tiny colorful cube avatars celebrating, confetti, party
c|43|tall mountain peak made of glowing cubes with a flag on top, blue sky
d|44|empty colorful blocky playground with a few tiny cube avatars, sunset, calm
e|45|giant glowing golden counter wall of floating coins and cubes, treasure vault
L
