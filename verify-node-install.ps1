# verify-node-install.ps1
# Script to verify Node.js installation and environment

function Test-CommandExists {
    param($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

Write-Host "=== Node.js Installation Verification ===" -ForegroundColor Cyan

# 1. Check if node.exe exists in common locations
$nodePaths = @(
    "$env:SystemDrive\Program Files\nodejs\node.exe",
    "$env:ProgramFiles\nodejs\node.exe",
    "${env:ProgramFiles(x86)}\nodejs\node.exe",
    "$env:LOCALAPPDATA\nvm4w\nodejs\node.exe",
    "$env:USERPROFILE\AppData\Roaming\nvm\nodejs\node.exe"
)

Write-Host "`n🔍 Checking for Node.js installation..." -ForegroundColor Yellow
$nodeFound = $false

foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $nodeFound = $true
        Write-Host "✅ Found Node.js at: $path" -ForegroundColor Green
        $version = & "$path" --version 2>&1 | Out-String
        Write-Host "   Version: $($version.Trim())" -ForegroundColor White
        
        # Check if directory is in PATH
        $dir = [System.IO.Path]::GetDirectoryName($path)
        $inPath = $env:Path -split ';' -contains $dir
        if ($inPath) {
            Write-Host "   ✅ Directory is in PATH" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Directory is NOT in PATH" -ForegroundColor Red
            Write-Host "   To add to PATH temporarily, run:" -ForegroundColor Yellow
            Write-Host "   `$env:Path = \"$dir;\" + `$env:Path" -ForegroundColor White
        }
    }
}

if (-not $nodeFound) {
    Write-Host "❌ Node.js not found in common locations" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Check if node is in PATH
Write-Host "`n🔍 Checking if 'node' command is available..." -ForegroundColor Yellow
$nodeInPath = Test-CommandExists "node"

if ($nodeInPath) {
    $nodeVersion = node --version 2>&1 | Out-String
    Write-Host "✅ Node.js is in PATH" -ForegroundColor Green
    Write-Host "   Version: $($nodeVersion.Trim())" -ForegroundColor White
} else {
    Write-Host "❌ 'node' command not found in PATH" -ForegroundColor Red
    Write-Host "   Try running with full path to node.exe" -ForegroundColor Yellow
}

# 3. Check npm
Write-Host "`n🔍 Checking npm..." -ForegroundColor Yellow
$npmInPath = Test-CommandExists "npm"

if ($npmInPath) {
    $npmVersion = npm --version 2>&1 | Out-String
    Write-Host "✅ npm is in PATH" -ForegroundColor Green
    Write-Host "   Version: $($npmVersion.Trim())" -ForegroundColor White
} else {
    Write-Host "❌ 'npm' command not found in PATH" -ForegroundColor Red
}

# 4. Run a simple test
Write-Host "`n🔍 Running a simple test..." -ForegroundColor Yellow
$testScript = @"
console.log('=== Node.js Test ===');
console.log('Node.js is working!');
console.log('Version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
"@

$testFile = "$env:TEMP\node-test.js"
$testScript | Out-File -FilePath $testFile -Encoding utf8

Write-Host "`nTest script saved to: $testFile" -ForegroundColor Cyan
Write-Host "Contents:" -ForegroundColor Cyan
Get-Content $testFile | ForEach-Object { Write-Host "   $_" -ForegroundColor White }

Write-Host "`nExecuting test script..." -ForegroundColor Cyan
try {
    $output = & "$env:SystemDrive\Program Files\nodejs\node.exe" $testFile 2>&1 | Out-String
    Write-Host $output -ForegroundColor Green
    Write-Host "✅ Test script executed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error executing test script: $_" -ForegroundColor Red
}

# 5. Check if we can run Jest
Write-Host "`n🔍 Checking Jest..." -ForegroundColor Yellow
try {
    $jestVersion = npx jest --version 2>&1 | Out-String
    Write-Host "✅ Jest is available" -ForegroundColor Green
    Write-Host "   Version: $($jestVersion.Trim())" -ForegroundColor White
    
    # Try running a simple test
    Write-Host "`n🔍 Running simple Jest test..." -ForegroundColor Cyan
    $simpleTest = "$env:TEMP\simple-test.js"
    @'
test('1 + 1 equals 2', () => {
  expect(1 + 1).toBe(2);
});
'@ | Out-File -FilePath $simpleTest -Encoding utf8
    
    Push-Location $env:TEMP
    $jestOutput = npx jest $simpleTest --no-cache 2>&1 | Out-String
    Pop-Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host $jestOutput -ForegroundColor Green
        Write-Host "✅ Jest test passed!" -ForegroundColor Green
    } else {
        Write-Host $jestOutput -ForegroundColor Red
        Write-Host "❌ Jest test failed" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error running Jest: $_" -ForegroundColor Red
    Write-Host "   Try installing Jest globally: npm install -g jest" -ForegroundColor Yellow
}

# 6. Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
if ($nodeFound -and $nodeInPath -and $npmInPath) {
    Write-Host "✅ Node.js environment is properly set up!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some issues were found with your Node.js installation" -ForegroundColor Yellow
    if (-not $nodeInPath) {
        Write-Host "   - Node.js is not in your PATH" -ForegroundColor Yellow
    }
    if (-not $npmInPath) {
        Write-Host "   - npm is not in your PATH" -ForegroundColor Yellow
    }
    
    Write-Host "`nTo fix these issues, you can:" -ForegroundColor Yellow
    Write-Host "1. Reinstall Node.js from https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Make sure to check 'Add to PATH' during installation" -ForegroundColor White
    Write-Host "3. Or add Node.js to your PATH manually" -ForegroundColor White
}

# Clean up
Remove-Item $testFile -ErrorAction SilentlyContinue
Remove-Item "$env:TEMP\simple-test.js" -ErrorAction SilentlyContinue
