"""t1/t2/t3.json (whisper 단어 시각) → 이어 붙인 영상 기준 자막 assets/source.srt

인트로(0) + 실습(O2) + 아웃트로(O3) 순서. 한 줄 자막은 원본 영상에 박힌 자막처럼 짧게(최대 ~22자).
표기 교정은 FIX (전역 치환) 와 fixes.txt (큐 번호별 문구 교체, 2차 검토용).
"""
import json, re, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
O2 = 145.387
O3 = 145.387 + 950.033
PARTS = [("t1.json", 0.0), ("t2.json", O2), ("t3.json", O3)]
MAXC = 22

FIX = [
    (r"philo\s*local\s*ai\s*\.\s*netlify\s*\.\s*app", "philolocalai.netlify.app"),
    (r"추앤\s*3|2n\s*3|추앤", "Qwen3"),
    (r"젠마\s*3|젠마", "Gemma3"),
    (r"노콜", "로컬"),
    (r"b번", "비번"),
    (r"랜서", "랜선"),
    (r"개인정부", "개인정보"),
    (r"채취\s*pt", "ChatGPT"),
    (r"(\d)\s*b(?![A-Za-z])", r"\1B"),
    (r"진료", "진로"),
    (r"담으줍니다", "답을 줍니다"),
    (r"서속대학", "소속 대학"),
    (r"보완이", "보안이"),
    (r"가성으로", "가상으로"),
    (r"자리 자료", "짜리 자료"),
    (r"오퍼스", "Opus"),
    (r"\bppt\b", "PPT"),
    (r"메뉴 모음", "메모 모음"),
    (r"생성형의 관계", "생성형 AI의 관계"),
    (r"채찌\s*pt|챗\s*gpt|채찌피티|챗지피티|chat\s*gpt", "ChatGPT"),
    (r"재미나이|제미나이|gemini", "Gemini"),
    (r"클로드", "Claude"),
    (r"philosophy\s*local\s*ai|필로소피\s*로컬\s*ai|필로소피\s*로컬\s*에이아이", "필로소피 로컬 AI"),
    (r"local\s*ai", "로컬 AI"),
    (r"로컬\s*에게", "로컬 AI"),
    (r"올라마|ollama", "Ollama"),
    (r"\bshen\b|퀜|큐엔|쿠엔|qwen", "Qwen"),
    (r"\bgemma\b|젬마", "Gemma"),
    (r"\bai\b", "AI"),
    (r"(?<![A-Za-z])ai(?=[가-힣])", "AI"),
    (r"(?<=[가-힣 ])ai(?![A-Za-z])", "AI"),
    (r"\bpdf\b", "PDF"),
    (r"\bexcel\b", "Excel"),
    (r"\bword\b", "Word"),
]


def fix(s):
    for a, b in FIX:
        s = re.sub(a, b, s, flags=re.I)
    return re.sub(r"\s+", " ", s).strip()


def ts(t):
    t = max(0, t)
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}".replace(",1000", ",999")


cues = []
for fn, off in PARTS:
    data = json.load(open(os.path.join(HERE, fn), encoding="utf-8"))
    for seg in data["segments"]:
        words = [w for w in seg["words"] if w["word"].strip()]
        cur = []
        def flush():
            if cur:
                txt = " ".join(w["word"] for w in cur)
                cues.append([cur[0]["start"] + off, cur[-1]["end"] + off, txt])
                cur.clear()
        for i, w in enumerate(words):
            if cur:
                ln = len(" ".join(x["word"] for x in cur))
                gap = w["start"] - cur[-1]["end"]
                end_sent = re.search(r"[.?!]$", cur[-1]["word"]) and ln >= 6
                if ln + 1 + len(w["word"]) > MAXC or gap > 0.6 or end_sent:
                    flush()
            cur.append(w)
        flush()

# clean: strip trailing period, min duration, avoid overlap, hold a little
out = []
for i, (s, e, t) in enumerate(cues):
    t = fix(t).rstrip(".").strip()
    if not t:
        continue
    nxt = cues[i + 1][0] if i + 1 < len(cues) else e + 1.0
    e2 = min(max(e + 0.25, s + 0.8), nxt - 0.02)
    out.append([s, max(e2, s + 0.3), t])

# per-cue manual fixes: "번호<TAB>문구"
fx = os.path.join(HERE, "fixes.txt")
if os.path.exists(fx):
    for line in open(fx, encoding="utf-8"):
        if "\t" in line and not line.startswith("#"):
            n, txt = line.rstrip("\n").split("\t", 1)
            n = int(n)
            if txt == "-":
                out[n - 1][2] = ""
            else:
                out[n - 1][2] = txt
out = [c for c in out if c[2]]

root = os.path.dirname(HERE)
with open(os.path.join(root, "assets", "source.srt"), "w", encoding="utf-8") as f:
    for i, (s, e, t) in enumerate(out, 1):
        f.write(f"{i}\n{ts(s)} --> {ts(e)}\n{t}\n\n")
with open(os.path.join(HERE, "cues.txt"), "w", encoding="utf-8") as f:
    for i, (s, e, t) in enumerate(out, 1):
        part = "I" if s < O2 else ("P" if s < O3 else "O")
        rel = s - (0 if part == "I" else O2 if part == "P" else O3)
        f.write(f"{i:4d} {part} {s:8.2f} ({rel:7.2f})  {t}\n")
print(len(out), "cues")
