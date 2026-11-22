#!/bin/bash
cd /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-3
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 120 -o /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-3/img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file /home/runner/work/pixelfacts-agents/pixelfacts-agents/items/veille-20261121-3/img/$name.jpg | grep -q JPEG; then echo ok $name; sleep 20; break; else sleep 20; fi
  done
done <<'L'
a|91|glowing game console with three blinking red lights on its front, cute cartoon cubes around, nostalgic
b|92|calendar page July with a big shield and the number 3 years, sparkles, cartoon
c|93|giant pile of shiny gold coins and money bag, billion dollars feeling, cartoon
d|94|thermometer and gears with a question mark, a mystery magnifying glass, cartoon
e|95|happy cartoon cubes giving back coins and a receipt refund, nostalgic warm light
L
echo done
