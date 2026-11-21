#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no letters, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 150 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 10; break; else sleep 15; fi
  done
done <<'L'
a|61|colorful cartoon video game village square with houses, fountain and fantasy trees, sunny, no characters
b|62|cute cartoon knight adventurer in armor seen from behind walking into a bright fantasy village, game world
c|63|big glowing golden exclamation mark floating above a fantasy village, sparkles, quest symbol
d|64|speech bubble made of glowing cubes in a sunny fantasy village, playful
e|65|stone brick wall in a fantasy village with a cartoon footsteps trail leading into it, funny
f|66|giant glowing red power button on a wooden signpost in a fantasy meadow, humorous
g|67|shiny red apple glowing with sparkles on a wooden table in a fantasy village
h|68|joyful confetti and fireworks over a fantasy village, golden coins and stars, celebration
i|69|cartoon knight running fast toward the camera on a dirt path in fantasy village, dust clouds, funny
j|70|big question mark made of glowing cubes in a fantasy village, colorful
L
echo done
