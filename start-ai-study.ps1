param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $toolRoot 'sync-runtime.ps1')
$nodeExe = Resolve-StudyNode $toolRoot
$nodeVersion = (& $nodeExe --version) | Select-Object -Last 1
$major = [int]($nodeVersion.TrimStart('v').Split('.')[0])
if ($major -lt 24) { throw 'The local AI service requires Node.js 24 or later.' }
$entry = Join-Path $toolRoot 'app\ai\server.mjs'
$page = Join-Path $toolRoot ([string]::Concat([char]0x516D,[char]0x7EA7,[char]0x5B66,[char]0x4E60,[char]0x5DE5,[char]0x5177,'.html'))
if (!(Test-Path -LiteralPath $entry) -or !(Test-Path -LiteralPath $page)) { throw 'AI service or study page is missing. Finish the local update first.' }
$stateDir = Join-Path $toolRoot '.local-ai'
New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
$healthUrl = 'http://127.0.0.1:4318/health'
$health = $null
try { $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2 } catch {}
if ($health -and ($health.service -ne 'cet4-ai' -or $health.version -ne 1)) { throw 'Port 4318 belongs to another service; nothing was stopped.' }
if (!$health) {
  $process = Start-Process -FilePath $nodeExe -ArgumentList @('"' + $entry + '"') -WorkingDirectory $toolRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $stateDir 'server.log') -RedirectStandardError (Join-Path $stateDir 'server-error.log')
  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 300
    $process.Refresh()
    if ($process.HasExited) { throw 'The AI service exited. See .local-ai/server-error.log; do not share keys or private chat files.' }
    try { $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 1; if ($health.service -eq 'cet4-ai' -and $health.version -eq 1) { $ready = $true; break } } catch {}
  }
  if (!$ready) { throw 'The AI service did not become ready. No browser records were changed.' }
  @{ pid = $process.Id; entry = $entry; executable = $nodeExe } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $stateDir 'server-process.json') -Encoding UTF8
}
# Keep the original file origin: existing grades and drafts stay in the same browser.
$pairPath = Join-Path $stateDir 'pairing.json'
if (!(Test-Path -LiteralPath $pairPath)) { throw 'Restart the local AI service to create a secure pairing.' }
$pairing = (Get-Content -LiteralPath $pairPath -Raw | ConvertFrom-Json).pairing
if ($pairing -notmatch '^[a-f0-9]{64}$') { throw 'The local AI pairing is invalid. Stop and restart the AI service.' }
$target = ([Uri]$page).AbsoluteUri + '?assistant=1#ai-pair=' + $pairing
if (!$NoBrowser) { Start-Process $target }
Write-Host 'Local AI assistant started. Configure the API key inside its page; do not paste it into chat.'
