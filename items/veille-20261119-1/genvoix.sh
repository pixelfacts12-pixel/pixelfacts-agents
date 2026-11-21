#!/bin/bash
cd "$(dirname "$0")"; i=0
while IFS='|' read -r rate txt; do i=$((i+1))
 edge-tts --voice fr-FR-HenriNeural --rate="$rate" --text "$txt" --write-media voix_l/l$i.mp3 >/dev/null 2>&1
 ffmpeg -y -v error -i voix_l/l$i.mp3 -ar 44100 -ac 1 voix_l/l$i.wav
done < lignes.txt
ffmpeg -y -v error -f lavfi -i anullsrc=r=44100:cl=mono -t 0.12 voix_l/gap.wav
: > list.txt
for k in $(seq 1 $i); do echo "file 'voix_l/l$k.wav'" >> list.txt; [ $k -lt $i ] && echo "file 'voix_l/gap.wav'" >> list.txt; done
ffmpeg -y -v error -f concat -safe 0 -i list.txt -c:a libmp3lame -q:a 3 voix.mp3
