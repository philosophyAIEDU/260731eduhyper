# 원본 기준 (시작, 끝, 라벨). 구간 안의 2초 넘는 무음은 줄인다.
import json,sys
sys.stdout.reconfigure(encoding='utf-8')
R = """
106.3 169.7 인트로
169.7 184.2 폴더·터미널
228.2 242.5
288.9 304.6 claude실행
385.1 418.8 저장소받기
434.6 463.5
531.8 550.3 실습시작
563.4 608.4 CLI장점
646.3 712.1 STEP1·모드
742.1 791.4 전공·주제
886.3 919.1 가상메모
1057.0 1093.9 왜IDE
1165.9 1176.7 복사
1297.8 1336.6 페이퍼생성
1351.1 1365.7
1386.7 1467.7 질문·설명
1529.6 1549.6 다음
1554.0 1623.0 STEP3플랜
1650.9 1676.8
1739.1 1793.7
2007.3 2069.4 STEP4
2127.3 2178.6 슬라이드
2324.8 2354.7 디자인요청
2527.8 2564.2 디자인바뀜
2643.4 2693.1 CLI힘
2776.1 2795.9 개인정보
2864.6 2871.7 STEP5
2885.7 2941.1 스킬약속
3043.6 3166.1 lecture-kit
3232.9 3283.5 스킬md
3335.1 3363.1 스킬사용
3410.9 3453.5 다른폴더
3590.8 3618.6 결과
3677.1 3700.8 STEP6
3764.8 3804.0 weekly
3917.6 3946.7 inbox
3963.5 3985.3
4019.3 4058.2 결과·정리
4079.1 4107.7
4271.4 4294.6 CLAUDE.md
4427.2 4516.2 매일8시
4525.7 4548.3
4612.0 4634.4
4790.8 4821.3 뉴스결과
4832.9 4913.8
4930.0 4960.6 피드백
4962.5 4972.9
5004.2 5047.9
5065.0 5070.1
5110.4 5124.4
5194.8 5225.1
5237.6 5254.3
5257.0 5261.7 끝
"""
GAP=float(sys.argv[1]) if len(sys.argv)>1 else 2.0
segs=json.load(open('transcript.json',encoding='utf-8'))['segments']
words=[(w['start'],w['end']) for s in segs for w in s['words'] if w['end']>w['start']]
raw=[]
for line in R.strip().splitlines():
    p=line.split(); raw.append((float(p[0]),float(p[1]),p[2] if len(p)>2 else ''))
out=[]
for a,b,l in raw:
    ws=[(s,e) for s,e in words if e>a and s<b]
    if not ws: continue
    pieces=[]; ps=max(a,ws[0][0]-0.3); pe=ws[0][1]
    for s,e in ws[1:]:
        if s-pe>GAP: pieces.append((ps,pe+0.4)); ps=s-0.3
        pe=max(pe,e)
    pieces.append((ps,min(b+0.3,pe+0.5)))
    for i,(s,e) in enumerate(pieces):
        lab=l if i==0 else ''
        if out and s<=out[-1][1]+0.05: out[-1]=(out[-1][0],max(out[-1][1],e),out[-1][2])
        else: out.append((s,e,lab))
tot=sum(b-a for a,b,_ in out)
print(len(out),'pieces total %.1fs = %dm%ds'%(tot,tot//60,tot%60))
json.dump(out,open('cuts.json','w',encoding='utf-8'),ensure_ascii=False)
t=0
for a,b,l in out:
    if l: print('%7.1f %-10s src %.1f'%(t,l,a))
    t+=b-a
