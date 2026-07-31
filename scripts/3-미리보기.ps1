# ============================================================
#  3. 미리보기 / 검사
#
#  렌더는 시간이 걸리니, 먼저 여기서 확인하세요.
#    - 문법·레이아웃·대비 자동 검사
#    - 씬별 스틸 이미지 뽑아서 눈으로 확인
#    - 브라우저 미리보기 (선택)
# ============================================================

$ErrorActionPreference = "Continue"
$proj = Split-Path -Parent $PSScriptRoot
Push-Location $proj

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  미리보기 / 검사" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# ── 자동 검사 ──────────────────────────────────────────────
Write-Host "  [1/2] 자동 검사 (check)..." -ForegroundColor White
Write-Host ""
& npx hyperframes check
$checkFailed = -not $?

Write-Host ""

# ── 스틸 뽑기 ──────────────────────────────────────────────
Write-Host "  [2/2] 씬별 스틸 이미지..." -ForegroundColor White

# 영상 길이를 읽어서 고르게 8장
$dur = 12
$idx = Join-Path $proj "index.html"
if (Test-Path $idx) {
    $raw = Get-Content $idx -Raw -Encoding UTF8
    if ($raw -match 'const\s+TOTAL\s*=\s*([0-9.]+)') { $dur = [double]$Matches[1] }
}
$times = @()
for ($i = 1; $i -le 8; $i++) {
    $times += [math]::Round($dur * $i / 9.0, 2)
}
$atArg = ($times -join ",")

Write-Host ""
& npx hyperframes snapshot --at $atArg --no-end

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
if ($checkFailed) {
    Write-Host "  검사에서 문제가 발견됐습니다" -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  위에 나온 내용을 Claude Code 에게 그대로 보여 주면" -ForegroundColor White
    Write-Host "  고쳐 줍니다." -ForegroundColor White
} else {
    Write-Host "  검사 통과" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "  ⚠ 검사를 통과해도 '화면이 빈 구간' 은 잡히지 않습니다." -ForegroundColor Yellow
Write-Host "     snapshots\ 폴더의 contact-sheet 를 꼭 열어서" -ForegroundColor Yellow
Write-Host "     모든 씬을 눈으로 확인하세요." -ForegroundColor Yellow
Write-Host ""
Write-Host "  움직임까지 보려면 브라우저 미리보기:" -ForegroundColor White
Write-Host "     npx hyperframes preview" -ForegroundColor Yellow
Write-Host ""
Write-Host "  다 괜찮으면 : scripts\4-렌더.ps1" -ForegroundColor White
Write-Host ""

$snapDir = Join-Path $proj "snapshots"
if (Test-Path $snapDir) { Start-Process $snapDir }

Pop-Location
