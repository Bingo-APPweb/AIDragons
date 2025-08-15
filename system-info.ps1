# System and Environment Check Script
# This script gathers detailed information about the system and environment

Write-Host "=== System Information ===" -ForegroundColor Cyan

# Basic system info
$os = Get-CimInstance Win32_OperatingSystem
$computerInfo = Get-ComputerInfo

Write-Host "OS: $($os.Caption) $($os.Version)" -ForegroundColor White
Write-Host "Architecture: $($os.OSArchitecture)" -ForegroundColor White
Write-Host "Last Boot: $($os.LastBootUpTime)" -ForegroundColor White
Write-Host "System Uptime: $((Get-Date) - $os.LastBootUpTime)" -ForegroundColor White

# CPU Info
$cpu = Get-CimInstance Win32_Processor
Write-Host "`n=== CPU Information ===" -ForegroundColor Cyan
Write-Host "Name: $($cpu.Name)" -ForegroundColor White
Write-Host "Cores: $($cpu.NumberOfCores)" -ForegroundColor White
Write-Host "Logical Processors: $($cpu.NumberOfLogicalProcessors)" -ForegroundColor White

# Memory Info
$totalMemory = [math]::Round($computerInfo.CsPhyicallyInstalledMemory / 1GB, 2)
$freeMemory = [math]::Round($computerInfo.OsFreePhysicalMemory / 1MB, 2)
Write-Host "`n=== Memory Information ===" -ForegroundColor Cyan
Write-Host "Total Physical Memory: ${totalMemory}GB" -ForegroundColor White
Write-Host "Free Physical Memory: ${freeMemory}GB" -ForegroundColor White

# Node.js Info
Write-Host "`n=== Node.js Information ===" -ForegroundColor Cyan
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if ($nodePath) {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "Node.js Path: $nodePath" -ForegroundColor White
    Write-Host "Node.js Version: $nodeVersion" -ForegroundColor White
    Write-Host "npm Version: $npmVersion" -ForegroundColor White
} else {
    Write-Host "Node.js is not in PATH" -ForegroundColor Red
}

# Environment Variables
Write-Host "`n=== Environment Variables ===" -ForegroundColor Cyan
$envVars = @(
    'PATH',
    'NODE_PATH',
    'NVM_HOME',
    'NVM_SYMLINK',
    'JAVA_HOME',
    'ANDROID_HOME',
    'GIT_SSH',
    'HOME',
    'USERPROFILE',
    'TEMP',
    'TMP'
)

foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Host "$($var.PadRight(15)): $value" -ForegroundColor White
    }
}

# Check for common development tools
Write-Host "`n=== Development Tools ===" -ForegroundColor Cyan
$tools = @(
    'git',
    'python',
    'python3',
    'java',
    'javac',
    'gcc',
    'g++',
    'make',
    'cmake',
    'yarn',
    'pnpm',
    'npx',
    'jest'
)

foreach ($tool in $tools) {
    $toolPath = (Get-Command $tool -ErrorAction SilentlyContinue).Source
    if ($toolPath) {
        Write-Host "$($tool.PadRight(10)): $toolPath" -ForegroundColor Green
    } else {
        Write-Host "$($tool.PadRight(10)): Not found" -ForegroundColor DarkGray
    }
}

# Check Node.js installation
Write-Host "`n=== Node.js Check ===" -ForegroundColor Cyan
$nodeCheck = @{
    'node' = 'node --version';
    'npm' = 'npm --version';
    'npx' = 'npx --version';
    'jest' = 'npx jest --version';
}

foreach ($check in $nodeCheck.GetEnumerator()) {
    try {
        $output = Invoke-Expression $check.Value 2>&1
        Write-Host "$($check.Name.PadRight(10)): $($output.Trim())" -ForegroundColor Green
    } catch {
        Write-Host "$($check.Name.PadRight(10)): Error - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check for running processes
Write-Host "`n=== Running Node.js Processes ===" -ForegroundColor Cyan
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, Path
if ($nodeProcesses) {
    $nodeProcesses | Format-Table -AutoSize
} else {
    Write-Host "No Node.js processes found" -ForegroundColor Yellow
}

# Check file system permissions
Write-Host "`n=== File System Permissions ===" -ForegroundColor Cyan
$pathsToCheck = @(
    $PWD.Path,
    "$env:APPDATA\npm",
    "$env:LOCALAPPDATA\nvm"
)

foreach ($path in $pathsToCheck) {
    if (Test-Path $path) {
        $acl = Get-Acl -Path $path
        $access = $acl.Access | Where-Object { $_.IdentityReference -eq "$env:USERDOMAIN\$env:USERNAME" }
        Write-Host "`nPath: $path" -ForegroundColor White
        Write-Host "  Owner: $($acl.Owner)" -ForegroundColor White
        if ($access) {
            Write-Host "  Permissions: $($access.FileSystemRights)" -ForegroundColor White
        } else {
            Write-Host "  No explicit permissions found for current user" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Path not found: $path" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Check Complete ===" -ForegroundColor Green
