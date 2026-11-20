import numpy as np, wave
sr=44100; dur=34; bpm=112; beat=60/bpm
t=np.arange(int(sr*dur))/sr
out=np.zeros_like(t)
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
f=lambda m:440*2**((m-69)/12)
bar=beat*4
for i in range(int(dur/bar)+1):
    c=chords[i%4]; s=int(i*bar*sr); e=min(int((i+1)*bar*sr),len(t))
    if s>=len(t): break
    tt=t[s:e]-t[s]; env=np.minimum(1,tt/0.15)*np.exp(-tt*0.35)
    for m in c:
        out[s:e]+=0.12*env*(np.sin(2*np.pi*f(m)*tt)+0.3*np.sin(2*np.pi*f(m)*2*tt))
    # bass
    for b in range(4):
        bs=s+int(b*beat*sr); be=min(bs+int(beat*sr*0.9),len(t))
        if bs>=len(t): break
        x=t[bs:be]-t[bs]; out[bs:be]+=0.35*np.sin(2*np.pi*f(c[0]-24)*x)*np.exp(-x*4)
    # arpeggio
    for k in range(8):
        a=s+int(k*beat/2*sr); ae=min(a+int(beat/2*sr),len(t))
        if a>=len(t): break
        x=t[a:ae]-t[a]; out[a:ae]+=0.12*np.sin(2*np.pi*f(c[k%3]+12)*x)*np.exp(-x*8)
        # hat
        n=np.random.RandomState(k).randn(len(x)); out[a:ae]+=0.03*n*np.exp(-x*60)*(k%2)
        if k%4==0: out[a:ae]+=0.4*np.sin(2*np.pi*(55+80*np.exp(-x*30))*x)*np.exp(-x*12)
out/=np.abs(out).max(); out*=0.8
w=wave.open('snd/musique.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
# pops
for n,(f0,f1) in enumerate([(500,900),(700,1200),(400,1000)]):
    x=np.arange(int(sr*0.14))/sr; fr=f0+(f1-f0)*np.minimum(1,x/0.04)
    s=np.sin(2*np.pi*np.cumsum(fr)/sr)*np.exp(-x*35)*0.8
    w=wave.open(f'snd/pop{n+1}.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((s*32767).astype(np.int16).tobytes()); w.close()
