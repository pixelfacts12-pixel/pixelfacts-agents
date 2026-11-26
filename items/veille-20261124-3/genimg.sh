#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261124-3
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person, no brand"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 8; break; else sleep 20; fi
  done
done <<'L'
a|21|glowing handheld game console shape with a cute generic round pixel creature inside a tall grass field, bright sky
b|22|child silhouette with a bug net and jar collecting colorful tiny generic cartoon creatures in a sunny meadow
c|23|team of cartoon cubes working at a desk with calendars flipping, pencils, light bulbs, cozy 1990s studio
d|24|big calendar pages flying from 1990 to 1996, confetti, bright sky, generic
e|25|many cute generic collectible creatures celebrating together with balloons and stars, party sky
L
echo done
