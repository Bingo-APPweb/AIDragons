@echo off
echo Setting up Jest configuration...

echo Creating jest.config.js...
echo module.exports = { > jest.config.js
echo   preset: 'ts-jest', >> jest.config.js
echo   testEnvironment: 'node', >> jest.config.js
echo   testMatch: ['**/tests/**/*.test.ts'], >> jest.config.js
echo   moduleFileExtensions: ['ts', 'js', 'json', 'node'], >> jest.config.js
echo   transform: { >> jest.config.js
echo     '^.+\\.tsx?$': 'ts-jest', >> jest.config.js
echo   }, >> jest.config.js
echo   collectCoverage: true, >> jest.config.js
echo   collectCoverageFrom: [ >> jest.config.js
echo     'src/**/*.{ts,js}', >> jest.config.js
echo     '!**/node_modules/**', >> jest.config.js
echo     '!**/dist/**', >> jest.config.js
echo     '!**/tests/**', >> jest.config.js
echo   ], >> jest.config.js
echo   coverageDirectory: 'coverage', >> jest.config.js
echo   verbose: true, >> jest.config.js
echo }; >> jest.config.js

echo Installing dependencies...
call npm install --save-dev jest ts-jest @types/jest typescript

if not exist "tests" mkdir tests

echo Creating basic test file...
echo // Basic test to verify Jest is working > tests\basic.test.ts
echo test('1 + 1 equals 2', () => { >> tests\basic.test.ts
echo   expect(1 + 1).toBe(2); >> tests\basic.test.ts
echo }); >> tests\basic.test.ts
echo. >> tests\basic.test.ts
echo test('async test', async () => { >> tests\basic.test.ts
echo   const result = await Promise.resolve('test'); >> tests\basic.test.ts
echo   expect(result).toBe('test'); >> tests\basic.test.ts
echo }); >> tests\basic.test.ts

echo Clearing Jest cache...
call npx jest --clearCache

echo Running tests...
call npx jest --verbose

echo Setup complete!
pause
