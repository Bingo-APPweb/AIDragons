@echo off
echo ===== Environment Check =====
echo.

echo Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not in your PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to run 'node --version'
    pause
    exit /b 1
)

:: Create a simple test file
echo // Simple test > test.js
echo console.log('Test script running!'); >> test.js
echo console.log('Node.js version:', process.version); >> test.js
echo console.log('Current directory:', process.cwd()); >> test.js

echo.
echo Running test script...
node test.js

echo.
echo Cleaning up...
del test.js >nul 2>&1

echo.
echo Environment check complete.
pauseecho off
echo === Environment Check ===
echo.

:: Check Node.js installation
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not in your PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed at:
where node
node --version

:: Check npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not in your PATH
) else (
    echo.
    echo npm is installed at:
    where npm
    npm --version
)

:: Create a simple test file
echo. > test.js
(
    echo // Simple test
    echo console.log('Test script running!');
    echo console.log('1 + 1 =', 1 + 1);
    echo console.log('Current directory:', process.cwd());
) > test.js

echo.
echo Running test script...
node test.js

del test.js >nul 2>&1

echo.
echo Environment check complete.
pauseecho off
echo === System Environment Check ===
echo.
echo System Information:
systeminfo | findstr /B /C:"OS Name" /C:"OS Version" /C:"System Type"

echo.
echo Node.js Check:
where node
if %ERRORLEVEL% EQU 0 (
  echo Node.js found in PATH
  node --version
) else (
  echo Node.js not found in PATH
)

echo.
echo Checking Node.js in Program Files:
if exist "%ProgramFiles%\nodejs\node.exe" (
  echo Found Node.js in Program Files
  "%ProgramFiles%\nodejs\node.exe" --version
) else (
  echo Node.js not found in Program Files
)

echo.
echo Checking npm:
where npm
if %ERRORLEVEL% EQU 0 (
  echo npm found in PATH
  npm --version
) else (
  echo npm not found in PATH
)

echo.
echo PATH Environment Variable:
echo %PATH%
