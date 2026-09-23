[CmdletBinding()]
param([switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$repoRoot = $PSScriptRoot
$safeDirectory = $repoRoot -replace '\\', '/'
$gitArgs = @('-c', "safe.directory=$safeDirectory", '-c', 'core.quotePath=false', '-C', $repoRoot)
$files = @('.gitignore', 'README.md', 'THIRD_PARTY_NOTICES.md', 'sync-runtime.ps1', '每日同步到GitHub.ps1', 'app/scripts/test-sync-proxy.ps1', 'app/scripts/test-sync-runtime.ps1', 'app/lib/study-engine.mjs', 'app/lib/word-search.mjs', 'app/content/word-search.json', 'app/scripts/build-word-search-data.mjs', 'app/scripts/generate-standalone.mjs', 'app/standalone-template.html', 'app/scripts/test-recovery.mjs', 'finish-sync-update.ps1', 'Finish-Sync-Update.cmd')
$previousEncoding = [Console]::OutputEncoding
$transcriptStarted = $false
$failure = $false
$logFile = $null
try {
  [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
  if (-not $CheckOnly) {
    $logDirectory = Join-Path $repoRoot 'logs'
    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
    $logFile = Join-Path $logDirectory ('github-sync-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff') + '.log')
    Start-Transcript -LiteralPath $logFile -ErrorAction Stop | Out-Null
    $transcriptStarted = $true
  }
  Write-Host '[1/4] Checking Git, Node.js and repository...'
  . (Join-Path $repoRoot 'sync-runtime.ps1')
  $gitExecutable = Resolve-StudyGit $repoRoot
  $nodeExecutable = Resolve-StudyNode $repoRoot
  Write-Host "Git: $gitExecutable"
  function Read-Git {
    param([string[]]$Arguments)
    $result = @(& $gitExecutable @gitArgs @Arguments)
    if ($LASTEXITCODE -ne 0) { throw "Git check failed: $($Arguments -join ' ')" }
    return $result
  }
  if ((Read-Git @('branch', '--show-current')) -ne 'main') { throw 'Expected branch main.' }
  if ((Read-Git @('remote', 'get-url', 'origin')) -ne 'https://github.com/htlacs25/CET6-500-Study-Tool.git') { throw 'Unexpected repository. Stopped.' }
  $staged = @(Read-Git @('diff', '--cached', '--name-only', '--'))
  if (@($staged | Where-Object { $_ -notin $files }).Count) { throw 'Other files are staged. Stopped without changing them.' }
  Write-Host '[2/4] Checking runtime, proxy and local lesson files...'
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repoRoot 'app/scripts/test-sync-runtime.ps1')
  if ($LASTEXITCODE -ne 0) { throw 'Runtime tests failed.' }
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repoRoot 'app/scripts/test-sync-proxy.ps1')
  if ($LASTEXITCODE -ne 0) { throw 'Proxy tests failed.' }
  $courseOutput = @(& $nodeExecutable (Join-Path $repoRoot 'app/scripts/sync-daily-content.mjs') --check)
  $courseExit = $LASTEXITCODE
  $courseReport = ($courseOutput -join [Environment]::NewLine) | ConvertFrom-Json
  if ($courseExit -notin @(0, 2) -or -not $courseReport.contentReady) { throw 'Local daily readiness check failed. Nothing committed or pushed.' }
  Write-Host "Local lessons ready. Generated files current: $($courseReport.synced)"
  if ($CheckOnly) { Write-Output 'Ready: runtime, exact file list, branch, remote, proxy and lesson checks passed. Nothing committed or pushed.'; return }
  Write-Host '[3/4] Committing only the approved project files...'
  & $gitExecutable @gitArgs add -- @files
  if ($LASTEXITCODE -ne 0) { throw 'Cannot stage the sync update. Run this file from your normal Windows account.' }
  & $gitExecutable @gitArgs diff --cached --quiet -- @files
  $difference = $LASTEXITCODE
  if ($difference -eq 1) {
    & $gitExecutable @gitArgs commit -m 'Update study features and offline word search'
    if ($LASTEXITCODE -ne 0) { throw 'Commit failed; local files are retained.' }
  } elseif ($difference -ne 0) { throw 'Cannot inspect staged changes.' }
  Write-Host '[4/4] Publishing daily pages and verifying the GitHub commit...'
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repoRoot '每日同步到GitHub.ps1')
  if ($LASTEXITCODE -ne 0) { throw 'Daily publishing failed; local commit is retained for retry.' }
  Write-Output 'Completed: the daily sync script verified the local and remote commit hashes.'
} catch {
  $failure = $true
  Write-Host ('SYNC FAILED: ' + $_.Exception.Message) -ForegroundColor Red
  if ($_.InvocationInfo.PositionMessage) { Write-Host $_.InvocationInfo.PositionMessage }
  if ($logFile) { Write-Host "Diagnostic log: $logFile" }
  Write-Host 'GitHub synchronization has NOT been confirmed. Local study data is retained.'
} finally {
  if ($transcriptStarted) { Stop-Transcript | Out-Null }
  [Console]::OutputEncoding = $previousEncoding
}
if ($failure) { exit 1 }
