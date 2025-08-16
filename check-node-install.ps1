# check-node-install.ps1
# Script to verify Node.js installation and fix PATH issues

Write-Host "🔍 Verifying Node.js installation..." -ForegroundColor Cyan

# Check common Node.js installation paths
$nodePaths = @(
    "$env:ProgramFiles\nodejs\node.exe",
    "${env:ProgramFiles(x86)}\nodejs\node.exe",
    "$env:LOCALAPPDATA\nvm4w\nodejs\node.exe",
    "$env:USERPROFILE\AppData\Roaming\nvm\nodejs\node.exe"
)

$nodeFound = $false
$nodePath = $null

foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $nodePath = $path
        $nodeFound = $true
        Write-Host "✅ Found Node.js at: $path" -ForegroundColor Green
        break
    }
}

if (-not $nodeFound) {
    Write-Host "❌ Node.js not found in common locations" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Get Node.js version
$nodeVersion = & "$nodePath" --version
Write-Host "📦 Node.js version: $nodeVersion" -ForegroundColor Green

# Check if node is in PATH
$nodeInPath = $false
$env:Path -split ';' | ForEach-Object {
    if ($_ -and (Test-Path (Join-Path $_ 'node.exe'))) {
        $nodeInPath = $true
    }
}

if (-not $nodeInPath) {
    Write-Host "⚠️ Node.js directory not in PATH" -ForegroundColor Yellow
    $nodeDir = Split-Path $nodePath
    Write-Host "Adding to PATH for current session: $nodeDir" -ForegroundColor Cyan
    $env:Path = "$nodeDir;$env:Path"
    
    # Test if node is now available
    try {
        $testNode = Get-Command node -ErrorAction Stop
        Write-Host "✅ Node.js is now available in PATH" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to add Node.js to PATH" -ForegroundColor Red
        Write-Host "Please add the following to your system PATH manually:" -ForegroundColor Yellow
        Write-Host $nodeDir -ForegroundColor White
    }
}

# Check npm
Write-Host "\n🔍 Checking npm..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "📦 npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    $npmPath = Join-Path (Split-Path $nodePath) "npm.cmd"
    if (Test-Path $npmPath) {
        Write-Host "Found npm at: $npmPath" -ForegroundColor Yellow
        Write-Host "Trying to add to PATH..." -ForegroundColor Cyan
        $env:Path = "$(Split-Path $npmPath);$env:Path"
    } else {
        Write-Host "npm not found. Please reinstall Node.js" -ForegroundColor Red
        exit 1
    }
}

# Verify installation
Write-Host "\n✅ Verification complete!" -ForegroundColor Green
Write-Host "Node.js: $(node --version)" -ForegroundColor White
Write-Host "npm: $(npm --version)" -ForegroundColor White

# Test if we can run a simple script
Write-Host "\n🚀 Running a simple test..." -ForegroundColor Cyan
$testScript = @"
console.log('Node.js is working correctly!');
console.log('Version:', process.version);
"@

$testFile = "$env:TEMP\node-test.js"
$testScript | Out-File -FilePath $testFile -Encoding utf8
node $testFile
Remove-Item $testFile
