#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 50; break; else sleep 50; fi
  done
done <<'L'
a|41|glossy 3D cartoon electric kick scooter on a sunny colorful city road, blocky city, speed lines
b|42|blocky cartoon city street with many electric scooters racing, sunset, vibrant
c|43|giant glowing heart and star icons floating over a blocky city, celebration
d|44|cartoon blue sky with cubes and a single scooter in front of a cheerful blocky skyline, wide
e|45|stack of glowing golden cube coins and a scooter, treasure feel, party confetti
L
echo done
