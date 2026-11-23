import numpy as np, wave
sr=44100; dur=34; bpm=104; beat=60/bpm
t=np.arange(int(sr*dur))/sr; out=np.zeros_like(t)
def env(n,a=0.01,r=0.4):
    x=np.arange(n)/sr; return np.minimum(1,x/a)*np.exp(-x/r)
def note(f,n,amp,r):
    x=np.arange(n)/sr; w=np.sin(2*np.pi*f*x)+0.3*np.sin(4*np.pi*f*x)+0.1*np.sin(6*np.pi*f*x)
    return amp*w*env(n,0.008,r)
chords=[(196.00,246.94,293.66),(220.00,261.63,329.63),(174.61,220.00,261.63),(164.81,196.00,246.94)]
bass=[49.0,55.0,43.65,41.2]
for bar in range(int(dur/(4*beat))+1):
    c=chords[bar%4]; b0=bar*4*beat
    for k in range(8):  # croches arpégées
        s=int((b0+k*beat/2)*sr); f=c[k%3]*(2 if k%2 else 1)
        n=int(0.5*sr); 
        if s+n<len(out): out[s:s+n]+=note(f,n,0.12,0.25)
    for k in range(4):
        s=int((b0+k*beat)*sr); n=int(0.9*beat*sr)
        if s+n<len(out): out[s:s+n]+=note(bass[bar%4],n,0.28,0.5)
        # kick doux
        kn=int(0.18*sr); x=np.arange(kn)/sr
        if s+kn<len(out): out[s:s+kn]+=0.4*np.sin(2*np.pi*(120*np.exp(-x*25)+40)*x)*np.exp(-x*14)
    for k in range(8):  # charleston
        s=int((b0+k*beat/2+beat/4)*sr); n=int(0.05*sr)
        if s+n<len(out): out[s:s+n]+=0.04*np.random.default_rng(k+bar).standard_normal(n)*np.exp(-np.arange(n)/sr*90)
out*=np.minimum(1,(dur-t)/2)
out/=np.abs(out).max()*1.05
w=wave.open('musique_brut.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
# pop
n=int(0.12*sr); x=np.arange(n)/sr; p=np.sin(2*np.pi*(900+1200*np.exp(-x*40))*x)*np.exp(-x*35)
w=wave.open('pop1.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((p*0.9*32767).astype(np.int16).tobytes()); w.close()
for k,(f0,f1,dd) in enumerate([(700,1500,30),(500,1900,45)]):
    n=int(0.14*sr); x=np.arange(n)/sr; p=np.sin(2*np.pi*(f0+f1*np.exp(-x*dd))*x)*np.exp(-x*30)
    w=wave.open(f'pop{k+2}.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((p*0.9*32767).astype(np.int16).tobytes()); w.close()
