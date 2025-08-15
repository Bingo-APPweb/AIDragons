@echo off
echo Testing command execution...

echo Current directory: %CD%

echo.
echo Testing echo command:
echo Hello, World!

echo.
echo Testing Node.js version:
node --version

echo.
echo Testing npm version:
npm --version

echo.
echo Creating a test file...
echo Test content > test-output.txt

echo.
echo Test file contents:
type test-output.txt

echo.
echo Cleaning up...
del test-output.txt

echo.
echo Test complete.
