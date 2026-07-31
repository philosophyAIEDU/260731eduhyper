# ============================================================
#  4. 최종 렌더 (MP4 만들기)
#
#  걸리는 시간은 대략 "영상 길이의 1.5배" 입니다.
#  (83초 영상 → 약 2분)
# ============================================================

$ErrorActionPreference = "Continue"
$proj = Split-Path -Parent $PSScriptRoot
$name = Split-Path -Leaf $proj
Push-Location $proj

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  최종 렌더" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$outFile = "$name.mp4"

Write-Host "  렌더 중... (창을 닫지 마세요)" -ForegroundColor Gray
Write-Host ""
& npx hyperframes render -o $outFile
Write-Host ""

$outPath = Join-Path $proj $outFile
if (-not (Test-Path $outPath)) {
    Write-Host "  렌더에 실패했습니다." -ForegroundColor Red
    Write-Host "  위 메시지를 Claude Code 에게 보여 주세요." -ForegroundColor Yellow
    Pop-Location
    exit 1
}

# ── 결과물 검증 — 소스가 멀쩡해도 인코딩에서 문제가 날 수 있습니다 ──
Write-Host "  결과물 확인 중..." -ForegroundColor Gray

$sizeMB = [math]::Round((Get-Item $outPath).Length / 1MB, 1)

$hasAudio = $false
if ($null -ne (Get-Command ffprobe -ErrorAction SilentlyContinue)) {
    $streams = & ffprobe -v error -show_entries stream=codec_type -of default=noprint_wrappers=1:nokey=1 $outPath
    if ($streams -contains "audio") { $hasAudio = $true }
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  완성" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  파일 : $outPath" -ForegroundColor White
Write-Host "  크기 : $sizeMB MB" -ForegroundColor Gray
if ($hasAudio) {
    Write-Host "  소리 : 있음" -ForegroundColor Gray
} else {
    Write-Host "  소리 : 없음 — index.html 의 <audio> 주석을 풀었는지 확인하세요" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  ⚠ 업로드 전에 영상을 한 번 끝까지 재생해 보세요." -ForegroundColor Yellow
Write-Host ""

Start-Process $outPath

Pop-Location
