import json,subprocess
clips=json.load(open('edl.json',encoding='utf-8'))
F=30
cl=[]
for c in clips:
  s=round(c['s']*F)/F; e=round(c['e']*F)/F
  if e-s>=0.2: cl.append((s,e))
# timeline map
out=0;M=[]
for s,e in cl: M.append({'s':s,'e':e,'o':round(out,4)}); out+=e-s
json.dump(M,open('map.json','w'),indent=0)
fc=[]
for i,(s,e) in enumerate(cl):
  d=e-s
  fc.append(f"[0:v]trim=start={s:.4f}:end={e:.4f},setpts=PTS-STARTPTS[v{i}];")
  fc.append(f"[0:a]atrim=start={s:.4f}:end={e:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={d-0.03:.4f}:d=0.03[a{i}];")
fc.append(''.join(f"[v{i}][a{i}]" for i in range(len(cl)))+f"concat=n={len(cl)}:v=1:a=1[cv][ca];")
fc.append("[cv]crop=1324:745:108:196,scale=1920:1080:flags=lanczos,unsharp=5:5:0.6[ov]")
open('fc.txt','w').write('\n'.join(fc))
print(len(cl),round(out,2))
