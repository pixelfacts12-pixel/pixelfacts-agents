#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person, no violence"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 150 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 15; break; else sleep 20; fi
  done
done <<'L'
a|41|cute cube hero with a wuxia hat standing on a misty mountain at sunrise, chinese ink painting mixed with glossy toy style, golden light
b|42|small glowing cube workshop studio at night with a lantern, tiny team desk with computers, giant sleeping dragon shadow behind, cozy
c|43|pause button glowing in the sky over chinese pagoda rooftops, floating glossy cubes, calm blue mood
d|44|a glowing red lantern rising from a small pagoda into a big night sky full of golden sparks, hopeful, cartoon
e|45|small yellow cube hero standing in front of a giant glossy cube giant tower, david versus goliath, bright sky, heroic, no weapons
f|46|huge rocket made of glossy blocks lifting off with golden confetti and a crowd of tiny cubes cheering, chinese lanterns
g|47|giant glowing trophy surrounded by a swirl of golden coins and wishlist hearts, cartoon, bright
L
echo done
