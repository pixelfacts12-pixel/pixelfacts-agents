#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-3
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 15; break; else sleep 20; fi
  done
done <<'L'
a|91|generic white game console box glowing three red lights in a ring, dark cozy room, cartoon
b|92|hot glowing computer chip with heat waves and flames, cartoon thermometer rising
c|93|warranty shield with a big 3 years ribbon and a shining checkmark, cartoon
d|94|pile of golden coins and dollar bills tower, sparkling, cartoon
e|95|nostalgic living room with old tv and a gamepad on the floor, warm evening light, cartoon
L
echo done
