import numpy as np
W,H=288,180
a=np.fromfile('layout.raw',np.uint8).reshape(-1,H,W)
prev=None;start=0
def sig(f):
    m=f>18
    cols=np.where(m.mean(0)>0.05)[0]; rows=np.where(m.mean(1)>0.05)[0]
    # main box: columns within x<250
    mc=m[:, :252]
    c=np.where(mc.mean(0)>0.3)[0]; r=np.where(mc.mean(1)>0.3)[0]
    box=(c.min()*4 if len(c) else -1, c.max()*4 if len(c) else -1, r.min()*4 if len(r) else -1, r.max()*4 if len(r) else -1)
    strip=m[:,256:].mean(0).mean()
    sr=np.where(m[:,258:].mean(1)>0.5)[0]
    return box,(sr.min()*4 if len(sr) else -1, sr.max()*4 if len(sr) else -1)
res=[sig(f) for f in a]
def key(s):
    b,sr=s; return (tuple(round(x/16) for x in b), tuple(round(x/24) for x in sr))
cur=key(res[0]);st=0
for i,s in enumerate(res+[None]):
    k=key(s) if s else None
    if k!=cur:
        if i-st>=3: print(f'{st:5d}-{i:5d}', res[st])
        cur=k;st=i
