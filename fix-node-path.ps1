# fix-node-path.ps1
# Script to add Node.js to the system PATH temporarily

# Define the Node.js installation path
$nodePath = "$env:SystemDrive\Program Files\nodejs"

# Verify Node.js exists at the path
if (-not (Test-Path $nodePath)) {
    Write-Host "❌ Node.js not found at: $nodePath" -ForegroundColor Red
    exit 1
}

# Add to PATH for current session
$env:Path = "$nodePath;" + $env:Path

# Verify Node.js is accessible
try {
    $nodeVersion = & "$nodePath\node.exe" --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Test npm
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
    
    # Run a simple test
    Write-Host "\n🚀 Running a simple test..." -ForegroundColor Cyan
    $testScript = @"
    console.log('=== Node.js Test ===');
    console.log('Node.js is working correctly!');
    console.log('Version:', process.version);
    console.log('Platform:', process.platform);
    console.log('Architecture:', process.arch);
"@
    
    $testFile = "$env:TEMP\node-test.js"
    $testScript | Out-File -FilePath $testFile -Encoding utf8
    & "$nodePath\node.exe" $testFile
    Remove-Item $testFile
    
    Write-Host "\n✅ Node.js is working correctly!" -ForegroundColor Green
    Write-Host "To make this change permanent, add the following to your system PATH:" -ForegroundColor Yellow
    Write-Host $nodePath -ForegroundColor White
    
} catch {
    Write-Host "❌ Error testing Node.js: $_" -ForegroundColor Red
    exit 1
}
