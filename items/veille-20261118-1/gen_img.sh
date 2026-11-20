#!/bin/bash
cd "$(dirname "$0")/img"
i=0
for p in "glossy 3D cartoon rocket launching upward with fire trail, sky blue background, yellow and pink, no text" "glossy 3D cartoon gaming PC monitor with glowing neon blue light, colorful, no text" "glossy 3D cartoon golden trophy podium, confetti, sky blue and pink, no text" "glossy 3D cartoon swarm of tiny colorful pixel cubes rising up, sky blue, no text" "glossy 3D cartoon calendar and clock with sparkles, yellow and blue, no text"; do
 i=$((i+1)); q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$p")
 for s in 1 2 3 4; do
  curl -sL -m 120 -o bg$i.jpg "https://image.pollinations.ai/prompt/$q?width=1080&height=1920&nologo=true&seed=$((i*7+s))"
  [ "$(stat -c%s bg$i.jpg)" -gt 20000 ] && break; sleep 50
 done; sleep 47
done
echo fini > ../img_done
