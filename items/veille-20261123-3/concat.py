import subprocess
n=8
with open('list.txt','w') as f:
    for i in range(1,n+1):
        f.write(f"file 'voix_l/l{i}.wav'\nfile 'gap.wav'\n")
