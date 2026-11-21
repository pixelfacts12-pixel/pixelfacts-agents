#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no letters, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 150 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 12; break; else sleep 15; fi
  done
done <<'L'
a|61|magic wishing star falling over a sunny cartoon fantasy village, sparkles, colorful
b|62|cute fantasy village square with a wooden quest signpost and colorful houses, sunny, no people
c|63|big speech bubble shape floating over a cobblestone village road, repeating echo rings, playful
d|64|single big green tree in a village square with a circular dirt path worn around it, sunny
e|65|cozy medieval village street with market stalls, lantern, bright morning, nobody
f|66|three cute cartoon chickens running in a green meadow near a wooden fence, joyful
g|67|golden glowing quest scroll and exclamation mark floating over a meadow, sparkles
h|68|golden magic sparkles and confetti swirling around in a village square, celebration
i|69|village at sunset with cozy lanterns and a wooden bench, warm light, peaceful, nobody
j|70|big thank you heart made of glowing cubes in a sunny village, confetti
L
echo done
