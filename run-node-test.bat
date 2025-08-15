@echo off
node -e "console.log('Test output to file'); console.log('Node.js version:', process.version);" > test-output.txt 2>&1
type test-output.txt
