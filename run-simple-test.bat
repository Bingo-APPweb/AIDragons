@echo off
echo Running simple test...

:: Create a simple test file
echo // Simple test > simple-test.js
echo test('1 + 1 equals 2', () => { >> simple-test.js
echo   expect(1 + 1).toBe(2); >> simple-test.js
echo }); >> simple-test.js

:: Run the test with output to file
npx jest simple-test.js --no-cache > test-output.txt 2>&1

echo Test complete. Output saved to test-output.txt
type test-output.txt

del simple-test.js

echo.
echo If you don't see test output above, check test-output.txt
pause
