# Install ESLint and TypeScript ESLint dependencies
Write-Host "Installing ESLint and TypeScript ESLint dependencies..." -ForegroundColor Cyan
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Set up Husky for pre-commit hooks
Write-Host "\nSetting up Husky..." -ForegroundColor Cyan
npx husky install

# Add pre-commit hook for pretty-quick
Write-Host "\nAdding pre-commit hook..." -ForegroundColor Cyan
npx husky add .husky/pre-commit "npx pretty-quick --staged"

# Create a basic .gitignore if it doesn't exist
if (-not (Test-Path .gitignore)) {
    Write-Host "\nCreating .gitignore file..." -ForegroundColor Cyan
    @"
# Dependencies
node_modules/

# Build output
dist/

# Test coverage
coverage/

# Environment variables
.env
.env.local

# IDE specific files
.vscode/
.idea/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temp files
tmp/
temp/
"@ | Out-File -FilePath .gitignore -Encoding utf8
}

Write-Host "\n✅ Development environment setup complete!" -ForegroundColor Green
Write-Host "\nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm install' to install all dependencies"
Write-Host "2. Run 'npm run format' to format all files"
Write-Host "3. Run 'npm run lint:fix' to fix linting issues"
Write-Host "4. Run 'npm test' to run tests"
