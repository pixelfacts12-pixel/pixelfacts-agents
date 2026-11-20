#!/bin/bash
cd "$(dirname "$0")"
P="3D glossy cartoon style, bright cyan blue yellow and pink colors, no text, no logo, no real person"
while IFS='|' read -r name seed prompt; do
  for try in 1 2 3 4 5; do
    curl -sL -m 120 -o img/$name.jpg "https://image.pollinations.ai/prompt/$(python3 -I -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$prompt, $P")?width=1080&height=1920&nologo=true&seed=$seed"
    if file img/$name.jpg | grep -q JPEG; then echo ok $name; break; else sleep 20; fi
  done
done <<'X'
bg1|31|glowing green translucent retro game console with a big green orb, floating cubes, sparkles, party confetti
bg2|32|retro game console on a pedestal in a spotlight, 25 golden balloons, cubes
bg3|33|world map made of colorful cubes with glowing pins on Japan and Europe, sky blue
bg4|34|row of three game consoles getting bigger and sleeker, neon glow, tech background
bg5|35|huge pile of cute game console boxes stacked high like a mountain, golden sparkles
bg6|36|glowing green ring in space with energy and shiny cubes floating, sci-fi
bg7|37|desktop computer monitor with floating retro game cartridges flying into it, cubes
X
echo done
