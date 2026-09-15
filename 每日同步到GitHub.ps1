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
. (Join-Path $repoRoot 'sync-runtime.ps1')
$gitExecutable = Resolve-StudyGit $repoRoot
$nodeExecutable = Resolve-StudyNode $repoRoot
$syncScript = Join-Path $repoRoot 'app\scripts\sync-daily-content.mjs'
$safeDirectory = ($repoRoot -replace '\\', '/')
$gitPrefix = @('-c', "safe.directory=$safeDirectory", '-c', 'core.quotePath=false', '-C', $repoRoot)
$allowedPaths = @(
  'app/content/daily-lessons.json',
  'app/content/full-dictation.json',
  'app/content/article-glossary.json',
  'app/content/extensive-reading.json',
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
  $native = Invoke-Native { & $gitExecutable @gitPrefix @CommandArgs }
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

function ConvertTo-StaticHttpsProxy {
  param([AllowEmptyString()][string]$ProxyServer)
  # Windows may use one address for all protocols or protocol=address pairs.
  # An HTTP-only entry must not silently become the proxy for HTTPS traffic.
  $candidate = ''
  if ($ProxyServer -match '=') {
    foreach ($entry in ($ProxyServer -split ';')) {
      if ($entry.Trim() -match '^https\s*=\s*(.+)$') { $candidate = $Matches[1].Trim(); break }
    }
  } else {
    $candidate = $ProxyServer.Trim()
  }
  if (-not $candidate -or $candidate -match '[\x00-\x1f\x7f]') { return $null }
  if ($candidate -notmatch '^[a-z][a-z0-9+.-]*://') { $candidate = 'http://' + $candidate }
  $proxyUri = $null
  if (-not [Uri]::TryCreate($candidate, [UriKind]::Absolute, [ref]$proxyUri)) { return $null }
  if ($proxyUri.Scheme -notin @('http', 'https') -or
      $proxyUri.Port -lt 1 -or $proxyUri.Port -gt 65535 -or
      -not $proxyUri.Host -or $proxyUri.UserInfo -or $proxyUri.Query -or $proxyUri.Fragment -or
      $proxyUri.AbsolutePath -notin @('', '/')) { return $null }
  return $proxyUri.AbsoluteUri
}

function Get-WindowsStaticHttpsProxy {
  if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) { return $null }
  $settings = Get-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
  if ($null -eq $settings) { return $null }
  $enabled = $settings.PSObject.Properties['ProxyEnable']
  $server = $settings.PSObject.Properties['ProxyServer']
  if ($null -eq $enabled -or $enabled.Value -ne 1 -or $null -eq $server) { return $null }
  return ConvertTo-StaticHttpsProxy ([string]$server.Value)
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

$proxySource = 'existing-or-direct'
$gitNetworkPrefix = $gitPrefix
if ($remoteUrl.StartsWith('https://')) {
  $httpProxyConfig = Invoke-Native { & $gitExecutable @gitPrefix config --get-urlmatch http.proxy $remoteUrl }
  $originProxyConfig = Invoke-Native { & $gitExecutable @gitPrefix config --get remote.origin.proxy }
  if ($httpProxyConfig.ExitCode -notin @(0, 1) -or $originProxyConfig.ExitCode -notin @(0, 1)) {
    throw '无法确认现有 Git 代理设置，已停止，避免覆盖显式配置。'
  }
  $hasProxyEnvironment = @('HTTPS_PROXY', 'HTTP_PROXY', 'ALL_PROXY', 'NO_PROXY') |
    Where-Object { -not [string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($_)) }
  # Even an explicitly empty Git proxy means direct access; preserve that choice.
  if ($httpProxyConfig.ExitCode -eq 1 -and $originProxyConfig.ExitCode -eq 1 -and -not $hasProxyEnvironment) {
    $windowsProxy = Get-WindowsStaticHttpsProxy
    if ($windowsProxy) {
      $gitNetworkPrefix = @('-c', "safe.directory=$safeDirectory", '-c', 'core.quotePath=false', '-c', "http.proxy=$windowsProxy", '-C', $repoRoot)
      $proxySource = 'windows-static'
    }
  }
}

if ($CheckOnly) {
  $checkResult = Invoke-Native { & $nodeExecutable $syncScript $Date '--check' }
  $checkOutput = $checkResult.Output
  if ($checkResult.ExitCode -ne 0) {
    throw "本地课程检查未通过：$($checkOutput -join [Environment]::NewLine)"
  }
} else {
  $syncResult = Invoke-Native { & $nodeExecutable $syncScript $Date }
  $syncOutput = $syncResult.Output
  if ($syncResult.ExitCode -ne 0) {
    throw "本地课程同步未通过，不会提交到 GitHub：$($syncOutput -join [Environment]::NewLine)"
  }
  $checkResult = Invoke-Native { & $nodeExecutable $syncScript $Date '--check' }
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
    proxySource = $proxySource
    preparedThrough = $checkReport.preparedThrough
    allowedPaths = $allowedPaths
  } | ConvertTo-Json -Depth 4
  exit 0
}

$addResult = Invoke-Native { & $gitExecutable @gitPrefix add -- @allowedPaths }
if ($addResult.ExitCode -ne 0) {
  throw '无法暂存每日课程文件。'
}

$diffResult = Invoke-Native { & $gitExecutable @gitPrefix diff --cached --quiet -- @allowedPaths }
$diffExit = $diffResult.ExitCode
$committed = $false
if ($diffExit -eq 1) {
  $commitResult = Invoke-Native { & $gitExecutable @gitPrefix commit -m "Daily study update $Date" }
  if ($commitResult.ExitCode -ne 0) {
    throw "创建每日提交失败：$($commitResult.Output -join [Environment]::NewLine)"
  }
  $committed = $true
} elseif ($diffExit -ne 0) {
  throw '检查每日课程差异失败。'
}

$pushResult = Invoke-Native { & $gitExecutable @gitNetworkPrefix push origin main }
if ($pushResult.ExitCode -ne 0) {
  throw "GitHub 推送失败；本地提交会保留，稍后可重试：$($pushResult.Output -join [Environment]::NewLine)"
}

$localHead = (Invoke-GitText @('rev-parse', 'HEAD') | Select-Object -First 1).Trim()
$remoteResult = Invoke-Native { & $gitExecutable @gitNetworkPrefix ls-remote origin refs/heads/main }
if ($remoteResult.ExitCode -ne 0) {
  throw "推送后无法核对远程版本；本地提交保留：$($remoteResult.Output -join [Environment]::NewLine)"
}
$remoteLine = ($remoteResult.Output | Select-Object -First 1)
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
  proxySource = $proxySource
  commit = $localHead
  preparedThrough = $checkReport.preparedThrough
  repository = 'https://github.com/htlacs25/CET6-500-Study-Tool'
} | ConvertTo-Json -Depth 4
