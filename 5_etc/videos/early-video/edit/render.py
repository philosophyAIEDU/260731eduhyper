# cuts.json 의 구간을 잘라 붙이고, 줌 화면공유 영역만 남긴다 (오른쪽 얼굴 띠 제거).
# 프레임 단위로 정확히 자른다: 구간 i 의 길이 N_i/30 = round(누적끝*30) - round(누적시작*30).
# 영상은 조각별 인코딩 후 이어 붙이고, 소리는 원본에서 같은 길이로 한 번에 잘라 붙여 싱크를 맞춘다.
import json, subprocess, os
from concurrent.futures import ThreadPoolExecutor
src=os.path.abspath('../../../../3_원본 보관/초기영상/초기영상.mp4')
cuts=json.load(open('cuts.json',encoding='utf-8'))
os.makedirs('parts',exist_ok=True)
VF='crop=1022:548:0:84,scale=1720:922:flags=lanczos,pad=1920:1080:100:18:color=0x15131c,fps=30,format=yuv420p'
cum=0; N=[]
for a,b,_ in cuts:
    s=round(cum*30); cum+=b-a; N.append(round(cum*30)-s)
def job(i):
    a=cuts[i][0]; out=f'parts/v{i:03d}.mp4'
    cmd=['ffmpeg','-y','-v','error','-ss',f'{a:.3f}','-i',src,'-frames:v',str(N[i]),'-an','-vf',VF,
         '-c:v','libx264','-preset','medium','-crf','19','-g','60','-video_track_timescale','30000',out]
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode: print(i,r.stderr[-500:],flush=True)
    return out
with ThreadPoolExecutor(4) as ex: parts=list(ex.map(job,range(len(cuts))))
open('parts/vlist.txt','w').write(''.join(f"file '{os.path.basename(p)}'\n" for p in parts))
r=subprocess.run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i','parts/vlist.txt','-c','copy','parts/video.mp4'],capture_output=True,text=True)
print('video', r.returncode, r.stderr[-300:])
# audio
fc=[]
for i,(a,b,_) in enumerate(cuts):
    d=N[i]/30
    fc.append(f'[0:a]atrim=start={a:.4f}:duration={d:.5f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={d-0.03:.4f}:d=0.03[a{i}]')
fc.append(''.join(f'[a{i}]' for i in range(len(cuts)))+f'concat=n={len(cuts)}:v=0:a=1,aresample=48000[aout]')
open('parts/afilter.txt','w').write(';\n'.join(fc))
r=subprocess.run(['ffmpeg','-y','-v','error','-i',src,'-filter_complex_script','parts/afilter.txt','-map','[aout]','-ac','2','-c:a','aac','-b:a','192k','parts/audio.m4a'],capture_output=True,text=True)
print('audio', r.returncode, r.stderr[-300:])
r=subprocess.run(['ffmpeg','-y','-v','error','-i','parts/video.mp4','-i','parts/audio.m4a','-map','0:v','-map','1:a','-c','copy','-movflags','+faststart','../assets/media/src.mp4'],capture_output=True,text=True)
print('mux', r.returncode, r.stderr[-300:], 'expected', sum(N)/30)
