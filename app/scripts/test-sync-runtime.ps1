$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$runtimeFile = Join-Path $PSScriptRoot '..\..\sync-runtime.ps1'
. $runtimeFile
$originalPath = $env:PATH
$passed = 0
try {
  # Test resolution without executing fake binaries, changing PATH or writing Git data.
  function Get-StudyRuntimeCandidates { param($RepoRoot, $Name) return $script:candidates }
  function Test-StudyGitExecutable { param($Path) return $Path -in $script:completeGit }
  function Test-Path { param($LiteralPath, $PathType) return $LiteralPath -in $script:existingFiles }
  $script:existingFiles = @()
  foreach ($case in @(
    @{ candidates = @('project-git', 'path-git'); complete = @('project-git', 'path-git'); expected = 'project-git' },
    @{ candidates = @('reduced-git', 'full-git'); complete = @('full-git'); expected = 'full-git' },
    @{ candidates = @('missing-git', 'full-git'); complete = @('full-git'); expected = 'full-git' },
    @{ candidates = @('reduced-git'); complete = @(); expected = $null },
    @{ candidates = @(); complete = @(); expected = $null }
  )) {
    $script:candidates = $case.candidates
    $script:completeGit = $case.complete
    $actual = $null
    $caught = $false
    try { $actual = Resolve-StudyGit 'fixture-root' } catch { $caught = $true }
    if ($null -eq $case.expected) {
      if (-not $caught) { throw 'Missing complete Git must stop before staging.' }
    } elseif ($caught -or $actual -ne $case.expected) { throw 'Git candidate selection failed.' }
    $passed++
  }
  $script:candidates = @('missing-node', 'program-files-node')
  $script:existingFiles = @('program-files-node')
  if ((Resolve-StudyNode 'fixture-root') -ne 'program-files-node') { throw 'Node fallback failed.' }
  $passed++
  $script:existingFiles = @()
  $caught = $false
  try { Resolve-StudyNode 'fixture-root' | Out-Null } catch { $caught = $true }
  if (-not $caught) { throw 'Missing Node must fail.' }
  $passed++
  if ($env:PATH -ne $originalPath) { throw 'Runtime detection changed PATH.' }
  $passed++
  # Both entry points must resolve an absolute Git executable, not call PATH Git.
  foreach ($name in @('finish-sync-update.ps1', '每日同步到GitHub.ps1')) {
    $source = [IO.File]::ReadAllText((Join-Path $PSScriptRoot ('..\..\' + $name)))
    if ($source -match '&\s+git\s' -or $source -notmatch 'Resolve-StudyGit') { throw 'Bare Git command remains in sync entry point.' }
    $passed++
  }
  "PASS: $passed runtime resolution cases; no files, PATH or Git configuration changed."
} finally {
  if ($env:PATH -ne $originalPath) { $env:PATH = $originalPath }
}
