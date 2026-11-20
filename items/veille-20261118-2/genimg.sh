#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5 6; do
    curl -sL -m 150 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG && [ $(stat -c%s img/$name.jpg) -gt 20000 ]; then echo ok $name; sleep 20; break; else sleep 30; fi
  done
done <<'L'
bg1|21|colorful obstacle course obby with floating cube platforms and lava gaps in a bright sky
bg2|22|giant glowing stopwatch speeding with motion lines and neon cubes
bg3|23|shiny gold medal with ribbon on a podium, sparkles
bg4|24|golden certificate scroll with wax seal and sparkles floating among cubes
bg5|25|huge golden trophy with confetti and fireworks, arcade
bg6|26|blocky cube character crossing a finish line with flags, confetti, no face details
L
echo done > img_done
