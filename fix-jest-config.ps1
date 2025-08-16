# fix-jest-config.ps1
# Script to resolve Jest configuration conflicts

Write-Host "🐉 Dragon Fix Script - Resolving Jest configuration conflict..." -ForegroundColor Cyan

# Create backup of package.json
Copy-Item package.json package.json.backup -Force
Write-Host "✅ Backup created: package.json.backup" -ForegroundColor Green

# Read package.json
$pkg = Get-Content package.json -Raw | ConvertFrom-Json

# Check if jest key exists in package.json
if ($pkg.jest) {
    Write-Host "⚠️ Found 'jest' configuration in package.json" -ForegroundColor Yellow
    
    # Create jest.config.js if it doesn't exist
    if (-not (Test-Path jest.config.js)) {
        Write-Host "📝 Creating jest.config.js..." -ForegroundColor Cyan
        @'
// jest.config.js - Unified configuration
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
'@ | Out-File -FilePath jest.config.js -Encoding UTF8
        Write-Host "✅ Created jest.config.js" -ForegroundColor Green
    }
    
    # Remove jest config from package.json
    Write-Host "🔄 Removing 'jest' from package.json..." -ForegroundColor Cyan
    $pkg.PSObject.Properties.Remove('jest')
    
    # Save cleaned package.json
    $pkg | ConvertTo-Json -Depth 10 | Set-Content package.json -Encoding UTF8
    Write-Host "✅ package.json cleaned!" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No 'jest' configuration found in package.json" -ForegroundColor Green
}

# Clear Jest cache
Write-Host "🧹 Clearing Jest cache..." -ForegroundColor Cyan
npx jest --clearCache

Write-Host "`n🎯 Testing configuration..." -ForegroundColor Cyan
Write-Host "Jest version: $(npx jest --version)" -ForegroundColor Green

Write-Host "`n✨ All set! Try running:" -ForegroundColor Green
Write-Host "   npx jest simple.test.js" -ForegroundColor White
Write-Host "   or" -ForegroundColor White
Write-Host "   npx jest tests/natural-prediction/fft-weak-signal.test.ts" -ForegroundColor White
