<#
Script: test-supabase-project.ps1
But: tester rapidement l'API REST PostgREST de Supabase pour vérifier la colonne `client_phone` sur la table `projects`.
Usage examples:
  # En fournissant project ref et anon key
  .\scripts\test-supabase-project.ps1 -ProjectRef "dlilzlplokhnioozgewo" -ApiKey "eyJ..."

  # En fournissant l'URL complète
  .\scripts\test-supabase-project.ps1 -BaseUrl "https://dlilzlplokhnioozgewo.supabase.co" -ApiKey "eyJ..."

Notes:
- Ne partage jamais ta service_role key côté client. Pour des tests côté serveur, tu peux indiquer -UseServiceRole.
- Ce script fait plusieurs requêtes GET et affiche status + body brut pour aider au debug.
#>

[CmdletBinding()]
param(
    [string]$ProjectRef,
    [string]$BaseUrl,
    [string]$ApiKey,
    [switch]$UseServiceRole
)

function Write-Title($s) { Write-Host "`n=== $s ===`n" -ForegroundColor Cyan }

# Resolve base URL
if (-not $BaseUrl) {
    if ($ProjectRef) {
        $BaseUrl = "https://$ProjectRef.supabase.co"
    } elseif ($env:NEXT_PUBLIC_SUPABASE_URL) {
        $BaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
    } else {
        Write-Host "Error: Vous devez fournir -ProjectRef ou -BaseUrl, ou définir NEXT_PUBLIC_SUPABASE_URL dans l'environnement." -ForegroundColor Red
        return 1
    }
}

# Resolve key
if (-not $ApiKey) {
    if ($UseServiceRole -and $env:SUPABASE_SERVICE_ROLE_KEY) {
        $ApiKey = $env:SUPABASE_SERVICE_ROLE_KEY
    } elseif ($env:NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        $ApiKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
    } else {
        Write-Host "Warning: aucune clé fournie. Les requêtes sans clé peuvent être refusées selon la configuration RLS." -ForegroundColor Yellow
    }
}

$headers = @{}
if ($ApiKey) {
    $headers['apikey'] = $ApiKey
    $headers['Authorization'] = "Bearer $ApiKey"
}

Write-Title "Configuration"
Write-Host "Base URL: $BaseUrl"
Write-Host "Using key: " + ($(if ($ApiKey) { 'yes' } else { 'no' }))

function Do-Get($path) {
    $url = "$BaseUrl$path"
    Write-Host "`nGET $url" -ForegroundColor Gray
    try {
        $resp = Invoke-RestMethod -Method Get -Uri $url -Headers $headers -ErrorAction Stop
        # Invoke-RestMethod converts JSON to objects; also capture raw response with Invoke-WebRequest if needed
        Write-Host "Status: 200 OK" -ForegroundColor Green
        Write-Host "Body (parsed):" -ForegroundColor Gray
        $resp | ConvertTo-Json -Depth 5 | Write-Host
    } catch {
        $err = $_.Exception
        if ($err.Response) {
            # Try to read the raw body and status code
            $raw = $err.Response.GetResponseStream()
            $sr = New-Object System.IO.StreamReader($raw)
            $body = $sr.ReadToEnd()
            $status = ($err.Response.StatusCode.value__)
            Write-Host "HTTP Status: $status" -ForegroundColor Red
            Write-Host "Body (raw):`n$body" -ForegroundColor Red
        } else {
            Write-Host "Request error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Test 1: select id,client_phone
Write-Title "Test 1 — select=id,client_phone"
Do-Get '/rest/v1/projects?select=id,client_phone&limit=5'

# Test 2: select=client_phone only
Write-Title "Test 2 — select=client_phone"
Do-Get '/rest/v1/projects?select=client_phone&limit=5'

# Test 3: select=* (to compare)
Write-Title "Test 3 — select=* (preview)"
Do-Get '/rest/v1/projects?select=*&limit=3'

# Helpful curl equivalents
Write-Title "Curl examples"
if ($ApiKey) {
    Write-Host "curl -H \"apikey: <KEY>\" -H \"Authorization: Bearer <KEY>\" \"$BaseUrl/rest/v1/projects?select=id,client_phone\"" -ForegroundColor DarkYellow
} else {
    Write-Host "curl \"$BaseUrl/rest/v1/projects?select=id,client_phone\" (needs apikey/Authorization header)" -ForegroundColor DarkYellow
}

Write-Host "`nScript finished." -ForegroundColor Cyan
return 0
