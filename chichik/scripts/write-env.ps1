# Использование:
#   .\scripts\write-env.ps1 -Url "https://xxxx.supabase.co" -PublishableKey "sb_publishable_..." -AdminEmail "you@mail.com"

param(
  [Parameter(Mandatory = $true)][string]$Url,
  [Parameter(Mandatory = $true)][string]$PublishableKey,
  [Parameter(Mandatory = $true)][string]$AdminEmail
)

$root = Split-Path -Parent $PSScriptRoot
$path = Join-Path $root ".env.local"

@"
NEXT_PUBLIC_SUPABASE_URL=$Url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$PublishableKey
ADMIN_EMAILS=$AdminEmail
"@ | Set-Content -Path $path -Encoding UTF8

Write-Host "Wrote $path"
Write-Host "Next: run SQL migration + seed in Supabase SQL Editor, then npm run dev"
