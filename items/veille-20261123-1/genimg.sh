#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261123-1
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person, no brand"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 8; break; else sleep 20; fi
  done
done <<'L'
a|11|cute generic pixel-art creature hatching from a spotted egg, sparkles, soft pastel sky background
b|12|adorable round pixel blob pet eating a small snack on a cozy bedroom shelf, hearts floating
c|13|cute pixel pet creature growing bigger, three growth stages, bright playful room
d|14|retro 1990s keychain-style handheld toy glowing in a child's hand silhouette, nostalgic warm room, generic shape
e|15|big happy grown pixel creature with confetti and balloons, party, bright sky
L
echo done
