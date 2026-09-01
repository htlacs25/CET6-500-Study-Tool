$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$page = Join-Path $toolRoot '六级学习工具.html'
if (Get-Command node -ErrorAction SilentlyContinue) {
    & node (Join-Path $toolRoot 'app\scripts\sync-daily-content.mjs') | Out-Null
}
Start-Process $page
