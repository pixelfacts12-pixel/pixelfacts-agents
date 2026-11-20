import numpy as np, wave
sr=44100; dur=38; bpm=96; beat=60/bpm
t=np.arange(int(sr*dur))/sr; out=np.zeros_like(t); rng=np.random.default_rng(3)
def env(n,a=0.01,r=0.4):
    x=np.arange(n)/sr; return np.minimum(1,x/a)*np.exp(-x/r)
def note(f,n,amp,r):
    x=np.arange(n)/sr; w=np.sin(2*np.pi*f*x)+0.3*np.sin(4*np.pi*f*x)+0.1*np.sin(6*np.pi*f*x)
    return amp*w*env(n,0.008,r)
chords=[(261.63,329.63,392.0),(220.0,261.63,329.63),(174.61,220.0,261.63),(196.0,246.94,293.66)]
bass=[65.41,55.0,43.65,49.0]
mel=[[1,1.25,1.5,2,1.5,1.25,1,1.5],[1.25,1.5,1.25,1,1.25,1.5,2,1.5]]
for bar in range(int(dur/(4*beat))+1):
    c=chords[bar%4]; b0=bar*4*beat
    for k in range(8):
        s=int((b0+k*beat/2)*sr); f=c[k%3]*(2 if k%2 else 1); n=int(0.5*sr)
        if s+n<len(out): out[s:s+n]+=note(f,n,0.10,0.25)
        if bar>=2 and s+n<len(out): out[s:s+n]+=note(c[0]*2*mel[bar%2][k],n,0.09,0.3)
    for k in range(4):
        s=int((b0+k*beat)*sr); n=int(0.9*beat*sr)
        if s+n<len(out): out[s:s+n]+=note(bass[bar%4],n,0.28,0.5)
        kn=int(0.18*sr); x=np.arange(kn)/sr
        if s+kn<len(out): out[s:s+kn]+=0.4*np.sin(2*np.pi*(120*np.exp(-x*25)+40)*x)*np.exp(-x*14)
    for k in range(8):
        s=int((b0+k*beat/2+beat/4)*sr); n=int(0.05*sr)
        if s+n<len(out): out[s:s+n]+=0.04*rng.standard_normal(n)*np.exp(-np.arange(n)/sr*90)
out*=np.minimum(1,t/1.5)*np.minimum(1,(dur-t)/2)
out/=np.abs(out).max()*1.05
def wr(name,a):
    w=wave.open(name,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
wr('musique_brut.wav',out)
for nm,f0 in (('pop',900),('pop2',700),('pop3',1100)):
    n=int(0.12*sr); x=np.arange(n)/sr; wr(nm+'.wav',np.sin(2*np.pi*(f0+1200*np.exp(-x*40))*x)*np.exp(-x*35)*0.9)
