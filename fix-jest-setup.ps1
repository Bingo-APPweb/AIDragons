# Script to fix Jest configuration and run tests
Write-Host "=== Fixing Jest Configuration ===" -ForegroundColor Cyan

# 1. Remove existing Jest configuration from package.json
$packageJsonPath = "package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    
    # Remove Jest config if it exists
    if ($packageJson.PSObject.Properties.Name -contains 'jest') {
        $packageJson.PSObject.Properties.Remove('jest')
        $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
        Write-Host "✅ Removed Jest configuration from package.json" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ No Jest configuration found in package.json" -ForegroundColor Yellow
    }
}

# 2. Create/update jest.config.js
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

$jestConfig | Out-File -FilePath "jest.config.js" -Encoding utf8
Write-Host "✅ Created/updated jest.config.js" -ForegroundColor Green

# 3. Install required dependencies if not already installed
$requiredDeps = @('jest', 'ts-jest', '@types/jest')
$missingDeps = @()

foreach ($dep in $requiredDeps) {
    $installed = npm list $dep --depth=0 2>$null
    if (-not $installed -or $installed -match 'empty') {
        $missingDeps += $dep
    }
}

if ($missingDeps.Count -gt 0) {
    Write-Host "Installing missing dependencies: $($missingDeps -join ', ')" -ForegroundColor Yellow
    npm install --save-dev $missingDeps
} else {
    Write-Host "✅ All required dependencies are installed" -ForegroundColor Green
}

# 4. Create a simple test file if it doesn't exist
$testFilePath = "tests/basic.test.ts"
if (-not (Test-Path $testFilePath)) {
    $testContent = @"
// Basic test to verify Jest is working
test('1 + 1 equals 2', () => {
  expect(1 + 1).toBe(2);
});

test('async test', async () => {
  const result = await Promise.resolve('test');
  expect(result).toBe('test');
});
"@
    $testContent | Out-File -FilePath $testFilePath -Encoding utf8
    Write-Host "✅ Created basic test file at $testFilePath" -ForegroundColor Green
}

# 5. Clear Jest cache
Write-Host "Clearing Jest cache..." -ForegroundColor Yellow
npx jest --clearCache

# 6. Run the tests
Write-Host "`n=== Running Tests ===" -ForegroundColor Cyan
npx jest --verbose

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
