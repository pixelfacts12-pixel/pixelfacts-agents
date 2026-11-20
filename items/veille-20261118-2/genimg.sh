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
a|21|shiny golden Guinness-style world record trophy medal with laurel and confetti, floating colorful cubes
b|22|colorful obstacle course obby with floating platforms, spinning bars and a finish line flag, bright blocky world
c|23|racing stopwatch with glowing rings and speed lines, cubes, sky background
d|24|big gold medal on a ribbon with sparkles and a podium of three blocks
e|25|cute blocky cube judge character with a magnifying glass and a golden certificate scroll, friendly
f|26|giant crowd of tiny colorful cube avatars gathered in a huge neon stadium seen from above
g|27|glowing golden open book with stars and cubes flying out of it, magical
L
echo done
