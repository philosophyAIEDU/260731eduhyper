import json,re
from pathlib import Path
s=Path('subtitles.srt').read_text(encoding='utf-8-sig')
def sec(s):
 h,m,s=map(float,s.replace(',','.').split(':'));return h*3600+m*60+s
subs=[]
for b in re.split(r'\n\s*\n',s.strip()):
 l=b.splitlines();a,z=l[1].split(' --> ');subs.append(dict(start=sec(a),end=sec(z),text=' '.join(l[2:])))
Path('subs.json').write_text(json.dumps(subs,ensure_ascii=False))
