# setup.ps1
Write-Host "=== Project Setup ===" -ForegroundColor Cyan

# Check Node.js and npm
$nodeVersion = node --version
$npmVersion = npm --version

Write-Host "Node.js: $nodeVersion"
Write-Host "npm: $npmVersion"

# Clean up
Write-Host "`nCleaning up..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path "package-lock.json") {
    Remove-Item package-lock.json
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install

# Install dev dependencies
Write-Host "`nInstalling dev dependencies..." -ForegroundColor Yellow
npm install --save-dev jest ts-jest @types/jest typescript

# Initialize TypeScript if needed
if (-not (Test-Path "tsconfig.json")) {
    Write-Host "`nInitializing TypeScript..." -ForegroundColor Yellow
    npx tsc --init
}

# Create a simple test file if it doesn't exist
if (-not (Test-Path "tests/basic.test.ts")) {
    Write-Host "`nCreating a basic test file..." -ForegroundColor Yellow
    @'
// Basic test to verify Jest is working
test('1 + 1 equals 2', () => {
  expect(1 + 1).toBe(2);
});

test('async test', async () => {
  const result = await Promise.resolve('test');
  expect(result).toBe('test');
});
'@ | Out-File -FilePath "tests/basic.test.ts" -Encoding utf8
}

# Run tests
Write-Host "`nRunning tests..." -ForegroundColor Green
npx jest tests/basic.test.ts --verbose

Write-Host "`nSetup complete!" -ForegroundColor Green
