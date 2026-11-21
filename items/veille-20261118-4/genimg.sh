#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 150 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 15; break; else sleep 20; fi
  done
done <<'L'
a|41|cartoon city skyline with a traditional pagoda tower next to modern skyscrapers, golden hour, floating glossy cubes
b|42|one tiny yellow glossy cube hero standing in front of gigantic glowing futuristic towers, david versus goliath feeling, dramatic sky, friendly
c|43|desk with concept art sketches pencils and a glowing computer screen, creative studio, floating cubes
d|44|cinema red curtain opening with a bright spotlight and popcorn and film reel, festive
e|45|giant wall calendar with a date circled and a calendar page flipping, clock, bright colors
f|46|giant glowing rising bar chart with an arrow shooting upward into a sky full of stars and cubes
g|47|golden trophy with confetti and fireworks and floating glossy cubes, celebration
L
echo done
