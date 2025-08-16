@echo off
echo ===== System Check =====
echo.

echo [1/6] Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not in your PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/6] Node.js is installed at:
where node
node --version

:: Create a simple test file
echo [3/6] Creating test file...
echo console.log('Test script running!'); > test.js
echo console.log('Node.js version:', process.version); >> test.js
echo console.log('Current directory:', process.cwd()); >> test.js

echo [4/6] Running test script...
node test.js > test-output.txt 2>&1

echo [5/6] Test output:
type test-output.txt

echo [6/6] Cleaning up...
del test.js >nul 2>&1

echo.
echo Check complete. See test-output.txt for details.
pause
