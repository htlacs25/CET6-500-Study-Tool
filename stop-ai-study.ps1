$ErrorActionPreference = 'Stop'
$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $toolRoot '.local-ai\server-process.json'
if (!(Test-Path -LiteralPath $pidFile)) { Write-Host 'No launcher-owned AI process was recorded.'; exit 0 }
$record = Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json
$expected = Join-Path $toolRoot 'app\ai\server.mjs'
if ($record.entry -ne $expected -or [int]$record.pid -le 0) { throw 'Unexpected process record; nothing was stopped.' }
$running = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + [int]$record.pid)
if ($running) {
  if ($running.ExecutablePath -ne $record.executable -or !$running.CommandLine.Contains($expected)) { throw 'The process identity changed; nothing was stopped.' }
  Stop-Process -Id ([int]$record.pid) -Force
}
Remove-Item -LiteralPath $pidFile
Write-Host 'AI service stopped. Saved conversations and approved plans are retained. An in-memory key is no longer available.'
