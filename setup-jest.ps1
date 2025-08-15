# Script to set up Jest configuration
Write-Host "=== Setting up Jest Configuration ===" -ForegroundColor Cyan

# 1. Create/update jest.config.js
$jestConfig = @"
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/tests/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
"@

$jestConfig | Out-File -FilePath "jest.config.js" -Encoding utf8 -Force
Write-Host "✅ Created/updated jest.config.js" -ForegroundColor Green

# 2. Install required dependencies
Write-Host "`nInstalling required dependencies..." -ForegroundColor Yellow
npm install --save-dev jest ts-jest @types/jest typescript

# 3. Create a basic test file if it doesn't exist
$testFilePath = "tests/basic.test.ts"
if (-not (Test-Path $testFilePath)) {
    @'
// Basic test to verify Jest is working
test('1 + 1 equals 2', () => {
  expect(1 + 1).toBe(2);
});

test('async test', async () => {
  const result = await Promise.resolve('test');
  expect(result).toBe('test');
});
'@ | Out-File -FilePath $testFilePath -Encoding utf8
    Write-Host "✅ Created basic test file at $testFilePath" -ForegroundColor Green
}

# 4. Clear Jest cache
Write-Host "`nClearing Jest cache..." -ForegroundColor Yellow
npx jest --clearCache

# 5. Run the tests
Write-Host "`n=== Running Tests ===" -ForegroundColor Cyan
npx jest --verbose
