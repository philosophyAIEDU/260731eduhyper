# concat 은 조각마다 영상 길이(마지막 프레임까지)에 맞춰 소리를 채우므로, 실제 프레임 시각으로 map.json 의 출력 위치를 다시 잡는다.
# pts.txt: ffprobe -select_streams v -show_entries packet=pts_time -of csv=p=0 <원본> > pts.txt
import json,bisect
P=sorted(float(x) for x in open('pts.txt') if x.strip() and x.strip()!='N/A')
M=json.load(open('map.json'))
o=0
for m in M:
  i=bisect.bisect_left(P,m['s']-1e-9); j=bisect.bisect_left(P,m['e']-1e-9)
  fr=P[i:j]
  vd=(fr[-1]-fr[0])+(P[j]-fr[-1] if j<len(P) else 1/30) if fr else 0
  m['o']=round(o,4); o+=max(vd,m['e']-m['s'])
print(round(o,3))
json.dump(M,open('map.json','w'),indent=0)
