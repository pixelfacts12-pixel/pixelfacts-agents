#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 50; break; else sleep 50; fi
  done
done <<'L'
a|41|huge crowd of tiny cube avatars cheering in a bright colorful blocky arena, confetti, daytime
b|42|calm empty colorful blocky plaza with only a few tiny cube avatars, soft sunset light, peaceful
c|43|giant glowing arrow chart shape made of cubes shooting up into the sky, rocket trail, bright
d|44|glowing golden number wall of floating coins and cubes, treasure vault, shiny
e|45|friendly bright blue sky with fluffy clouds and floating colorful cubes, cheerful
L
echo done
