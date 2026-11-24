import json,re
d=json.load(open('cuts.json',encoding='utf-8'))
S=[];cur=None
for l in open('sil.txt'):
  m=re.search(r'silence_start: ([\d.]+)',l)
  if m: cur=float(m[1])
  m=re.search(r'silence_end: ([\d.]+)',l)
  if m and cur is not None: S.append((cur,float(m[1])));cur=None
PAD=0.35
clips=[]
for g in d['segs']:
  s,e=g['s'],g['e']
  # trim leading/trailing silence
  for a,b in S:
    if a<=s+0.05 and b>s: s=max(s,b-PAD)
    if a<e and b>=e-0.05: e=min(e,a+PAD)
  pieces=[[s,e]]
  for a,b in S:
    if b-a<1.0: continue
    np_=[]
    for x,y in pieces:
      if a+PAD<y and b-PAD>x and a+PAD>x and b-PAD<y:
        np_+= [[x,a+PAD],[b-PAD,y]]
      else: np_.append([x,y])
    pieces=np_
  for x,y in pieces:
    if y-x>0.3: clips.append({'s':round(x,3),'e':round(y,3),'seg':g['a']})
tot=sum(c['e']-c['s'] for c in clips)
print(len(clips),round(tot/60,2))
json.dump(clips,open('edl.json','w',encoding='utf-8'),indent=0)
