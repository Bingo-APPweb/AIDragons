# Fix PowerShell execution policy and check environment

# Set execution policy for current user
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Check Node.js and npm
Write-Host "=== Node.js Check ===" -ForegroundColor Cyan
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "Node.js: $nodeVersion"
Write-Host "npm: $npmVersion"

# Simple test
Write-Host "`n=== Running Simple Test ===" -ForegroundColor Cyan
$testFile = "$env:TEMP\node-test.js"
@"
console.log('Test script running!');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());
"@ | Out-File -FilePath $testFile -Encoding utf8

node $testFile
Remove-Item $testFile -ErrorAction SilentlyContinue

Write-Host "`nCheck complete!" -ForegroundColor Green
