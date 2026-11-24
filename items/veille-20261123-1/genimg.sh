#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, cute, soft, no text, no logo, no real person, no brand"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 12; break; else sleep 20; fi
  done
done <<'L'
a|41|tiny cute pixel art blob creature with big eyes on a glowing retro pixel screen, party confetti, birthday cake with candles
b|42|cute small pixel pet creature in a cozy bedroom at night, moon and stars, hearts floating, soft glow
c|43|cute pixel pet creature eating a pixel apple, hearts and sparkles, pastel pixel landscape
d|44|globe of earth covered with tiny cute pixel pet creatures waving, hearts, bright sky
e|45|cute pixel creature growing from a tiny egg to a bigger happy creature, three stages, sparkles, soft pastel background
L
echo done
