@echo off
echo Running Jest test...
node node_modules/jest/bin/jest.js jest-test.js --no-cache > test-output.txt 2>&1
type test-output.txt
