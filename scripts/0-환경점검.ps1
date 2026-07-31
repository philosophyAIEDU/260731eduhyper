# ============================================================
#  0. 환경 점검
#  영상을 만들기 전에 필요한 것들이 다 준비됐는지 확인합니다.
#  처음 한 번만 돌리면 됩니다.
# ============================================================

$ErrorActionPreference = "Continue"
$kit = Split-Path -Parent $PSScriptRoot
$problems = @()
$warnings = @()

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  HyperFrames 환경 점검" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------
# 1. 경로에 한글이 있는지 — 가장 중요
# ------------------------------------------------------------
Write-Host "[1/5] 폴더 경로 확인..." -NoNewline
if ($kit -match '[^\x00-\x7F]') {
    Write-Host " 실패" -ForegroundColor Red
    Write-Host ""
    Write-Host "  ┌──────────────────────────────────────────────────────┐" -ForegroundColor Red
    Write-Host "  │  경로에 한글이 들어 있습니다.                          │" -ForegroundColor Red
    Write-Host "  │  HyperFrames 는 한글 경로에서 에러 메시지 없이         │" -ForegroundColor Red
    Write-Host "  │  조용히 멈춰버립니다. 반드시 옮기세요.                 │" -ForegroundColor Red
    Write-Host "  └──────────────────────────────────────────────────────┘" -ForegroundColor Red
    Write-Host ""
    Write-Host "  현재 : $kit" -ForegroundColor Yellow
    Write-Host "  권장 : C:\Users\$env:USERNAME\hyper\hyperframes-starter-kit" -ForegroundColor Green
    Write-Host ""
    Write-Host "  ※ 원본 영상·대본은 한글 폴더에 있어도 괜찮습니다." -ForegroundColor Gray
    Write-Host "     이 키트 폴더만 영어 경로면 됩니다." -ForegroundColor Gray
    $problems += "한글 경로"
} else {
    Write-Host " OK" -ForegroundColor Green
    Write-Host "       $kit" -ForegroundColor Gray
}

# ------------------------------------------------------------
# 2. Node.js
# ------------------------------------------------------------
Write-Host "[2/5] Node.js..." -NoNewline
$node = Get-Command node -ErrorAction SilentlyContinue
if ($null -eq $node) {
    Write-Host " 없음" -ForegroundColor Red
    Write-Host "       https://nodejs.org 에서 'LTS' 버튼을 눌러 설치하세요." -ForegroundColor Yellow
    Write-Host "       설치 후 이 창을 닫고 새로 열어야 인식됩니다." -ForegroundColor Yellow
    $problems += "Node.js"
} else {
    $nv = (& node -v)
    $major = [int](($nv -replace '^v','') -split '\.')[0]
    if ($major -lt 22) {
        Write-Host " 버전 낮음 ($nv)" -ForegroundColor Yellow
        Write-Host "       22 이상이 필요합니다. https://nodejs.org 에서 최신 LTS 설치." -ForegroundColor Yellow
        $problems += "Node.js 버전"
    } else {
        Write-Host " OK ($nv)" -ForegroundColor Green
    }
}

# HyperFrames 스킬은 여기서 자동 확인하기 어려워서 (Claude Code 쪽 설정) 안내만.
if ($node -ne $null) {
    Write-Host "       ※ HyperFrames 스킬을 아직 설치 안 했다면:" -ForegroundColor Gray
    Write-Host "         npx skills add heygen-com/hyperframes" -ForegroundColor White
}

# ------------------------------------------------------------
# 3. ffmpeg  (오디오 추출용)
# ------------------------------------------------------------
Write-Host "[3/5] ffmpeg..." -NoNewline
$ff = Get-Command ffmpeg -ErrorAction SilentlyContinue
if ($null -eq $ff) {
    Write-Host " 없음" -ForegroundColor Red
    Write-Host "       PowerShell 을 '관리자 권한으로 실행' 한 뒤 아래를 실행하세요:" -ForegroundColor Yellow
    Write-Host "         winget install Gyan.FFmpeg.Shared" -ForegroundColor White
    Write-Host "       설치 후 PowerShell 창을 전부 닫고 새로 여세요." -ForegroundColor Yellow
    $problems += "ffmpeg"
} else {
    Write-Host " OK" -ForegroundColor Green
}

# ------------------------------------------------------------
# 4. Chrome Headless Shell  (렌더 엔진)
# ------------------------------------------------------------
Write-Host "[4/5] 렌더용 Chrome..." -NoNewline
$chromeDir = Join-Path $env:USERPROFILE ".cache\hyperframes\chrome"
if (Test-Path $chromeDir) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " 없음 — 지금 설치합니다 (약 115MB, 최초 1회)" -ForegroundColor Yellow
    Push-Location $kit
    & npx hyperframes browser ensure
    Pop-Location
    if (Test-Path $chromeDir) {
        Write-Host "       설치 완료" -ForegroundColor Green
    } else {
        Write-Host "       설치 실패 — 인터넷 연결을 확인하고 다시 실행하세요." -ForegroundColor Red
        $problems += "Chrome"
    }
}

# ------------------------------------------------------------
# 5. 전사(자막 타이밍) 도구 — 없어도 영상은 만들 수 있음
# ------------------------------------------------------------
Write-Host "[5/5] 음성 전사 도구..." -NoNewline
$py = Get-Command python -ErrorAction SilentlyContinue
$whisperOk = $false
if ($null -ne $py) {
    & python -c "import whisper" 2>$null
    if ($?) { $whisperOk = $true }
}
if ($whisperOk) {
    Write-Host " OK" -ForegroundColor Green
} elseif ($null -eq $py) {
    Write-Host " 없음 (선택 사항)" -ForegroundColor Yellow
    Write-Host "       Python 이 먼저 필요합니다: https://www.python.org/downloads/" -ForegroundColor Gray
    Write-Host "       설치 화면에서 'Add python.exe to PATH' 를 꼭 체크하세요." -ForegroundColor Gray
    Write-Host "       그다음: pip install -U openai-whisper" -ForegroundColor White
    $warnings += "whisper"
} else {
    Write-Host " 없음 (선택 사항)" -ForegroundColor Yellow
    Write-Host "       내레이션에 화면을 정확히 맞추려면 있는 게 좋습니다." -ForegroundColor Gray
    Write-Host "       설치: pip install -U openai-whisper" -ForegroundColor White
    $warnings += "whisper"
}

# ------------------------------------------------------------
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
if ($problems.Count -eq 0) {
    Write-Host "  준비 완료" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""
    if ($warnings.Count -gt 0) {
        Write-Host "  참고: $($warnings -join ', ') 는 없지만 영상 제작은 가능합니다." -ForegroundColor Gray
        Write-Host ""
    }
    Write-Host "  다음 단계 : scripts\1-새영상만들기.ps1 을 실행하세요." -ForegroundColor White
} else {
    Write-Host "  해결이 필요합니다: $($problems -join ', ')" -ForegroundColor Red
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  위 안내대로 처리한 뒤 이 스크립트를 다시 실행하세요." -ForegroundColor Yellow
}
Write-Host ""
