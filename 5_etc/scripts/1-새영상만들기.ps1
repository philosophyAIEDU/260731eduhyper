# ============================================================
#  1. 새 영상 프로젝트 만들기
#  이 키트를 복사해서 새 작업 폴더를 만듭니다.
#  키트 원본은 그대로 두고, 항상 복사본에서 작업하세요.
# ============================================================

$ErrorActionPreference = "Stop"
$kit = Split-Path -Parent $PSScriptRoot
$workRoot = Split-Path -Parent $kit

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  새 영상 프로젝트 만들기" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# 프로젝트 이름 받기 (영어/숫자/하이픈만)
$name = $args[0]
if ([string]::IsNullOrWhiteSpace($name)) {
    Write-Host "  프로젝트 이름을 영어로 지어 주세요." -ForegroundColor White
    Write-Host "  (예: quantum-computer, ai-agent-intro)" -ForegroundColor Gray
    Write-Host ""
    $name = Read-Host "  이름"
}

if ([string]::IsNullOrWhiteSpace($name)) {
    Write-Host "  이름이 비어 있어 중단합니다." -ForegroundColor Red
    exit 1
}

if ($name -notmatch '^[a-zA-Z0-9][a-zA-Z0-9\-_]*$') {
    Write-Host ""
    Write-Host "  '$name' 은 쓸 수 없습니다." -ForegroundColor Red
    Write-Host "  영어 소문자·숫자·하이픈(-)만 쓰세요. 한글·공백은 안 됩니다." -ForegroundColor Yellow
    Write-Host "  HyperFrames 가 한글 경로에서 조용히 죽기 때문입니다." -ForegroundColor Gray
    exit 1
}

$dest = Join-Path $workRoot $name

if (Test-Path $dest) {
    Write-Host ""
    Write-Host "  이미 있는 폴더입니다: $dest" -ForegroundColor Red
    Write-Host "  다른 이름을 쓰거나, 기존 폴더를 먼저 정리하세요." -ForegroundColor Yellow
    exit 1
}

# 복사 (out.mp4, snapshots, node_modules 등은 제외)
Write-Host ""
Write-Host "  만드는 중..." -ForegroundColor Gray

New-Item -ItemType Directory -Path $dest -Force | Out-Null
Copy-Item (Join-Path $kit "index.html")       $dest
Copy-Item (Join-Path $kit "CLAUDE.md")        $dest
Copy-Item (Join-Path $kit "frame.md")         $dest -ErrorAction SilentlyContinue
Copy-Item (Join-Path $kit "hyperframes.json") $dest
Copy-Item (Join-Path $kit "package.json")     $dest
Copy-Item (Join-Path $kit "assets")           $dest -Recurse
Copy-Item (Join-Path $kit "compositions")     $dest -Recurse
Copy-Item (Join-Path $kit "scripts")          $dest -Recurse
Copy-Item (Join-Path $kit "templates")        $dest -Recurse -ErrorAction SilentlyContinue

# 프로젝트 이름 반영
$hf = Join-Path $dest "hyperframes.json"
(Get-Content $hf -Raw -Encoding UTF8).Replace("hyperframes-starter-kit", $name) |
    Out-File -FilePath $hf -Encoding utf8 -NoNewline

Write-Host "  완료" -ForegroundColor Green
Write-Host ""
Write-Host "  위치 : $dest" -ForegroundColor White
Write-Host ""
Write-Host "  ── 다음에 할 일 ──────────────────────────────" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1) 원본 영상(내레이션 녹음본)과 대본 3개를" -ForegroundColor White
Write-Host "     이 폴더 안 source\ 에 넣으세요." -ForegroundColor White
Write-Host "     양식은 templates\ 폴더에 있습니다." -ForegroundColor Gray
Write-Host ""
Write-Host "  2) 이 폴더에서 Claude Code 를 여세요:" -ForegroundColor White
Write-Host "       cd `"$dest`"" -ForegroundColor Yellow
Write-Host "       claude" -ForegroundColor Yellow
Write-Host ""
Write-Host "  3) Claude 에게 이렇게 말하세요:" -ForegroundColor White
Write-Host '       "source 폴더의 영상과 대본으로 모션그래픽 영상 만들어줘"' -ForegroundColor Yellow
Write-Host ""

New-Item -ItemType Directory -Path (Join-Path $dest "source") -Force | Out-Null
