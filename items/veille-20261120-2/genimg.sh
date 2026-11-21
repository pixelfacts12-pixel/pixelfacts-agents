#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person, no brand"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 20; break; else sleep 30; fi
  done
done <<'L'
a|41|colorful cartoon electric kick scooter on a sunny blocky city street, speed lines
b|42|big colorful blocky city map from above with winding roads, bright cyan sky
c|43|many cute cube avatars riding scooters together on a road at sunset, crowd, joyful
d|44|workshop wall full of colorful customizable scooter parts and paint buckets
e|45|giant glowing trophy and sparkles over a blocky city, confetti, celebration
L
echo done
