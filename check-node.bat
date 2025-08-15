@echo off
echo ===== Node.js Check =====
echo.

echo Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not in your PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed at:
where node
echo.

echo Node.js version:
node --version
echo.

echo Creating test file...
echo console.log('Test script running!'); > test.js
echo console.log('Node.js version:', process.version); >> test.js
echo console.log('Current directory:', process.cwd()); >> test.js

echo Running test script...
node test.js > test-output.txt 2>&1
echo.

echo Test output:
type test-output.txt
echo.

del test.js
del test-output.txt

echo Test complete.
pause
