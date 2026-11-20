P0="excited cartoon chameleon hiding on colorful painted wall, glossy 3D cartoon, yellow pink sky blue colors"
P3="group of cartoon cubes playing multiplayer hide and seek in a colorful room, glossy 3D cartoon"
P5="rocket of confetti and tiny world globe with game controllers flying around, glossy 3D cartoon, sky blue background"
for i in 0 3 5; do v=P$i; for try in 1 2 3 4; do sleep 47; curl -sL --max-time 120 -o img$i.jpg "https://image.pollinations.ai/prompt/$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "${!v}")?width=1080&height=1920&nologo=true&seed=$((i+40+try))"; file img$i.jpg | grep -q JPEG && break; done; done; echo done > gen.done
