#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
i=0
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 150 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 46; break; else sleep 46; fi
  done
done <<'L'
a|11|huge glowing rocket made of cubes flying up through a sky of blue pixel clouds
b|12|golden podium with a shiny trophy and confetti, pixel cubes, arcade
c|13|giant crowd of thousands of tiny colorful cube avatars gathered in a huge futuristic neon plaza seen from above
d|14|glowing calendar page with pixel art confetti, party mood, game launch day
e|15|gaming PC with glowing screen and rising graph arrow, neon cubes around
f|16|big shiny gift box open with golden light and sparkles
L
echo done
