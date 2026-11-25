#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 20; break; else sleep 20; fi
  done
done <<'L'
a|51|giant glowing podium with ten colorful cubes ranked one to ten, spotlights, confetti, bright arena
b|52|rocket made of colorful cubes shooting up through blue sky leaving a glowing trail, speed lines
c|53|glowing golden number wall of floating coins and cubes, treasure vault, shiny
d|54|calm colorful blocky plaza with only a few tiny cube avatars, soft sunset light, peaceful
e|55|friendly bright blue sky with fluffy clouds and floating colorful cubes, cheerful
L
echo done
