$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$scriptPath = Join-Path $PSScriptRoot '..\..\每日同步到GitHub.ps1'
$tokens = $null
$parseErrors = $null
$source = [IO.File]::ReadAllText($scriptPath, [Text.Encoding]::UTF8)
$ast = [Management.Automation.Language.Parser]::ParseInput($source, [ref]$tokens, [ref]$parseErrors)
if ($parseErrors.Count) { throw ($parseErrors | Out-String) }
foreach ($name in @('ConvertTo-StaticHttpsProxy', 'Get-WindowsStaticHttpsProxy')) {
  $functionAst = $ast.Find({ param($node) $node -is [Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq $name }, $true)
  if ($null -eq $functionAst) { throw "Missing function: $name" }
  . ([scriptblock]::Create($functionAst.Extent.Text))
}

$cases = @(
  @{ input = '127.0.0.1:7890'; expected = 'http://127.0.0.1:7890/' },
  @{ input = 'http=127.0.0.1:7891;https=127.0.0.1:7890'; expected = 'http://127.0.0.1:7890/' },
  @{ input = ' https = 127.0.0.1:7890 ;http=127.0.0.1:7891'; expected = 'http://127.0.0.1:7890/' },
  @{ input = 'http=127.0.0.1:7891'; expected = $null },
  @{ input = 'socks=127.0.0.1:7891'; expected = $null },
  @{ input = 'https://proxy.example:8443'; expected = 'https://proxy.example:8443/' },
  @{ input = 'http://user:password@proxy.example:8080'; expected = $null },
  @{ input = 'file:///proxy.pac'; expected = $null },
  @{ input = 'http://proxy.example/config.pac'; expected = $null },
  @{ input = 'http://proxy.example/?token=test'; expected = $null },
  @{ input = 'bad host:123'; expected = $null },
  @{ input = ''; expected = $null }
)
foreach ($case in $cases) {
  $actual = ConvertTo-StaticHttpsProxy $case.input
  if ($actual -ne $case.expected) { throw "Proxy parsing failed for fixture: $($case.input)" }
}

# Exercise enabled, disabled, missing and malformed registry values without
# changing the real Windows settings or making network requests.
$script:fixtureSettings = $null
function Get-ItemProperty { param($LiteralPath, $ErrorAction) return $script:fixtureSettings }
foreach ($fixture in @(
  @{ settings = $null; expected = $null },
  @{ settings = [pscustomobject]@{}; expected = $null },
  @{ settings = [pscustomobject]@{ ProxyEnable = 0; ProxyServer = '127.0.0.1:7890' }; expected = $null },
  @{ settings = [pscustomobject]@{ ProxyEnable = 1 }; expected = $null },
  @{ settings = [pscustomobject]@{ ProxyEnable = 1; ProxyServer = '127.0.0.1:7890' }; expected = 'http://127.0.0.1:7890/' }
)) {
  $script:fixtureSettings = $fixture.settings
  if ((Get-WindowsStaticHttpsProxy) -ne $fixture.expected) { throw 'Windows proxy fixture failed' }
}
'PASS: 12 proxy formats and 5 Windows settings cases; no configuration changed.'
