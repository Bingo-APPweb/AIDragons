# check-node-env.ps1
Write-Host "=== Node.js Environment Check ===" -ForegroundColor Cyan

# Check if Node.js is in PATH
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodePath) {
    Write-Host "❌ Node.js is not in your PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js found at: $nodePath" -ForegroundColor Green

# Get Node.js version
$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor White

# Get npm version
$npmVersion = (npm --version 2>$null)
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found or not working" -ForegroundColor Red
}

# Create a test script
$testScript = @"
console.log('Test script running!');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());
"@

$testFile = "$env:TEMP\node-test.js"
$testScript | Out-File -FilePath $testFile -Encoding utf8

# Run the test script
Write-Host "`nRunning test script..." -ForegroundColor Cyan
try {
    $output = & node $testFile 2>&1 | Out-String
    Write-Host $output -ForegroundColor White
    Write-Host "✅ Test script executed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error running test script: $_" -ForegroundColor Red
}

# Clean up
Remove-Item $testFile -ErrorAction SilentlyContinue

Write-Host "`nEnvironment check complete!" -ForegroundColor Green
