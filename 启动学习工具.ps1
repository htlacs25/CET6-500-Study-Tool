$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$page = Join-Path $toolRoot '六级学习工具.html'
if (Get-Command node -ErrorAction SilentlyContinue) {
    $syncOutput = & node (Join-Path $toolRoot 'app\scripts\sync-daily-content.mjs') 2>&1
    $syncExit = $LASTEXITCODE
    $syncText = $syncOutput -join [Environment]::NewLine
    $syncStatus = $null
    try { $syncStatus = $syncText | ConvertFrom-Json } catch {}
    if ($syncExit -ne 0 -and -not $syncStatus.todayReady) {
        Write-Host '今天的课程尚未通过完整性检查，因此没有打开可能过期的页面。' -ForegroundColor Red
        $syncOutput | Write-Host
        exit 2
    }
    if ($syncExit -ne 0 -and $syncStatus.todayReady) {
        Write-Host '今天的课程可以使用；部分未来课程尚待生成，网页会禁用缺少内容的日期。' -ForegroundColor Yellow
    }
}
$buildId = 'manual'
$statusFile = Join-Path $toolRoot '同步状态.json'
if (Test-Path -LiteralPath $statusFile) {
    try { $buildId = (Get-Content -Raw -LiteralPath $statusFile | ConvertFrom-Json).buildId } catch {}
}
$pageUri = ([Uri]$page).AbsoluteUri + '?course-build=' + [Uri]::EscapeDataString($buildId)
Start-Process -FilePath $pageUri
