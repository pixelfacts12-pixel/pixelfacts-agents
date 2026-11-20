P="cartoon%203D%20glossy%20"
for n in "trophees|golden%20trophies%20on%20podium%20confetti%20sky%20blue%20yellow%20pink|13" "equipe|tiny%20indie%20game%20studio%20desk%20with%20laptop%20cozy%20pink%20yellow|15" "geants|tiny%20yellow%20cube%20next%20to%20giant%20robots%20and%20skyscrapers%20blue%20sky|16"; do
 IFS='|' read a b c <<<"$n"
 for t in 1 2 3; do sleep 46; curl -sL --max-time 120 -o img/$a.jpg "https://image.pollinations.ai/prompt/${P}${b}?width=1080&height=1920&nologo=true&seed=$c"; file img/$a.jpg | grep -q JPEG && break; done
done
echo done > img/DONE
