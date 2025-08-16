Write-Host "🔍 Verificando versões e dependências..." -ForegroundColor Cyan
node -v
npm -v

# 1) Instalação limpa e build
Write-Host "`n🔧 Instalando dependências e construindo..." -ForegroundColor Cyan
npm ci
npm run build

# 2) Testes e cobertura
Write-Host "`n🧪 Executando testes..." -ForegroundColor Cyan
npm test -- --coverage

# 3) Verificação de tamanho e API
Write-Host "`n📊 Verificando orçamento de tamanho..." -ForegroundColor Cyan
npm run size

Write-Host "`n🔍 Verificando API..." -ForegroundColor Cyan
npm run api:check

# 4) Teste de empacotamento
Write-Host "`n📦 Testando empacotamento..." -ForegroundColor Cyan
node scripts/smoke-pack.mjs

# 5) Dry run da release
Write-Host "`n🚀 Simulando release (dry-run)..." -ForegroundColor Cyan
npx semantic-release --dry-run

Write-Host "`n✅ Verificação concluída! Tudo pronto para o release." -ForegroundColor Green
Write-Host "`n📋 Verificações manuais necessárias:" -ForegroundColor Yellow
Write-Host "1. Rulesets: Ativados no branch default com Secret Scanning Push Protection"
Write-Host "2. Branch Protection: Apenas 'Gate (all checks aggregated)' como required"
Write-Host "3. Secrets: NPM_TOKEN no Environment 'release', CODECOV_TOKEN no repositório"
Write-Host "4. Equipes do CODEOWNERS (@bbf-core @bbf-ci @bbf-security @bbf-docs) existem e têm acesso de review"
Write-Host "5. package.json:"
Write-Host "   - version: "0.0.0-development""
Write-Host "   - publishConfig: { "access": "public", "provenance": true }"
Write-Host "   - exports e types estão corretos"
Write-Host "   - engines e license definidos"
Write-Host "6. Codecov: Jest está gerando coverage/lcov.info"

Write-Host "`n🎯 Micro-polimentos opcionais:" -ForegroundColor Yellow
Write-Host "- Adicionar badge do Gate no README"
Write-Host "- Linkar Discussions no ISSUE_TEMPLATE/config.yml"
Write-Host "- Confirmar PR do Renovate mergeado"

Write-Host "`nExecute 'npm run verify:release' para rodar estas verificações novamente." -ForegroundColor Cyan
