[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [ValidatePattern('^\d{4}-\d{2}-\d{2}$')]
  [string]$Date,
  [switch]$CheckOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSCommandPath
$syncScript = Join-Path $repoRoot 'app\scripts\sync-daily-content.mjs'
$safeDirectory = ($repoRoot -replace '\\', '/')
$gitPrefix = @('-c', "safe.directory=$safeDirectory", '-C', $repoRoot)
$allowedPaths = @(
  'app/content/daily-lessons.json',
  '六级学习工具.html',
  'app/public/六级学习工具.html',
  'study-release.js',
  'app/public/study-release.js',
  '同步状态.json'
)

if (-not $Date) {
  $chinaZone = [TimeZoneInfo]::FindSystemTimeZoneById('China Standard Time')
  $chinaNow = [TimeZoneInfo]::ConvertTime([DateTimeOffset]::UtcNow, $chinaZone)
  $Date = $chinaNow.ToString('yyyy-MM-dd')
}

function Invoke-GitText {
  param([Parameter(Mandatory)][string[]]$CommandArgs)
  $native = Invoke-Native { & git @gitPrefix @CommandArgs }
  if ($native.ExitCode -ne 0) {
    throw "git $($CommandArgs -join ' ') 失败：$($native.Output -join [Environment]::NewLine)"
  }
  return @($native.Output)
}

function Invoke-Native {
  param([Parameter(Mandatory)][scriptblock]$Command)
  $previousPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = 'Continue'
    $capturedOutput = @(& $Command 2>&1)
    $capturedExitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousPreference
  }
  return [pscustomobject]@{
    ExitCode = $capturedExitCode
    Output = $capturedOutput
  }
}

if (-not (Test-Path -LiteralPath $syncScript)) {
  throw "找不到课程同步脚本：$syncScript"
}

$branch = (Invoke-GitText @('branch', '--show-current') | Select-Object -First 1).Trim()
if ($branch -ne 'main') {
  throw "为避免推错分支，脚本只允许在 main 上运行；当前分支为 $branch。"
}

$remoteUrl = (Invoke-GitText @('remote', 'get-url', 'origin') | Select-Object -First 1).Trim()
$acceptedRemotes = @(
  'https://github.com/htlacs25/CET6-500-Study-Tool.git',
  'git@github.com:htlacs25/CET6-500-Study-Tool.git'
)
if ($remoteUrl -notin $acceptedRemotes) {
  throw "origin 不是预期的学习工具仓库，已停止：$remoteUrl"
}

if ($CheckOnly) {
  $checkResult = Invoke-Native { & node $syncScript $Date '--check' }
  $checkOutput = $checkResult.Output
  if ($checkResult.ExitCode -ne 0) {
    throw "本地课程检查未通过：$($checkOutput -join [Environment]::NewLine)"
  }
} else {
  $syncResult = Invoke-Native { & node $syncScript $Date }
  $syncOutput = $syncResult.Output
  if ($syncResult.ExitCode -ne 0) {
    throw "本地课程同步未通过，不会提交到 GitHub：$($syncOutput -join [Environment]::NewLine)"
  }
  $checkResult = Invoke-Native { & node $syncScript $Date '--check' }
  $checkOutput = $checkResult.Output
  if ($checkResult.ExitCode -ne 0) {
    throw "同步后的复核未通过，不会提交到 GitHub：$($checkOutput -join [Environment]::NewLine)"
  }
}

$checkReport = ($checkOutput -join [Environment]::NewLine) | ConvertFrom-Json
if (-not $checkReport.synced -or -not $checkReport.contentReady) {
  throw '课程仍有缺失、重复或文件版本不一致，不会提交到 GitHub。'
}

$stagedBefore = @(Invoke-GitText @('diff', '--cached', '--name-only', '--'))
$unexpectedStaged = @($stagedBefore | Where-Object { $_ -and $_ -notin $allowedPaths })
if ($unexpectedStaged.Count -gt 0) {
  throw "检测到不属于每日课程的已暂存文件，已停止，避免误上传：$($unexpectedStaged -join ', ')"
}

if ($CheckOnly) {
  [ordered]@{
    date = $Date
    mode = 'check'
    ready = $true
    synced = $true
    preparedThrough = $checkReport.preparedThrough
    allowedPaths = $allowedPaths
  } | ConvertTo-Json -Depth 4
  exit 0
}

$addResult = Invoke-Native { & git @gitPrefix add -- @allowedPaths }
if ($addResult.ExitCode -ne 0) {
  throw '无法暂存每日课程文件。'
}

$diffResult = Invoke-Native { & git @gitPrefix diff --cached --quiet -- @allowedPaths }
$diffExit = $diffResult.ExitCode
$committed = $false
if ($diffExit -eq 1) {
  $commitResult = Invoke-Native { & git @gitPrefix commit -m "Daily study update $Date" }
  if ($commitResult.ExitCode -ne 0) {
    throw "创建每日提交失败：$($commitResult.Output -join [Environment]::NewLine)"
  }
  $committed = $true
} elseif ($diffExit -ne 0) {
  throw '检查每日课程差异失败。'
}

$pushResult = Invoke-Native { & git @gitPrefix push origin main }
if ($pushResult.ExitCode -ne 0) {
  throw "GitHub 推送失败；本地提交会保留，稍后可重试：$($pushResult.Output -join [Environment]::NewLine)"
}

$localHead = (Invoke-GitText @('rev-parse', 'HEAD') | Select-Object -First 1).Trim()
$remoteLine = (Invoke-GitText @('ls-remote', 'origin', 'refs/heads/main') | Select-Object -First 1)
$remoteHead = ($remoteLine -split '\s+')[0]
if ($localHead -ne $remoteHead) {
  throw "推送后哈希不一致：本地 $localHead，远程 $remoteHead"
}

[ordered]@{
  date = $Date
  mode = 'publish'
  synced = $true
  committed = $committed
  pushed = $true
  commit = $localHead
  preparedThrough = $checkReport.preparedThrough
  repository = 'https://github.com/htlacs25/CET6-500-Study-Tool'
} | ConvertTo-Json -Depth 4
