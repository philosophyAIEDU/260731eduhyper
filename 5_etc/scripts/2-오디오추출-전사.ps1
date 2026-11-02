# ============================================================
#  2. 오디오 추출 + 음성 전사
#
#  원본 영상에서 내레이션 오디오만 뽑고,
#  각 단어가 몇 초에 나오는지(단어 단위 타임스탬프)를 만듭니다.
#
#  이게 있어야 화면을 목소리에 정확히 맞출 수 있습니다.
#  기획서에 적은 초 단위 수치는 실제 낭독과 거의 항상 다릅니다.
#
#  사용법:  .\scripts\2-오디오추출-전사.ps1 "source\PART 0. 초고 영상.mp4"
# ============================================================

$ErrorActionPreference = "Continue"
$proj = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  오디오 추출 + 전사" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# ── 입력 영상 찾기 ──────────────────────────────────────────
$video = $args[0]
if ([string]::IsNullOrWhiteSpace($video)) {
    $found = Get-ChildItem -Path (Join-Path $proj "source") -Filter *.mp4 -ErrorAction SilentlyContinue |
             Select-Object -First 1
    if ($null -ne $found) {
        $video = $found.FullName
        Write-Host "  source 폴더에서 찾았습니다: $($found.Name)" -ForegroundColor Gray
    }
}
if ([string]::IsNullOrWhiteSpace($video)) {
    Write-Host "  원본 영상을 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "  source\ 폴더에 mp4 를 넣거나, 경로를 직접 알려 주세요:" -ForegroundColor Yellow
    Write-Host '    .\scripts\2-오디오추출-전사.ps1 "C:\경로\영상.mp4"' -ForegroundColor White
    exit 1
}
if (-not (Test-Path $video)) {
    Write-Host "  파일이 없습니다: $video" -ForegroundColor Red
    exit 1
}

# ── ffmpeg 확인 ────────────────────────────────────────────
if ($null -eq (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "  ffmpeg 가 없습니다. 먼저 0-환경점검.ps1 을 실행하세요." -ForegroundColor Red
    exit 1
}

# ── 오디오 추출 ────────────────────────────────────────────
$assets = Join-Path $proj "assets"
if (-not (Test-Path $assets)) { New-Item -ItemType Directory -Path $assets -Force | Out-Null }
$mp3 = Join-Path $assets "narration.mp3"

Write-Host "  [1/2] 오디오 추출 중..." -NoNewline
& ffmpeg -y -v error -i $video -vn -acodec libmp3lame -b:a 192k -ar 48000 $mp3
if (Test-Path $mp3) {
    Write-Host " 완료" -ForegroundColor Green
} else {
    Write-Host " 실패" -ForegroundColor Red
    Write-Host "  원본에 오디오 트랙이 없는지 확인하세요." -ForegroundColor Yellow
    exit 1
}

# 길이 재기 — index.html 의 data-duration 에 쓸 값
$dur = & ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $mp3
$durR = [math]::Round([double]$dur, 2)
Write-Host "        오디오 길이: $durR 초" -ForegroundColor White

# ── index.html 자동 수정 ───────────────────────────────────
# 입문자가 HTML 을 직접 건드리지 않도록 여기서 처리합니다.
#   1) 영상 전체 길이를 오디오 길이로 맞춤 (2군데)
#   2) <audio> 태그 삽입
$idx = Join-Path $proj "index.html"
$wired = $false
if (Test-Path $idx) {
    $html = Get-Content $idx -Raw -Encoding UTF8

    $html = [regex]::Replace($html,
        '(<div\s+id="root"[\s\S]*?data-duration=")[0-9.]+(")',
        "`${1}$durR`${2}")
    $html = [regex]::Replace($html,
        '(const\s+TOTAL\s*=\s*)[0-9.]+(\s*;)',
        "`${1}$durR`${2}")

    $audioTag = @"
<audio
        id="narration"
        src="assets/narration.mp3"
        data-start="0"
        data-duration="$durR"
        data-track-index="10"
        data-volume="1"
      ></audio>
"@
    if ($html -match '<!--AUDIO-SLOT-->') {
        $html = $html.Replace('<!--AUDIO-SLOT-->', $audioTag.Trim())
        $wired = $true
    } elseif ($html -match 'id="narration"') {
        # 이미 들어 있으면 길이만 갱신
        $html = [regex]::Replace($html,
            '(id="narration"[\s\S]*?data-duration=")[0-9.]+(")',
            "`${1}$durR`${2}")
        $wired = $true
    }

    $html | Out-File -FilePath $idx -Encoding utf8 -NoNewline
}

if ($wired) {
    Write-Host "        index.html 에 오디오 연결 완료 (길이 $durR 초)" -ForegroundColor Green
} else {
    Write-Host "        index.html 을 자동 수정하지 못했습니다 — Claude 에게 부탁하세요" -ForegroundColor Yellow
}

# ── 전사 ───────────────────────────────────────────────────
Write-Host "  [2/2] 음성 전사 중..." -NoNewline

$py = Get-Command python -ErrorAction SilentlyContinue
$whisperOk = $false
if ($null -ne $py) {
    & python -c "import whisper" 2>$null
    if ($?) { $whisperOk = $true }
}

if (-not $whisperOk) {
    Write-Host " 건너뜀" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  whisper 가 없어 전사를 건너뛰었습니다." -ForegroundColor Yellow
    Write-Host "  설치하면 화면을 목소리에 정확히 맞출 수 있습니다:" -ForegroundColor Gray
    Write-Host "    pip install -U openai-whisper" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "        (처음 한 번은 모델을 내려받느라 몇 분 걸립니다)" -ForegroundColor Gray
    & python (Join-Path $PSScriptRoot "transcribe.py") $mp3 (Join-Path $proj "transcript.json")
}

# ── 마무리 안내 ────────────────────────────────────────────
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  완료" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  만들어진 파일" -ForegroundColor White
Write-Host "    assets\narration.mp3   ← 영상에 들어갈 내레이션" -ForegroundColor Gray
if ($whisperOk) {
    Write-Host "    transcript.json        ← 단어별 시각 (화면 타이밍 기준)" -ForegroundColor Gray
    Write-Host "    transcript.txt         ← 사람이 읽기 쉬운 버전" -ForegroundColor Gray
}
Write-Host ""
Write-Host "  index.html 은 자동으로 맞춰 뒀습니다 (길이 $durR 초 + 오디오 연결)." -ForegroundColor Green
Write-Host ""
Write-Host "  ⚠ 아직 씬은 예시 하나뿐입니다." -ForegroundColor Yellow
Write-Host "     지금 렌더하면 앞부분만 나오고 나머지는 빈 화면입니다." -ForegroundColor Yellow
Write-Host "     아래 단계를 먼저 하세요." -ForegroundColor Yellow
Write-Host ""
Write-Host "  ── 다음에 할 일 ──────────────────────────────" -ForegroundColor Cyan
Write-Host ""
Write-Host "  이 폴더에서 Claude Code 를 열고 이렇게 말하세요:" -ForegroundColor White
Write-Host ""
Write-Host '    "transcript.txt 의 실제 발화 타이밍에 맞춰' -ForegroundColor Yellow
Write-Host '     source 폴더의 기획서대로 씬을 만들어줘"' -ForegroundColor Yellow
Write-Host ""
Write-Host "  만든 뒤에는 scripts\3-미리보기.ps1 로 확인하세요." -ForegroundColor White
Write-Host ""
