"""한국어 음성 전사 — 단어 단위 타임스탬프를 만듭니다.

2-오디오추출-전사.ps1 이 호출합니다. 직접 쓸 수도 있습니다:
    python transcribe.py <오디오파일> <출력.json> [모델]

모델: tiny / base / small / medium(기본) / large-v3
      medium 이 한국어 정확도와 속도의 균형이 좋습니다.
"""

import json
import sys
import os

# Windows 콘솔은 한글 코드페이지(cp949)를 쓰는 경우가 많아서,
# 거기 없는 기호(em dash, 경고 표시 등)를 출력하면 스크립트가 죽는다.
# 인코딩할 수 없는 글자는 '?' 로 바꾸고 계속 진행하게 한다.
try:
    sys.stdout.reconfigure(errors="replace")
    sys.stderr.reconfigure(errors="replace")
except Exception:
    pass

try:
    import whisper
except ImportError:
    print("  whisper 가 설치돼 있지 않습니다.")
    print("  설치: pip install -U openai-whisper")
    sys.exit(1)

audio = sys.argv[1] if len(sys.argv) > 1 else "assets/narration.mp3"
out = sys.argv[2] if len(sys.argv) > 2 else "transcript.json"
model_name = sys.argv[3] if len(sys.argv) > 3 else "medium"

# GPU 가 있으면 쓰고, 없으면 CPU 로 (느리지만 동작합니다)
device = "cpu"
try:
    import torch

    if torch.cuda.is_available():
        device = "cuda"
except ImportError:
    pass

print(f"        모델 {model_name} / {device.upper()} 사용", flush=True)

model = whisper.load_model(model_name, device=device)
result = model.transcribe(audio, language="ko", word_timestamps=True, verbose=False)

segments = []
for seg in result["segments"]:
    segments.append(
        {
            "id": seg["id"],
            "start": round(seg["start"], 3),
            "end": round(seg["end"], 3),
            "text": seg["text"].strip(),
            "words": [
                {"word": w["word"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)}
                for w in seg.get("words", [])
            ],
        }
    )

with open(out, "w", encoding="utf-8") as f:
    json.dump({"language": "ko", "segments": segments}, f, ensure_ascii=False, indent=2)

# 사람이 읽기 쉬운 버전도 같이 — 씬 경계를 눈으로 잡을 때 씁니다
txt_path = os.path.splitext(out)[0] + ".txt"
with open(txt_path, "w", encoding="utf-8") as f:
    f.write("문장별 시각\n")
    f.write("=" * 60 + "\n")
    for s in segments:
        f.write(f"[{s['start']:7.2f} ~ {s['end']:7.2f}]  {s['text']}\n")
    f.write("\n\n단어별 시각\n")
    f.write("=" * 60 + "\n")
    for s in segments:
        for w in s["words"]:
            f.write(f"{w['start']:7.2f}  {w['word']}\n")

print(f"        전사 완료 - 문장 {len(segments)}개", flush=True)

# ── OBS 녹화 앞뒤의 빈 구간 감지 ──────────────────────────────
# 녹화 버튼을 누르고 말을 시작하기까지, 말이 끝나고 정지를 누르기까지의
# 조용한 시간. 안 자르면 그만큼 빈 화면으로 영상이 시작/종료된다.
if segments:
    speech_start = segments[0]["start"]
    speech_end = segments[-1]["end"]

    total = 0.0
    try:
        import subprocess

        total = float(
            subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "default=noprint_wrappers=1:nokey=1", audio],
                capture_output=True, text=True, check=True,
            ).stdout.strip()
        )
    except Exception:
        total = speech_end

    head = speech_start
    tail = max(0.0, total - speech_end)

    if head > 1.5 or tail > 1.5:
        print("", flush=True)
        print("  [!] 녹화 앞뒤에 말이 없는 구간이 있습니다.", flush=True)
        if head > 1.5:
            print(f"      앞  : {head:.1f}초 (말은 {speech_start:.1f}초부터 시작)", flush=True)
        if tail > 1.5:
            print(f"      뒤  : {tail:.1f}초 (말은 {speech_end:.1f}초에 끝남)", flush=True)
        print("", flush=True)
        print("    이대로 두면 그 시간만큼 빈 화면이 나옵니다.", flush=True)
        print("    Claude 에게 이렇게 말하세요:", flush=True)
        print(f'      "오디오 앞뒤 무음을 잘라줘. 실제 발화는 '
              f'{speech_start:.1f}초~{speech_end:.1f}초야"', flush=True)
    else:
        print(f"        발화 구간 {speech_start:.1f}초 ~ {speech_end:.1f}초 - 앞뒤 여백 문제없음",
              flush=True)
