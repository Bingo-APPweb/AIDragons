# env-check.ps1
# Script to display all environment variables and system information

Write-Host "=== System Environment Check ===" -ForegroundColor Cyan

# 1. System Information
Write-Host "`n🔍 System Information:" -ForegroundColor Yellow
Write-Host "OS: $([System.Environment]::OSVersion)" -ForegroundColor White
Write-Host "64-bit OS: $([Environment]::Is64BitOperatingSystem)" -ForegroundColor White
Write-Host "64-bit Process: $([Environment]::Is64BitProcess)" -ForegroundColor White
Write-Host "Current Directory: $(Get-Location)" -ForegroundColor White

# 2. Environment Variables
Write-Host "`n🔍 Environment Variables:" -ForegroundColor Yellow
$envVars = [System.Environment]::GetEnvironmentVariables()

# Group by scope
$processVars = $envVars.GetEnumerator() | Where-Object { $_.Name -notlike '*=*' } | Sort-Object Name
$userVars = [System.Environment]::GetEnvironmentVariables('User')
$machineVars = [System.Environment]::GetEnvironmentVariables('Machine')

# Display important environment variables
$importantVars = @('Path', 'NODE_PATH', 'NVM_HOME', 'NVM_SYMLINK', 'NODE_HOME', 'SystemRoot', 'TEMP', 'TMP', 'USERPROFILE')

foreach ($var in $importantVars) {
    $value = [System.Environment]::GetEnvironmentVariable($var)
    $source = @()
    
    if ($processVars.Name -contains $var) { $source += 'Process' }
    if ($userVars.ContainsKey($var)) { $source += 'User' }
    if ($machineVars.ContainsKey($var)) { $source += 'Machine' }
    
    if ($null -ne $value) {
        Write-Host "✅ $var" -ForegroundColor Green -NoNewline
        Write-Host " (Source: $($source -join ', '))"
        $value -split ';' | ForEach-Object { 
            if ($_) { Write-Host "   - $_" -ForegroundColor White }
        }
    } else {
        Write-Host "❌ $var (Not Set)" -ForegroundColor Red
    }
}

# 3. Check Node.js installation
Write-Host "`n🔍 Node.js Check:" -ForegroundColor Yellow
$nodePaths = @(
    "$env:SystemDrive\Program Files\nodejs\node.exe",
    "$env:ProgramFiles\nodejs\node.exe",
    "${env:ProgramFiles(x86)}\nodejs\node.exe",
    "$env:LOCALAPPDATA\nvm4w\nodejs\node.exe",
    "$env:USERPROFILE\AppData\Roaming\nvm\nodejs\node.exe"
)

$nodeFound = $false
foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $nodeFound = $true
        Write-Host "✅ Found Node.js at: $path" -ForegroundColor Green
        
        # Try to get version
        try {
            $version = & "$path" --version 2>&1 | Out-String
            Write-Host "   Version: $($version.Trim())" -ForegroundColor White
        } catch {
            Write-Host "   Could not get version: $_" -ForegroundColor Red
        }
    }
}

if (-not $nodeFound) {
    Write-Host "❌ Node.js not found in common locations" -ForegroundColor Red
}

# 4. Check if node is in PATH
Write-Host "`n🔍 Checking if 'node' is in PATH:" -ForegroundColor Yellow
try {
    $nodePath = Get-Command node -ErrorAction Stop
    Write-Host "✅ 'node' found in PATH: $($nodePath.Source)" -ForegroundColor Green
    Write-Host "   Version: $(node --version)" -ForegroundColor White
} catch {
    Write-Host "❌ 'node' command not found in PATH" -ForegroundColor Red
}

# 5. Check PowerShell execution policy
Write-Host "`n🔍 PowerShell Execution Policy:" -ForegroundColor Yellow
$execPolicy = Get-ExecutionPolicy
Write-Host "Current Execution Policy: $execPolicy" -ForegroundColor White

# 6. Check if we can run scripts
Write-Host "`n🔍 Script Execution Test:" -ForegroundColor Yellow
$testScript = "$env:TEMP\test-script.ps1"
'Write-Host "Hello from test script!"' | Out-File -FilePath $testScript -Encoding utf8

try {
    $output = & $testScript 2>&1 | Out-String
    Write-Host "✅ Script executed successfully!" -ForegroundColor Green
    Write-Host "   Output: $($output.Trim())" -ForegroundColor White
} catch {
    Write-Host "❌ Script execution failed: $_" -ForegroundColor Red
    Write-Host "   Current Execution Policy: $(Get-ExecutionPolicy)" -ForegroundColor Yellow
}

# Clean up
Remove-Item $testScript -ErrorAction SilentlyContinue

Write-Host "`n=== Environment Check Complete ===" -ForegroundColor Cyan
