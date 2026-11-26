#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 20; break; else sleep 20; fi
  done
done <<'L'
a|71|cute round pocket-sized cartoon creatures of many colors peeking out of a pocket, sparkles, no text
b|72|bright handheld game console shape generic gray with green screen, glowing, colorful sparkles, generic not a real brand
c|73|child collecting colorful bugs and butterflies in a sunny city park with a net, cartoon, no real person
d|74|colorful calendar pages flying and a big clock, six sparkling years, bright cartoon
e|75|glowing giant treasure chest full of colorful collectible monster cards and balls, confetti, generic
L
echo done
