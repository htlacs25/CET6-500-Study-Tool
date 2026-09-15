# Resolve only executable paths; do not change PATH or global Git settings.
function Get-StudyRuntimeCandidates {
  param([string]$RepoRoot, [ValidateSet('git', 'node')][string]$Name)
  if ($Name -eq 'git') {
    Join-Path $RepoRoot 'runtime\PortableGit-2.55.0.5\cmd\git.exe'
  }
  $command = Get-Command ($Name + '.exe') -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($command) { $command.Source }
  if ($Name -eq 'git') {
    foreach ($base in @($env:ProgramFiles, ${env:ProgramFiles(x86)})) {
      if ($base) { Join-Path $base 'Git\cmd\git.exe' }
    }
    if ($env:LOCALAPPDATA) { Join-Path $env:LOCALAPPDATA 'Programs\Git\cmd\git.exe' }
  } elseif ($env:ProgramFiles) {
    Join-Path $env:ProgramFiles 'nodejs\node.exe'
  }
}

function Test-StudyGitExecutable {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }
  $execPath = @(& $Path --exec-path 2>$null)
  if ($LASTEXITCODE -ne 0 -or $execPath.Count -ne 1) { return $false }
  # The app's reduced Git can commit but has no HTTPS transport. Do not use it.
  return (Test-Path -LiteralPath (Join-Path ([string]$execPath[0]) 'git-remote-https.exe') -PathType Leaf)
}

function Resolve-StudyGit {
  param([string]$RepoRoot)
  foreach ($candidate in @(Get-StudyRuntimeCandidates $RepoRoot 'git' | Select-Object -Unique)) {
    if (Test-StudyGitExecutable $candidate) { return $candidate }
  }
  throw 'No complete Git for Windows was found. Keep the project runtime\PortableGit-2.55.0.5 folder, or install Git for Windows. A reduced Git without HTTPS cannot upload.'
}

function Resolve-StudyNode {
  param([string]$RepoRoot)
  foreach ($candidate in @(Get-StudyRuntimeCandidates $RepoRoot 'node' | Select-Object -Unique)) {
    if (Test-Path -LiteralPath $candidate -PathType Leaf) { return $candidate }
  }
  throw 'Node.js was not found. Install Node.js before syncing the generated study pages.'
}
