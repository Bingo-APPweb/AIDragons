# system-check.ps1
# Script to check system environment and Node.js installation

Write-Host "=== System Environment Check ===" -ForegroundColor Cyan

# 1. Check PATH environment variable
Write-Host "`n🔍 PATH Environment Variable:" -ForegroundColor Yellow
$env:Path -split ';' | Where-Object { $_ -ne '' } | ForEach-Object { 
    if (Test-Path $_) { 
        Write-Host "✅ $_" -ForegroundColor Green 
    } else { 
        Write-Host "❌ $_ (Not Found)" -ForegroundColor Red 
    }
}

# 2. Check common Node.js locations
Write-Host "`n🔍 Checking Common Node.js Locations:" -ForegroundColor Yellow
$nodeLocations = @(
    "$env:ProgramFiles\nodejs\node.exe",
    "${env:ProgramFiles(x86)}\nodejs\node.exe",
    "$env:LOCALAPPDATA\nvm4w\nodejs\node.exe",
    "$env:USERPROFILE\AppData\Roaming\nvm\nodejs\node.exe"
)

$nodeFound = $false
foreach ($loc in $nodeLocations) {
    if (Test-Path $loc) {
        $version = & "$loc" --version
        Write-Host "✅ Found Node.js at: $loc" -ForegroundColor Green
        Write-Host "   Version: $version" -ForegroundColor White
        $nodeFound = $true
    } else {
        Write-Host "❌ Not found: $loc" -ForegroundColor DarkGray
    }
}

if (-not $nodeFound) {
    Write-Host "\n❌ Node.js not found in any standard location" -ForegroundColor Red
}

# 3. Check if node is in PATH
Write-Host "`n🔍 Checking if 'node' is in PATH:" -ForegroundColor Yellow
try {
    $nodePath = Get-Command node -ErrorAction Stop
    Write-Host "✅ Node.js found in PATH: $($nodePath.Source)" -ForegroundColor Green
    Write-Host "   Version: $(node --version)" -ForegroundColor White
} catch {
    Write-Host "❌ 'node' command not found in PATH" -ForegroundColor Red
}

# 4. Check npm
Write-Host "`n🔍 Checking npm:" -ForegroundColor Yellow
try {
    $npmPath = Get-Command npm -ErrorAction Stop
    Write-Host "✅ npm found: $($npmPath.Source)" -ForegroundColor Green
    Write-Host "   Version: $(npm --version)" -ForegroundColor White
} catch {
    Write-Host "❌ 'npm' command not found" -ForegroundColor Red
}

# 5. Check environment variables
Write-Host "`n🔍 Environment Variables:" -ForegroundColor Yellow
$envVars = @('NVM_HOME', 'NVM_SYMLINK', 'NODE_PATH', 'NODE_HOME')
foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Host "✅ $var = $value" -ForegroundColor Green
    } else {
        Write-Host "❌ $var = (not set)" -ForegroundColor DarkGray
    }
}

Write-Host "`n=== System Check Complete ===" -ForegroundColor Cyan
