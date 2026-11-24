#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261123-2
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person, no brand"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 8; break; else sleep 20; fi
  done
done <<'L'
a|21|cute generic white remote-shaped gamepad flying with motion trails, sparkles, bright living room, soft pastel sky
b|22|cartoon tennis racket and ball, bowling pins and golf ball floating on a green and cyan sunny background
c|23|happy cartoon silhouettes of a family swinging arms together in a bright living room, generic
d|24|giant glowing number of sold boxes stack, pile of colorful game boxes without logos, confetti
e|25|cozy night sky with floating memory bubbles and a twenty year timeline of stars
L
echo done
