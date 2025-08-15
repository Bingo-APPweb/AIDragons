@echo off
echo Running Jest tests...

:: Install Jest if not already installed
call npm list jest || npm install --save-dev jest

:: Run the test with verbose output
call npx jest tests/basic.test.js --verbose

echo.
echo If you don't see test output above, try running manually with:
echo npx jest tests/basic.test.js --verbose

pause
