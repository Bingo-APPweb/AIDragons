@echo off
echo === Node.js Verification ===
echo.
echo Checking if Node.js is installed...

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

:: Test Node.js version
node --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to run 'node --version'
    pause
    exit /b 1
)

echo.
echo Creating a simple test script...
echo console.log('Test script executed successfully!'); > test.js
echo console.log('Node.js version:', process.version); >> test.js
echo console.log('Current directory:', process.cwd()); >> test.js

echo Running test script...
node test.js

del test.js >nul 2>&1

echo.
echo Verification complete.
pause
